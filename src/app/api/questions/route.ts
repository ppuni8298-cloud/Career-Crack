import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const exam = searchParams.get("exam");
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const sourceType = searchParams.get("sourceType");
    const verified = searchParams.get("verified");
    const tag = searchParams.get("tag");
    const bookmarkedOnly = searchParams.get("bookmarked") === "true";
    const search = searchParams.get("search");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Check optional authenticated user session
    const session = await getSession();

    const where: any = { active: true };

    if (exam && exam !== "ALL") {
      where.OR = [
        { exam: { slug: exam } },
        { subject: { examSubjects: { some: { exam: { slug: exam } } } } },
      ];
    }

    if (subject && subject !== "ALL") {
      where.subject = { slug: subject };
    }

    if (topic && topic !== "ALL") {
      where.topic = { slug: topic };
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty.toUpperCase();
    }

    if (sourceType && sourceType !== "ALL") {
      where.sourceType = sourceType.toUpperCase();
    }

    if (verified === "true") {
      where.verified = true;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    if (bookmarkedOnly) {
      if (!session) {
        return NextResponse.json({
          questions: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          authenticated: false,
        });
      }
      where.bookmarks = {
        some: { userId: session.userId },
      };
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { questionText: { contains: term } },
            { concept: { contains: term } },
            { shortcut: { contains: term } },
            { topic: { name: { contains: term } } },
            { subject: { name: { contains: term } } },
          ],
        },
      ];
    }

    // Run count and query in parallel
    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          exam: {
            select: { id: true, name: true, slug: true },
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
      }),
    ]);

    const formatted = questions.map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      sourceType: q.sourceType,
      difficulty: q.difficulty,
      explanation: q.explanation,
      shortcut: q.shortcut,
      commonMistake: q.commonMistake,
      concept: q.concept,
      expectedTimeSeconds: q.expectedTimeSeconds,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      verified: q.verified,
      verificationStatus: q.verificationStatus,
      createdAt: q.createdAt,
      exam: q.exam,
      subject: q.subject,
      topic: q.topic,
      options: q.options,
      pyqMetadata: q.pyqMetadata,
      tags: q.tags.map((t: any) => ({ name: t.tag.name, slug: t.tag.slug })),
      isBookmarked: Boolean(session && q.bookmarks && q.bookmarks.length > 0),
    }));

    return NextResponse.json({
      questions: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error querying questions:", error);
    return NextResponse.json(
      { error: "Failed to query questions" },
      { status: 500 }
    );
  }
}
