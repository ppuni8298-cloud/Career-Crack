import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      mode = "LEARNING",
      onlyUnresolved = true,
      topicId,
      questionCount = 10,
    } = body;

    const limit = Math.min(30, Math.max(1, parseInt(questionCount, 10) || 10));

    // Build mistake query
    const where: any = {
      userId: session.userId,
    };

    if (onlyUnresolved) {
      where.reviewStatus = "UNRESOLVED";
    }

    if (topicId && topicId !== "ALL") {
      where.question = {
        topicId,
      };
    }

    const userMistakes = await prisma.userMistake.findMany({
      where,
      include: {
        question: {
          include: {
            topic: true,
            subject: true,
          },
        },
      },
      orderBy: { lastAttemptedAt: "desc" },
    });

    if (userMistakes.length === 0) {
      return NextResponse.json(
        { error: "No matching mistakes found in your vault to practice." },
        { status: 400 }
      );
    }

    // Shuffle and pick up to limit
    const shuffled = [...userMistakes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    const validMode = mode === "TEST" ? "TEST" : "LEARNING";
    const sessionTitle = `Mistake Vault Drill (${selected.length} Questions)`;

    // Create session & session questions transactionally
    const newSession = await prisma.$transaction(async (tx) => {
      const created = await tx.practiceSession.create({
        data: {
          userId: session.userId,
          title: sessionTitle,
          mode: validMode,
          difficulty: "MIXED",
          sourceType: "ALL",
          totalQuestions: selected.length,
          durationSeconds: validMode === "TEST" ? selected.length * 60 : null,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      await tx.practiceSessionQuestion.createMany({
        data: selected.map((m, idx) => ({
          sessionId: created.id,
          questionId: m.questionId,
          questionOrder: idx + 1,
          answerStatus: "UNANSWERED",
          markedForReview: false,
          isAnswered: false,
          timeSpentSeconds: 0,
        })),
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      totalQuestions: selected.length,
      session: {
        id: newSession.id,
        title: newSession.title,
        mode: newSession.mode,
      },
    });
  } catch (err: any) {
    console.error("Error creating mistake practice drill:", err);
    return NextResponse.json(
      { error: "Failed to create mistake practice session" },
      { status: 500 }
    );
  }
}
