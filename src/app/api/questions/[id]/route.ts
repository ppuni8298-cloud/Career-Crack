import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: {
          select: { id: true, name: true, slug: true, category: true },
        },
        subject: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        topic: {
          select: { id: true, name: true, slug: true },
        },
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
        tags: {
          include: { tag: true },
        },
        ...(session
          ? {
              bookmarks: {
                where: { userId: session.userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      question: {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        sourceType: question.sourceType,
        difficulty: question.difficulty,
        explanation: question.explanation,
        shortcut: question.shortcut,
        commonMistake: question.commonMistake,
        concept: question.concept,
        expectedTimeSeconds: question.expectedTimeSeconds,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        verified: question.verified,
        verificationStatus: question.verificationStatus,
        createdAt: question.createdAt,
        exam: question.exam,
        subject: question.subject,
        topic: question.topic,
        options: question.options,
        pyqMetadata: question.pyqMetadata,
        tags: question.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
        isBookmarked: Boolean(
          session && (question as any).bookmarks && (question as any).bookmarks.length > 0
        ),
      },
    });
  } catch (error: any) {
    console.error("Error fetching question details:", error);
    return NextResponse.json(
      { error: "Failed to fetch question details" },
      { status: 500 }
    );
  }
}
