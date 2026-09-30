import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await context.params;

    // Find mock test by ID or slug
    const mockTest = await prisma.mockTest.findFirst({
      where: {
        OR: [{ id: slug }, { slug: slug }],
        status: "PUBLISHED",
      },
      include: {
        sections: {
          orderBy: { sectionOrder: "asc" },
        },
        questions: {
          orderBy: { questionOrder: "asc" },
        },
      },
    });

    if (!mockTest) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    // Check if an unexpired in-progress attempt already exists
    const existingAttempt = await prisma.mockTestAttempt.findFirst({
      where: {
        userId: session.userId,
        mockTestId: mockTest.id,
        status: "IN_PROGRESS",
      },
      orderBy: { startedAt: "desc" },
    });

    if (existingAttempt) {
      const now = Date.now();
      const start = new Date(existingAttempt.startedAt).getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);

      if (elapsedSeconds < mockTest.durationSeconds) {
        return NextResponse.json({
          attemptId: existingAttempt.id,
          isResumed: true,
          remainingSeconds: mockTest.durationSeconds - elapsedSeconds,
          message: "Resuming existing active mock test attempt",
        });
      } else {
        // Mark stale attempt as EXPIRED
        await prisma.mockTestAttempt.update({
          where: { id: existingAttempt.id },
          data: { status: "EXPIRED", completedAt: new Date() },
        });
      }
    }

    // Create a new attempt transactionally with all answer placeholders
    const newAttempt = await prisma.$transaction(async (tx) => {
      const attempt = await tx.mockTestAttempt.create({
        data: {
          userId: session.userId,
          mockTestId: mockTest.id,
          status: "IN_PROGRESS",
          durationSeconds: mockTest.durationSeconds,
          startedAt: new Date(),
          currentSectionId: mockTest.sections[0]?.id || null,
        },
      });

      // Pre-create answer records for all questions in this mock test
      for (const mq of mockTest.questions) {
        await tx.mockTestAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: mq.questionId,
            sectionId: mq.sectionId,
            answerStatus: "UNANSWERED",
            markedForReview: false,
            isVisited: false,
            timeSpentSeconds: 0,
          },
        });
      }

      return attempt;
    });

    return NextResponse.json({
      attemptId: newAttempt.id,
      isResumed: false,
      remainingSeconds: mockTest.durationSeconds,
      message: "Started new mock test attempt",
    });
  } catch (error: any) {
    console.error("POST /api/mock-tests/[slug]/attempts error:", error);
    return NextResponse.json(
      { error: "Failed to initialize mock test attempt", details: error.message },
      { status: 500 }
    );
  }
}
