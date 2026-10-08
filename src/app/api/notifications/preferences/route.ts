import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Retrieve user's opt-in reminder and notification preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: session.userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: session.userId,
          emailReminders: true,
          dailyTaskAlerts: true,
          revisionDueAlerts: true,
          studyGroupAlerts: true,
          reminderTime: "09:00",
        },
      });
    }

    return NextResponse.json({ preferences: prefs });
  } catch (error: any) {
    console.error("GET /api/notifications/preferences error:", error);
    return NextResponse.json({ error: "Failed to load notification preferences" }, { status: 500 });
  }
}

// PUT: Update opt-in notification settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { emailReminders, dailyTaskAlerts, revisionDueAlerts, studyGroupAlerts, reminderTime } =
      (await req.json().catch(() => ({}))) || {};

    const updated = await prisma.notificationPreference.upsert({
      where: { userId: session.userId },
      update: {
        ...(typeof emailReminders === "boolean" ? { emailReminders } : {}),
        ...(typeof dailyTaskAlerts === "boolean" ? { dailyTaskAlerts } : {}),
        ...(typeof revisionDueAlerts === "boolean" ? { revisionDueAlerts } : {}),
        ...(typeof studyGroupAlerts === "boolean" ? { studyGroupAlerts } : {}),
        ...(reminderTime ? { reminderTime } : {}),
      },
      create: {
        userId: session.userId,
        emailReminders: emailReminders ?? true,
        dailyTaskAlerts: dailyTaskAlerts ?? true,
        revisionDueAlerts: revisionDueAlerts ?? true,
        studyGroupAlerts: studyGroupAlerts ?? true,
        reminderTime: reminderTime || "09:00",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully.",
      preferences: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/notifications/preferences error:", error);
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 });
  }
}
