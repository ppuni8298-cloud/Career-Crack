import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id: sessionId } = await context.params;
    const body = await req.json();
    const { questionId, timeSpentDelta = 0 } = body;
    const optionKey = body.optionKey || body.selectedOptionKey;

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    // Verify session ownership and active status
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        mode: true,
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (practiceSession.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Session is already completed or abandoned" },
        { status: 400 }
      );
    }

    // Find the session question
    const sessionQuestion = await prisma.practiceSessionQuestion.findUnique({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!sessionQuestion) {
      return NextResponse.json(
        { error: "Question not found in this practice session" },
        { status: 404 }
      );
    }

    const isClearing = !optionKey;

    if (isClearing) {
      // Clear answer
      await prisma.practiceSessionQuestion.update({
        where: { id: sessionQuestion.id },
        data: {
          selectedOptionId: null,
          selectedOptionKey: null,
          answerStatus: "UNANSWERED",
          isAnswered: false,
          timeSpentSeconds: { increment: Math.max(0, parseInt(timeSpentDelta, 10) || 0) },
        },
      });

      return NextResponse.json({
        success: true,
        cleared: true,
        isAnswered: false,
      });
    }

    // User provided an option key ("A", "B", "C", "D")
    const selectedOpt = sessionQuestion.question.options.find(
      (o) => o.optionKey.toUpperCase() === optionKey.toUpperCase()
    );

    if (!selectedOpt) {
      return NextResponse.json({ error: "Invalid option key provided" }, { status: 400 });
    }

    const isCorrect = selectedOpt.isCorrect;
    const answerStatus = isCorrect ? "CORRECT" : "INCORRECT";

    await prisma.practiceSessionQuestion.update({
      where: { id: sessionQuestion.id },
      data: {
        selectedOptionId: selectedOpt.id,
        selectedOptionKey: selectedOpt.optionKey,
        answerStatus,
        isAnswered: true,
        timeSpentSeconds: { increment: Math.max(0, parseInt(timeSpentDelta, 10) || 0) },
      },
    });

    // In Learning Mode, reveal detailed feedback immediately
    if (practiceSession.mode === "LEARNING") {
      const correctOption = sessionQuestion.question.options.find((o) => o.isCorrect);
      return NextResponse.json({
        success: true,
        isAnswered: true,
        isCorrect,
        correctOptionKey: correctOption?.optionKey || null,
        correctOptionText: correctOption?.optionText || null,
        explanation: sessionQuestion.question.explanation,
        concept: sessionQuestion.question.concept,
        shortcut: sessionQuestion.question.shortcut,
        commonMistake: sessionQuestion.question.commonMistake,
      });
    }

    // In Test Mode, confirm save without revealing correctness
    return NextResponse.json({
      success: true,
      saved: true,
      isAnswered: true,
      selectedOptionKey: selectedOpt.optionKey,
    });
  } catch (error: any) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Failed to record answer" }, { status: 500 });
  }
}
