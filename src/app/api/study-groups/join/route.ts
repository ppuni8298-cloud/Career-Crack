import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { code } = (await req.json().catch(() => ({}))) || {};
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Study group code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const group = await prisma.studyGroup.findUnique({
      where: { code: cleanCode },
    });

    if (!group) {
      return NextResponse.json(
        { error: `No study group found with code '${cleanCode}'` },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({
        success: true,
        message: "You are already a member of this study group.",
        groupId: group.id,
      });
    }

    // Join the group
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: session.userId,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined '${group.name}'!`,
      groupId: group.id,
    });
  } catch (error: any) {
    console.error("POST /api/study-groups/join error:", error);
    return NextResponse.json({ error: "Failed to join study group" }, { status: 500 });
  }
}
