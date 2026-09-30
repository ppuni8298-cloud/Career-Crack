import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET: List user's active study groups & discovery list
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.userId;

    const [userMemberships, publicGroups] = await Promise.all([
      prisma.studyGroupMember.findMany({
        where: { userId },
        include: {
          group: {
            include: {
              members: { include: { user: { select: { name: true } } } },
              goals: true,
            },
          },
        },
      }),
      prisma.studyGroup.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          members: { include: { user: { select: { name: true } } } },
          goals: true,
        },
      }),
    ]);

    const myGroups = userMemberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      code: m.group.code,
      description: m.group.description,
      targetExam: m.group.targetExam,
      role: m.role,
      memberCount: m.group.members.length,
      activeGoalsCount: m.group.goals.length,
      members: m.group.members.map((mem) => ({
        name: mem.user.name,
        role: mem.role,
      })),
    }));

    const exploreGroups = publicGroups
      .filter((g) => !userMemberships.some((m) => m.groupId === g.id))
      .map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        description: g.description,
        targetExam: g.targetExam,
        memberCount: g.members.length,
        activeGoalsCount: g.goals.length,
      }));

    return NextResponse.json({
      myGroups,
      exploreGroups,
    });
  } catch (error: any) {
    console.error("GET /api/study-groups error:", error);
    return NextResponse.json({ error: "Failed to load study groups" }, { status: 500 });
  }
}

// POST: Create a new study group
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { name, description, targetExam } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    let code = generateGroupCode();
    // Ensure uniqueness
    let existing = await prisma.studyGroup.findUnique({ where: { code } });
    while (existing) {
      code = generateGroupCode();
      existing = await prisma.studyGroup.findUnique({ where: { code } });
    }

    const group = await prisma.studyGroup.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        targetExam: targetExam || "SSC CGL",
        code,
        ownerId: session.userId,
        members: {
          create: {
            userId: session.userId,
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    });

    return NextResponse.json({
      success: true,
      message: "Study group created successfully.",
      group,
    });
  } catch (error: any) {
    console.error("POST /api/study-groups error:", error);
    return NextResponse.json({ error: "Failed to create study group" }, { status: 500 });
  }
}
