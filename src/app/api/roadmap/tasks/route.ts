import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Retrieve user's dynamic roadmap daily/weekly tasks
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch existing tasks
    let tasks = await prisma.dailyPlanTask.findMany({
      where: { userId: session.userId },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    // If no tasks exist for today, dynamically generate initial syllabus-aligned tasks
    if (tasks.length === 0) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.userId },
      });

      const examSlug = profile?.targetExam ? profile.targetExam.toLowerCase().replace(/[^a-z0-9]/g, "-") : "ssc-cgl";
      const subjects = await prisma.subject.findMany({
        take: 3,
        include: { topics: { take: 2 } },
      });

      const initialTasks = [];
      for (const sub of subjects) {
        for (const topic of sub.topics) {
          initialTasks.push({
            userId: session.userId,
            title: `Practice 15 Questions: ${topic.name}`,
            subject: sub.name,
            duration: "30 mins",
            date: todayStr,
            isCompleted: false,
          });
        }
      }

      if (initialTasks.length > 0) {
        for (const t of initialTasks) {
          await prisma.dailyPlanTask.create({ data: t });
        }
        tasks = await prisma.dailyPlanTask.findMany({
          where: { userId: session.userId },
          orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        });
      }
    }

    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = tasks.filter((t) => !t.isCompleted).length;

    return NextResponse.json({
      tasks,
      summary: {
        total: tasks.length,
        completed,
        pending,
        completionRatePct: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error("GET /api/roadmap/tasks error:", error);
    return NextResponse.json({ error: "Failed to load roadmap tasks" }, { status: 500 });
  }
}

// POST: Add or reschedule tasks
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { action, taskId, title, subject, duration, date } = (await req.json().catch(() => ({}))) || {};

    if (action === "TOGGLE" && taskId) {
      const task = await prisma.dailyPlanTask.findUnique({ where: { id: taskId } });
      if (!task || task.userId !== session.userId) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const updated = await prisma.dailyPlanTask.update({
        where: { id: taskId },
        data: { isCompleted: !task.isCompleted },
      });

      return NextResponse.json({ success: true, task: updated });
    }

    if (action === "RESCHEDULE_MISSED") {
      const todayStr = new Date().toISOString().split("T")[0];
      const overdueTasks = await prisma.dailyPlanTask.findMany({
        where: {
          userId: session.userId,
          isCompleted: false,
          date: { lt: todayStr },
        },
      });

      // Shift overdue tasks to today
      let rescheduledCount = 0;
      for (const t of overdueTasks) {
        await prisma.dailyPlanTask.update({
          where: { id: t.id },
          data: { date: todayStr },
        });
        rescheduledCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Rescheduled ${rescheduledCount} overdue task(s) to today.`,
        rescheduledCount,
      });
    }

    if (action === "CREATE") {
      if (!title || !subject) {
        return NextResponse.json({ error: "Title and subject are required" }, { status: 400 });
      }

      const newTask = await prisma.dailyPlanTask.create({
        data: {
          userId: session.userId,
          title,
          subject,
          duration: duration || "30 mins",
          date: date || new Date().toISOString().split("T")[0],
          isCompleted: false,
        },
      });

      return NextResponse.json({ success: true, task: newTask });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/roadmap/tasks error:", error);
    return NextResponse.json({ error: "Failed to process task action" }, { status: 500 });
  }
}
