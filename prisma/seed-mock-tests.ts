import { PrismaClient } from "@prisma/client";

export async function seedMockTests(prisma: PrismaClient) {
  console.log("📝 Seeding Phase 5 Mock Tests...");

  // Retrieve exams
  const sscCgl = await prisma.exam.findUnique({ where: { slug: "ssc-cgl" } });
  const kpscKas = await prisma.exam.findUnique({ where: { slug: "kpsc-kas" } });
  const campusApt = await prisma.exam.findUnique({ where: { slug: "campus-aptitude" } });
  const techPlacement = await prisma.exam.findUnique({ where: { slug: "technical-placement" } });

  // Retrieve subjects
  const quant = await prisma.subject.findUnique({ where: { slug: "quantitative-aptitude" } });
  const reasoning = await prisma.subject.findUnique({ where: { slug: "logical-reasoning" } });
  const english = await prisma.subject.findUnique({ where: { slug: "english-comprehension" } });
  const ga = await prisma.subject.findUnique({ where: { slug: "general-awareness" } });
  const dsa = await prisma.subject.findUnique({ where: { slug: "data-structures-algorithms" } });
  const dbms = await prisma.subject.findUnique({ where: { slug: "database-management-systems" } });

  // Ensure fallback topics exist
  async function getOrCreateTopic(name: string, slug: string, subjectId: string) {
    return await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId,
          slug,
        },
      },
      update: { name },
      create: { name, slug, subjectId },
    });
  }

  const topicReasoning = await getOrCreateTopic("Analytical & Verbal Reasoning", "reasoning-general", reasoning!.id);
  const topicQuant = await getOrCreateTopic("Arithmetic & Advance Mathematics", "quant-general", quant!.id);
  const topicEnglish = await getOrCreateTopic("Grammar, Vocabulary & Comprehension", "english-general", english!.id);
  const topicGA = await getOrCreateTopic("Polity, History & Current Affairs", "ga-general", ga!.id);
  const topicDSA = await getOrCreateTopic("Data Structures, Complexity & Algorithms", "dsa-general", dsa!.id);
  const topicDBMS = await getOrCreateTopic("Relational DB, SQL & Transactions", "dbms-general", dbms!.id);

  // Helper to create questions and link to mock test
  async function createMockQuestion(data: {
    questionText: string;
    difficulty: string;
    examId?: string;
    subjectId: string;
    topicId: string;
    marks: number;
    negativeMarks: number;
    expectedTimeSeconds: number;
    concept: string;
    shortcut: string;
    commonMistake: string;
    explanation: string;
    options: Array<{ key: string; text: string; isCorrect: boolean }>;
  }) {
    let q = await prisma.question.findFirst({
      where: { questionText: data.questionText },
    });
    if (!q) {
      q = await prisma.question.create({
        data: {
          questionText: data.questionText,
          difficulty: data.difficulty,
          examId: data.examId || null,
          subjectId: data.subjectId,
          topicId: data.topicId,
          marks: data.marks,
          negativeMarks: data.negativeMarks,
          expectedTimeSeconds: data.expectedTimeSeconds,
          concept: data.concept,
          shortcut: data.shortcut,
          commonMistake: data.commonMistake,
          explanation: data.explanation,
          sourceType: "PREVIOUS_YEAR",
          verificationStatus: "VERIFIED",
          verified: true,
          options: {
            create: data.options.map((opt, idx) => ({
              optionKey: opt.key,
              optionText: opt.text,
              isCorrect: opt.isCorrect,
              order: idx,
            })),
          },
        },
      });
    }
    return q;
  }

  // =========================================================================
  // 1. SSC CGL Tier-1 Full-Length Mock Test 1
  // =========================================================================
  console.log("Seeding Mock Test 1: SSC CGL Tier-1...");
  const sscMock = await prisma.mockTest.upsert({
    where: { slug: "ssc-cgl-tier-1-mock-1" },
    update: {
      title: "SSC CGL Tier-1 Full-Length Mock Test 1",
      examId: sscCgl!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "MEDIUM",
      totalQuestions: 20,
      durationSeconds: 3600,
      totalMarks: 40.0,
      passingMarks: 26.0,
      negativeMarks: 0.5,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Official SSC CGL Tier-1 Pattern: 2.0 marks per question, 0.50 negative marking for each incorrect response.",
      description: "Full simulation of SSC CGL Tier-1 covering all 4 mandatory sections: Reasoning, Quantitative Aptitude, English, and General Awareness.",
    },
    create: {
      title: "SSC CGL Tier-1 Full-Length Mock Test 1",
      slug: "ssc-cgl-tier-1-mock-1",
      examId: sscCgl!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "MEDIUM",
      totalQuestions: 20,
      durationSeconds: 3600,
      totalMarks: 40.0,
      passingMarks: 26.0,
      negativeMarks: 0.5,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Official SSC CGL Tier-1 Pattern: 2.0 marks per question, 0.50 negative marking for each incorrect response.",
      description: "Full simulation of SSC CGL Tier-1 covering all 4 mandatory sections: Reasoning, Quantitative Aptitude, English, and General Awareness.",
    },
  });

  // Clean old sections for re-seeding cleanly
  await prisma.mockTestQuestion.deleteMany({ where: { mockTestId: sscMock.id } });
  await prisma.mockTestSection.deleteMany({ where: { mockTestId: sscMock.id } });

  // Section 1: General Intelligence & Reasoning
  const sscSec1 = await prisma.mockTestSection.create({
    data: {
      mockTestId: sscMock.id,
      title: "General Intelligence & Reasoning",
      sectionOrder: 1,
      questionCount: 5,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: reasoning!.id,
      instructions: "Each question carries 2 marks. 0.50 marks deducted for each incorrect answer.",
    },
  });

  const sscQ1 = await createMockQuestion({
    questionText: "Select the option that is related to the third number in the same way as the second number is related to the first number: 7 : 344 :: 11 : ?",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: reasoning!.id,
    topicId: topicReasoning.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 40,
    concept: "Cube plus one relationship: n : (n³ + 1)",
    shortcut: "7³ = 343 -> 343 + 1 = 344. Similarly, 11³ = 1331 -> 1331 + 1 = 1332.",
    commonMistake: "Multiplying by 49 instead of checking standard powers of cubes.",
    explanation: "The logic is: (First Number)³ + 1 = Second Number. 7³ + 1 = 343 + 1 = 344. For 11: 11³ + 1 = 1331 + 1 = 1332.",
    options: [
      { key: "A", text: "1332", isCorrect: true },
      { key: "B", text: "1330", isCorrect: false },
      { key: "C", text: "1321", isCorrect: false },
      { key: "D", text: "1222", isCorrect: false },
    ],
  });

  const sscQ2 = await createMockQuestion({
    questionText: "In a code language, 'ROBUST' is written as 'QNATRS'. How will 'ZODIAC' be written in that language?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: reasoning!.id,
    topicId: topicReasoning.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 45,
    concept: "Letter substitution with position decrement: -1 on each letter.",
    shortcut: "R-1=Q, O-1=N, B-1=A, U-1=T, S-1=R, T-1=S. Apply Z-1=Y, O-1=N, D-1=C, I-1=H, A-1=Z, C-1=B.",
    commonMistake: "Forgetting that decrementing 'A' wraps around to 'Z'.",
    explanation: "Each letter is shifted backward by 1 position in alphabetical order: Z -> Y, O -> N, D -> C, I -> H, A -> Z, C -> B, yielding YNCHZB.",
    options: [
      { key: "A", text: "YNCHZB", isCorrect: true },
      { key: "B", text: "XNCHZB", isCorrect: false },
      { key: "C", text: "YMCGZB", isCorrect: false },
      { key: "D", text: "WNDHZB", isCorrect: false },
    ],
  });

  const sscQ3 = await createMockQuestion({
    questionText: "Statements: Some pens are pencils. All pencils are erasers. Conclusions: I. Some erasers are pens. II. All erasers are pencils.",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: reasoning!.id,
    topicId: topicReasoning.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 50,
    concept: "Syllogism Euler circles / Venn diagrams.",
    shortcut: "Some Pens are Pencils, and All Pencils are Erasers implies intersection between Erasers and Pens exists. Conclusion I is definite; Conclusion II is converse fallacy.",
    commonMistake: "Assuming universal quantification works symmetrically (All A are B doesn't mean All B are A).",
    explanation: "Because all pencils are inside erasers, the intersection of pens and pencils is also inside erasers. Hence 'Some erasers are pens' is definitely true. 'All erasers are pencils' is not necessarily true.",
    options: [
      { key: "A", text: "Only conclusion I follows", isCorrect: true },
      { key: "B", text: "Only conclusion II follows", isCorrect: false },
      { key: "C", text: "Both I and II follow", isCorrect: false },
      { key: "D", text: "Neither I nor II follows", isCorrect: false },
    ],
  });

  const sscQ4 = await createMockQuestion({
    questionText: "Pointing to a photograph, a woman says: 'He is the son of the only daughter of the father of my brother.' How is the man in the photograph related to the woman?",
    difficulty: "HARD",
    examId: sscCgl!.id,
    subjectId: reasoning!.id,
    topicId: topicReasoning.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 60,
    concept: "Blood relations backtracking.",
    shortcut: "Father of my brother = Woman's father. Only daughter of woman's father = The woman herself. Son of the woman = Her son.",
    commonMistake: "Confusing 'only daughter' with sister when the speaker is a female.",
    explanation: "'Father of my brother' is her father. 'Only daughter of my father' is the woman herself (since she is female). 'He is the son of the only daughter' -> He is her son.",
    options: [
      { key: "A", text: "Son", isCorrect: true },
      { key: "B", text: "Nephew", isCorrect: false },
      { key: "C", text: "Brother", isCorrect: false },
      { key: "D", text: "Cousin", isCorrect: false },
    ],
  });

  const sscQ5 = await createMockQuestion({
    questionText: "Find the missing number in the series: 3, 10, 29, 66, 127, ?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: reasoning!.id,
    topicId: topicReasoning.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 45,
    concept: "Series pattern based on n³ + 2.",
    shortcut: "1³+2=3, 2³+2=10, 3³+2=29, 4³+2=66, 5³+2=127, 6³+2=216+2=218.",
    commonMistake: "Trying double differences without recognizing cube offsets.",
    explanation: "Each term corresponds to n³ + 2 for n = 1, 2, 3, 4, 5. For n = 6: 6³ + 2 = 216 + 2 = 218.",
    options: [
      { key: "A", text: "218", isCorrect: true },
      { key: "B", text: "216", isCorrect: false },
      { key: "C", text: "220", isCorrect: false },
      { key: "D", text: "214", isCorrect: false },
    ],
  });

  // Section 2: Quantitative Aptitude
  const sscSec2 = await prisma.mockTestSection.create({
    data: {
      mockTestId: sscMock.id,
      title: "Quantitative Aptitude",
      sectionOrder: 2,
      questionCount: 5,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: quant!.id,
      instructions: "High precision calculation section. 2 marks per question, 0.50 negative marking.",
    },
  });

  const sscQ6 = await createMockQuestion({
    questionText: "A trader marks his goods at 40% above the cost price and allows a discount of 25% on the marked price. Find his net profit or loss percentage.",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: quant!.id,
    topicId: topicQuant.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 50,
    concept: "Successive percentage change formula: a + b + (ab/100).",
    shortcut: "+40 - 25 - (40*25)/100 = 15 - 10 = +5% profit.",
    commonMistake: "Directly subtracting 25 from 40 to get 15%. Discount applies to marked price, not cost price!",
    explanation: "Let CP = 100. Marked Price (MP) = 140. Discount = 25% of 140 = 35. Selling Price (SP) = 140 - 35 = 105. Profit = 105 - 100 = 5%.",
    options: [
      { key: "A", text: "5% Profit", isCorrect: true },
      { key: "B", text: "15% Profit", isCorrect: false },
      { key: "C", text: "2% Loss", isCorrect: false },
      { key: "D", text: "8% Profit", isCorrect: false },
    ],
  });

  const sscQ7 = await createMockQuestion({
    questionText: "Two trains of lengths 140 m and 160 m run at speeds of 60 km/h and 48 km/h respectively in opposite directions on parallel tracks. The time taken to cross each other is:",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: quant!.id,
    topicId: topicQuant.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 55,
    concept: "Relative speed in opposite directions: S = S1 + S2; Total Distance = L1 + L2.",
    shortcut: "Relative speed = 60 + 48 = 108 km/h = 108 * (5/18) = 30 m/s. Total distance = 140 + 160 = 300 m. Time = 300 / 30 = 10 seconds.",
    commonMistake: "Forgetting to convert km/h to m/s by multiplying with 5/18.",
    explanation: "Total distance to be covered = 140 + 160 = 300 m. Relative speed in opposite directions = 60 + 48 = 108 km/h = 108 * (5/18) = 30 m/s. Time = Distance / Speed = 300 / 30 = 10 seconds.",
    options: [
      { key: "A", text: "10 seconds", isCorrect: true },
      { key: "B", text: "12 seconds", isCorrect: false },
      { key: "C", text: "9 seconds", isCorrect: false },
      { key: "D", text: "15 seconds", isCorrect: false },
    ],
  });

  const sscQ8 = await createMockQuestion({
    questionText: "If x + (1/x) = 5, then the value of x³ + (1/x³) is:",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: quant!.id,
    topicId: topicQuant.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 30,
    concept: "Algebraic identity: If x + 1/x = k, then x³ + 1/x³ = k³ - 3k.",
    shortcut: "5³ - 3(5) = 125 - 15 = 110.",
    commonMistake: "Cubing 5 directly as 125 without subtracting 3k.",
    explanation: "(x + 1/x)³ = x³ + 1/x³ + 3(x)(1/x)(x + 1/x) => 5³ = x³ + 1/x³ + 3(5) => x³ + 1/x³ = 125 - 15 = 110.",
    options: [
      { key: "A", text: "110", isCorrect: true },
      { key: "B", text: "125", isCorrect: false },
      { key: "C", text: "140", isCorrect: false },
      { key: "D", text: "115", isCorrect: false },
    ],
  });

  const sscQ9 = await createMockQuestion({
    questionText: "A sum of ₹12,000 amounts to ₹14,520 in 2 years compounded annually. What is the rate of interest per annum?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: quant!.id,
    topicId: topicQuant.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 60,
    concept: "Compound interest ratio method: A/P = (1 + r/100)ᵗ.",
    shortcut: "14520 / 12000 = 121 / 100. Square root for 2 years = 11 / 10 = 1 + 1/10 => r = 10%.",
    commonMistake: "Using simple interest formula when compound interest is specified.",
    explanation: "A/P = 14520/12000 = 1.21 = (1 + r/100)². Taking square root: 1 + r/100 = 1.10 => r/100 = 0.10 => r = 10%.",
    options: [
      { key: "A", text: "10%", isCorrect: true },
      { key: "B", text: "11%", isCorrect: false },
      { key: "C", text: "12%", isCorrect: false },
      { key: "D", text: "9.5%", isCorrect: false },
    ],
  });

  const sscQ10 = await createMockQuestion({
    questionText: "If the radius of a cylinder is doubled and its height is halved, the ratio of its new curved surface area to its original curved surface area is:",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: quant!.id,
    topicId: topicQuant.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 35,
    concept: "Curved surface area of a cylinder = 2πrh.",
    shortcut: "New CSA = 2π(2r)(h/2) = 2πrh. Ratio = 1 : 1.",
    commonMistake: "Thinking of volume (πr²h) instead of curved surface area.",
    explanation: "Original CSA = 2πrh. New CSA = 2π(2r)(h/2) = 2πrh. Thus, the ratio of new to original is 1 : 1.",
    options: [
      { key: "A", text: "1 : 1", isCorrect: true },
      { key: "B", text: "2 : 1", isCorrect: false },
      { key: "C", text: "1 : 2", isCorrect: false },
      { key: "D", text: "4 : 1", isCorrect: false },
    ],
  });

  // Section 3: English Comprehension
  const sscSec3 = await prisma.mockTestSection.create({
    data: {
      mockTestId: sscMock.id,
      title: "English Comprehension",
      sectionOrder: 3,
      questionCount: 5,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: english!.id,
      instructions: "Error identification, vocabulary, idioms, and voice changes.",
    },
  });

  const sscQ11 = await createMockQuestion({
    questionText: "Identify the segment that contains a grammatical error: 'Neither the teacher (A) / nor the students (B) / was present in the auditorium (C) / No error (D)'",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: english!.id,
    topicId: topicEnglish.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 30,
    concept: "Subject-verb agreement with correlative conjunctions 'neither...nor'.",
    shortcut: "When subjects are joined by 'neither... nor', the verb agrees with the subject nearest to it ('the students' is plural -> 'were').",
    commonMistake: "Matching the verb with the first subject ('the teacher') instead of the closer plural subject.",
    explanation: "When two subjects are joined by 'neither... nor', the verb agrees in person and number with the nearest subject. Here 'students' is plural, so 'were present' should be used instead of 'was present'.",
    options: [
      { key: "A", text: "Neither the teacher", isCorrect: false },
      { key: "B", text: "nor the students", isCorrect: false },
      { key: "C", text: "was present in the auditorium", isCorrect: true },
      { key: "D", text: "No error", isCorrect: false },
    ],
  });

  const sscQ12 = await createMockQuestion({
    questionText: "Select the most appropriate synonym of the given word: 'EPHEMERAL'",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: english!.id,
    topicId: topicEnglish.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 25,
    concept: "Vocabulary - Greek root 'ephemeros' (lasting for a day).",
    shortcut: "Ephemeral = Short-lived, transient, fleeting.",
    commonMistake: "Selecting 'Eternal' or 'Enduring' which are antonyms.",
    explanation: "'Ephemeral' means lasting for a very short time. 'Transient' is the exact synonym.",
    options: [
      { key: "A", text: "Transient", isCorrect: true },
      { key: "B", text: "Perpetual", isCorrect: false },
      { key: "C", text: "Enduring", isCorrect: false },
      { key: "D", text: "Imposing", isCorrect: false },
    ],
  });

  const sscQ13 = await createMockQuestion({
    questionText: "Select the most appropriate meaning of the idiom: 'To burn the candle at both ends'",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: english!.id,
    topicId: topicEnglish.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 25,
    concept: "Idiomatic expressions.",
    shortcut: "Burning both ends = exhausting energy by working late at night and early in the morning.",
    commonMistake: "Interpreting literally as wasting money or electricity.",
    explanation: "'To burn the candle at both ends' means to work extremely hard and stay up late while getting up early, often risking exhaustion.",
    options: [
      { key: "A", text: "To work extremely hard from early morning until late night", isCorrect: true },
      { key: "B", text: "To waste resources recklessly", isCorrect: false },
      { key: "C", text: "To illuminate a dark room from two sides", isCorrect: false },
      { key: "D", text: "To engage in two simultaneous heated arguments", isCorrect: false },
    ],
  });

  const sscQ14 = await createMockQuestion({
    questionText: "Select the correct passive form of the given sentence: 'The chef prepared an exquisite seven-course meal for the delegates.'",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: english!.id,
    topicId: topicEnglish.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 35,
    concept: "Active to Passive conversion in Simple Past tense: Object + was/were + V3 + by Subject.",
    shortcut: "'prepared' (simple past) -> 'was prepared'.",
    commonMistake: "Using continuous tense ('was being prepared') or perfect tense ('had been prepared').",
    explanation: "Simple past active (S + V2 + O) transforms into passive as (O + was/were + V3 + by + S). 'An exquisite seven-course meal was prepared by the chef for the delegates.'",
    options: [
      { key: "A", text: "An exquisite seven-course meal was prepared by the chef for the delegates.", isCorrect: true },
      { key: "B", text: "An exquisite seven-course meal was being prepared by the chef for the delegates.", isCorrect: false },
      { key: "C", text: "An exquisite seven-course meal had been prepared by the chef for the delegates.", isCorrect: false },
      { key: "D", text: "An exquisite seven-course meal is prepared by the chef for the delegates.", isCorrect: false },
    ],
  });

  const sscQ15 = await createMockQuestion({
    questionText: "Select the correctly spelt word:",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: english!.id,
    topicId: topicEnglish.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 20,
    concept: "Orthography and standard spelling.",
    shortcut: "Ac-com-mo-date has two 'c's and two 'm's.",
    commonMistake: "Omitting the second 'm' (accommodate vs accomodate).",
    explanation: "The correct spelling is 'Accommodate', containing double 'c' and double 'm'.",
    options: [
      { key: "A", text: "Accommodate", isCorrect: true },
      { key: "B", text: "Acommodate", isCorrect: false },
      { key: "C", text: "Accomodate", isCorrect: false },
      { key: "D", text: "Acomodate", isCorrect: false },
    ],
  });

  // Section 4: General Awareness
  const sscSec4 = await prisma.mockTestSection.create({
    data: {
      mockTestId: sscMock.id,
      title: "General Awareness",
      sectionOrder: 4,
      questionCount: 5,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: ga!.id,
      instructions: "Polity, History, Geography, and General Science questions.",
    },
  });

  const sscQ16 = await createMockQuestion({
    questionText: "Under which Article of the Constitution of India can the President issue an ordinance when Parliament is not in session?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: ga!.id,
    topicId: topicGA.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 25,
    concept: "Constitutional law: Legislative powers of the President.",
    shortcut: "President = 123; Governor = 213 (permuted digits).",
    commonMistake: "Confusing Article 123 (President) with Article 213 (Governor).",
    explanation: "Article 123 empowers the President to promulgate Ordinances during the recess of Parliament. Article 213 grants corresponding powers to State Governors.",
    options: [
      { key: "A", text: "Article 123", isCorrect: true },
      { key: "B", text: "Article 213", isCorrect: false },
      { key: "C", text: "Article 143", isCorrect: false },
      { key: "D", text: "Article 352", isCorrect: false },
    ],
  });

  const sscQ17 = await createMockQuestion({
    questionText: "Which ruler founded the city of Tughlaqabad and built its famous stone fortress in Delhi?",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: ga!.id,
    topicId: topicGA.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 25,
    concept: "Medieval Indian History - Delhi Sultanate Tughlaq dynasty.",
    shortcut: "Founder of Tughlaq Dynasty = Ghiyasuddin Tughlaq (built Tughlaqabad in 1321 AD).",
    commonMistake: "Selecting Muhammad bin Tughlaq, who founded Jahanpanah and shifted capital to Daulatabad.",
    explanation: "Ghiyasuddin Tughlaq (Ghazi Malik), founder of the Tughlaq dynasty in 1320, founded the third historic city of Delhi, Tughlaqabad, and built the massive stone fortress.",
    options: [
      { key: "A", text: "Ghiyasuddin Tughlaq", isCorrect: true },
      { key: "B", text: "Muhammad bin Tughlaq", isCorrect: false },
      { key: "C", text: "Feroz Shah Tughlaq", isCorrect: false },
      { key: "D", text: "Alauddin Khalji", isCorrect: false },
    ],
  });

  const sscQ18 = await createMockQuestion({
    questionText: "The Tropic of Cancer does NOT pass through which of the following Indian states?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: ga!.id,
    topicId: topicGA.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 30,
    concept: "Indian Physical Geography: 23°26′ N parallel.",
    shortcut: "8 States mnemonic: 'Mitram Par Ghamachha Jhar' (Mizoram, Tripura, WB, Gujarat, MP, Chhattisgarh, Jharkhand, Rajasthan). Odisha is south of Tropic of Cancer.",
    commonMistake: "Thinking Odisha lies on the Tropic of Cancer line.",
    explanation: "The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. It does not pass through Odisha.",
    options: [
      { key: "A", text: "Odisha", isCorrect: true },
      { key: "B", text: "Gujarat", isCorrect: false },
      { key: "C", text: "Chhattisgarh", isCorrect: false },
      { key: "D", text: "Tripura", isCorrect: false },
    ],
  });

  const sscQ19 = await createMockQuestion({
    questionText: "Which fundamental constant is represented by the letter 'h' in quantum mechanics and has the value ~6.626 × 10⁻³⁴ J·s?",
    difficulty: "EASY",
    examId: sscCgl!.id,
    subjectId: ga!.id,
    topicId: topicGA.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 20,
    concept: "General Science - Quantum Physics.",
    shortcut: "E = hν (Planck-Einstein relation).",
    commonMistake: "Confusing with Boltzmann constant (k) or Avogadro number.",
    explanation: "Max Planck introduced the Planck constant (h = 6.626 × 10⁻³⁴ J·s) in 1900 to describe the relationship between energy and frequency of electromagnetic radiation: E = hν.",
    options: [
      { key: "A", text: "Planck's Constant", isCorrect: true },
      { key: "B", text: "Boltzmann's Constant", isCorrect: false },
      { key: "C", text: "Hubble's Constant", isCorrect: false },
      { key: "D", text: "Rydberg's Constant", isCorrect: false },
    ],
  });

  const sscQ20 = await createMockQuestion({
    questionText: "In the context of the Indian economy, what does the term 'Stagflation' signify?",
    difficulty: "MEDIUM",
    examId: sscCgl!.id,
    subjectId: ga!.id,
    topicId: topicGA.id,
    marks: 2.0,
    negativeMarks: 0.5,
    expectedTimeSeconds: 30,
    concept: "Macroeconomics: Stagnant economic output combined with high inflation and unemployment.",
    shortcut: "Stagnation + Inflation = Stagflation.",
    commonMistake: "Equating stagflation with deflation (falling prices).",
    explanation: "Stagflation is an economic anomaly characterized by slow or stagnant economic growth, high unemployment, accompanied by persistent high inflation.",
    options: [
      { key: "A", text: "Stagnant economic growth accompanied by high inflation and high unemployment", isCorrect: true },
      { key: "B", text: "Rapid economic expansion accompanied by falling consumer price index", isCorrect: false },
      { key: "C", text: "Persistent drop in overall price levels causing industrial slowdown", isCorrect: false },
      { key: "D", text: "High fiscal deficit accompanied by currency appreciation", isCorrect: false },
    ],
  });

  // Link all 20 questions to SSC Mock Test
  const sscQuestions = [
    { q: sscQ1, sec: sscSec1, order: 1 },
    { q: sscQ2, sec: sscSec1, order: 2 },
    { q: sscQ3, sec: sscSec1, order: 3 },
    { q: sscQ4, sec: sscSec1, order: 4 },
    { q: sscQ5, sec: sscSec1, order: 5 },
    { q: sscQ6, sec: sscSec2, order: 6 },
    { q: sscQ7, sec: sscSec2, order: 7 },
    { q: sscQ8, sec: sscSec2, order: 8 },
    { q: sscQ9, sec: sscSec2, order: 9 },
    { q: sscQ10, sec: sscSec2, order: 10 },
    { q: sscQ11, sec: sscSec3, order: 11 },
    { q: sscQ12, sec: sscSec3, order: 12 },
    { q: sscQ13, sec: sscSec3, order: 13 },
    { q: sscQ14, sec: sscSec3, order: 14 },
    { q: sscQ15, sec: sscSec3, order: 15 },
    { q: sscQ16, sec: sscSec4, order: 16 },
    { q: sscQ17, sec: sscSec4, order: 17 },
    { q: sscQ18, sec: sscSec4, order: 18 },
    { q: sscQ19, sec: sscSec4, order: 19 },
    { q: sscQ20, sec: sscSec4, order: 20 },
  ];

  for (const item of sscQuestions) {
    await prisma.mockTestQuestion.create({
      data: {
        mockTestId: sscMock.id,
        sectionId: item.sec.id,
        questionId: item.q.id,
        questionOrder: item.order,
        marks: 2.0,
        negativeMarks: 0.5,
      },
    });
  }

  // =========================================================================
  // 2. KPSC KAS General Studies Prelims Mock 1
  // =========================================================================
  console.log("Seeding Mock Test 2: KPSC KAS Prelims Mock 1...");
  const kpscMock = await prisma.mockTest.upsert({
    where: { slug: "kpsc-kas-prelims-mock-1" },
    update: {
      title: "KPSC KAS General Studies Prelims Mock 1",
      examId: kpscKas!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "HARD",
      totalQuestions: 15,
      durationSeconds: 3600,
      totalMarks: 30.0,
      passingMarks: 18.0,
      negativeMarks: 0.5,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Simulated adhering to KPSC KAS Gazetted Probationers Preliminary Examination Paper-1 standards.",
      description: "Authentic simulation covering Karnataka history, Kadambas, Hoysalas, Vijayanagara Empire, and Indian Polity & Economy.",
    },
    create: {
      title: "KPSC KAS General Studies Prelims Mock 1",
      slug: "kpsc-kas-prelims-mock-1",
      examId: kpscKas!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "HARD",
      totalQuestions: 15,
      durationSeconds: 3600,
      totalMarks: 30.0,
      passingMarks: 18.0,
      negativeMarks: 0.5,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Simulated adhering to KPSC KAS Gazetted Probationers Preliminary Examination Paper-1 standards.",
      description: "Authentic simulation covering Karnataka history, Kadambas, Hoysalas, Vijayanagara Empire, and Indian Polity & Economy.",
    },
  });

  await prisma.mockTestQuestion.deleteMany({ where: { mockTestId: kpscMock.id } });
  await prisma.mockTestSection.deleteMany({ where: { mockTestId: kpscMock.id } });

  const kpscSec1 = await prisma.mockTestSection.create({
    data: {
      mockTestId: kpscMock.id,
      title: "Karnataka History, Heritage & Culture",
      sectionOrder: 1,
      questionCount: 8,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: ga!.id,
      instructions: "Ancient, medieval, and modern Karnataka history. 2 marks per question, 0.50 negative marking.",
    },
  });

  const kpscSec2 = await prisma.mockTestSection.create({
    data: {
      mockTestId: kpscMock.id,
      title: "Indian Polity, State Administration & Economy",
      sectionOrder: 2,
      questionCount: 7,
      marksPerQuestion: 2.0,
      negativeMarks: 0.5,
      subjectId: ga!.id,
      instructions: "Constitution of India, federal structure, Karnataka budget, and administrative machinery.",
    },
  });

  const kpscQuestionsData = [
    {
      text: "The famous Halmidi inscription, recognized as the earliest known Kannada epigraph, belongs to which dynasty?",
      diff: "MEDIUM",
      sec: kpscSec1,
      concept: "Epigraphy of Karnataka - Kadamba dynasty.",
      shortcut: "Halmidi inscription discovered in Hassan district dates to ~450 CE under King Kakusthavarma of Kadamba dynasty.",
      mistake: "Attributing to Badami Chalukyas or Western Gangas.",
      exp: "The Halmidi inscription (dated to c. 450 CE) was issued during the reign of Kadamba ruler Kakusthavarma and constitutes the earliest documented Kannada stone inscription.",
      opts: [
        { key: "A", text: "Kadambas of Banavasi", isCorrect: true },
        { key: "B", text: "Chalukyas of Badami", isCorrect: false },
        { key: "C", text: "Gangas of Talakad", isCorrect: false },
        { key: "D", text: "Rashtrakutas of Manyakheta", isCorrect: false },
      ],
    },
    {
      text: "Who among the following Vijayanagara rulers authored the celebrated Telugu epic 'Amuktamalyada' and Kannada work 'Jambavati Kalyana' in Sanskrit?",
      diff: "EASY",
      sec: kpscSec1,
      concept: "Vijayanagara Literature & Tuluva dynasty.",
      shortcut: "Krishnadevaraya = Patron of Ashtadiggajas, author of Amuktamalyada.",
      mistake: "Confusing Devaraya II with Krishnadevaraya.",
      exp: "Emperor Sri Krishnadevaraya (1509–1529 CE) of the Tuluva dynasty authored 'Amuktamalyada' in Telugu and 'Jambavati Kalyanam' in Sanskrit.",
      opts: [
        { key: "A", text: "Sri Krishnadevaraya", isCorrect: true },
        { key: "B", text: "Devaraya II (Proudha Devaraya)", isCorrect: false },
        { key: "C", text: "Harihara II", isCorrect: false },
        { key: "D", text: "Achyuta Deva Raya", isCorrect: false },
      ],
    },
    {
      text: "The unique star-shaped (stellate) ground plans and chloritic schist carvings are characteristic architectural hallmarks of which Karnataka dynasty?",
      diff: "MEDIUM",
      sec: kpscSec1,
      concept: "Hoysala temple architecture (Belur, Halebidu, Somanathapura).",
      shortcut: "Star-shaped platform + soapstone = Hoysalas.",
      mistake: "Confusing Chalukyan rock-cut temples with Hoysala stellate temples.",
      exp: "Hoysala architecture is famed for stellate (star-shaped) platforms (jagati) and intricate soapstone (chloritic schist) reliefs, exemplified at Belur Chennakeshava and Halebidu Hoysaleshwara temples.",
      opts: [
        { key: "A", text: "Hoysala Dynasty", isCorrect: true },
        { key: "B", text: "Chola Dynasty", isCorrect: false },
        { key: "C", text: "Alupa Dynasty", isCorrect: false },
        { key: "D", text: "Bahmani Sultanate", isCorrect: false },
      ],
    },
    {
      text: "Which pioneering social reformer established the 'Anubhava Mantapa' in Basavakalyan during the 12th century as a socio-spiritual democratic parliament?",
      diff: "EASY",
      sec: kpscSec1,
      concept: "Vachana movement & Sharana philosophy in Karnataka.",
      shortcut: "Basaveshwara established Anubhava Mantapa under King Bijjala II.",
      mistake: "Confusing Allama Prabhu (the presiding head) with the founder Basavanna.",
      exp: "Lord Basaveshwara (Basavanna) established the Anubhava Mantapa in the 12th century at Basavakalyan, welcoming seekers from all castes and genders to compose and discuss Vachana literature.",
      opts: [
        { key: "A", text: "Basaveshwara", isCorrect: true },
        { key: "B", text: "Madhavacharya", isCorrect: false },
        { key: "C", text: "Ramanujacharya", isCorrect: false },
        { key: "D", text: "Shankaracharya", isCorrect: false },
      ],
    },
    {
      text: "The heroic Queen Kittur Chennamma led an armed rebellion against British East India Company rule in 1824 opposing the imposition of:",
      diff: "MEDIUM",
      sec: kpscSec1,
      concept: "Modern Karnataka History - Anti-colonial uprisings.",
      shortcut: "Kittur Chennamma fought British Collector St. John Thackeray over British refusal to recognize her adopted son Shivalingappa.",
      mistake: "Assuming Dalhousie's Doctrine of Lapse of 1848, whereas Company applied customary lapse precursors in 1824.",
      exp: "Rani Chennamma fought against British annexation when Collector Thackeray refused to recognize her adopted son Shivalingappa as heir to the Kittur principality in 1824.",
      opts: [
        { key: "A", text: "Rejection of the right of adopted heir by the East India Company", isCorrect: true },
        { key: "B", text: "The Vernacular Press Act", isCorrect: false },
        { key: "C", text: "Permanent Settlement of Land Revenue", isCorrect: false },
        { key: "D", text: "Ilbert Bill controversy", isCorrect: false },
      ],
    },
    {
      text: "Who presided over the historic 39th session of the Indian National Congress held at Belgaum in 1924, the only INC session ever presided over by him?",
      diff: "EASY",
      sec: kpscSec1,
      concept: "Indian Freedom Movement in Karnataka.",
      shortcut: "Belgaum 1924 = Only session presided over by Mahatma Gandhi.",
      mistake: "Guessing Jawaharlal Nehru or Subhas Chandra Bose.",
      exp: "The 39th Session of the Indian National Congress at Belgaum (now Belagavi), Karnataka in December 1924 was the only INC session presided over by Mahatma Gandhi.",
      opts: [
        { key: "A", text: "Mahatma Gandhi", isCorrect: true },
        { key: "B", text: "Sardar Vallabhbhai Patel", isCorrect: false },
        { key: "C", text: "Jawaharlal Nehru", isCorrect: false },
        { key: "D", text: "Gopabandhu Das", isCorrect: false },
      ],
    },
    {
      text: "Under the provisions of the States Reorganisation Act 1956, Mysore State was formed on November 1, 1956. In which year was it officially renamed 'Karnataka'?",
      diff: "EASY",
      sec: kpscSec1,
      concept: "Karnataka Unification (Ekikarana) milestone.",
      shortcut: "Renamed Karnataka on November 1, 1973 under Chief Minister D. Devaraj Urs.",
      mistake: "Choosing 1956 (formation) or 1969.",
      exp: "Mysore State was formally renamed 'Karnataka' on November 1, 1973 during the tenure of Chief Minister D. Devaraj Urs.",
      opts: [
        { key: "A", text: "1973", isCorrect: true },
        { key: "B", text: "1956", isCorrect: false },
        { key: "C", text: "1969", isCorrect: false },
        { key: "D", text: "1980", isCorrect: false },
      ],
    },
    {
      text: "The famous waterfall 'Jog Falls' (Gersoppa Falls), one of the highest plunge waterfalls in India, is formed by which river in Shivamogga district?",
      diff: "EASY",
      sec: kpscSec1,
      concept: "Physical Geography of Karnataka - Western Ghats drainage.",
      shortcut: "Jog Falls = Sharavathi River.",
      mistake: "Confusing with Netravati, Tungabhadra, or Cauvery.",
      exp: "Jog Falls is created by the Sharavathi River dropping 253 m (830 ft) in four distinct cascades named Raja, Rani, Roarer, and Rocket.",
      opts: [
        { key: "A", text: "Sharavathi River", isCorrect: true },
        { key: "B", text: "Tungabhadra River", isCorrect: false },
        { key: "C", text: "Netravati River", isCorrect: false },
        { key: "D", text: "Kali River", isCorrect: false },
      ],
    },
    // Section 2 Questions
    {
      text: "Article 371J of the Constitution of India provides special provisions for which region of Karnataka?",
      diff: "MEDIUM",
      sec: kpscSec2,
      concept: "Constitutional provisions - Regional autonomy & backward area development.",
      shortcut: "Article 371J = 98th Constitutional Amendment Act (2012) for Kalyana-Karnataka (Hyderabad-Karnataka).",
      mistake: "Confusing with Coastal Karnataka or Malnad.",
      exp: "Article 371J was inserted by the 98th Constitutional Amendment Act, 2012, granting special status, reservations in education, and public employment to 6 districts of Hyderabad-Karnataka (Kalyana-Karnataka).",
      opts: [
        { key: "A", text: "Kalyana-Karnataka (Hyderabad-Karnataka) region", isCorrect: true },
        { key: "B", text: "Coastal Karnataka (Karavali) region", isCorrect: false },
        { key: "C", text: "Old Mysore administrative region", isCorrect: false },
        { key: "D", text: "Kittur-Karnataka (Bombay-Karnataka) region", isCorrect: false },
      ],
    },
    {
      text: "Under the 73rd Constitutional Amendment Act, 1992, what is the mandatory reservation provided for women in Panchayati Raj Institutions in Karnataka?",
      diff: "MEDIUM",
      sec: kpscSec2,
      concept: "Local self-government & state amendment provisions.",
      shortcut: "Center requires minimum 33%, but Karnataka enacted 50% reservation for women in local bodies.",
      mistake: "Choosing 33% (central minimum) instead of Karnataka's 50% statutory provision.",
      exp: "While the 73rd Amendment mandates at least 33.3% reservation, Karnataka enhanced women's reservation in Gram, Taluk, and Zilla Panchayats to 50%.",
      opts: [
        { key: "A", text: "50%", isCorrect: true },
        { key: "B", text: "33%", isCorrect: false },
        { key: "C", text: "25%", isCorrect: false },
        { key: "D", text: "40%", isCorrect: false },
      ],
    },
    {
      text: "Which Constitutional Body in India conducts audits of the receipts and expenditures of the Government of Karnataka and submits reports to the Governor?",
      diff: "EASY",
      sec: kpscSec2,
      concept: "Article 148–151: Comptroller and Auditor General of India.",
      shortcut: "CAG reports on state finances are submitted to the State Governor under Article 151(2).",
      mistake: "Thinking state finance audits are done by the State Finance Commission.",
      exp: "Under Article 151(2), the reports of the Comptroller and Auditor General of India relating to the accounts of a State shall be submitted to the Governor, who causes them to be laid before the Legislature.",
      opts: [
        { key: "A", text: "Comptroller and Auditor General of India (CAG)", isCorrect: true },
        { key: "B", text: "State Finance Commission", isCorrect: false },
        { key: "C", text: "Public Accounts Committee of Karnataka", isCorrect: false },
        { key: "D", text: "Karnataka State Audit and Accounts Department", isCorrect: false },
      ],
    },
    {
      text: "Which landmark initiative made Karnataka the first Indian state to computerize 20 million rural land records, earning national and global governance acclaim?",
      diff: "MEDIUM",
      sec: kpscSec2,
      concept: "E-Governance and public administration innovations in Karnataka.",
      shortcut: "Project Bhoomi (launched in 2000) for online delivery of RTCs.",
      mistake: "Selecting Sakala (Guarantee of Services) or Khajane (Treasury system).",
      exp: "Project 'Bhoomi', conceptualized and deployed in Karnataka in 2000, pioneered digital land title management and online RTC generation, eliminating bureaucratic discretion.",
      opts: [
        { key: "A", text: "Project Bhoomi", isCorrect: true },
        { key: "B", text: "Sakala Scheme", isCorrect: false },
        { key: "C", text: "Khajane Project", isCorrect: false },
        { key: "D", text: "Mahiti Shakti", isCorrect: false },
      ],
    },
    {
      text: "Which tier of the court hierarchy in India has original jurisdiction under Article 131 to decide legal disputes between the Government of India and one or more States?",
      diff: "HARD",
      sec: kpscSec2,
      concept: "Federal dispute jurisdiction of the Supreme Court.",
      shortcut: "Article 131 = Exclusive Original Jurisdiction of the Supreme Court of India.",
      mistake: "Thinking high courts can adjudicate interstate federal disputes.",
      exp: "Article 131 of the Constitution grants the Supreme Court exclusive original jurisdiction in disputes between the Government of India and one or more States, or between two or more States.",
      opts: [
        { key: "A", text: "Supreme Court of India exclusively", isCorrect: true },
        { key: "B", text: "High Court of the responding state", isCorrect: false },
        { key: "C", text: "Inter-State Council under Article 263", isCorrect: false },
        { key: "D", text: "Special Federal Tribunal", isCorrect: false },
      ],
    },
    {
      text: "In Karnataka's agro-climatic profile, which district is widely recognized as the 'Coffee Capital of India' producing the largest share of Indian Arabica and Robusta?",
      diff: "EASY",
      sec: kpscSec2,
      concept: "Agriculture & Plantation Economy of Karnataka.",
      shortcut: "Chikkamagaluru (where Baba Budan first planted coffee seeds in the 17th century) and Kodagu.",
      mistake: "Selecting Mandya (sugarcane) or Belagavi.",
      exp: "Chikkamagaluru and Kodagu account for over 70% of India's coffee yield. Baba Budan introduced coffee seeds from Yemen to the Chandragiri hills (Baba Budan Giri) in Chikkamagaluru.",
      opts: [
        { key: "A", text: "Chikkamagaluru", isCorrect: true },
        { key: "B", text: "Mandya", isCorrect: false },
        { key: "C", text: "Shivamogga", isCorrect: false },
        { key: "D", text: "Dharwad", isCorrect: false },
      ],
    },
    {
      text: "The Fiscal Responsibility and Budget Management (FRBM) Act aims to ensure inter-generational equity in fiscal management. What was Karnataka's distinction regarding fiscal responsibility legislation?",
      diff: "HARD",
      sec: kpscSec2,
      concept: "Public Finance in Karnataka - KFRRA 2002.",
      shortcut: "Karnataka was the very first state in India to enact Fiscal Responsibility legislation (2002).",
      mistake: "Assuming Tamil Nadu or Maharashtra enacted it first.",
      exp: "Karnataka was the first state in India to pass the Karnataka Fiscal Responsibility Act (KFRA) in 2002, even before the Union Parliament enacted the FRBM Act in 2003.",
      opts: [
        { key: "A", text: "Karnataka was the first Indian state to enact a Fiscal Responsibility Act in 2002", isCorrect: true },
        { key: "B", text: "Karnataka was granted full exemption from central debt borrowing ceilings", isCorrect: false },
        { key: "C", text: "Karnataka has maintained a 0% fiscal deficit consecutively for 20 years", isCorrect: false },
        { key: "D", text: "Karnataka is the only state where revenue surplus is unconstitutional", isCorrect: false },
      ],
    },
  ];

  let kpscQOrder = 1;
  for (const item of kpscQuestionsData) {
    const q = await createMockQuestion({
      questionText: item.text,
      difficulty: item.diff,
      examId: kpscKas!.id,
      subjectId: ga!.id,
      topicId: topicGA.id,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 40,
      concept: item.concept,
      shortcut: item.shortcut,
      commonMistake: item.mistake,
      explanation: item.exp,
      options: item.opts,
    });

    await prisma.mockTestQuestion.create({
      data: {
        mockTestId: kpscMock.id,
        sectionId: item.sec.id,
        questionId: q.id,
        questionOrder: kpscQOrder++,
        marks: 2.0,
        negativeMarks: 0.5,
      },
    });
  }

  // =========================================================================
  // 3. Campus Recruitment Aptitude & Reasoning Mock 1
  // =========================================================================
  console.log("Seeding Mock Test 3: Campus Recruitment Aptitude...");
  const campusMock = await prisma.mockTest.upsert({
    where: { slug: "campus-aptitude-mock-1" },
    update: {
      title: "Campus Recruitment Aptitude & Reasoning Mock 1",
      examId: campusApt!.id,
      mockType: "PRACTICE_MOCK",
      difficulty: "MEDIUM",
      totalQuestions: 15,
      durationSeconds: 2700,
      totalMarks: 15.0,
      passingMarks: 10.0,
      negativeMarks: 0.25,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Simulates evaluation blueprints across TCS NQT, Infosys, Cognizant, and Wipro recruitment screenings.",
      description: "Comprehensive aptitude drill covering Numerical Problem Solving, Logical Deduction, and Verbal Fluency.",
    },
    create: {
      title: "Campus Recruitment Aptitude & Reasoning Mock 1",
      slug: "campus-aptitude-mock-1",
      examId: campusApt!.id,
      mockType: "PRACTICE_MOCK",
      difficulty: "MEDIUM",
      totalQuestions: 15,
      durationSeconds: 2700,
      totalMarks: 15.0,
      passingMarks: 10.0,
      negativeMarks: 0.25,
      navigationRule: "FREE",
      isOfficialPattern: true,
      disclaimer: "Simulates evaluation blueprints across TCS NQT, Infosys, Cognizant, and Wipro recruitment screenings.",
      description: "Comprehensive aptitude drill covering Numerical Problem Solving, Logical Deduction, and Verbal Fluency.",
    },
  });

  await prisma.mockTestQuestion.deleteMany({ where: { mockTestId: campusMock.id } });
  await prisma.mockTestSection.deleteMany({ where: { mockTestId: campusMock.id } });

  const campSec1 = await prisma.mockTestSection.create({
    data: {
      mockTestId: campusMock.id,
      title: "Quantitative Problem Solving",
      sectionOrder: 1,
      questionCount: 5,
      marksPerQuestion: 1.0,
      negativeMarks: 0.25,
      subjectId: quant!.id,
      instructions: "1 mark per question. 0.25 negative marks for incorrect answers.",
    },
  });

  const campSec2 = await prisma.mockTestSection.create({
    data: {
      mockTestId: campusMock.id,
      title: "Logical & Deductive Reasoning",
      sectionOrder: 2,
      questionCount: 5,
      marksPerQuestion: 1.0,
      negativeMarks: 0.25,
      subjectId: reasoning!.id,
      instructions: "Pattern recognition, blood relations, and arrangements.",
    },
  });

  const campSec3 = await prisma.mockTestSection.create({
    data: {
      mockTestId: campusMock.id,
      title: "Verbal Ability & Grammar",
      sectionOrder: 3,
      questionCount: 5,
      marksPerQuestion: 1.0,
      negativeMarks: 0.25,
      subjectId: english!.id,
      instructions: "Grammar, contextual fill-ups, and sentence restructuring.",
    },
  });

  const campusQuestionsData = [
    // Quant 5
    {
      sec: campSec1,
      sub: quant!.id,
      top: topicQuant.id,
      text: "A can do a piece of work in 12 days and B can do it in 18 days. They work together for 4 days, after which B leaves. How many days will A alone take to finish the remaining work?",
      diff: "MEDIUM",
      concept: "Time and Work unitary & LCM method.",
      shortcut: "Total work = LCM(12, 18) = 36 units. Efficiency: A = 3, B = 2. Together = 5 units/day. 4 days work = 20 units. Remaining = 16 units. A takes 16/3 = 5⅓ days.",
      mistake: "Dividing remaining work by combined efficiency instead of A's alone.",
      exp: "Work in 4 days = 4 * (1/12 + 1/18) = 4 * (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9. Time taken by A alone = (4/9) / (1/12) = (4/9) * 12 = 16/3 = 5⅓ days.",
      opts: [
        { key: "A", text: "5⅓ days (16/3 days)", isCorrect: true },
        { key: "B", text: "6 days", isCorrect: false },
        { key: "C", text: "4½ days", isCorrect: false },
        { key: "D", text: "7 days", isCorrect: false },
      ],
    },
    {
      sec: campSec1,
      sub: quant!.id,
      top: topicQuant.id,
      text: "In an alloy of 60 kg, the ratio of copper to zinc is 2 : 1. If this ratio is to be made 1 : 2, how much zinc must be added to the alloy?",
      diff: "MEDIUM",
      concept: "Mixture and Alligation: Ratio adjustments when adding single component.",
      shortcut: "Copper remains fixed at 40 kg. In new ratio Copper:Zinc = 1:2, if 1 unit = 40 kg, Zinc must be 2 units = 80 kg. Already have 20 kg Zinc, so add 80 - 20 = 60 kg.",
      mistake: "Recalculating both components or dividing total by 3.",
      exp: "Initial Copper = (2/3) * 60 = 40 kg; Zinc = 20 kg. In new mixture, Copper : Zinc = 1 : 2. Since only Zinc is added, Copper stays 40 kg. 40 / (20 + x) = 1/2 => 20 + x = 80 => x = 60 kg.",
      opts: [
        { key: "A", text: "60 kg", isCorrect: true },
        { key: "B", text: "40 kg", isCorrect: false },
        { key: "C", text: "30 kg", isCorrect: false },
        { key: "D", text: "75 kg", isCorrect: false },
      ],
    },
    {
      sec: campSec1,
      sub: quant!.id,
      top: topicQuant.id,
      text: "A vendor buys lemons at 6 for ₹10 and sells them at 4 for ₹10. What is his profit percentage?",
      diff: "EASY",
      concept: "Profit and Loss: Equalizing quantity.",
      shortcut: "LCM of 6 and 4 is 12 lemons. CP of 12 = ₹20. SP of 12 = ₹30. Profit = ₹10 on ₹20 = 50%.",
      mistake: "Calculating profit directly from the prices without equalizing item count.",
      exp: "CP of 1 lemon = ₹10/6 = ₹5/3. SP of 1 lemon = ₹10/4 = ₹5/2. Profit = SP - CP = 5/2 - 5/3 = 5/6. Profit % = (Profit / CP) * 100 = ( (5/6) / (5/3) ) * 100 = (3/6) * 100 = 50%.",
      opts: [
        { key: "A", text: "50%", isCorrect: true },
        { key: "B", text: "40%", isCorrect: false },
        { key: "C", text: "33.33%", isCorrect: false },
        { key: "D", text: "25%", isCorrect: false },
      ],
    },
    {
      sec: campSec1,
      sub: quant!.id,
      top: topicQuant.id,
      text: "The average age of a class of 30 students is 15 years. If the teacher's age is included, the average age increases by 1 year. The teacher's age is:",
      diff: "EASY",
      concept: "Averages: Deviation method.",
      shortcut: "Teacher's age = New Average + (Number of initial students * change) = 16 + (30 * 1) = 46 years.",
      mistake: "Multiplying 31 * 16 and getting calculation fatigue instead of using deviation shortcut.",
      exp: "Total age of 30 students = 30 * 15 = 450. Total age with teacher (31 persons) = 31 * 16 = 496. Teacher's age = 496 - 450 = 46 years.",
      opts: [
        { key: "A", text: "46 years", isCorrect: true },
        { key: "B", text: "45 years", isCorrect: false },
        { key: "C", text: "44 years", isCorrect: false },
        { key: "D", text: "48 years", isCorrect: false },
      ],
    },
    {
      sec: campSec1,
      sub: quant!.id,
      top: topicQuant.id,
      text: "What is the probability of getting a sum of 9 when two fair six-sided dice are thrown simultaneously?",
      diff: "MEDIUM",
      concept: "Classical probability: Favorable outcomes / Total sample space.",
      shortcut: "Total outcomes = 6 * 6 = 36. Pairs summing to 9: (3,6), (4,5), (5,4), (6,3) = 4 pairs. P = 4/36 = 1/9.",
      mistake: "Missing permutations like (4,5) vs (5,4).",
      exp: "Favorable pairs for sum = 9 are {(3,6), (4,5), (5,4), (6,3)}, total 4 outcomes. Total sample space = 36. Probability = 4/36 = 1/9.",
      opts: [
        { key: "A", text: "1/9", isCorrect: true },
        { key: "B", text: "1/6", isCorrect: false },
        { key: "C", text: "5/36", isCorrect: false },
        { key: "D", text: "1/12", isCorrect: false },
      ],
    },
    // Logical 5
    {
      sec: campSec2,
      sub: reasoning!.id,
      top: topicReasoning.id,
      text: "In a row of boys facing North, A is 13th from the left and D is 17th from the right. If they interchange positions, A becomes 21st from the left. How many boys are there in the row?",
      diff: "MEDIUM",
      concept: "Ranking and Ordering: Position Interchange.",
      shortcut: "Total = (A's new position from left) + (D's original position from right) - 1 = 21 + 17 - 1 = 37.",
      mistake: "Forgetting to subtract 1 to avoid double-counting the occupant of that position.",
      exp: "When A shifts to D's position, that position is 21st from left and 17th from right. Total = Left + Right - 1 = 21 + 17 - 1 = 37 boys.",
      opts: [
        { key: "A", text: "37", isCorrect: true },
        { key: "B", text: "38", isCorrect: false },
        { key: "C", text: "36", isCorrect: false },
        { key: "D", text: "39", isCorrect: false },
      ],
    },
    {
      sec: campSec2,
      sub: reasoning!.id,
      top: topicReasoning.id,
      text: "If '+' means 'divided by', '-' means 'multiplied by', '×' means 'plus', and '÷' means 'minus', then calculate: 36 + 6 - 3 × 5 ÷ 3",
      diff: "EASY",
      concept: "Mathematical operations & BODMAS precedence.",
      shortcut: "Substitute: 36 ÷ 6 × 3 + 5 - 3 = 6 × 3 + 5 - 3 = 18 + 5 - 3 = 20.",
      mistake: "Applying operations from left to right without respecting BODMAS.",
      exp: "Applying replacements gives: 36 ÷ 6 × 3 + 5 - 3. Division first: 36 ÷ 6 = 6. Multiplication: 6 × 3 = 18. Addition/Subtraction: 18 + 5 - 3 = 20.",
      opts: [
        { key: "A", text: "20", isCorrect: true },
        { key: "B", text: "22", isCorrect: false },
        { key: "C", text: "18", isCorrect: false },
        { key: "D", text: "25", isCorrect: false },
      ],
    },
    {
      sec: campSec2,
      sub: reasoning!.id,
      top: topicReasoning.id,
      text: "Find the odd one out among the following pairs: (8, 64), (6, 36), (7, 49), (9, 82)",
      diff: "EASY",
      concept: "Classification of number pairs: Number to its square.",
      shortcut: "8²=64, 6²=36, 7²=49. But 9²=81 (not 82).",
      mistake: "Checking arithmetic difference rather than squaring.",
      exp: "In all other pairs, the second number is the square of the first number (8²=64, 6²=36, 7²=49). In (9, 82), 9² is 81, making 82 incorrect.",
      opts: [
        { key: "A", text: "(9, 82)", isCorrect: true },
        { key: "B", text: "(8, 64)", isCorrect: false },
        { key: "C", text: "(7, 49)", isCorrect: false },
        { key: "D", text: "(6, 36)", isCorrect: false },
      ],
    },
    {
      sec: campSec2,
      sub: reasoning!.id,
      top: topicReasoning.id,
      text: "A person travels 12 km North, turns right and travels 5 km. How far and in what direction is he now from his starting point?",
      diff: "EASY",
      concept: "Directions and Pythagoras theorem: 5-12-13 triplet.",
      shortcut: "North 12, East 5. Hypotenuse = √(12² + 5²) = 13 km North-East.",
      mistake: "Adding 12 + 5 = 17 km instead of straight-line displacement.",
      exp: "By Pythagoras Theorem: Distance = √(12² + 5²) = √(144 + 25) = √169 = 13 km. Direction from origin is North-East.",
      opts: [
        { key: "A", text: "13 km, North-East", isCorrect: true },
        { key: "B", text: "17 km, North-East", isCorrect: false },
        { key: "C", text: "13 km, North-West", isCorrect: false },
        { key: "D", text: "15 km, South-East", isCorrect: false },
      ],
    },
    {
      sec: campSec2,
      sub: reasoning!.id,
      top: topicReasoning.id,
      text: "Select the letter cluster that will replace the question mark: BDF, CFI, DHL, ?",
      diff: "MEDIUM",
      concept: "Letter pattern with step increments.",
      shortcut: "B(+1)=C(+1)=D(+1)=E; D(+2)=F(+2)=H(+2)=J; F(+3)=I(+3)=L(+3)=O. Result = EJO.",
      mistake: "Treating each letter with the same constant offset.",
      exp: "1st letter increments by 1: B, C, D -> E. 2nd letter increments by 2: D(4), F(6), H(8) -> J(10). 3rd letter increments by 3: F(6), I(9), L(12) -> O(15). Answer: EJO.",
      opts: [
        { key: "A", text: "EJO", isCorrect: true },
        { key: "B", text: "EKP", isCorrect: false },
        { key: "C", text: "EIN", isCorrect: false },
        { key: "D", text: "FJP", isCorrect: false },
      ],
    },
    // Verbal 5
    {
      sec: campSec3,
      sub: english!.id,
      top: topicEnglish.id,
      text: "Fill in the blank with the appropriate preposition: 'He is proficient _____ five different programming languages.'",
      diff: "EASY",
      concept: "Prepositional collocation with adjectives.",
      shortcut: "'Proficient in' is the standard fixed preposition.",
      mistake: "Using 'proficient at' or 'proficient with'.",
      exp: "The adjective 'proficient' is correctly followed by the preposition 'in' when denoting mastery of an art, language, or subject.",
      opts: [
        { key: "A", text: "in", isCorrect: true },
        { key: "B", text: "at", isCorrect: false },
        { key: "C", text: "with", isCorrect: false },
        { key: "D", text: "about", isCorrect: false },
      ],
    },
    {
      sec: campSec3,
      sub: english!.id,
      top: topicEnglish.id,
      text: "Select the option that gives the most accurate meaning of 'PRAGMATIC':",
      diff: "EASY",
      concept: "Vocabulary - Practical versus theoretical.",
      shortcut: "Pragmatic = Realistic, hands-on, practical.",
      mistake: "Confusing pragmatic with dogmatic or idealistic.",
      exp: "'Pragmatic' means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
      opts: [
        { key: "A", text: "Dealing with matters from a practical, realistic viewpoint", isCorrect: true },
        { key: "B", text: "Strictly adhering to rigid dogmatic theory", isCorrect: false },
        { key: "C", text: "Possessing an overly idealistic, utopian imagination", isCorrect: false },
        { key: "D", text: "Inclined towards aggressive dispute", isCorrect: false },
      ],
    },
    {
      sec: campSec3,
      sub: english!.id,
      top: topicEnglish.id,
      text: "Rearrange the sentence parts to form a coherent sentence: P: has transformed the way / Q: modern artificial intelligence / R: businesses analyze data / S: and make strategic decisions",
      diff: "MEDIUM",
      concept: "Sentence restructuring: Subject + Verb + Object + Conjunction.",
      shortcut: "Q ('modern artificial intelligence') is subject, P ('has transformed the way') is predicate verb, R ('businesses analyze data') follows, S ('and make strategic decisions') concludes -> QPRS.",
      mistake: "Starting with P ('has transformed') which lacks a preceding subject.",
      exp: "The logical order is: (Q) Modern artificial intelligence (P) has transformed the way (R) businesses analyze data (S) and make strategic decisions. Sequence: QPRS.",
      opts: [
        { key: "A", text: "QPRS", isCorrect: true },
        { key: "B", text: "PQRS", isCorrect: false },
        { key: "C", text: "RPQS", isCorrect: false },
        { key: "D", text: "SQPR", isCorrect: false },
      ],
    },
    {
      sec: campSec3,
      sub: english!.id,
      top: topicEnglish.id,
      text: "Choose the antonym of the word 'CANDID':",
      diff: "MEDIUM",
      concept: "Antonyms: Frank/Open vs Deceptive/Secretive.",
      shortcut: "Candid = Frank, honest, upfront. Antonym = Devious, secretive, evasive.",
      mistake: "Choosing 'Forthright' or 'Honest' (synonyms).",
      exp: "'Candid' means truthful, straightforward, and frank. The opposite is 'Devious' or 'Evasive'.",
      opts: [
        { key: "A", text: "Devious", isCorrect: true },
        { key: "B", text: "Forthright", isCorrect: false },
        { key: "C", text: "Sincere", isCorrect: false },
        { key: "D", text: "Spontaneous", isCorrect: false },
      ],
    },
    {
      sec: campSec3,
      sub: english!.id,
      top: topicEnglish.id,
      text: "Identify the part of the sentence with an error: 'Each of the candidates (A) / have submitted their resume (B) / before the closing date (C) / No error (D)'",
      diff: "MEDIUM",
      concept: "Subject-verb agreement: Distributive pronoun 'Each' takes singular verb.",
      shortcut: "'Each of the [plural noun]' takes singular verb ('has submitted', not 'have submitted').",
      mistake: "Matching the verb with 'candidates' instead of 'Each'.",
      exp: "'Each' is an indefinite distributive pronoun that takes a singular verb. Therefore, 'have submitted' is incorrect; it should be 'has submitted'.",
      opts: [
        { key: "A", text: "Each of the candidates", isCorrect: false },
        { key: "B", text: "have submitted their resume", isCorrect: true },
        { key: "C", text: "before the closing date", isCorrect: false },
        { key: "D", text: "No error", isCorrect: false },
      ],
    },
  ];

  let campOrder = 1;
  for (const item of campusQuestionsData) {
    const q = await createMockQuestion({
      questionText: item.text,
      difficulty: item.diff,
      examId: campusApt!.id,
      subjectId: item.sub,
      topicId: item.top,
      marks: 1.0,
      negativeMarks: 0.25,
      expectedTimeSeconds: 45,
      concept: item.concept,
      shortcut: item.shortcut,
      commonMistake: item.mistake,
      explanation: item.exp,
      options: item.opts,
    });

    await prisma.mockTestQuestion.create({
      data: {
        mockTestId: campusMock.id,
        sectionId: item.sec.id,
        questionId: q.id,
        questionOrder: campOrder++,
        marks: 1.0,
        negativeMarks: 0.25,
      },
    });
  }

  // =========================================================================
  // 4. Software Engineer Technical Placement Mock 1
  // =========================================================================
  console.log("Seeding Mock Test 4: Software Engineer Technical Placement Mock...");
  const techMock = await prisma.mockTest.upsert({
    where: { slug: "technical-placement-dsa-mock-1" },
    update: {
      title: "Software Engineer Technical Placement Mock 1",
      examId: techPlacement!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "HARD",
      totalQuestions: 15,
      durationSeconds: 2700,
      totalMarks: 15.0,
      passingMarks: 10.0,
      negativeMarks: 0.0,
      navigationRule: "FREE",
      isOfficialPattern: false,
      disclaimer: "Practice configuration — curated for Tier-1 Product Engineering (FAANG / Unicorns) coding & CS fundamentals rounds.",
      description: "Rigorous technical screening covering Data Structures, Algorithmic Complexity, SQL Joins, Indexing, and Operating System Concurrency.",
    },
    create: {
      title: "Software Engineer Technical Placement Mock 1",
      slug: "technical-placement-dsa-mock-1",
      examId: techPlacement!.id,
      mockType: "EXAM_SIMULATION",
      difficulty: "HARD",
      totalQuestions: 15,
      durationSeconds: 2700,
      totalMarks: 15.0,
      passingMarks: 10.0,
      negativeMarks: 0.0,
      navigationRule: "FREE",
      isOfficialPattern: false,
      disclaimer: "Practice configuration — curated for Tier-1 Product Engineering (FAANG / Unicorns) coding & CS fundamentals rounds.",
      description: "Rigorous technical screening covering Data Structures, Algorithmic Complexity, SQL Joins, Indexing, and Operating System Concurrency.",
    },
  });

  await prisma.mockTestQuestion.deleteMany({ where: { mockTestId: techMock.id } });
  await prisma.mockTestSection.deleteMany({ where: { mockTestId: techMock.id } });

  const techSec1 = await prisma.mockTestSection.create({
    data: {
      mockTestId: techMock.id,
      title: "Data Structures & Algorithms",
      sectionOrder: 1,
      questionCount: 8,
      marksPerQuestion: 1.0,
      negativeMarks: 0.0,
      subjectId: dsa!.id,
      instructions: "Algorithm analysis, trees, heaps, graphs, dynamic programming, and complexity bounds.",
    },
  });

  const techSec2 = await prisma.mockTestSection.create({
    data: {
      mockTestId: techMock.id,
      title: "DBMS, SQL & Operating Systems",
      sectionOrder: 2,
      questionCount: 7,
      marksPerQuestion: 1.0,
      negativeMarks: 0.0,
      subjectId: dbms!.id,
      instructions: "Relational algebra, ACID properties, isolation levels, virtual memory, and process synchronization.",
    },
  });

  const techQuestionsData = [
    // DSA 8
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "What is the worst-case time complexity of building a Binary Max-Heap from an unsorted array of n elements using the bottom-up 'heapify' method?",
      diff: "HARD",
      concept: "Heap construction mathematical analysis.",
      shortcut: "Bottom-up build-heap is O(n), not O(n log n). Sum of heights Σ (h / 2ʰ) converges to a constant.",
      mistake: "Assuming n insertions at O(log n) each gives O(n log n).",
      exp: "Building a heap bottom-up uses Floyd's heap construction. Most nodes are near leaves with small heights. The mathematical summation Σ (h / 2ʰ) evaluates to O(n).",
      opts: [
        { key: "A", text: "O(n)", isCorrect: true },
        { key: "B", text: "O(n log n)", isCorrect: false },
        { key: "C", text: "O(log n)", isCorrect: false },
        { key: "D", text: "O(n²)", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "Which of the following sorting algorithms is inherently stable and guarantees O(n log n) worst-case time complexity?",
      diff: "MEDIUM",
      concept: "Sorting stability and algorithmic bounds.",
      shortcut: "Merge Sort is both stable and guaranteed O(n log n). QuickSort worst case is O(n²); HeapSort is not stable.",
      mistake: "Confusing HeapSort or QuickSort which are unstable in their standard implementations.",
      exp: "Merge Sort divides the array into halves and merges them while preserving the relative order of identical keys, ensuring stability and strict O(n log n) performance.",
      opts: [
        { key: "A", text: "Merge Sort", isCorrect: true },
        { key: "B", text: "Quick Sort", isCorrect: false },
        { key: "C", text: "Heap Sort", isCorrect: false },
        { key: "D", text: "Selection Sort", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "In a Red-Black Tree, what is the maximum height of a tree having n internal nodes?",
      diff: "HARD",
      concept: "Balanced search trees - Red-Black tree properties.",
      shortcut: "Height h ≤ 2 log₂(n + 1).",
      mistake: "Confusing with AVL tree height 1.44 log₂(n).",
      exp: "Because no path from root to leaf can have two consecutive red nodes and all paths have the same number of black nodes, the longest path is at most twice the shortest path: h ≤ 2 log₂(n + 1).",
      opts: [
        { key: "A", text: "2 log₂(n + 1)", isCorrect: true },
        { key: "B", text: "log₂(n)", isCorrect: false },
        { key: "C", text: "1.44 log₂(n)", isCorrect: false },
        { key: "D", text: "n / 2", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "What is the optimal auxiliary space complexity of Floyd's Cycle Detection Algorithm (Tortoise and Hare) in a singly linked list?",
      diff: "EASY",
      concept: "Two pointer technique for cycle detection.",
      shortcut: "Two pointers (slow & fast) only require O(1) extra space.",
      mistake: "Suggesting O(n) space which is required if using a hash set.",
      exp: "Floyd's algorithm uses two pointer variables ('slow' advancing 1 step, 'fast' advancing 2 steps) requiring O(1) constant auxiliary space.",
      opts: [
        { key: "A", text: "O(1)", isCorrect: true },
        { key: "B", text: "O(n)", isCorrect: false },
        { key: "C", text: "O(log n)", isCorrect: false },
        { key: "D", text: "O(n²)", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "Which data structure is most optimal for implementing an LRU (Least Recently Used) Cache with O(1) get() and put() time complexities?",
      diff: "MEDIUM",
      concept: "System design & combined data structures.",
      shortcut: "Hash Map (for O(1) lookups) + Doubly Linked List (for O(1) removal & head insertion).",
      mistake: "Using an array or single linked list where removing a middle node takes O(n).",
      exp: "A Hash Map maps keys to nodes in a Doubly Linked List. The doubly linked list allows O(1) removal of any node and O(1) addition to the most recent end.",
      opts: [
        { key: "A", text: "Hash Map combined with a Doubly Linked List", isCorrect: true },
        { key: "B", text: "Binary Search Tree with a Queue", isCorrect: false },
        { key: "C", text: "Array-based Circular Buffer", isCorrect: false },
        { key: "D", text: "Max Heap with a Stack", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "In a directed acyclic graph (DAG), which algorithm produces a linear ordering of vertices such that for every directed edge u -> v, vertex u comes before v?",
      diff: "EASY",
      concept: "Graph theory: Dependency resolution.",
      shortcut: "Topological Sort (Kahn's algorithm using in-degree or DFS with post-order reversal).",
      mistake: "Confusing with Dijkstra or Prim's algorithm.",
      exp: "Topological Sort creates a linear order of nodes in a DAG respecting all directional edge dependencies.",
      opts: [
        { key: "A", text: "Topological Sort", isCorrect: true },
        { key: "B", text: "Breadth-First Search level order", isCorrect: false },
        { key: "C", text: "Dijkstra's Algorithm", isCorrect: false },
        { key: "D", text: "Tarjan's Bridge-finding Algorithm", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "What is the time complexity of solving the 0/1 Knapsack Problem with n items and capacity W using Dynamic Programming?",
      diff: "MEDIUM",
      concept: "Dynamic Programming: Pseudo-polynomial time.",
      shortcut: "Table size is (n + 1) × (W + 1), taking O(n × W) time and space.",
      mistake: "Assuming it is strictly polynomial without recognizing W is exponential in terms of its bit representation.",
      exp: "The DP table requires computing states for 0..n items and 0..W capacities, resulting in O(n × W) operations (pseudo-polynomial time).",
      opts: [
        { key: "A", text: "O(n × W)", isCorrect: true },
        { key: "B", text: "O(2ⁿ)", isCorrect: false },
        { key: "C", text: "O(n log W)", isCorrect: false },
        { key: "D", text: "O(n² + W²)", isCorrect: false },
      ],
    },
    {
      sec: techSec1,
      sub: dsa!.id,
      top: topicDSA.id,
      text: "Which algorithmic paradigm is utilized by Dijkstra's Shortest Path algorithm on graphs with non-negative edge weights?",
      diff: "EASY",
      concept: "Algorithm strategies.",
      shortcut: "Dijkstra always picks the unvisited vertex with minimal distance: Greedy approach.",
      mistake: "Classifying it as Divide and Conquer.",
      exp: "Dijkstra's algorithm employs a Greedy strategy, iteratively making the locally optimal choice (lowest tentative distance) which leads to a globally optimal shortest path on graphs without negative edges.",
      opts: [
        { key: "A", text: "Greedy Strategy", isCorrect: true },
        { key: "B", text: "Divide and Conquer", isCorrect: false },
        { key: "C", text: "Backtracking with pruning", isCorrect: false },
        { key: "D", text: "Randomized approximation", isCorrect: false },
      ],
    },
    // DBMS & Systems 7
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "Which SQL clause is executed after the GROUP BY clause to filter groups based on aggregate functions?",
      diff: "EASY",
      concept: "SQL Query Execution Order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.",
      shortcut: "WHERE filters rows before aggregation; HAVING filters aggregated groups.",
      mistake: "Using WHERE with aggregate functions like WHERE COUNT(*) > 5, which is invalid SQL.",
      exp: "The HAVING clause filters groups created by the GROUP BY clause based on aggregate calculations (e.g., HAVING COUNT(*) > 2).",
      opts: [
        { key: "A", text: "HAVING", isCorrect: true },
        { key: "B", text: "WHERE", isCorrect: false },
        { key: "C", text: "QUALIFY", isCorrect: false },
        { key: "D", text: "ORDER BY", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads under the ANSI SQL-92 standard?",
      diff: "HARD",
      concept: "Transaction Isolation Levels & Concurrency Phenomena.",
      shortcut: "Read Committed allows Non-Repeatable Reads; Repeatable Read prevents both Dirty and Non-Repeatable Reads, but allows Phantoms.",
      mistake: "Choosing Serializable, which prevents all three phenomena including Phantom Reads.",
      exp: "Under ANSI SQL-92, 'Repeatable Read' guarantees that any data read cannot change during the transaction, preventing Dirty Reads and Non-Repeatable Reads. However, newly inserted rows meeting search criteria (phantoms) may still appear.",
      opts: [
        { key: "A", text: "Repeatable Read", isCorrect: true },
        { key: "B", text: "Read Committed", isCorrect: false },
        { key: "C", text: "Serializable", isCorrect: false },
        { key: "D", text: "Read Uncommitted", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "Why are B+ Trees predominantly favored over B Trees for indexing in relational database storage engines (e.g., MySQL InnoDB)?",
      diff: "MEDIUM",
      concept: "Database index structures - B+ Tree vs B Tree.",
      shortcut: "Leaf nodes in B+ Tree form a doubly linked list allowing efficient range scans, and internal nodes only hold keys so more keys fit in a disk block.",
      mistake: "Thinking B Trees are faster for range queries.",
      exp: "In B+ Trees, all actual data records/pointers reside exclusively in leaf nodes which are sequentially linked. This provides extremely fast range scans and higher branching factor in internal nodes.",
      opts: [
        { key: "A", text: "All data pointers are stored in linked leaf nodes, enabling fast sequential range scans and higher fanout", isCorrect: true },
        { key: "B", text: "B+ Trees eliminate disk I/O completely by using in-memory hashes", isCorrect: false },
        { key: "C", text: "B Trees cannot maintain logarithmic search complexity", isCorrect: false },
        { key: "D", text: "B+ Trees prevent database deadlocks automatically", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "What are the four necessary Coffman conditions for a deadlock to occur in an operating system?",
      diff: "MEDIUM",
      concept: "Operating Systems - Deadlock characterization.",
      shortcut: "Mutual exclusion, Hold and wait, No preemption, Circular wait.",
      mistake: "Including starvation or preemption as a deadlock condition.",
      exp: "Coffman stated that deadlock can arise if and only if all four conditions hold simultaneously: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.",
      opts: [
        { key: "A", text: "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait", isCorrect: true },
        { key: "B", text: "Preemption, Starvation, Paging, Mutual Exclusion", isCorrect: false },
        { key: "C", text: "Context Switching, Thread Affinity, Race Condition, Critical Section", isCorrect: false },
        { key: "D", text: "Aging, Semaphores, Monitors, Priority Inversion", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "In modern operating systems, what is the primary role of the Translation Lookaside Buffer (TLB)?",
      diff: "EASY",
      concept: "Virtual Memory management - Hardware memory caching.",
      shortcut: "TLB is a fast hardware cache that stores recent virtual-to-physical address translations to avoid multiple memory lookups.",
      mistake: "Thinking TLB stores actual file cache or CPU instructions.",
      exp: "The TLB is a high-speed associative hardware cache in the MMU that caches recently used virtual-to-physical page table translations to drastically reduce memory access latency.",
      opts: [
        { key: "A", text: "A hardware cache storing recent virtual-to-physical page address translations", isCorrect: true },
        { key: "B", text: "A buffer to hold file data during direct memory access (DMA) transfers", isCorrect: false },
        { key: "C", text: "A register holding the base address of the interrupt vector table", isCorrect: false },
        { key: "D", text: "An OS kernel queue for tracking I/O blocked processes", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "A database table is said to be in Third Normal Form (3NF) if it is in 2NF and:",
      diff: "MEDIUM",
      concept: "Relational database normalization theory.",
      shortcut: "3NF = 2NF + No transitive dependencies on the primary key.",
      mistake: "Confusing partial dependency (eliminated in 2NF) with transitive dependency (eliminated in 3NF).",
      exp: "A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key (every non-key attribute must depend directly on the primary key).",
      opts: [
        { key: "A", text: "No non-prime attribute is transitively dependent on any candidate key", isCorrect: true },
        { key: "B", text: "There are no partial dependencies on a composite key", isCorrect: false },
        { key: "C", text: "Every determinant is a super key", isCorrect: false },
        { key: "D", text: "All multi-valued dependencies have been separated into distinct relations", isCorrect: false },
      ],
    },
    {
      sec: techSec2,
      sub: dbms!.id,
      top: topicDBMS.id,
      text: "What classic synchronization problem occurs when two or more threads attempt to modify shared state concurrently without synchronization, causing indeterminate output?",
      diff: "EASY",
      concept: "Concurrency & Multi-threading.",
      shortcut: "Race condition.",
      mistake: "Calling it thrashing or paging.",
      exp: "A Race Condition occurs when multiple threads concurrently access and manipulate shared data, and the final outcome depends on the particular order in which the access takes place.",
      opts: [
        { key: "A", text: "Race Condition", isCorrect: true },
        { key: "B", text: "Thrashing", isCorrect: false },
        { key: "C", text: "Priority Inversion", isCorrect: false },
        { key: "D", text: "Belady's Anomaly", isCorrect: false },
      ],
    },
  ];

  let techOrder = 1;
  for (const item of techQuestionsData) {
    const q = await createMockQuestion({
      questionText: item.text,
      difficulty: item.diff,
      examId: techPlacement!.id,
      subjectId: item.sub,
      topicId: item.top,
      marks: 1.0,
      negativeMarks: 0.0,
      expectedTimeSeconds: 45,
      concept: item.concept,
      shortcut: item.shortcut,
      commonMistake: item.mistake,
      explanation: item.exp,
      options: item.opts,
    });

    await prisma.mockTestQuestion.create({
      data: {
        mockTestId: techMock.id,
        sectionId: item.sec.id,
        questionId: q.id,
        questionOrder: techOrder++,
        marks: 1.0,
        negativeMarks: 0.0,
      },
    });
  }

  console.log("✅ Seeded 4 Full-Length Mock Tests with 65 authentic questions, sections, and solutions!");
}
