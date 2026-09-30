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
    const { questionId, markedForReview } = body;

    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id },
    });

    if (!attempt || attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is closed" }, { status: 400 });
    }

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

    const answer = await prisma.mockTestAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: id,
          questionId,
        },
      },
      update: {
        markedForReview: !!markedForReview,
        isVisited: true,
      },
      create: {
        attemptId: id,
        questionId,
        sectionId,
        markedForReview: !!markedForReview,
        isVisited: true,
        answerStatus: "UNANSWERED",
      },
    });

    return NextResponse.json({
      success: true,
      markedForReview: answer.markedForReview,
    });
  } catch (error: any) {
    console.error("PATCH /api/mock-tests/attempts/[id]/review error:", error);
    return NextResponse.json(
      { error: "Failed to update review status", details: error.message },
      { status: 500 }
    );
  }
}
