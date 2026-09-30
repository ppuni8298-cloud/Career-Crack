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
    const selectedExamSlug = searchParams.get("exam");

    // Fetch user profile to know default target exam
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      select: { targetExam: true },
    });

    // Fetch all active exams in the database
    const exams = await prisma.exam.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        organization: true,
        _count: {
          select: {
            questions: { where: { active: true } },
            mockTests: { where: { status: "PUBLISHED" } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (exams.length === 0) {
      return NextResponse.json({
        exams: [],
        selectedExam: null,
        message: "No active exams configured in the system.",
      });
    }

    // Determine target exam (either requested by slug, user's profile target, or first available)
    let currentExam = exams.find((e) => e.slug === selectedExamSlug);
    if (!currentExam && userProfile?.targetExam) {
      currentExam = exams.find(
        (e) => e.name.toLowerCase() === userProfile.targetExam.toLowerCase() || e.slug === userProfile.targetExam
      );
    }
    if (!currentExam) {
      currentExam = exams[0];
    }

    // Fetch exam subjects & topics with real user activity
    const examSubjects = await prisma.examSubject.findMany({
      where: { examId: currentExam.id },
      include: {
        subject: {
          include: {
            topics: {
              where: { active: true },
              include: {
                _count: { select: { questions: { where: { active: true } } } },
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Fetch user practice questions
    const userPracticeQuestions = await prisma.practiceSessionQuestion.findMany({
      where: {
        session: { userId: session.userId, status: "COMPLETED" },
        isAnswered: true,
      },
      select: {
        answerStatus: true,
        question: { select: { subjectId: true, topicId: true } },
      },
    });

    // Fetch user mistakes
    const userMistakes = await prisma.userMistake.findMany({
      where: { userId: session.userId, reviewStatus: "UNRESOLVED" },
      select: { question: { select: { subjectId: true, topicId: true } } },
    });

    // Aggregate user performance by subject
    const subjectStats: Record<
      string,
      { attempted: number; correct: number; mistakes: number; attemptedTopicIds: Set<string> }
    > = {};

    userPracticeQuestions.forEach((pq) => {
      const sId = pq.question.subjectId;
      if (!subjectStats[sId]) {
        subjectStats[sId] = { attempted: 0, correct: 0, mistakes: 0, attemptedTopicIds: new Set() };
      }
      subjectStats[sId].attempted++;
      if (pq.answerStatus === "CORRECT") subjectStats[sId].correct++;
      subjectStats[sId].attemptedTopicIds.add(pq.question.topicId);
    });

    userMistakes.forEach((m) => {
      const sId = m.question.subjectId;
      if (sId) {
        if (!subjectStats[sId]) {
          subjectStats[sId] = { attempted: 0, correct: 0, mistakes: 0, attemptedTopicIds: new Set() };
        }
        subjectStats[sId].mistakes++;
      }
    });

    // Build subject breakdown with 100% verified database fields
    const subjectsData = examSubjects.map((es) => {
      const s = es.subject;
      const stats = subjectStats[s.id] || {
        attempted: 0,
        correct: 0,
        mistakes: 0,
        attemptedTopicIds: new Set(),
      };

      const topicCount = s.topics.length;
      const attemptedTopicCount = stats.attemptedTopicIds.size;
      const coveragePct = topicCount > 0 ? Math.min(100, Math.round((attemptedTopicCount / topicCount) * 100)) : 0;
      const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;

      let performanceStatus = "NOT_STARTED";
      if (stats.attempted > 0) {
        if (accuracy >= 75 && coveragePct >= 50) performanceStatus = "STRONG";
        else if (accuracy >= 55) performanceStatus = "DEVELOPING";
        else performanceStatus = "NEEDS_IMPROVEMENT";
      }

      return {
        subjectId: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category || "GENERAL",
        icon: s.icon,
        topicCount,
        questionsAttempted: stats.attempted,
        correctAnswers: stats.correct,
        accuracy,
        unresolvedMistakes: stats.mistakes,
        coveragePct,
        performanceStatus,
        topics: s.topics.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          totalQuestions: t._count.questions,
          hasAttempted: stats.attemptedTopicIds.has(t.id),
        })),
      };
    });

    // Overall exam totals
    const totalExamQuestions = currentExam._count.questions;
    const totalMocksAvailable = currentExam._count.mockTests;
    const totalAttemptedInExam = subjectsData.reduce((acc, s) => acc + s.questionsAttempted, 0);
    const totalCorrectInExam = subjectsData.reduce((acc, s) => acc + s.correctAnswers, 0);
    const overallExamAccuracy =
      totalAttemptedInExam > 0 ? Math.round((totalCorrectInExam / totalAttemptedInExam) * 100) : 0;

    return NextResponse.json({
      exams: exams.map((e) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        category: e.category,
        totalQuestions: e._count.questions,
        totalMocks: e._count.mockTests,
      })),
      selectedExam: {
        id: currentExam.id,
        name: currentExam.name,
        slug: currentExam.slug,
        category: currentExam.category,
        organization: currentExam.organization || "National Exam Authority",
        description: currentExam.description || "Comprehensive syllabus evaluation and practice track.",
        totalQuestionsAvailable: totalExamQuestions,
        totalMocksAvailable,
        totalAttemptedInExam,
        overallExamAccuracy,
        subjects: subjectsData,
      },
    });
  } catch (err: any) {
    console.error("GET /api/exam-intelligence error:", err);
    return NextResponse.json({ error: "Failed to generate exam intelligence" }, { status: 500 });
  }
}
