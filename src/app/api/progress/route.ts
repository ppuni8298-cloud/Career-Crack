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
    const examFilter = searchParams.get("exam");
    const subjectFilter = searchParams.get("subject");
    const statusFilter = searchParams.get("status"); // ALL, NOT_STARTED, PRACTICING, IMPROVING, STRONG
    const search = searchParams.get("search")?.trim().toLowerCase();

    // 1. Fetch user profile for target exam/subjects context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    // 2. Build topic query
    const topicWhere: any = { active: true };

    if (subjectFilter && subjectFilter !== "ALL") {
      topicWhere.subject = {
        OR: [{ id: subjectFilter }, { slug: subjectFilter }],
      };
    }

    if (search) {
      topicWhere.name = { contains: search };
    }

    // If examFilter provided, limit to subjects associated with that exam
    if (examFilter && examFilter !== "ALL") {
      const exam = await prisma.exam.findFirst({
        where: { OR: [{ id: examFilter }, { slug: examFilter }] },
        include: { examSubjects: { select: { subjectId: true } } },
      });
      if (exam) {
        const subjectIds = exam.examSubjects.map((es) => es.subjectId);
        topicWhere.subjectId = { in: subjectIds };
      }
    }

    const allTopics = await prisma.topic.findMany({
      where: topicWhere,
      orderBy: [{ subject: { name: "asc" } }, { order: "asc" }],
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        _count: { select: { questions: true } },
      },
    });

    // 3. Query all completed session questions for this user
    const userSessionQuestions = await prisma.practiceSessionQuestion.findMany({
      where: {
        session: {
          userId: session.userId,
          status: "COMPLETED",
        },
        isAnswered: true,
      },
      select: {
        answerStatus: true,
        createdAt: true,
        question: {
          select: {
            topicId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate stats per topicId
    const topicStatsMap: Record<
      string,
      { attempted: number; correct: number; incorrect: number; lastPracticed: Date | null }
    > = {};

    userSessionQuestions.forEach((sq) => {
      const tid = sq.question.topicId;
      if (!tid) return;
      if (!topicStatsMap[tid]) {
        topicStatsMap[tid] = { attempted: 0, correct: 0, incorrect: 0, lastPracticed: sq.createdAt };
      }
      topicStatsMap[tid].attempted++;
      if (sq.answerStatus === "CORRECT") topicStatsMap[tid].correct++;
      else if (sq.answerStatus === "INCORRECT") topicStatsMap[tid].incorrect++;
    });

    // 4. Map each topic with real performance stats and mastery status
    const mappedTopics = allTopics.map((t) => {
      const stats = topicStatsMap[t.id] || {
        attempted: 0,
        correct: 0,
        incorrect: 0,
        lastPracticed: null,
      };

      const accuracy =
        stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;

      let masteryStatus: "NOT_STARTED" | "PRACTICING" | "IMPROVING" | "STRONG" = "NOT_STARTED";
      if (stats.attempted === 0) {
        masteryStatus = "NOT_STARTED";
      } else if (stats.attempted < 5 || accuracy < 60) {
        masteryStatus = "PRACTICING";
      } else if (accuracy < 80) {
        masteryStatus = "IMPROVING";
      } else {
        masteryStatus = "STRONG";
      }

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        subjectId: t.subject.id,
        subjectName: t.subject.name,
        subjectSlug: t.subject.slug,
        totalAvailableQuestions: t._count.questions,
        questionsAttempted: stats.attempted,
        correctAnswers: stats.correct,
        incorrectAnswers: stats.incorrect,
        accuracy,
        masteryStatus,
        lastPracticedAt: stats.lastPracticed,
      };
    });

    // Filter by status if requested
    const filteredTopics =
      statusFilter && statusFilter !== "ALL"
        ? mappedTopics.filter((t) => t.masteryStatus === statusFilter)
        : mappedTopics;

    // Overall summary statistics
    const strongCount = mappedTopics.filter((t) => t.masteryStatus === "STRONG").length;
    const improvingCount = mappedTopics.filter((t) => t.masteryStatus === "IMPROVING").length;
    const practicingCount = mappedTopics.filter((t) => t.masteryStatus === "PRACTICING").length;
    const notStartedCount = mappedTopics.filter((t) => t.masteryStatus === "NOT_STARTED").length;

    // Distinct subjects for filter dropdown
    const subjects = await prisma.subject.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      topics: filteredTopics,
      stats: {
        totalTopics: mappedTopics.length,
        strongCount,
        improvingCount,
        practicingCount,
        notStartedCount,
        masteryPercentage:
          mappedTopics.length > 0
            ? Math.round(((strongCount + improvingCount * 0.5) / mappedTopics.length) * 100)
            : 0,
      },
      subjects,
      targetExam: profile?.targetExam || null,
    });
  } catch (err: any) {
    console.error("Error fetching progress:", err);
    return NextResponse.json({ error: "Failed to load topic progress" }, { status: 500 });
  }
}
