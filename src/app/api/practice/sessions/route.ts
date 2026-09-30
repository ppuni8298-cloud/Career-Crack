import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/practice/sessions -> Create a new practice session
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to start a practice session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      examId,
      subjectId,
      topicId,
      difficulty = "MIXED",
      sourceType = "ALL",
      totalQuestions = 10,
      durationMinutes = null,
      mode = "TEST", // "TEST" | "LEARNING"
      title,
    } = body;

    // Validate mode and question count
    const requestedCount = Math.min(50, Math.max(5, parseInt(totalQuestions, 10) || 10));
    const validMode = mode === "LEARNING" ? "LEARNING" : "TEST";

    // Build question query filter
    const where: any = { active: true };

    if (examId && examId !== "ALL") {
      where.OR = [
        { examId },
        { subject: { examSubjects: { some: { examId } } } },
      ];
    }

    if (subjectId && subjectId !== "ALL") {
      where.subjectId = subjectId;
    }

    if (topicId && topicId !== "ALL") {
      where.topicId = topicId;
    }

    if (difficulty && difficulty !== "MIXED" && difficulty !== "ALL") {
      where.difficulty = difficulty.toUpperCase();
    }

    if (sourceType && sourceType !== "ALL") {
      where.sourceType = sourceType.toUpperCase();
    }

    // Fetch candidate questions
    const candidateQuestions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        marks: true,
        negativeMarks: true,
      },
    });

    if (candidateQuestions.length === 0) {
      return NextResponse.json(
        {
          error: "No questions found matching your selected criteria.",
          availableCount: 0,
        },
        { status: 400 }
      );
    }

    // Shuffle and pick up to requestedCount
    const shuffled = [...candidateQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, requestedCount);
    const actualCount = selectedQuestions.length;

    // Calculate duration in seconds if timed
    let durationSeconds: number | null = null;
    if (durationMinutes && typeof durationMinutes === "number" && durationMinutes > 0) {
      durationSeconds = durationMinutes * 60;
    } else if (durationMinutes === "AUTO") {
      // 1 minute per question default
      durationSeconds = actualCount * 60;
    }

    // Generate descriptive session title if not provided
    let sessionTitle = title;
    if (!sessionTitle) {
      if (examId && examId !== "ALL") {
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        sessionTitle = `${exam?.name || "Exam"} ${validMode === "LEARNING" ? "Learning Drill" : "Practice Test"}`;
      } else if (subjectId && subjectId !== "ALL") {
        const sub = await prisma.subject.findUnique({ where: { id: subjectId } });
        sessionTitle = `${sub?.name || "Subject"} ${validMode === "LEARNING" ? "Learning Drill" : "Practice Test"}`;
      } else {
        sessionTitle = `Mixed Rapid Drill (${actualCount} Questions)`;
      }
    }

    // Create session & session questions in transaction
    const newSession = await prisma.$transaction(async (tx) => {
      const created = await tx.practiceSession.create({
        data: {
          userId: session.userId,
          examId: examId && examId !== "ALL" ? examId : null,
          subjectId: subjectId && subjectId !== "ALL" ? subjectId : null,
          topicId: topicId && topicId !== "ALL" ? topicId : null,
          title: sessionTitle,
          mode: validMode,
          difficulty: difficulty || "MIXED",
          sourceType: sourceType || "ALL",
          totalQuestions: actualCount,
          durationSeconds,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      // Create individual session question records
      await tx.practiceSessionQuestion.createMany({
        data: selectedQuestions.map((q, idx) => ({
          sessionId: created.id,
          questionId: q.id,
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
      session: {
        id: newSession.id,
        title: newSession.title,
        mode: newSession.mode,
        totalQuestions: newSession.totalQuestions,
        durationSeconds: newSession.durationSeconds,
        status: newSession.status,
        startedAt: newSession.startedAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating practice session:", error);
    return NextResponse.json(
      { error: "Failed to initialize practice session" },
      { status: 500 }
    );
  }
}
