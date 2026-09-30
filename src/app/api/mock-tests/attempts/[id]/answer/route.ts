import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { questionId, selectedOptionKey, isVisited, timeSpentIncrement } = body;

    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    // Verify attempt ownership and active status
    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id },
      include: {
        mockTest: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is already submitted or closed" }, { status: 400 });
    }

    // Check time expiry
    const now = Date.now();
    const start = new Date(attempt.startedAt).getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    if (elapsedSeconds > attempt.durationSeconds + 30) {
      // 30s buffer for network latency
      return NextResponse.json({ error: "Test duration has elapsed" }, { status: 400 });
    }

    // Fetch the mock test question to get sectionId
    const mockQuestion = await prisma.mockTestQuestion.findUnique({
      where: {
        mockTestId_questionId: {
          mockTestId: attempt.mockTestId,
          questionId,
        },
      },
      select: { sectionId: true },
    });
    const sectionId = mockQuestion?.sectionId || "";

    // If an option key is provided, find the option ID
    let selectedOptionId: string | null = null;
    if (selectedOptionKey) {
      const option = await prisma.questionOption.findFirst({
        where: {
          questionId,
          optionKey: selectedOptionKey,
        },
      });
      if (option) {
        selectedOptionId = option.id;
      }
    }

    // Update answer
    const updatedAnswer = await prisma.mockTestAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: id,
          questionId,
        },
      },
      update: {
        selectedOptionKey: selectedOptionKey || null,
        selectedOptionId,
        answerStatus: selectedOptionKey ? "ANSWERED" : "UNANSWERED",
        isVisited: isVisited !== undefined ? isVisited : true,
        ...(timeSpentIncrement && timeSpentIncrement > 0
          ? { timeSpentSeconds: { increment: Math.min(60, timeSpentIncrement) } }
          : {}),
      },
      create: {
        attemptId: id,
        questionId,
        sectionId,
        selectedOptionKey: selectedOptionKey || null,
        selectedOptionId,
        answerStatus: selectedOptionKey ? "ANSWERED" : "UNANSWERED",
        isVisited: true,
        timeSpentSeconds: timeSpentIncrement ? Math.min(60, timeSpentIncrement) : 0,
      },
    });

    return NextResponse.json({
      success: true,
      answer: {
        questionId,
        selectedOptionKey: updatedAnswer.selectedOptionKey,
        answerStatus: updatedAnswer.answerStatus,
        isVisited: updatedAnswer.isVisited,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/mock-tests/attempts/[id]/answer error:", error);
    return NextResponse.json(
      { error: "Failed to record answer", details: error.message },
      { status: 500 }
    );
  }
}
