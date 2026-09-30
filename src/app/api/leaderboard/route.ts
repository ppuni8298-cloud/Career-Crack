import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeLevel } from "@/lib/xp-engine";

// GET /api/leaderboard — privacy-first leaderboard, top 20 by XP
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get top 20 users by totalXP
    const topUsers = await (prisma as any).userLevel.findMany({
      orderBy: { totalXP: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Build leaderboard entries with privacy-friendly display names
    const entries = topUsers.map((ul: any, index: number) => {
      const name: string = ul.user?.name ?? "Aspirant";
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] ?? "Aspirant";
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + "." : "";
      const displayName = lastInitial ? `${firstName} ${lastInitial}` : firstName;

      const levelData = computeLevel(ul.totalXP);

      return {
        rank: index + 1,
        displayName,
        totalXP: ul.totalXP,
        level: levelData.level,
        levelTitle: levelData.title,
        isCurrentUser: ul.user?.id === session.userId,
      };
    });

    // Find current user's rank if not in top 20
    const currentUserEntry = entries.find((e: any) => e.isCurrentUser);
    let currentUserRank: number | null = null;

    if (!currentUserEntry) {
      const allUsers = await (prisma as any).userLevel.findMany({
        orderBy: { totalXP: "desc" },
        select: { userId: true, totalXP: true },
      });
      const idx = allUsers.findIndex((u: any) => u.userId === session.userId);
      currentUserRank = idx >= 0 ? idx + 1 : null;
    }

    return NextResponse.json({
      entries,
      currentUserRank: currentUserEntry?.rank ?? currentUserRank,
      totalParticipants: await (prisma as any).userLevel.count(),
    });
  } catch (err: any) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
