import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;

    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id },
      include: {
        mockTest: {
          include: {
            exam: {
              select: {
                id: true,
                name: true,
                category: true,
                organization: true,
                logo: true,
              },
            },
            sections: {
              orderBy: { sectionOrder: "asc" },
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                  },
                },
              },
            },
            questions: {
              orderBy: { questionOrder: "asc" },
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { order: "asc" },
                      select: {
                        id: true,
                        optionKey: true,
                        optionText: true,
                        // DO NOT EXPOSE isCorrect, explanation
                      },
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Ownership check
    if (attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Elapsed time calculation
    const now = Date.now();
    const start = new Date(attempt.startedAt).getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);
    const remainingSeconds = Math.max(0, attempt.durationSeconds - elapsedSeconds);

    const isTimeExpired = remainingSeconds <= 0 && attempt.status === "IN_PROGRESS";

    // Build question answer map
    const answerMap = new Map<string, any>();
    for (const ans of (attempt as any).answers) {
      answerMap.set(ans.questionId, {
        selectedOptionKey: ans.selectedOptionKey,
        answerStatus: ans.answerStatus,
        markedForReview: ans.markedForReview,
        isVisited: ans.isVisited,
        timeSpentSeconds: ans.timeSpentSeconds,
      });
    }

    // Build sanitized questions array grouped or ordered
    const questions = (attempt as any).mockTest.questions.map((mq: any, index: number) => {
      const q = mq.question;
      const ans = answerMap.get(q.id) || {
        selectedOptionKey: null,
        answerStatus: "UNANSWERED",
        markedForReview: false,
        isVisited: false,
        timeSpentSeconds: 0,
      };

      return {
        id: q.id,
        mockQuestionId: mq.id,
        sectionId: mq.sectionId,
        questionOrder: mq.questionOrder || index + 1,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: mq.marks,
        negativeMarks: mq.negativeMarks,
        options: q.options.map((opt: any) => ({
          id: opt.id,
          key: opt.optionKey,
          text: opt.optionText,
        })),
        // Client-side attempt state
        selectedOptionKey: ans.selectedOptionKey,
        markedForReview: ans.markedForReview,
        isVisited: ans.isVisited,
        timeSpentSeconds: ans.timeSpentSeconds,
      };
    });

    const fullAttempt = attempt as any;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: isTimeExpired ? "TIME_EXPIRED" : attempt.status,
        startedAt: attempt.startedAt,
        durationSeconds: attempt.durationSeconds,
        elapsedSeconds,
        remainingSeconds,
        currentSectionId: attempt.currentSectionId || fullAttempt.mockTest.sections[0]?.id || null,
        mockTest: {
          id: fullAttempt.mockTest.id,
          title: fullAttempt.mockTest.title,
          slug: fullAttempt.mockTest.slug,
          navigationRule: fullAttempt.mockTest.navigationRule,
          totalQuestions: fullAttempt.mockTest.totalQuestions,
          totalMarks: fullAttempt.mockTest.totalMarks,
          negativeMarks: fullAttempt.mockTest.negativeMarks,
          exam: fullAttempt.mockTest.exam,
          sections: fullAttempt.mockTest.sections.map((s: any) => ({
            id: s.id,
            title: s.title,
            sectionOrder: s.sectionOrder,
            questionCount: s.questionCount,
            marksPerQuestion: s.marksPerQuestion,
            negativeMarks: s.negativeMarks,
            durationSeconds: s.durationSeconds,
            subject: s.subject,
          })),
        },
        questions,
      },
    });
  } catch (error: any) {
    console.error("GET /api/mock-tests/attempts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load test attempt", details: error.message },
      { status: 500 }
    );
  }
}
