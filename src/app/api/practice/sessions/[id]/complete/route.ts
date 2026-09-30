import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { evaluateAndAwardAchievements } from "@/lib/achievements";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id: sessionId } = await context.params;

    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Idempotent: If already completed, return existing data without double-updating
    if (practiceSession.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        session: {
          id: practiceSession.id,
          status: practiceSession.status,
          totalQuestions: practiceSession.totalQuestions,
          correctCount: practiceSession.correctCount,
          incorrectCount: practiceSession.incorrectCount,
          skippedCount: practiceSession.skippedCount,
          score: practiceSession.score,
          accuracy: practiceSession.accuracy,
          timeSpentSeconds: practiceSession.timeSpentSeconds,
          completedAt: practiceSession.completedAt,
        },
      });
    }

    // Calculate metrics
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let totalScore = 0;
    let totalTimeSpent = 0;

    const incorrectQuestions: Array<{
      questionId: string;
      selectedKey: string | null;
      correctKey: string;
    }> = [];

    for (const sq of practiceSession.sessionQuestions) {
      totalTimeSpent += sq.timeSpentSeconds || 0;
      const correctOpt = sq.question.options.find((o) => o.isCorrect);
      const correctKey = correctOpt?.optionKey || "A";

      if (sq.answerStatus === "CORRECT") {
        correctCount++;
        totalScore += sq.question.marks || 1.0;
      } else if (sq.answerStatus === "INCORRECT") {
        incorrectCount++;
        totalScore = Math.max(0, totalScore - (sq.question.negativeMarks || 0.25));
        incorrectQuestions.push({
          questionId: sq.questionId,
          selectedKey: sq.selectedOptionKey,
          correctKey,
        });
      } else {
        skippedCount++;
      }
    }

    // Elapsed wall-clock time fallback
    const elapsedWallClock = Math.max(
      totalTimeSpent,
      Math.floor((new Date().getTime() - new Date(practiceSession.startedAt).getTime()) / 1000)
    );
    const finalTimeSpent = practiceSession.durationSeconds
      ? Math.min(practiceSession.durationSeconds, elapsedWallClock)
      : elapsedWallClock;

    const totalQuestions = practiceSession.sessionQuestions.length || 1;
    const accuracy = parseFloat(((correctCount / totalQuestions) * 100).toFixed(1));
    const roundedScore = parseFloat(totalScore.toFixed(2));
    const completedAt = new Date();

    // Database transaction to finalize session, save mistakes, and update user progress
    await prisma.$transaction(async (tx) => {
      // 1. Update practice session
      await tx.practiceSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          correctCount,
          incorrectCount,
          skippedCount,
          score: roundedScore,
          accuracy,
          timeSpentSeconds: finalTimeSpent,
          completedAt,
        },
      });

      // 2. Mistake Vault Integration & Auto-Resolution (Section 12 & Phase 4)
      for (const m of incorrectQuestions) {
        await tx.userMistake.upsert({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId: m.questionId,
            },
          },
          update: {
            sessionId: practiceSession.id,
            selectedOptionKey: m.selectedKey,
            correctOptionKey: m.correctKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: { increment: 1 },
            lastAttemptedAt: completedAt,
          },
          create: {
            userId: session.userId,
            questionId: m.questionId,
            sessionId: practiceSession.id,
            selectedOptionKey: m.selectedKey,
            correctOptionKey: m.correctKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: 1,
            lastAttemptedAt: completedAt,
          },
        });
      }

      // If user answered any previously failed question correctly, resolve it in the vault
      for (const sq of practiceSession.sessionQuestions) {
        if (sq.answerStatus === "CORRECT") {
          await tx.userMistake.updateMany({
            where: {
              userId: session.userId,
              questionId: sq.questionId,
              reviewStatus: { in: ["UNRESOLVED", "REVIEWED"] },
            },
            data: {
              reviewStatus: "RESOLVED",
              resolvedAt: completedAt,
            },
          });
        }
      }

      // 3. User Progress Tracking & Topic Progress Update
      const readinessDelta = accuracy >= 80 ? 4 : accuracy >= 50 ? 2 : 1;
      const durationMins = Math.max(1, Math.ceil(finalTimeSpent / 60));

      await tx.studyLog.create({
        data: {
          userId: session.userId,
          action: `Completed Practice: ${practiceSession.title} (${correctCount}/${totalQuestions} Correct)`,
          score: `+${readinessDelta} Readiness Pts`,
          durationMinutes: durationMins,
        },
      });

      // Update User Profile & Streak
      const todayStr = completedAt.toISOString().split("T")[0];
      const profile = await tx.userProfile.findUnique({
        where: { userId: session.userId },
      });

      if (profile) {
        let newStreak = profile.streakDays || 1;
        const lastDate = profile.lastActiveDate;

        if (lastDate) {
          const last = new Date(lastDate);
          const current = new Date(todayStr);
          const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        const newLongest = Math.max(profile.longestStreak || 1, newStreak);

        await tx.userProfile.update({
          where: { userId: session.userId },
          data: {
            readinessScore: { increment: readinessDelta },
            streakDays: newStreak,
            longestStreak: newLongest,
            lastActiveDate: todayStr,
          },
        });
      }

      // 4. Update TopicProgress table for each topic in this session
      const topicCounts: Record<string, { correct: number; incorrect: number; total: number }> = {};
      practiceSession.sessionQuestions.forEach((sq) => {
        const tid = sq.question.topicId;
        if (!tid) return;
        if (!topicCounts[tid]) topicCounts[tid] = { correct: 0, incorrect: 0, total: 0 };
        topicCounts[tid].total++;
        if (sq.answerStatus === "CORRECT") topicCounts[tid].correct++;
        else if (sq.answerStatus === "INCORRECT") topicCounts[tid].incorrect++;
      });

      for (const [tid, tstat] of Object.entries(topicCounts)) {
        const existing = await tx.topicProgress.findUnique({
          where: {
            userId_topicId: {
              userId: session.userId,
              topicId: tid,
            },
          },
        });

        const newTotal = (existing?.questionsAttempted || 0) + tstat.total;
        const newCorrect = (existing?.correctAnswers || 0) + tstat.correct;
        const newIncorrect = (existing?.incorrectAnswers || 0) + tstat.incorrect;
        const newAcc = newTotal > 0 ? parseFloat(((newCorrect / newTotal) * 100).toFixed(1)) : 0;

        let status = "NOT_STARTED";
        if (newTotal === 0) status = "NOT_STARTED";
        else if (newTotal < 5 || newAcc < 60) status = "PRACTICING";
        else if (newAcc < 80) status = "IMPROVING";
        else status = "STRONG";

        await tx.topicProgress.upsert({
          where: {
            userId_topicId: {
              userId: session.userId,
              topicId: tid,
            },
          },
          update: {
            questionsAttempted: newTotal,
            correctAnswers: newCorrect,
            incorrectAnswers: newIncorrect,
            accuracy: newAcc,
            masteryStatus: status,
            lastPracticedAt: completedAt,
          },
          create: {
            userId: session.userId,
            topicId: tid,
            questionsAttempted: newTotal,
            correctAnswers: newCorrect,
            incorrectAnswers: newIncorrect,
            accuracy: newAcc,
            masteryStatus: status,
            lastPracticedAt: completedAt,
          },
        });
      }
    });

    // Award XP for completing this practice session (idempotent)
    const practiceXPBase = 20;
    const practiceAccuracyBonus = Math.round((accuracy / 100) * 15);
    const practiceXP = practiceXPBase + practiceAccuracyBonus;
    import("@/lib/xp-engine").then(({ awardXP }) => {
      awardXP(session.userId, "PRACTICE_SESSION_COMPLETE", sessionId, practiceXP).catch(() => {});
    });

    // Evaluate achievements asynchronously
    evaluateAndAwardAchievements(session.userId).catch(() => {});

    return NextResponse.json({
      success: true,
      session: {
        id: practiceSession.id,
        status: "COMPLETED",
        totalQuestions,
        correctCount,
        incorrectCount,
        skippedCount,
        score: roundedScore,
        accuracy,
        timeSpentSeconds: finalTimeSpent,
        completedAt,
      },
    });
  } catch (error: any) {
    console.error("Error completing practice session:", error);
    return NextResponse.json(
      { error: "Failed to complete practice session" },
      { status: 500 }
    );
  }
}
