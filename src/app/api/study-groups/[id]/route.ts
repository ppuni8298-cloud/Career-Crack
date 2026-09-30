import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                userLevel: { select: { totalXP: true, level: true, title: true } },
                profile: { select: { streakDays: true, readinessScore: true } },
              },
            },
          },
        },
        goals: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 });
    }

    const isMember = group.members.some((m) => m.userId === session.userId);

    const membersLeaderboard = group.members
      .map((m) => ({
        userId: m.userId,
        name: m.user.name,
        role: m.role,
        level: m.user.userLevel?.level || 1,
        totalXP: m.user.userLevel?.totalXP || 0,
        title: m.user.userLevel?.title || "Aspirant",
        streakDays: m.user.profile?.streakDays || 1,
        readinessScore: m.user.profile?.readinessScore || 35,
        isCurrentUser: m.userId === session.userId,
      }))
      .sort((a, b) => b.totalXP - a.totalXP);

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
        description: group.description,
        targetExam: group.targetExam,
        ownerId: group.ownerId,
        memberCount: group.members.length,
        isMember,
        members: membersLeaderboard,
        goals: group.goals,
      },
    });
  } catch (error: any) {
    console.error("GET /api/study-groups/[id] error:", error);
    return NextResponse.json({ error: "Failed to load study group details" }, { status: 500 });
  }
}
