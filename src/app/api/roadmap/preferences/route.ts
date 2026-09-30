import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { targetExam, targetExamDate, dailyStudyHours, goalCategory, targetSubjects } = await req.json();

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        ...(targetExam ? { targetExam } : {}),
        ...(targetExamDate ? { targetExamDate: new Date(targetExamDate) } : {}),
        ...(dailyStudyHours ? { dailyStudyHours } : {}),
        ...(goalCategory ? { goalCategory } : {}),
        ...(targetSubjects ? { targetSubjects: JSON.stringify(targetSubjects) } : {}),
      },
      create: {
        userId: session.userId,
        targetExam: targetExam || "SSC CGL",
        targetExamDate: targetExamDate ? new Date(targetExamDate) : null,
        dailyStudyHours: dailyStudyHours || "2-4 hours",
        goalCategory: goalCategory || "GOVERNMENT",
        targetSubjects: targetSubjects ? JSON.stringify(targetSubjects) : "[]",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Study preferences updated successfully.",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("POST /api/roadmap/preferences error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
