import { prisma } from "@/lib/prisma";

export const SPACED_INTERVALS = [1, 3, 7, 14, 30] as const;

export interface RevisionQueueItem {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  reason: string;
  intervalDays: number;
  nextReviewDate: string;
  lastPracticedAt: string | null;
  status: "PENDING" | "COMPLETED" | "SNOOZED" | "MASTERED";
  accuracy: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  unresolvedMistakesCount: number;
  isOverdue: boolean;
}

export async function syncRevisionQueue(userId: string): Promise<number> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // 1. Fetch user topic progress and mistakes
  const [topicProgressList, userMistakes, existingItems] = await Promise.all([
    prisma.topicProgress.findMany({
      where: { userId },
      include: {
        topic: { include: { subject: true } },
      },
    }),
    prisma.userMistake.findMany({
      where: { userId, reviewStatus: "UNRESOLVED" },
      select: { question: { select: { topicId: true, subjectId: true } } },
    }),
    (prisma as any).revisionItem.findMany({
      where: { userId },
    }),
  ]);

  const existingMap = new Map<string, any>(existingItems.map((item: any) => [item.topicId, item]));

  // Count mistakes per topic
  const mistakeCounts: Record<string, { count: number; subjectId: string }> = {};
  userMistakes.forEach((m) => {
    if (m.question?.topicId) {
      if (!mistakeCounts[m.question.topicId]) {
        mistakeCounts[m.question.topicId] = { count: 0, subjectId: m.question.subjectId };
      }
      mistakeCounts[m.question.topicId].count++;
    }
  });

  let createdOrUpdated = 0;

  // Process topic progress for revision triggers
  for (const tp of topicProgressList) {
    const topicId = tp.topicId;
    const subjectId = tp.topic.subjectId;
    const accuracy = tp.accuracy;
    const attempted = tp.questionsAttempted;

    let needsRevision = false;
    let reason = "SCHEDULED_RETENTION";
    let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    let intervalDays = 3;

    const mistakesInTopic = mistakeCounts[topicId]?.count || 0;

    // Trigger A: Mistake Cluster
    if (mistakesInTopic >= 2) {
      needsRevision = true;
      reason = `${mistakesInTopic} unresolved mistakes clustered in this topic.`;
      priority = "HIGH";
      intervalDays = 1;
    }
    // Trigger B: Low or declining accuracy
    else if (attempted >= 4 && accuracy < 65) {
      needsRevision = true;
      reason = `Accuracy is currently ${accuracy}%, requiring foundational review.`;
      priority = "HIGH";
      intervalDays = 2;
    }
    // Trigger C: Retention decay (inactive > 14 days for practiced topic)
    else if (tp.lastPracticedAt) {
      const daysSince = Math.floor((now.getTime() - new Date(tp.lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 14) {
        needsRevision = true;
        reason = `Unpracticed for ${daysSince} days. Spaced revision due to prevent memory decay.`;
        priority = daysSince >= 25 ? "HIGH" : "MEDIUM";
        intervalDays = 7;
      }
    }

    if (needsRevision) {
      const existing = existingMap.get(topicId);
      const nextDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      if (!existing) {
        await (prisma as any).revisionItem.create({
          data: {
            userId,
            topicId,
            subjectId,
            reason,
            intervalDays,
            nextReviewDate: nextDate,
            lastPracticedAt: tp.lastPracticedAt,
            status: "PENDING",
            accuracy,
            priority,
          },
        });
        createdOrUpdated++;
      } else if (existing.status !== "SNOOZED") {
        await (prisma as any).revisionItem.update({
          where: { id: existing.id },
          data: {
            reason,
            accuracy,
            priority,
            lastPracticedAt: tp.lastPracticedAt,
          },
        });
      }
    }
  }

  return createdOrUpdated;
}

export async function getRevisionQueue(userId: string): Promise<{
  dueToday: RevisionQueueItem[];
  upcoming: RevisionQueueItem[];
  mastered: RevisionQueueItem[];
  totalActive: number;
}> {
  await syncRevisionQueue(userId);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const items = await (prisma as any).revisionItem.findMany({
    where: { userId },
    include: {
      topic: { select: { id: true, name: true, slug: true } },
      subject: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ priority: "asc" }, { nextReviewDate: "asc" }],
  });

  // Fetch mistakes per topic
  const mistakes = await prisma.userMistake.findMany({
    where: { userId, reviewStatus: "UNRESOLVED" },
    select: { question: { select: { topicId: true } } },
  });
  const mistakeCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    if (m.question?.topicId) {
      mistakeCounts[m.question.topicId] = (mistakeCounts[m.question.topicId] || 0) + 1;
    }
  });

  const dueToday: RevisionQueueItem[] = [];
  const upcoming: RevisionQueueItem[] = [];
  const mastered: RevisionQueueItem[] = [];

  items.forEach((item: any) => {
    const isOverdue = item.nextReviewDate <= todayStr && item.status !== "MASTERED";

    const formatted: RevisionQueueItem = {
      id: item.id,
      topicId: item.topicId,
      topicName: item.topic.name,
      topicSlug: item.topic.slug,
      subjectId: item.subjectId,
      subjectName: item.subject.name,
      reason: item.reason,
      intervalDays: item.intervalDays,
      nextReviewDate: item.nextReviewDate,
      lastPracticedAt: item.lastPracticedAt ? new Date(item.lastPracticedAt).toISOString() : null,
      status: item.status,
      accuracy: item.accuracy,
      priority: item.priority,
      unresolvedMistakesCount: mistakeCounts[item.topicId] || 0,
      isOverdue,
    };

    if (item.status === "MASTERED") {
      mastered.push(formatted);
    } else if (isOverdue || item.status === "PENDING") {
      dueToday.push(formatted);
    } else {
      upcoming.push(formatted);
    }
  });

  return {
    dueToday,
    upcoming,
    mastered,
    totalActive: dueToday.length + upcoming.length,
  };
}

export async function snoozeRevisionItem(userId: string, id: string, days: number = 3): Promise<boolean> {
  const item = await (prisma as any).revisionItem.findFirst({
    where: { id, userId },
  });
  if (!item) return false;

  const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  await (prisma as any).revisionItem.update({
    where: { id },
    data: {
      nextReviewDate: newDate,
      status: "SNOOZED",
    },
  });

  return true;
}

export async function markRevisionItemMastered(userId: string, id: string): Promise<boolean> {
  const item = await (prisma as any).revisionItem.findFirst({
    where: { id, userId },
  });
  if (!item) return false;

  await (prisma as any).revisionItem.update({
    where: { id },
    data: {
      status: "MASTERED",
    },
  });

  return true;
}
