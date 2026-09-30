const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({
    select: { id: true, name: true, slug: true, category: true }
  });
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      topics: { select: { id: true, name: true, slug: true } },
      _count: { select: { questions: true } }
    }
  });

  console.log("=== EXAMS ===");
  console.log(JSON.stringify(exams, null, 2));

  console.log("=== SUBJECTS & TOPICS ===");
  for (const s of subjects) {
    console.log(`\nSubject: ${s.name} (${s.slug}) [${s._count.questions} questions, ${s.topics.length} topics]`);
    for (const t of s.topics) {
      console.log(`   - ${t.name} (${t.slug})`);
    }
  }
  const examSubjects = await prisma.examSubject.findMany({
    include: { exam: { select: { slug: true } }, subject: { select: { slug: true } } }
  });
  console.log("\n=== EXAM SUBJECTS ===");
  console.log(examSubjects.map(x => `${x.exam.slug} -> ${x.subject.slug}`).join(", "));
}

main().finally(() => prisma.$disconnect());
