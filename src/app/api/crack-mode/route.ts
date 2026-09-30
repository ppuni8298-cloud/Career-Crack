import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { selectAdaptiveQuestions } from "@/lib/adaptive-engine";
import { awardXP, updatePersonalRecords } from "@/lib/xp-engine";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const count = Math.min(30, Math.max(5, parseInt(searchParams.get("count") || "10", 10)));
    const mode = (searchParams.get("mode") as "QUICK" | "BALANCED" | "CHALLENGE") || "BALANCED";
    const examId = searchParams.get("examId") || undefined;
    const subjectId = searchParams.get("subjectId") || undefined;
    const topicId = searchParams.get("topicId") || undefined;

    const questions = await selectAdaptiveQuestions(session.userId, {
      count,
      mode,
      examId,
      subjectId,
      topicId,
    });

    return NextResponse.json({
      mode,
      questionCount: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error("GET /api/crack-mode error:", err);
    return NextResponse.json({ error: "Failed to generate adaptive questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { answers, timeSpentSeconds = 60, mode = "BALANCED" } = body;
    // answers format: { [questionId: string]: string (optionKey) }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers object is required" }, { status: 400 });
    }

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Fetch questions with correct answers
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        options: true,
        topic: { select: { id: true, name: true, slug: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    let correctCount = 0;
    let incorrectCount = 0;
    const topicResults: Record<string, { topicName: string; correct: number; total: number }> = {};
    const reviewDetails: any[] = [];
    const now = new Date();

    for (const q of questions) {
      const selectedKey = answers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      const isCorrect = selectedKey && correctOption && selectedKey === correctOption.optionKey;

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      // Aggregate topic
      const tId = q.topic.id;
      if (!topicResults[tId]) {
        topicResults[tId] = { topicName: q.topic.name, correct: 0, total: 0 };
      }
      topicResults[tId].total++;
      if (isCorrect) topicResults[tId].correct++;

      // Update question exposure record
      await (prisma as any).questionExposure.upsert({
        where: {
          userId_questionId: {
            userId: session.userId,
            questionId: q.id,
          },
        },
        update: {
          timesAnswered: { increment: 1 },
          lastAnsweredAt: now,
          lastResult: isCorrect ? "CORRECT" : "INCORRECT",
        },
        create: {
          userId: session.userId,
          questionId: q.id,
          timesShown: 1,
          timesAnswered: 1,
          lastShownAt: now,
          lastAnsweredAt: now,
          lastResult: isCorrect ? "CORRECT" : "INCORRECT",
        },
      });

      // If incorrect, add/update Mistake Vault
      if (!isCorrect && correctOption) {
        await prisma.userMistake.upsert({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId: q.id,
            },
          },
          update: {
            selectedOptionKey: selectedKey || "SKIPPED",
            correctOptionKey: correctOption.optionKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: { increment: 1 },
            lastAttemptedAt: now,
          },
          create: {
            userId: session.userId,
            questionId: q.id,
            selectedOptionKey: selectedKey || "SKIPPED",
            correctOptionKey: correctOption.optionKey,
            reviewStatus: "UNRESOLVED",
            timesIncorrect: 1,
            lastAttemptedAt: now,
          },
        });
      }

      reviewDetails.push({
        questionId: q.id,
        questionText: q.questionText,
        selectedKey,
        correctKey: correctOption?.optionKey,
        isCorrect,
        explanation: q.explanation,
        shortcut: q.shortcut,
        topicName: q.topic.name,
      });
    }

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Create a PracticeSession to maintain platform continuity
    const sessionRecord = await prisma.practiceSession.create({
      data: {
        userId: session.userId,
        title: `Adaptive Crack Mode (${mode})`,
        mode: "TEST",
        difficulty: mode === "CHALLENGE" ? "HARD" : "MIXED",
        totalQuestions,
        timeSpentSeconds,
        status: "COMPLETED",
        score: correctCount * 2 - incorrectCount * 0.5,
        accuracy,
        correctCount,
        incorrectCount,
        completedAt: now,
      },
    });

    // Award XP
    const xpBase = mode === "CHALLENGE" ? 35 : 25;
    const xpBonus = Math.round((accuracy / 100) * 15);
    const xpResult = await awardXP(
      session.userId,
      "PRACTICE_SESSION_COMPLETE",
      sessionRecord.id,
      xpBase + xpBonus
    );

    await updatePersonalRecords(session.userId);

    // Compute Next Action recommendation
    let nextRecommendation = "Great work! Return to your Roadmap to view next stage progress.";
    if (accuracy < 60) {
      nextRecommendation = "Review the explanations above and visit your Mistake Vault to master missed concepts.";
    } else if (accuracy >= 80) {
      nextRecommendation = "Exceptional performance! Consider taking a full-length mock test to challenge exam endurance.";
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionRecord.id,
      result: {
        accuracy,
        correctCount,
        incorrectCount,
        totalQuestions,
        timeSpentSeconds,
        xpAwarded: xpResult.xpAwarded,
        totalXP: xpResult.totalXP,
        level: xpResult.level,
      },
      topicBreakdown: Object.values(topicResults).map((tr) => ({
        topicName: tr.topicName,
        accuracy: Math.round((tr.correct / tr.total) * 100),
        status: tr.correct === tr.total ? "IMPROVED" : "NEEDS_WORK",
      })),
      review: reviewDetails,
      nextAction: nextRecommendation,
    });
  } catch (err: any) {
    console.error("POST /api/crack-mode error:", err);
    return NextResponse.json({ error: "Failed to submit adaptive session" }, { status: 500 });
  }
}
