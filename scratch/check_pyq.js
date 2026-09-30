const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const qs = await prisma.question.findMany({
    where: {
      sourceType: { in: ['PREVIOUS_YEAR', 'PYQ', 'VERIFIED_PYQ'] },
    },
    include: { pyqMetadata: true, exam: true },
  });

  console.log(`Found ${qs.length} PYQ-related questions.`);
  let withMeta = 0;
  let withoutMeta = 0;
  for (const q of qs) {
    if (q.pyqMetadata) withMeta++;
    else withoutMeta++;
  }
  console.log(`With PYQ Metadata: ${withMeta}, Without PYQ Metadata: ${withoutMeta}`);
  
  // Normalize source types
  let updated = 0;
  for (const q of qs) {
    if (q.sourceType === 'PREVIOUS_YEAR' || q.sourceType === 'PYQ') {
      if (q.pyqMetadata) {
        await prisma.question.update({
          where: { id: q.id },
          data: { sourceType: 'VERIFIED_PYQ', verified: true, verificationStatus: 'VERIFIED' }
        });
      } else {
        // If no metadata, classify as PRACTICE per prompt rule
        await prisma.question.update({
          where: { id: q.id },
          data: { sourceType: 'PRACTICE' }
        });
      }
      updated++;
    }
  }
  console.log(`Updated ${updated} legacy sourceTypes to standard PRACTICE or VERIFIED_PYQ.`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
