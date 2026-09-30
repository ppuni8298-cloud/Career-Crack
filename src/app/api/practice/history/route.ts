import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const [total, sessions, aggregateStats] = await Promise.all([
      prisma.practiceSession.count({
        where: { userId: session.userId },
      }),
      prisma.practiceSession.findMany({
        where: { userId: session.userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          exam: { select: { name: true, slug: true } },
          subject: { select: { name: true, slug: true } },
        },
      }),
      prisma.practiceSession.aggregate({
        where: {
          userId: session.userId,
          status: "COMPLETED",
        },
        _sum: {
          totalQuestions: true,
          correctCount: true,
          timeSpentSeconds: true,
        },
        _avg: {
          accuracy: true,
          score: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      mode: s.mode,
      status: s.status,
      totalQuestions: s.totalQuestions,
      correctCount: s.correctCount,
      accuracy: s.accuracy,
      score: s.score,
      timeSpentSeconds: s.timeSpentSeconds,
      createdAt: s.createdAt,
      completedAt: s.completedAt,
      examName: s.exam?.name,
      subjectName: s.subject?.name,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      stats: {
        totalSessionsCompleted: aggregateStats._count.id || 0,
        totalQuestionsAttempted: aggregateStats._sum.totalQuestions || 0,
        totalCorrectAnswers: aggregateStats._sum.correctCount || 0,
        totalTimeSpentMinutes: Math.round((aggregateStats._sum.timeSpentSeconds || 0) / 60),
        averageAccuracy: Math.round(aggregateStats._avg.accuracy || 0),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error loading practice history:", error);
    return NextResponse.json(
      { error: "Failed to load practice history" },
      { status: 500 }
    );
  }
}
