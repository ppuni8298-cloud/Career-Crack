import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
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
        exam: { select: { id: true, name: true, slug: true } },
        subject: { select: { id: true, name: true, slug: true } },
        topic: { select: { id: true, name: true, slug: true } },
        sessionQuestions: {
          orderBy: { questionOrder: "asc" },
          include: {
            question: {
              include: {
                topic: { select: { id: true, name: true, slug: true } },
                subject: { select: { id: true, name: true, slug: true } },
                options: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    optionKey: true,
                    optionText: true,
                    order: true,
                    isCorrect: true,
                  },
                },
                pyqMetadata: true,
                tags: { include: { tag: true } },
              },
            },
          },
        },
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Practice session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Fetch user bookmarks for these questions to mark isBookmarked
    const userBookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.userId,
        questionId: {
          in: practiceSession.sessionQuestions.map((sq) => sq.questionId),
        },
      },
      select: { questionId: true },
    });
    const bookmarkedSet = new Set(userBookmarks.map((b) => b.questionId));

    // Topic Performance Breakdown
    const topicStats: Record<
      string,
      { topicName: string; total: number; correct: number; incorrect: number; skipped: number }
    > = {};

    practiceSession.sessionQuestions.forEach((sq) => {
      const topicName = sq.question.topic?.name || "General";
      if (!topicStats[topicName]) {
        topicStats[topicName] = { topicName, total: 0, correct: 0, incorrect: 0, skipped: 0 };
      }
      topicStats[topicName].total++;
      if (sq.answerStatus === "CORRECT") topicStats[topicName].correct++;
      else if (sq.answerStatus === "INCORRECT") topicStats[topicName].incorrect++;
      else topicStats[topicName].skipped++;
    });

    const topicBreakdown = Object.values(topicStats).map((stat) => ({
      ...stat,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    }));

    const strengths = topicBreakdown.filter((t) => t.accuracy >= 75);
    const areasToImprove = topicBreakdown.filter((t) => t.accuracy < 75);

    // Format all reviewed questions
    const reviewedQuestions = practiceSession.sessionQuestions.map((sq) => {
      const q = sq.question;
      const correctOpt = q.options.find((o) => o.isCorrect);
      return {
        sessionQuestionId: sq.id,
        questionId: q.id,
        questionOrder: sq.questionOrder,
        selectedOptionKey: sq.selectedOptionKey,
        correctOptionKey: correctOpt?.optionKey || "A",
        correctOptionText: correctOpt?.optionText || "",
        answerStatus: sq.answerStatus,
        markedForReview: sq.markedForReview,
        isAnswered: sq.isAnswered,
        timeSpentSeconds: sq.timeSpentSeconds,
        questionText: q.questionText,
        difficulty: q.difficulty,
        sourceType: q.sourceType,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        topic: q.topic?.name,
        subject: q.subject?.name,
        options: q.options,
        explanation: q.explanation,
        concept: q.concept,
        shortcut: q.shortcut,
        commonMistake: q.commonMistake,
        pyqMetadata: q.pyqMetadata,
        tags: q.tags.map((t) => t.tag.name),
        isBookmarked: bookmarkedSet.has(q.id),
      };
    });

    return NextResponse.json({
      summary: {
        id: practiceSession.id,
        title: practiceSession.title,
        mode: practiceSession.mode,
        difficulty: practiceSession.difficulty,
        sourceType: practiceSession.sourceType,
        status: practiceSession.status,
        totalQuestions: practiceSession.totalQuestions,
        correctCount: practiceSession.correctCount,
        incorrectCount: practiceSession.incorrectCount,
        skippedCount: practiceSession.skippedCount,
        score: practiceSession.score || 0,
        accuracy: practiceSession.accuracy || 0,
        timeSpentSeconds: practiceSession.timeSpentSeconds,
        startedAt: practiceSession.startedAt,
        completedAt: practiceSession.completedAt,
        exam: practiceSession.exam,
        subject: practiceSession.subject,
        topic: practiceSession.topic,
      },
      topicBreakdown,
      strengths,
      areasToImprove,
      questions: reviewedQuestions,
    });
  } catch (error: any) {
    console.error("Error loading practice results:", error);
    return NextResponse.json(
      { error: "Failed to load practice results" },
      { status: 500 }
    );
  }
}
