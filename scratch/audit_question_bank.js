const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log("========================================");
  console.log("CAREER CRACK QUESTION BANK AUDIT");
  console.log("========================================\n");

  const totalQuestions = await prisma.question.count();
  
  // By sourceType
  const sourceTypes = await prisma.question.groupBy({
    by: ['sourceType'],
    _count: { id: true },
  });
  
  // Also count verified via pyqMetadata or verified flag
  const verifiedPyqs = await prisma.question.count({
    where: {
      OR: [
        { sourceType: 'VERIFIED_PYQ' },
        { sourceType: 'PYQ' },
        { pyqMetadata: { isNot: null } },
      ],
    },
  });

  const practiceCount = await prisma.question.count({
    where: {
      sourceType: 'PRACTICE',
      pyqMetadata: null,
    },
  });

  const aiChallengeCount = await prisma.question.count({
    where: {
      sourceType: 'AI_CHALLENGE',
    },
  });

  // By Difficulty
  const difficulties = await prisma.question.groupBy({
    by: ['difficulty'],
    _count: { id: true },
  });

  // Fetch all questions with relations for deep anomaly detection
  const allQuestions = await prisma.question.findMany({
    include: {
      options: true,
      subject: { select: { name: true, slug: true } },
      topic: { select: { name: true, slug: true } },
      exam: { select: { name: true, slug: true } },
      pyqMetadata: true,
    },
  });

  // By Exam
  const byExam = {};
  const bySubject = {};
  const byTopic = {};
  let missingAnswers = 0;
  let missingOptions = 0;
  let missingExplanations = 0;

  const seenText = new Map();
  let duplicateCount = 0;

  for (const q of allQuestions) {
    // Exam grouping
    const examName = q.exam?.name || "General / Unassigned";
    byExam[examName] = (byExam[examName] || 0) + 1;

    // Subject grouping
    const subName = q.subject?.name || "Unknown Subject";
    bySubject[subName] = (bySubject[subName] || 0) + 1;

    // Topic grouping
    const topName = `${q.subject?.name || 'Unknown'} -> ${q.topic?.name || 'Unknown'}`;
    byTopic[topName] = (byTopic[topName] || 0) + 1;

    // Options & Answer check
    if (!q.options || q.options.length < 2) {
      missingOptions++;
    }
    const correctOpts = (q.options || []).filter(o => o.isCorrect);
    if (correctOpts.length !== 1) {
      missingAnswers++;
    }

    // Explanation check
    if (!q.explanation || q.explanation.trim().length === 0) {
      missingExplanations++;
    }

    // Duplicate check using normalized text
    const normalized = q.questionText
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (seenText.has(normalized)) {
      duplicateCount++;
    } else {
      seenText.set(normalized, q.id);
    }
  }

  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`PRACTICE: ${practiceCount}`);
  console.log(`VERIFIED_PYQ: ${verifiedPyqs}`);
  console.log(`AI_CHALLENGE: ${aiChallengeCount}`);
  console.log(`\nSource Types in DB:`);
  for (const st of sourceTypes) {
    console.log(`  ${st.sourceType}: ${st._count.id}`);
  }

  console.log(`\nBy Difficulty:`);
  for (const d of difficulties) {
    console.log(`  ${d.difficulty}: ${d._count.id}`);
  }

  console.log(`\nQuestions by Exam (${Object.keys(byExam).length} exams):`);
  for (const [exam, count] of Object.entries(byExam)) {
    console.log(`  ${exam}: ${count}`);
  }

  console.log(`\nQuestions by Subject (${Object.keys(bySubject).length} subjects):`);
  for (const [sub, count] of Object.entries(bySubject)) {
    console.log(`  ${sub}: ${count}`);
  }

  console.log(`\nTop 15 Topics with Most Questions:`);
  const sortedTopics = Object.entries(byTopic).sort((a, b) => b[1] - a[1]);
  for (const [topic, count] of sortedTopics.slice(0, 15)) {
    console.log(`  ${topic}: ${count}`);
  }

  console.log(`\nQuality & Integrity Checks:`);
  console.log(`  Duplicates: ${duplicateCount}`);
  console.log(`  Missing Options (< 2 options): ${missingOptions}`);
  console.log(`  Missing Answers (!= 1 correct option): ${missingAnswers}`);
  console.log(`  Missing Explanations: ${missingExplanations}`);

  console.log("\n========================================\n");
}

audit()
  .catch(err => {
    console.error("Audit error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
