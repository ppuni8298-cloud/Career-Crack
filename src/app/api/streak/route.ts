import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      select: {
        streakDays: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    const currentStreak = profile?.streakDays || 1;
    const longestStreak = profile?.longestStreak || currentStreak;
    const lastActiveDate = profile?.lastActiveDate || null;

    // Build last 7 days activity array
    const today = new Date();
    const daysMap: Array<{
      date: string;
      dayName: string;
      isActive: boolean;
      activityCount: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      daysMap.push({
        date: dateStr,
        dayName,
        isActive: false,
        activityCount: 0,
      });
    }

    // Query activities across past 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [studyLogs, completedSessions, challengeAttempts] = await Promise.all([
      prisma.studyLog.findMany({
        where: {
          userId: session.userId,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }),
      prisma.practiceSession.findMany({
        where: {
          userId: session.userId,
          status: "COMPLETED",
          completedAt: { gte: sevenDaysAgo },
        },
        select: { completedAt: true },
      }),
      prisma.dailyChallengeAttempt.findMany({
        where: {
          userId: session.userId,
          completedAt: { gte: sevenDaysAgo },
        },
        select: { completedAt: true },
      }),
    ]);

    const activityDatesCount: Record<string, number> = {};

    studyLogs.forEach((l) => {
      const str = l.createdAt.toISOString().split("T")[0];
      activityDatesCount[str] = (activityDatesCount[str] || 0) + 1;
    });

    completedSessions.forEach((s) => {
      if (s.completedAt) {
        const str = s.completedAt.toISOString().split("T")[0];
        activityDatesCount[str] = (activityDatesCount[str] || 0) + 1;
      }
    });

    challengeAttempts.forEach((a) => {
      const str = a.completedAt.toISOString().split("T")[0];
      activityDatesCount[str] = (activityDatesCount[str] || 0) + 1;
    });

    daysMap.forEach((dm) => {
      const count = activityDatesCount[dm.date] || 0;
      dm.activityCount = count;
      dm.isActive = count > 0;
    });

    return NextResponse.json({
      currentStreak,
      longestStreak,
      lastActiveDate,
      weeklyActivity: daysMap,
      qualifyingActivitiesCount: Object.values(activityDatesCount).reduce((a, b) => a + b, 0),
    });
  } catch (err: any) {
    console.error("Error fetching streak:", err);
    return NextResponse.json({ error: "Failed to load streak details" }, { status: 500 });
  }
}
