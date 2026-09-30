import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAndAwardAchievements } from "@/lib/achievements";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, answers = {}, timeSpentSeconds = 0 } = body;

    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID is required" }, { status: 400 });
    }

    // 1. Verify challenge exists
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
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
    });

    if (!challenge) {
      return NextResponse.json({ error: "Daily challenge not found" }, { status: 404 });
    }

    // 2. Prevent repeated completion from inflating statistics
    const existingAttempt = await prisma.dailyChallengeAttempt.findUnique({
      where: {
        userId_challengeId: {
          userId: session.userId,
          challengeId,
        },
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: "You have already completed today's Daily Crack challenge." },
        { status: 400 }
      );
    }

    // 3. Score the answers
    let correctCount = 0;
    let incorrectCount = 0;
    let totalScore = 0;
    const mistakesToRecord: Array<{ questionId: string; selectedKey: string; correctKey: string }> = [];

    const detailedReview: Array<{
      questionId: string;
      selectedKey: string | null;
      correctKey: string;
      isCorrect: boolean;
      explanation: string | null;
      concept: string | null;
      shortcut: string | null;
    }> = [];

    for (const item of challenge.questions) {
      const q = item.question;
      const userKey = answers[q.id] ? String(answers[q.id]).toUpperCase() : null;
      const correctOption = q.options.find((o) => o.isCorrect);
      const correctKey = correctOption?.optionKey || "A";

      const isCorrect = userKey === correctKey;

      if (userKey) {
        if (isCorrect) {
          correctCount++;
          totalScore += q.marks;
        } else {
          incorrectCount++;
          totalScore -= q.negativeMarks;
          mistakesToRecord.push({
            questionId: q.id,
            selectedKey: userKey,
            correctKey,
          });
        }
      }

      detailedReview.push({
        questionId: q.id,
        selectedKey: userKey,
        correctKey,
        isCorrect,
        explanation: q.explanation,
        concept: q.concept,
        shortcut: q.shortcut,
      });
    }

    const totalQuestions = challenge.questions.length || 1;
    const accuracy = parseFloat(((correctCount / totalQuestions) * 100).toFixed(1));
    const roundedScore = parseFloat(totalScore.toFixed(2));
    const todayStr = challenge.date;

    // 4. Update Database Transactionally
    await prisma.$transaction(async (tx) => {
      // Record attempt
      await tx.dailyChallengeAttempt.create({
        data: {
          userId: session.userId,
          challengeId,
          score: roundedScore,
          accuracy,
          correctCount,
          incorrectCount,
          timeSpentSeconds: Math.max(0, parseInt(timeSpentSeconds, 10) || 0),
        },
      });

      // Record mistakes in Mistake Vault
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

      // Record Study Log
      await tx.studyLog.create({
        data: {
          userId: session.userId,
          action: `Completed ${challenge.title}`,
          score: `${roundedScore > 0 ? `+${roundedScore}` : roundedScore} pts (${accuracy}%)`,
          durationMinutes: Math.max(5, Math.round(timeSpentSeconds / 60)),
        },
      });

      // Update User Profile & Streak
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
            readinessScore: { increment: 3 },
            streakDays: newStreak,
            longestStreak: newLongest,
            lastActiveDate: todayStr,
          },
        });
      }
    });

    // 5. Award XP and evaluate Achievements
    const challengeXP = 30 + Math.round((accuracy / 100) * 20);
    import("@/lib/xp-engine").then(({ awardXP, updatePersonalRecords }) => {
      awardXP(session.userId, "DAILY_CHALLENGE_COMPLETE", challenge.id, challengeXP)
        .then(() => updatePersonalRecords(session.userId))
        .catch(() => {});
    });

    const newAchievements = await evaluateAndAwardAchievements(session.userId);

    return NextResponse.json({
      success: true,
      result: {
        score: roundedScore,
        accuracy,
        correctCount,
        incorrectCount,
        totalQuestions,
        timeSpentSeconds,
      },
      review: detailedReview,
      newAchievements,
    });
  } catch (err: any) {
    console.error("Error submitting daily challenge:", err);
    return NextResponse.json(
      { error: "Failed to submit daily challenge" },
      { status: 500 }
    );
  }
}
