import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/questions/[id]/bookmark -> add bookmark
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to bookmark questions" },
        { status: 401 }
      );
    }

    const { id: questionId } = await context.params;

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Upsert bookmark to guarantee idempotency and avoid duplicates
    await prisma.bookmark.upsert({
      where: {
        userId_questionId: {
          userId: session.userId,
          questionId,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        questionId,
      },
    });

    return NextResponse.json({
      success: true,
      bookmarked: true,
      message: "Question bookmarked successfully",
    });
  } catch (error: any) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to bookmark question" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id]/bookmark -> remove bookmark
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: questionId } = await context.params;

    await prisma.bookmark.deleteMany({
      where: {
        userId: session.userId,
        questionId,
      },
    });

    return NextResponse.json({
      success: true,
      bookmarked: false,
      message: "Bookmark removed successfully",
    });
  } catch (error: any) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
