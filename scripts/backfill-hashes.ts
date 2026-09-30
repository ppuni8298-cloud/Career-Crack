import { PrismaClient } from "@prisma/client";
import { computeQuestionHash, normalizeQuestionText } from "./validate-question-bank";

const prisma = new PrismaClient();

async function backfill() {
  console.log("Backfilling contentHash for existing questions...");
  const questions = await prisma.question.findMany({
    include: { options: true },
  });

  let updated = 0;
  for (const q of questions) {
    if (!q.contentHash) {
      const norm = normalizeQuestionText(q.questionText);
      const hash = computeQuestionHash(
        norm,
        q.options.map((o) => ({ text: o.optionText, isCorrect: o.isCorrect })),
        q.sourceType
      );
      try {
        await prisma.question.update({
          where: { id: q.id },
          data: { contentHash: hash },
        });
        updated++;
      } catch (e: any) {
        console.warn(`Could not set hash for ${q.id}:`, e.message);
      }
    }
  }

  console.log(`Backfilled hashes for ${updated} / ${questions.length} questions.`);
}

backfill()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
