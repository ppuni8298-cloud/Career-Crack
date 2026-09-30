import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch or ensure today's tasks exist
    let tasks = await prisma.dailyPlanTask.findMany({
      where: {
        userId: user.id,
        date: todayStr,
      },
      orderBy: { createdAt: "asc" },
    });

    // If no tasks for today yet, create standard preparation tasks based on their exam/goal
    if (tasks.length === 0) {
      const examName = user.profile?.targetExam || "Target Exam";
      const subjects: string[] = user.profile?.targetSubjects
        ? JSON.parse(user.profile.targetSubjects)
        : ["Quantitative Aptitude", "Logical Reasoning"];

      const s1 = subjects[0] || "Foundational Concepts";
      const s2 = subjects[1] || "Core Practice";

      await prisma.dailyPlanTask.createMany({
        data: [
          {
            userId: user.id,
            title: `Diagnostic Warm-up (${s1})`,
            subject: s1,
            duration: "15 mins",
            isCompleted: false,
            date: todayStr,
          },
          {
            userId: user.id,
            title: `High-Yield Formulas & Shortcuts (${s2})`,
            subject: s2,
            duration: "20 mins",
            isCompleted: false,
            date: todayStr,
          },
          {
            userId: user.id,
            title: `Target Drill: 10 Timed Questions for ${examName}`,
            subject: "Exam Practice",
            duration: "25 mins",
            isCompleted: false,
            date: todayStr,
          },
          {
            userId: user.id,
            title: "Analysis & Mistake Notebook Review",
            subject: "Revision",
            duration: "15 mins",
            isCompleted: false,
            date: todayStr,
          },
        ],
      });

      tasks = await prisma.dailyPlanTask.findMany({
        where: {
          userId: user.id,
          date: todayStr,
        },
        orderBy: { createdAt: "asc" },
      });
    }

    // Fetch recent study logs
    const studyLogs = await prisma.studyLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const parsedSubjects: string[] = user.profile?.targetSubjects
      ? JSON.parse(user.profile.targetSubjects)
      : ["Quantitative Aptitude", "Reasoning Ability", "General Awareness", "English Comprehension"];

    // Phase 4: Compute Real Performance Summary from Database
    const [
      completedSessionsCount,
      completedSessions,
      answeredQuestionsCount,
      unresolvedMistakesCount,
      distinctTopicsAttempted,
      recentSession,
    ] = await Promise.all([
      prisma.practiceSession.count({
        where: { userId: user.id, status: "COMPLETED" },
      }),
      prisma.practiceSession.findMany({
        where: { userId: user.id, status: "COMPLETED" },
        select: { accuracy: true, timeSpentSeconds: true, totalQuestions: true },
      }),
      prisma.practiceSessionQuestion.count({
        where: { session: { userId: user.id, status: "COMPLETED" }, isAnswered: true },
      }),
      prisma.userMistake.count({
        where: { userId: user.id, reviewStatus: "UNRESOLVED" },
      }),
      prisma.practiceSessionQuestion.findMany({
        where: { session: { userId: user.id, status: "COMPLETED" }, isAnswered: true },
        select: { question: { select: { topicId: true } } },
        distinct: ["questionId"],
      }),
      prisma.practiceSession.findFirst({
        where: { userId: user.id, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        include: { exam: true, subject: true, topic: true },
      }),
    ]);

    const totalStudySeconds = completedSessions.reduce(
      (acc, s) => acc + (s.timeSpentSeconds || 0),
      0
    );
    const studyTimeMinutes = Math.round(totalStudySeconds / 60);

    const overallAccuracy =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) /
              completedSessions.length
          )
        : 0;

    const topicsAttemptedCount = new Set(
      distinctTopicsAttempted.map((d) => d.question.topicId).filter(Boolean)
    ).size;

    const performanceSummary = {
      questionsAttempted: answeredQuestionsCount,
      overallAccuracy,
      sessionsCompleted: completedSessionsCount,
      studyTimeMinutes,
      currentStreak: user.profile?.streakDays || 1,
      longestStreak: user.profile?.longestStreak || 1,
      topicsCount: topicsAttemptedCount,
      mistakesPending: unresolvedMistakesCount,
    };

    // Continue Learning recommendations
    const continueLearning = {
      recentExam: recentSession?.exam
        ? { name: recentSession.exam.name, slug: recentSession.exam.slug }
        : user.profile?.targetExam
        ? { name: user.profile.targetExam, slug: "ssc-cgl" }
        : null,
      recentSubject: recentSession?.subject
        ? { name: recentSession.subject.name, slug: recentSession.subject.slug }
        : parsedSubjects[0]
        ? { name: parsedSubjects[0], slug: "quantitative-aptitude" }
        : null,
      weakTopic: recentSession?.topic ? { name: recentSession.topic.name, slug: recentSession.topic.slug } : null,
      recommendedNextSession: {
        title: unresolvedMistakesCount > 0 ? "Review Your Mistake Vault" : "10-Question Speed Drill",
        actionHref: unresolvedMistakesCount > 0 ? "/mistakes" : "/practice",
        badge: unresolvedMistakesCount > 0 ? `${unresolvedMistakesCount} Mistakes` : "Daily Focus",
      },
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isOnboarded: user.isOnboarded,
      },
      profile: user.profile,
      parsedSubjects,
      tasks,
      studyLogs,
      performanceSummary,
      continueLearning,
    });
  } catch (err: unknown) {
    console.error("Dashboard data error:", err);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}

// Toggle or update a task status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, isCompleted } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await prisma.dailyPlanTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== session.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.dailyPlanTask.update({
      where: { id: taskId },
      data: { isCompleted: Boolean(isCompleted) },
    });

    // If completed, record study activity log and bump readiness
    if (isCompleted) {
      await prisma.studyLog.create({
        data: {
          userId: session.userId,
          action: `Completed: ${task.title}`,
          score: "+2 Readiness Pts",
          durationMinutes: 20,
        },
      });

      await prisma.userProfile.updateMany({
        where: { userId: session.userId },
        data: {
          readinessScore: {
            increment: 2,
          },
        },
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    console.error("Task update error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
