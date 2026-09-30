import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Normalizing sourceType to standard: PRACTICE, VERIFIED_PYQ, AI_CHALLENGE...");

  const updatePyq = await prisma.question.updateMany({
    where: { sourceType: "PYQ" },
    data: { sourceType: "VERIFIED_PYQ", verified: true, verificationStatus: "VERIFIED" },
  });
  console.log(`Updated ${updatePyq.count} PYQ -> VERIFIED_PYQ`);

  const prevYearWithMetadata = await prisma.question.updateMany({
    where: { sourceType: "PREVIOUS_YEAR" },
    data: { sourceType: "VERIFIED_PYQ", verified: true, verificationStatus: "VERIFIED" },
  });
  console.log(`Updated ${prevYearWithMetadata.count} PREVIOUS_YEAR -> VERIFIED_PYQ`);

  const sourceTypes = await prisma.question.groupBy({
    by: ["sourceType"],
    _count: { id: true },
  });
  console.log("\nNew Source Types in DB:");
  for (const st of sourceTypes) {
    console.log(`  ${st.sourceType}: ${st._count.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
