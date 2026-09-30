import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface StudyRecommendation {
  id: string;
  type: "WEAK_TOPIC" | "MISTAKE_REVIEW" | "UNPRACTICED_TOPIC" | "DAILY_CHALLENGE" | "DIAGNOSTIC";
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  actionText: string;
  actionHref: string;
  metric?: string;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const [user, userMistakes, recentSessions, topicQuestions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true },
      }),
      prisma.userMistake.findMany({
        where: { userId: session.userId, reviewStatus: "UNRESOLVED" },
        include: { question: { include: { topic: true, subject: true } } },
        take: 10,
      }),
      prisma.practiceSession.findMany({
        where: { userId: session.userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: { topic: true, subject: true, exam: true },
      }),
      prisma.practiceSessionQuestion.findMany({
        where: {
          session: { userId: session.userId, status: "COMPLETED" },
          isAnswered: true,
        },
        select: {
          answerStatus: true,
          question: { select: { topicId: true, topic: { select: { name: true, slug: true } } } },
        },
      }),
    ]);

    const targetExamName = user?.profile?.targetExam || "Government & Placement";
    const recommendations: StudyRecommendation[] = [];

    // 1. Mistake Review Recommendation
    if (userMistakes.length > 0) {
      recommendations.push({
        id: "rec-mistakes",
        type: "MISTAKE_REVIEW",
        title: "Review Your Mistake Vault",
        subtitle: `${userMistakes.length} unresolved questions waiting`,
        description:
          "Re-attempt questions you previously answered incorrectly to convert weak spots into solid fundamentals.",
        badge: "High Priority",
        actionText: "Review Mistakes",
        actionHref: "/mistakes",
        metric: `${userMistakes.length} Pending`,
        priority: "HIGH",
      });
    }

    // 2. Weak Topic Recommendation (Topics with accuracy < 65%)
    const topicStats: Record<string, { name: string; slug: string; correct: number; total: number }> = {};
    topicQuestions.forEach((tq) => {
      const tid = tq.question.topicId;
      const tname = tq.question.topic?.name || "Topic";
      const tslug = tq.question.topic?.slug || "";
      if (!topicStats[tid]) topicStats[tid] = { name: tname, slug: tslug, correct: 0, total: 0 };
      topicStats[tid].total++;
      if (tq.answerStatus === "CORRECT") topicStats[tid].correct++;
    });

    const weakTopics = Object.entries(topicStats)
      .map(([id, s]) => ({
        id,
        name: s.name,
        slug: s.slug,
        accuracy: Math.round((s.correct / s.total) * 100),
        total: s.total,
      }))
      .filter((t) => t.total >= 3 && t.accuracy < 65)
      .sort((a, b) => a.accuracy - b.accuracy);

    if (weakTopics.length > 0) {
      const worst = weakTopics[0];
      recommendations.push({
        id: `rec-weak-${worst.id}`,
        type: "WEAK_TOPIC",
        title: `Strengthen ${worst.name}`,
        subtitle: `Current accuracy: ${worst.accuracy}% across ${worst.total} questions`,
        description: `Targeted revision in ${worst.name} will significantly improve your overall accuracy and confidence.`,
        badge: "Recommended Drill",
        actionText: `Practice ${worst.name}`,
        actionHref: `/practice?topic=${worst.slug}`,
        metric: `${worst.accuracy}% Acc`,
        priority: "HIGH",
      });
    }

    // 3. Daily Crack 10 Challenge Recommendation
    const todayStr = new Date().toISOString().split("T")[0];
    const todayAttempt = await prisma.dailyChallengeAttempt.findFirst({
      where: { userId: session.userId, challenge: { date: todayStr } },
    });

    if (!todayAttempt) {
      recommendations.push({
        id: "rec-daily-crack",
        type: "DAILY_CHALLENGE",
        title: "Complete Today's Daily Crack 10",
        subtitle: "10 rapid-fire questions to protect your streak",
        description:
          "Keep your daily rhythm alive. 10 curated questions across core aptitude and reasoning.",
        badge: "Daily Habit",
        actionText: "Start Daily Challenge",
        actionHref: "/daily-crack",
        metric: "10 Qs",
        priority: "MEDIUM",
      });
    }

    // 4. Unpracticed Syllabus Topic Recommendation
    const practicedTopicIds = new Set(Object.keys(topicStats));
    const unpracticedTopic = await prisma.topic.findFirst({
      where: {
        id: { notIn: Array.from(practicedTopicIds) },
        active: true,
        questions: { some: { active: true } },
      },
      include: { subject: true, _count: { select: { questions: true } } },
    });

    if (unpracticedTopic) {
      recommendations.push({
        id: `rec-unpracticed-${unpracticedTopic.id}`,
        type: "UNPRACTICED_TOPIC",
        title: `Explore New Topic: ${unpracticedTopic.name}`,
        subtitle: `Subject: ${unpracticedTopic.subject.name}`,
        description: `Expand your syllabus coverage. ${unpracticedTopic._count.questions} questions are available to test your baseline understanding.`,
        badge: "Coverage Expansion",
        actionText: `Practice ${unpracticedTopic.name}`,
        actionHref: `/practice?topic=${unpracticedTopic.slug}`,
        metric: `${unpracticedTopic._count.questions} Qs`,
        priority: "NORMAL",
      });
    }

    // 5. Fallback for new aspirants with zero sessions
    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec-diagnostic",
        type: "DIAGNOSTIC",
        title: `Take a Diagnostic Practice Drill`,
        subtitle: `Calibrated for ${targetExamName}`,
        description:
          "Attempt a 10-question practice drill to generate your personalized strength profile, mistake notebook, and readiness score.",
        badge: "Get Started",
        actionText: "Launch Practice Drill",
        actionHref: "/practice",
        metric: "10 Qs",
        priority: "HIGH",
      });
    }

    return NextResponse.json({
      recommendations,
      hasMistakes: userMistakes.length > 0,
      completedTodayDaily: !!todayAttempt,
    });
  } catch (err: any) {
    console.error("Error fetching recommendations:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
