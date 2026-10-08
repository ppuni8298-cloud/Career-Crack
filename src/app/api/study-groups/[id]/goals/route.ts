import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { title, targetCount, subject, dueDate } = (await req.json().catch(() => ({}))) || {};

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    }

    // Verify membership
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "You must be a member of this group to set goals" }, { status: 403 });
    }

    const goal = await prisma.groupStudyGoal.create({
      data: {
        groupId: id,
        title: title.trim(),
        targetCount: targetCount || 25,
        subject: subject || "All Subjects",
        dueDate: dueDate || null,
        isCompleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Study goal created successfully.",
      goal,
    });
  } catch (error: any) {
    console.error("POST /api/study-groups/[id]/goals error:", error);
    return NextResponse.json({ error: "Failed to create study goal" }, { status: 500 });
  }
}
