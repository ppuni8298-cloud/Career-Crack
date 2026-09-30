import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const { id } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty if submitting purely from DB state
    }

    const { answers: finalAnswers, timeSpentSeconds: finalTimeSpent } = body;

    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id },
      include: {
        mockTest: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If already completed, return existing results
    if (attempt.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        attemptId: attempt.id,
        score: attempt.score,
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        skippedCount: attempt.skippedCount,
      });
    }

    // Merge answers from DB and final payload
    const answerMap = new Map<string, any>();
    for (const ans of attempt.answers) {
      answerMap.set(ans.questionId, { ...ans });
    }

    if (finalAnswers && typeof finalAnswers === "object") {
      for (const [qId, optKey] of Object.entries(finalAnswers)) {
        const existing = answerMap.get(qId) || {};
        answerMap.set(qId, {
          ...existing,
          selectedOptionKey: optKey,
          isVisited: true,
        });
      }
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let totalScore = 0;

    const mistakesToRecord: Array<{ questionId: string; selectedKey: string; correctKey: string }> = [];
    const resolvedMistakeIds: string[] = [];
    const answersToUpdate: Array<{
      questionId: string;
      sectionId: string;
      selectedKey: string | null;
      status: "CORRECT" | "INCORRECT" | "SKIPPED";
    }> = [];

    for (const mq of (attempt as any).mockTest.questions) {
      const q = mq.question;
      const ans = answerMap.get(q.id);
      const selectedKey = ans?.selectedOptionKey || null;
      const correctOption = q.options.find((opt: any) => opt.isCorrect);
      const correctKey = correctOption?.optionKey || "A";

      if (!selectedKey) {
        skippedCount++;
        answersToUpdate.push({
          questionId: q.id,
          sectionId: mq.sectionId,
          selectedKey: null,
          status: "SKIPPED",
        });
      } else if (selectedKey === correctKey) {
        correctCount++;
        totalScore += mq.marks;
        resolvedMistakeIds.push(q.id);
        answersToUpdate.push({
          questionId: q.id,
          sectionId: mq.sectionId,
          selectedKey,
          status: "CORRECT",
        });
      } else {
        incorrectCount++;
        totalScore -= mq.negativeMarks;
        mistakesToRecord.push({
          questionId: q.id,
          selectedKey,
          correctKey,
        });
        answersToUpdate.push({
          questionId: q.id,
          sectionId: mq.sectionId,
          selectedKey,
          status: "INCORRECT",
        });
      }
    }

    const totalQuestions = attempt.mockTest.questions.length || 1;
    const accuracy = parseFloat(((correctCount / totalQuestions) * 100).toFixed(1));
    const roundedScore = parseFloat(Math.max(0, totalScore).toFixed(2));
    const totalTimeSpent =
      finalTimeSpent ||
      Math.min(
        attempt.durationSeconds,
        Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000)
      );

    const todayStr = new Date().toISOString().split("T")[0];

    // Transactional save
    await prisma.$transaction(async (tx) => {
      // 1. Update attempt
      await tx.mockTestAttempt.update({
        where: { id },
        data: {
          status: "COMPLETED",
          score: roundedScore,
          accuracy,
          correctCount,
          incorrectCount,
          skippedCount,
          timeSpentSeconds: totalTimeSpent,
          completedAt: new Date(),
        },
      });

      // 2. Update all answers with final grading
      for (const a of answersToUpdate) {
        await tx.mockTestAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: id,
              questionId: a.questionId,
            },
          },
          update: {
            selectedOptionKey: a.selectedKey,
            answerStatus: a.status,
            isVisited: true,
          },
          create: {
            attemptId: id,
            questionId: a.questionId,
            sectionId: a.sectionId,
            selectedOptionKey: a.selectedKey,
            answerStatus: a.status,
            isVisited: true,
            markedForReview: false,
            timeSpentSeconds: 0,
          },
        });
      }

      // 3. Mistake Vault: Record new/repeated mistakes
      for (const m of mistakesToRecord) {
        await tx.userMistake.upsert({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId: m.questionId,
            },
          },
          update: {
            selectedOptionKey: m.selectedKey,
            correctOptionKey: m.correctKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: { increment: 1 },
            lastAttemptedAt: new Date(),
          },
          create: {
            userId: session.userId,
            questionId: m.questionId,
            selectedOptionKey: m.selectedKey,
            correctOptionKey: m.correctKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: 1,
            lastAttemptedAt: new Date(),
          },
        });
      }

      // 4. Mistake Vault: Mark correctly answered previously mistaken questions as RESOLVED
      for (const qId of resolvedMistakeIds) {
        await tx.userMistake.updateMany({
          where: {
            userId: session.userId,
            questionId: qId,
            reviewStatus: "UNRESOLVED",
          },
          data: {
            reviewStatus: "RESOLVED",
            lastAttemptedAt: new Date(),
          },
        });
      }

      // 5. Record Study Log
      await tx.studyLog.create({
        data: {
          userId: session.userId,
          action: `Completed Mock Test: ${attempt.mockTest.title}`,
          score: `${roundedScore} pts (${accuracy}%)`,
          durationMinutes: Math.max(10, Math.round(totalTimeSpent / 60)),
        },
      });

      // 6. Update User Profile & Streak
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
        const readinessBoost = accuracy >= 80 ? 6 : accuracy >= 50 ? 4 : 2;

        await tx.userProfile.update({
          where: { userId: session.userId },
          data: {
            readinessScore: Math.min(100, (profile.readinessScore || 50) + readinessBoost),
            streakDays: newStreak,
            longestStreak: newLongest,
            lastActiveDate: todayStr,
          },
        });
      }
    });

    // Award XP for completing this mock test (idempotent)
    const mockXPBase = 75;
    const mockAccuracyBonus = Math.round((accuracy / 100) * 50);
    const mockXP = mockXPBase + mockAccuracyBonus;
    import("@/lib/xp-engine").then(({ awardXP }) => {
      awardXP(session.userId, "MOCK_TEST_COMPLETE", attempt.id, mockXP).catch(() => {});
    });

    // 7. Evaluate Achievements
    const newAchievements = await evaluateAndAwardAchievements(session.userId);

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: roundedScore,
      totalMarks: attempt.mockTest.totalMarks,
      accuracy,
      correctCount,
      incorrectCount,
      skippedCount,
      totalQuestions,
      timeSpentSeconds: totalTimeSpent,
      newAchievements,
    });
  } catch (error: any) {
    console.error("POST /api/mock-tests/attempts/[id]/complete error:", error);
    return NextResponse.json(
      { error: "Failed to submit mock test", details: error.message },
      { status: 500 }
    );
  }
}
