import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const session = await getSession();

    // Find by slug or ID
    const mockTest = await prisma.mockTest.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: "PUBLISHED",
      },
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
            description: true,
          },
        },
        sections: {
          orderBy: { sectionOrder: "asc" },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                slug: true,
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
                correctCount: true,
                incorrectCount: true,
                skippedCount: true,
                timeSpentSeconds: true,
                startedAt: true,
                completedAt: true,
              },
            }
          : false,
      },
    });

    if (!mockTest) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    const userAttempts = (mockTest as any).attempts || [];
    const activeAttempt = userAttempts.find((a: any) => {
      if (a.status !== "IN_PROGRESS") return false;
      const now = Date.now();
      const start = new Date(a.startedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      return elapsed < mockTest.durationSeconds;
    });

    let activeRemainingSeconds = null;
    if (activeAttempt) {
      const now = Date.now();
      const start = new Date(activeAttempt.startedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      activeRemainingSeconds = Math.max(0, mockTest.durationSeconds - elapsed);
    }

    return NextResponse.json({
      mockTest: {
        id: mockTest.id,
        title: mockTest.title,
        slug: mockTest.slug,
        description: mockTest.description,
        mockType: mockTest.mockType,
        difficulty: mockTest.difficulty,
        totalQuestions: mockTest.totalQuestions,
        durationSeconds: mockTest.durationSeconds,
        durationMinutes: Math.round(mockTest.durationSeconds / 60),
        totalMarks: mockTest.totalMarks,
        passingMarks: mockTest.passingMarks,
        negativeMarks: mockTest.negativeMarks,
        navigationRule: mockTest.navigationRule,
        isOfficialPattern: mockTest.isOfficialPattern,
        disclaimer: mockTest.disclaimer,
        exam: mockTest.exam,
        sections: mockTest.sections.map((s) => ({
          id: s.id,
          title: s.title,
          sectionOrder: s.sectionOrder,
          questionCount: s.questionCount,
          marksPerQuestion: s.marksPerQuestion,
          negativeMarks: s.negativeMarks,
          durationSeconds: s.durationSeconds,
          instructions: s.instructions,
          subject: s.subject,
        })),
        userAttempts: userAttempts.filter((a: any) => a.status === "COMPLETED"),
        activeAttempt: activeAttempt
          ? {
              id: activeAttempt.id,
              startedAt: activeAttempt.startedAt,
              remainingSeconds: activeRemainingSeconds,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("GET /api/mock-tests/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mock test details", details: error.message },
      { status: 500 }
    );
  }
}
