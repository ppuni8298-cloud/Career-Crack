import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: { userId: session.userId },
      }),
      prisma.bookmark.findMany({
        where: { userId: session.userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          question: {
            include: {
              exam: { select: { id: true, name: true, slug: true } },
              subject: { select: { id: true, name: true, slug: true, icon: true } },
              topic: { select: { id: true, name: true, slug: true } },
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
      }),
    ]);

    const formattedQuestions = bookmarks.map((b) => ({
      ...b.question,
      tags: b.question.tags.map((t: any) => ({ name: t.tag.name, slug: t.tag.slug })),
      bookmarkedAt: b.createdAt,
      isBookmarked: true,
    }));

    return NextResponse.json({
      questions: formattedQuestions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
