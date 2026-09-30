import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserXPAndLevel, syncXPFromHistory, updatePersonalRecords } from "@/lib/xp-engine";
import { prisma } from "@/lib/prisma";

// GET /api/xp — returns user XP, level, and recent transactions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const xpLevel = await getUserXPAndLevel(session.userId);

    // Recent XP transactions (last 10)
    const recentTransactions = await (prisma as any).xPTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const formattedTransactions = recentTransactions.map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      reason: tx.reason,
      createdAt: tx.createdAt,
      label: formatReason(tx.reason),
    }));

    return NextResponse.json({
      ...xpLevel,
      recentTransactions: formattedTransactions,
    });
  } catch (err: any) {
    console.error("Error fetching XP:", err);
    return NextResponse.json({ error: "Failed to load XP data" }, { status: 500 });
  }
}

// POST /api/xp — award XP for an action
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { reason, refId, amount } = body;

    if (!reason) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    const { awardXP } = await import("@/lib/xp-engine");
    const result = await awardXP(session.userId, reason, refId ?? null, amount);

    // Update personal records after awarding XP
    await updatePersonalRecords(session.userId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error awarding XP:", err);
    return NextResponse.json({ error: "Failed to award XP" }, { status: 500 });
  }
}

function formatReason(reason: string): string {
  const labels: Record<string, string> = {
    PRACTICE_SESSION_COMPLETE: "Completed Practice Session",
    MOCK_TEST_COMPLETE: "Completed Mock Test",
    DAILY_CHALLENGE_COMPLETE: "Daily Crack 10",
    MISTAKE_RESOLVED: "Resolved Mistake",
    STREAK_3DAY_BONUS: "3-Day Streak Bonus 🔥",
    STREAK_7DAY_BONUS: "7-Day Streak Bonus 🔥🔥",
    STREAK_30DAY_BONUS: "30-Day Streak Bonus 🔱",
    ACHIEVEMENT_UNLOCK: "Achievement Unlocked 🏆",
  };
  return labels[reason] ?? reason;
}
