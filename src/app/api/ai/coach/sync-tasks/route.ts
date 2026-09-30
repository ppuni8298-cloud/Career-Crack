import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compileStudentProfile, generateAIDailyPlan } from "@/lib/ai-coach";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const profile = await compileStudentProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const dailyBlocks = generateAIDailyPlan(profile);
    const todayStr = new Date().toISOString().split("T")[0];

    // Delete existing incomplete tasks for today to replace with AI optimized tasks
    await prisma.dailyPlanTask.deleteMany({
      where: {
        userId: session.userId,
        date: todayStr,
        isCompleted: false,
      },
    });

    // Create the AI study plan tasks
    const createdTasks = [];
    for (const block of dailyBlocks) {
      const task = await prisma.dailyPlanTask.create({
        data: {
          userId: session.userId,
          title: block.title,
          subject: block.subject,
          duration: block.duration,
          isCompleted: false,
          date: todayStr,
        },
      });
      createdTasks.push(task);
    }

    // Log this action in study logs
    await prisma.studyLog.create({
      data: {
        userId: session.userId,
        action: "Synced AI Coach Personalized Daily Plan",
        score: "+1 Readiness Pts",
        durationMinutes: 5,
      },
    });

    // Increment readiness score slightly for taking initiative
    await prisma.userProfile.updateMany({
      where: { userId: session.userId },
      data: {
        readinessScore: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synchronized ${createdTasks.length} AI study tasks for today`,
      tasks: createdTasks,
    });
  } catch (error: any) {
    console.error("POST /api/ai/coach/sync-tasks error:", error);
    return NextResponse.json(
      { error: "Failed to synchronize AI daily tasks", details: error.message },
      { status: 500 }
    );
  }
}
