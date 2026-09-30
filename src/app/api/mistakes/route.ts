import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL"; // ALL, UNRESOLVED, REVIEWED, RESOLVED
    const examFilter = searchParams.get("exam");
    const subjectFilter = searchParams.get("subject");
    const topicFilter = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.userId,
    };

    if (status !== "ALL") {
      where.reviewStatus = status;
    }

    const questionWhere: any = {};

    if (examFilter && examFilter !== "ALL") {
      questionWhere.OR = [
        { examId: examFilter },
        { exam: { slug: examFilter } },
      ];
    }

    if (subjectFilter && subjectFilter !== "ALL") {
      questionWhere.subject = {
        OR: [{ id: subjectFilter }, { slug: subjectFilter }],
      };
    }

    if (topicFilter && topicFilter !== "ALL") {
      questionWhere.topic = {
        OR: [{ id: topicFilter }, { slug: topicFilter }],
      };
    }

    if (difficulty && difficulty !== "ALL" && difficulty !== "MIXED") {
      questionWhere.difficulty = difficulty;
    }

    if (search) {
      questionWhere.OR = [
        { questionText: { contains: search } },
        { topic: { name: { contains: search } } },
        { explanation: { contains: search } },
      ];
    }

    if (Object.keys(questionWhere).length > 0) {
      where.question = questionWhere;
    }

    // Counts for stats summary
    const [total, unresolved, reviewed, resolved] = await Promise.all([
      prisma.userMistake.count({ where: { userId: session.userId } }),
      prisma.userMistake.count({ where: { userId: session.userId, reviewStatus: "UNRESOLVED" } }),
      prisma.userMistake.count({ where: { userId: session.userId, reviewStatus: "REVIEWED" } }),
      prisma.userMistake.count({ where: { userId: session.userId, reviewStatus: "RESOLVED" } }),
    ]);

    const filteredTotal = await prisma.userMistake.count({ where });

    const mistakes = await prisma.userMistake.findMany({
      where,
      orderBy: { lastAttemptedAt: "desc" },
      skip,
      take: limit,
      include: {
        question: {
          include: {
            exam: { select: { id: true, name: true, slug: true } },
            subject: { select: { id: true, name: true, slug: true } },
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
    });

    // Check user bookmarks
    const questionIds = mistakes.map((m) => m.questionId);
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.userId,
        questionId: { in: questionIds },
      },
      select: { questionId: true },
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.questionId));

    const formattedMistakes = mistakes.map((m) => ({
      id: m.id,
      questionId: m.questionId,
      selectedOptionKey: m.selectedOptionKey,
      correctOptionKey: m.correctOptionKey,
      reviewStatus: m.reviewStatus,
      timesIncorrect: m.timesIncorrect,
      lastAttemptedAt: m.lastAttemptedAt,
      resolvedAt: m.resolvedAt,
      question: {
        ...m.question,
        tags: m.question.tags.map((t) => t.tag.name),
        isBookmarked: bookmarkedSet.has(m.questionId),
      },
    }));

    return NextResponse.json({
      mistakes: formattedMistakes,
      stats: {
        total,
        unresolved,
        reviewed,
        resolved,
      },
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error("Error fetching mistakes:", err);
    return NextResponse.json({ error: "Failed to load mistakes" }, { status: 500 });
  }
}
