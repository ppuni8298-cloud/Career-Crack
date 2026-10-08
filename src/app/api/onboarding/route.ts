import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      goalCategory,
      targetExam,
      targetSubjects = [],
      dailyStudyHours = "2-4 hours",
      targetExamDate = null,
    } = body;

    if (!goalCategory || !targetExam) {
      return NextResponse.json(
        { error: "Please select what you are preparing for and your target exam" },
        { status: 400 }
      );
    }

    const examDate = targetExamDate ? new Date(targetExamDate) : null;

    // Create or update user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        goalCategory,
        targetExam,
        targetSubjects: JSON.stringify(targetSubjects),
        dailyStudyHours,
        targetExamDate: examDate,
        readinessScore: 32, // Initial baseline readiness
        streakDays: 1,
      },
      create: {
        userId: session.userId,
        goalCategory,
        targetExam,
        targetSubjects: JSON.stringify(targetSubjects),
        dailyStudyHours,
        targetExamDate: examDate,
        readinessScore: 32,
        streakDays: 1,
      },
    });

    // Mark user as onboarded
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { isOnboarded: true },
    });

    // Seed initial "Today's Crack Plan" tasks tailored to the goal
    const todayStr = new Date().toISOString().split("T")[0];

    // Remove any existing tasks for today before seeding
    await prisma.dailyPlanTask.deleteMany({
      where: {
        userId: session.userId,
        date: todayStr,
      },
    });

    // Create personalized tasks
    const firstSubject = targetSubjects.length > 0 ? targetSubjects[0] : "General Aptitude";
    const secondSubject = targetSubjects.length > 1 ? targetSubjects[1] : "Concepts & Formulas";

    await prisma.dailyPlanTask.createMany({
      data: [
        {
          userId: session.userId,
          title: `Diagnostic Baseline Check (${firstSubject})`,
          subject: firstSubject,
          duration: "15 mins",
          isCompleted: false,
          date: todayStr,
        },
        {
          userId: session.userId,
          title: `High-Yield Formula Review (${secondSubject})`,
          subject: secondSubject,
          duration: "20 mins",
          isCompleted: false,
          date: todayStr,
        },
        {
          userId: session.userId,
          title: "Speed Practice: 10 Targeted Concept Questions",
          subject: "Sprint Drills",
          duration: "25 mins",
          isCompleted: false,
          date: todayStr,
        },
        {
          userId: session.userId,
          title: "Review Error Log & Core Definitions",
          subject: "Revision",
          duration: "15 mins",
          isCompleted: false,
          date: todayStr,
        },
      ],
    });

    // Also add an initial study log entry
    await prisma.studyLog.create({
      data: {
        userId: session.userId,
        action: `Personalized Study Track Activated for ${targetExam}`,
        score: "Baseline 32%",
        durationMinutes: 10,
      },
    });

    // Re-issue JWT cookie with isOnboarded = true
    const updatedToken = await createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isOnboarded: true,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      profile,
      redirect: "/dashboard",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: updatedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding selections. Please try again." },
      { status: 500 }
    );
  }
}
