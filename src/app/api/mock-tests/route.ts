import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // GOVERNMENT, STATE_GOVERNMENT, PLACEMENT
    const search = searchParams.get("search");
    const mockType = searchParams.get("mockType"); // EXAM_SIMULATION, PRACTICE_MOCK, CUSTOM_MOCK

    const where: any = {
      status: "PUBLISHED",
    };

    if (category && category !== "ALL") {
      where.exam = { category };
    }

    if (mockType && mockType !== "ALL") {
      where.mockType = mockType;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { exam: { name: { contains: q } } },
      ];
    }

    const mockTests = await prisma.mockTest.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            organization: true,
            logo: true,
            state: true,
          },
        },
        sections: {
          orderBy: { sectionOrder: "asc" },
          select: {
            id: true,
            title: true,
            sectionOrder: true,
            questionCount: true,
            marksPerQuestion: true,
            negativeMarks: true,
            durationSeconds: true,
            subject: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
        attempts: session
          ? {
              where: { userId: session.userId },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                status: true,
                score: true,
                accuracy: true,
                startedAt: true,
                completedAt: true,
                timeSpentSeconds: true,
              },
            }
          : false,
      },
    });

    const formattedTests = mockTests.map((test) => {
      const userAttempts = (test as any).attempts || [];
      const completedAttempts = userAttempts.filter((a: any) => a.status === "COMPLETED");
      const inProgressAttempt = userAttempts.find((a: any) => {
        if (a.status !== "IN_PROGRESS") return false;
        const now = Date.now();
        const start = new Date(a.startedAt).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        return elapsed < test.durationSeconds;
      });

      const bestScore = completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a: any) => a.score))
        : null;

      const latestAttempt = userAttempts[0] || null;

      return {
        id: test.id,
        title: test.title,
        slug: test.slug,
        description: test.description,
        mockType: test.mockType,
        difficulty: test.difficulty,
        totalQuestions: test.totalQuestions,
        durationSeconds: test.durationSeconds,
        durationMinutes: Math.round(test.durationSeconds / 60),
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        negativeMarks: test.negativeMarks,
        navigationRule: test.navigationRule,
        isOfficialPattern: test.isOfficialPattern,
        disclaimer: test.disclaimer,
        exam: test.exam,
        sections: test.sections,
        userStats: session
          ? {
              totalAttempts: completedAttempts.length,
              bestScore,
              latestScore: latestAttempt?.score ?? null,
              latestAccuracy: latestAttempt?.accuracy ?? null,
              hasActiveAttempt: !!inProgressAttempt,
              activeAttemptId: inProgressAttempt?.id ?? null,
            }
          : null,
      };
    });

    return NextResponse.json({ mockTests: formattedTests });
  } catch (error: any) {
    console.error("GET /api/mock-tests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mock tests", details: error.message },
      { status: 500 }
    );
  }
}
