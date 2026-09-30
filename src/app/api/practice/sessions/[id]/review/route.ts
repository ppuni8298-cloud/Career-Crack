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
    const { questionId, markedForReview } = await req.json();

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    // Verify session belongs to user
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true },
    });

    if (!practiceSession || practiceSession.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const updated = await prisma.practiceSessionQuestion.update({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      data: {
        markedForReview: Boolean(markedForReview),
      },
    });

    return NextResponse.json({
      success: true,
      markedForReview: updated.markedForReview,
    });
  } catch (error: any) {
    console.error("Error updating review status:", error);
    return NextResponse.json(
      { error: "Failed to update review status" },
      { status: 500 }
    );
  }
}
