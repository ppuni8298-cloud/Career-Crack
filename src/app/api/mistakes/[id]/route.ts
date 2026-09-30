import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateAndAwardAchievements } from "@/lib/achievements";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { reviewStatus } = body;

    const validStatuses = ["UNRESOLVED", "REVIEWED", "RESOLVED"];
    if (!reviewStatus || !validStatuses.includes(reviewStatus)) {
      return NextResponse.json(
        { error: "Invalid review status. Must be UNRESOLVED, REVIEWED, or RESOLVED." },
        { status: 400 }
      );
    }

    // Find mistake by id or by questionId
    const mistake = await prisma.userMistake.findFirst({
      where: {
        userId: session.userId,
        OR: [{ id }, { questionId: id }],
      },
    });

    if (!mistake) {
      return NextResponse.json({ error: "Mistake record not found" }, { status: 404 });
    }

    const updated = await prisma.userMistake.update({
      where: { id: mistake.id },
      data: {
        reviewStatus,
        resolvedAt: reviewStatus === "RESOLVED" ? new Date() : null,
      },
    });

    // Award XP if mistake was marked resolved
    if (reviewStatus === "RESOLVED") {
      import("@/lib/xp-engine").then(({ awardXP }) => {
        awardXP(session.userId, "MISTAKE_RESOLVED", mistake.id).catch(() => {});
      });
    }

    // Check if user earned mistake reviewer badge
    evaluateAndAwardAchievements(session.userId).catch(() => {});

    return NextResponse.json({
      success: true,
      mistake: updated,
    });
  } catch (err: any) {
    console.error("Error updating mistake review status:", err);
    return NextResponse.json(
      { error: "Failed to update review status" },
      { status: 500 }
    );
  }
}
