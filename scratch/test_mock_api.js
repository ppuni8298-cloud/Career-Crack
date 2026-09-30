import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const tests = await prisma.mockTest.findMany({
    include: {
      exam: true,
      sections: {
        include: { subject: true },
      },
      questions: {
        include: {
          question: {
            include: { options: true },
          },
        },
      },
    },
  });

  console.log(`Found ${tests.length} tests in DB:`);
  for (const t of tests) {
    console.log(`- [${t.slug}] ${t.title} | ${t.totalQuestions} questions | ${t.durationSeconds / 60}m | Exam: ${t.exam.name}`);
    console.log(`  Sections: ${t.sections.map(s => `${s.title} (${s.questionCount}q)`).join(", ")}`);
    console.log(`  Actual Questions Linked: ${t.questions.length}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
