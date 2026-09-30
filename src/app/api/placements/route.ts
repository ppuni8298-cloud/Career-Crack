import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 1. Fetch practice questions for the user with subject categorization
    const [practiceQuestions, interviewSessions, subjects] = await Promise.all([
      prisma.practiceSessionQuestion.findMany({
        where: {
          session: { userId: session.userId, status: "COMPLETED" },
          isAnswered: true,
        },
        include: {
          question: {
            include: {
              subject: { select: { id: true, name: true, slug: true, category: true } },
              topic: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      (prisma as any).interviewSession.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subject.findMany({
        where: { active: true },
        include: {
          topics: { where: { active: true }, select: { id: true, name: true, slug: true } },
          _count: { select: { questions: { where: { active: true } } } },
        },
      }),
    ]);

    // Categorize actual user performance into:
    // 1. Aptitude (Quantitative, Reasoning, Verbal)
    // 2. Technical / DSA (Data Structures, Algorithms, Programming)
    // 3. Core CS (DBMS, OS, Networks, OOP)

    const aptitudeQuestions = practiceQuestions.filter(
      (pq) =>
        pq.question.subject.category === "APTITUDE" ||
        pq.question.subject.name.toLowerCase().includes("aptitude") ||
        pq.question.subject.name.toLowerCase().includes("reasoning")
    );

    const dsaQuestions = practiceQuestions.filter(
      (pq) =>
        pq.question.subject.name.toLowerCase().includes("data") ||
        pq.question.subject.name.toLowerCase().includes("dsa") ||
        pq.question.subject.name.toLowerCase().includes("algorithm")
    );

    const coreCsQuestions = practiceQuestions.filter(
      (pq) =>
        pq.question.subject.category === "CORE_CS" ||
        pq.question.subject.name.toLowerCase().includes("database") ||
        pq.question.subject.name.toLowerCase().includes("operating") ||
        pq.question.subject.name.toLowerCase().includes("network")
    );

    const calcAccuracy = (qs: typeof practiceQuestions) => {
      if (qs.length === 0) return 0;
      const correct = qs.filter((q) => q.answerStatus === "CORRECT").length;
      return Math.round((correct / qs.length) * 100);
    };

    const aptitudeAcc = calcAccuracy(aptitudeQuestions);
    const dsaAcc = calcAccuracy(dsaQuestions);
    const coreCsAcc = calcAccuracy(coreCsQuestions);

    const completedInterviews = interviewSessions.filter((s: any) => s.status === "COMPLETED");
    const avgInterviewScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / completedInterviews.length
          )
        : null;

    // Filter relevant subjects from database
    const placementCurriculum = {
      aptitude: subjects
        .filter(
          (s) =>
            s.category === "APTITUDE" ||
            s.name.toLowerCase().includes("aptitude") ||
            s.name.toLowerCase().includes("reasoning")
        )
        .map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          topicsCount: s.topics.length,
          questionsCount: s._count.questions,
        })),
      technical: subjects
        .filter(
          (s) =>
            s.category === "CORE_CS" ||
            s.name.toLowerCase().includes("data") ||
            s.name.toLowerCase().includes("database") ||
            s.name.toLowerCase().includes("operating") ||
            s.name.toLowerCase().includes("programming")
        )
        .map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          topicsCount: s.topics.length,
          questionsCount: s._count.questions,
        })),
    };

    return NextResponse.json({
      placementReadiness: {
        aptitude: {
          accuracy: aptitudeAcc,
          attempted: aptitudeQuestions.length,
          status: aptitudeQuestions.length >= 15 ? (aptitudeAcc >= 70 ? "STRONG" : "DEVELOPING") : "NEEDS_PRACTICE",
        },
        dsa: {
          accuracy: dsaAcc,
          attempted: dsaQuestions.length,
          status: dsaQuestions.length >= 10 ? (dsaAcc >= 70 ? "STRONG" : "DEVELOPING") : "NEEDS_PRACTICE",
        },
        coreCs: {
          accuracy: coreCsAcc,
          attempted: coreCsQuestions.length,
          status: coreCsQuestions.length >= 10 ? (coreCsAcc >= 70 ? "STRONG" : "DEVELOPING") : "NEEDS_PRACTICE",
        },
        interview: {
          completedCount: completedInterviews.length,
          averageScore: avgInterviewScore,
          status: completedInterviews.length > 0 ? "RECORDED" : "NOT_ENOUGH_DATA",
        },
      },
      curriculum: placementCurriculum,
      recentInterviews: interviewSessions.slice(0, 5).map((s: any) => ({
        id: s.id,
        interviewType: s.interviewType,
        topicOrRole: s.topicOrRole,
        score: s.score,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/placements error:", err);
    return NextResponse.json({ error: "Failed to load placement preparation data" }, { status: 500 });
  }
}
