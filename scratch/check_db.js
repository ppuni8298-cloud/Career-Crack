const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const qCount = await prisma.question.count();
  const mtCount = await prisma.mockTest.count();
  const exams = await prisma.exam.findMany({ select: { id: true, name: true, slug: true } });
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true, slug: true } });
  console.log("DB Stats:", { qCount, mtCount, examCount: exams.length, subjectCount: subjects.length });
  console.log("Subjects:", subjects.map(s => s.name));
  await prisma.$disconnect();
}

check();
