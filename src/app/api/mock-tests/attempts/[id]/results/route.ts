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
                slug: true,
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
                    },
                    topic: {
                      select: {
                        id: true,
                        name: true,
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

    if (attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const fullAttempt = attempt as any;

    const answerMap = new Map<string, any>();
    for (const ans of fullAttempt.answers) {
      answerMap.set(ans.questionId, ans);
    }

    // Build Sectional Breakdown
    const sectionStatsMap = new Map<string, {
      sectionId: string;
      title: string;
      subjectName: string;
      totalQuestions: number;
      attemptedCount: number;
      correctCount: number;
      incorrectCount: number;
      skippedCount: number;
      marksObtained: number;
      maxMarks: number;
      timeSpentSeconds: number;
    }>();

    for (const s of fullAttempt.mockTest.sections) {
      sectionStatsMap.set(s.id, {
        sectionId: s.id,
        title: s.title,
        subjectName: s.subject?.name || "General",
        totalQuestions: 0,
        attemptedCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        skippedCount: 0,
        marksObtained: 0,
        maxMarks: 0,
        timeSpentSeconds: 0,
      });
    }

    // Build Question Review List
    const questionReview = fullAttempt.mockTest.questions.map((mq: any, index: number) => {
      const q = mq.question;
      const ans = answerMap.get(q.id);
      const userSelectedKey = ans?.selectedOptionKey || null;
      const correctOption = q.options.find((o: any) => o.isCorrect);
      const correctKey = correctOption?.optionKey || "A";

      const status: "CORRECT" | "INCORRECT" | "SKIPPED" = !userSelectedKey
        ? "SKIPPED"
        : userSelectedKey === correctKey
        ? "CORRECT"
        : "INCORRECT";

      let marksEarned = 0;
      if (status === "CORRECT") marksEarned = mq.marks;
      else if (status === "INCORRECT") marksEarned = -mq.negativeMarks;

      // Update section stats
      const secStat = sectionStatsMap.get(mq.sectionId);
      if (secStat) {
        secStat.totalQuestions++;
        secStat.maxMarks += mq.marks;
        secStat.timeSpentSeconds += ans?.timeSpentSeconds || 0;
        if (status === "CORRECT") {
          secStat.attemptedCount++;
          secStat.correctCount++;
          secStat.marksObtained += mq.marks;
        } else if (status === "INCORRECT") {
          secStat.attemptedCount++;
          secStat.incorrectCount++;
          secStat.marksObtained -= mq.negativeMarks;
        } else {
          secStat.skippedCount++;
        }
      }

      return {
        id: q.id,
        questionOrder: mq.questionOrder || index + 1,
        sectionId: mq.sectionId,
        sectionTitle: fullAttempt.mockTest.sections.find((s: any) => s.id === mq.sectionId)?.title || "Section",
        topicName: q.topic?.name || "General",
        text: q.text,
        difficulty: q.difficulty,
        marks: mq.marks,
        negativeMarks: mq.negativeMarks,
        marksEarned,
        userSelectedKey,
        correctKey,
        status,
        options: q.options.map((o: any) => ({
          id: o.id,
          key: o.optionKey,
          text: o.optionText,
          imageUrl: o.imageUrl,
          isCorrect: o.isCorrect,
        })),
        explanation: q.explanation,
        concept: q.concept,
        shortcut: q.shortcut,
        commonMistake: q.commonMistake,
      };
    });

    const sectionsBreakdown = Array.from(sectionStatsMap.values()).map((sec) => ({
      ...sec,
      marksObtained: parseFloat(sec.marksObtained.toFixed(2)),
      accuracy:
        sec.attemptedCount > 0
          ? parseFloat(((sec.correctCount / sec.attemptedCount) * 100).toFixed(1))
          : 0,
    }));

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        totalMarks: fullAttempt.mockTest.totalMarks,
        passingMarks: fullAttempt.mockTest.passingMarks,
        percentage: parseFloat(
          ((attempt.score / (fullAttempt.mockTest.totalMarks || 1)) * 100).toFixed(1)
        ),
        accuracy: attempt.accuracy,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        skippedCount: attempt.skippedCount,
        totalQuestions: fullAttempt.mockTest.totalQuestions,
        timeSpentSeconds: attempt.timeSpentSeconds,
        durationSeconds: attempt.durationSeconds,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        mockTest: {
          id: fullAttempt.mockTest.id,
          title: fullAttempt.mockTest.title,
          slug: fullAttempt.mockTest.slug,
          mockType: fullAttempt.mockTest.mockType,
          difficulty: fullAttempt.mockTest.difficulty,
          exam: fullAttempt.mockTest.exam,
        },
        sectionsBreakdown,
        questions: questionReview,
      },
    });
  } catch (error: any) {
    console.error("GET /api/mock-tests/attempts/[id]/results error:", error);
    return NextResponse.json(
      { error: "Failed to load test results", details: error.message },
      { status: 500 }
    );
  }
}
