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

    // Verify session ownership
    if (practiceSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access to session" }, { status: 403 });
    }

    const now = new Date().getTime();
    const startTime = new Date(practiceSession.startedAt).getTime();

    // Check timer expiration for timed sessions
    let remainingSeconds: number | null = null;
    let isExpired = false;

    if (practiceSession.durationSeconds) {
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      remainingSeconds = Math.max(0, practiceSession.durationSeconds - elapsedSeconds);
      if (remainingSeconds <= 0 && practiceSession.status === "IN_PROGRESS") {
        isExpired = true;
      }
    }

    // Auto-complete if timer expired
    let finalStatus = practiceSession.status;
    if (isExpired) {
      finalStatus = "COMPLETED";
      // Auto-update to COMPLETED if expired
      await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    const isTestMode = practiceSession.mode === "TEST";
    const hideAnswers = isTestMode && finalStatus === "IN_PROGRESS";

    // Format questions safely
    const formattedQuestions = practiceSession.sessionQuestions.map((sq) => {
      const q = sq.question;
      return {
        sessionQuestionId: sq.id,
        questionId: q.id,
        questionOrder: sq.questionOrder,
        selectedOptionId: sq.selectedOptionId,
        selectedOptionKey: sq.selectedOptionKey,
        answerStatus: sq.answerStatus,
        markedForReview: sq.markedForReview,
        isAnswered: sq.isAnswered,
        timeSpentSeconds: sq.timeSpentSeconds,
        questionText: q.questionText,
        questionType: q.questionType,
        sourceType: q.sourceType,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        pyqMetadata: q.pyqMetadata,
        tags: q.tags.map((t) => t.tag.name),
        // Redact correctness in test mode
        options: q.options.map((opt) => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          order: opt.order,
          ...(hideAnswers ? {} : { isCorrect: opt.isCorrect }),
        })),
        // Redact explanation in test mode while in progress
        ...(hideAnswers
          ? {}
          : {
              explanation: q.explanation,
              concept: q.concept,
              shortcut: q.shortcut,
              commonMistake: q.commonMistake,
            }),
      };
    });

    return NextResponse.json({
      session: {
        id: practiceSession.id,
        title: practiceSession.title,
        mode: practiceSession.mode,
        difficulty: practiceSession.difficulty,
        sourceType: practiceSession.sourceType,
        totalQuestions: practiceSession.totalQuestions,
        durationSeconds: practiceSession.durationSeconds,
        remainingSeconds,
        status: finalStatus,
        startedAt: practiceSession.startedAt,
        completedAt: practiceSession.completedAt,
        exam: practiceSession.exam,
        subject: practiceSession.subject,
        topic: practiceSession.topic,
        questions: formattedQuestions,
      },
    });
  } catch (error: any) {
    console.error("Error loading practice session:", error);
    return NextResponse.json(
      { error: "Failed to load practice session" },
      { status: 500 }
    );
  }
}
