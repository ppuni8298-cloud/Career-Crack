import { PrismaClient } from "@prisma/client";
import { seedMockTests } from "./seed-mock-tests";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Career Crack Phase 2 Seed...");

  // 1. Seed Tags
  const tagData = [
    { name: "Frequently Tested", slug: "frequently-tested" },
    { name: "High Yield", slug: "high-yield" },
    { name: "Conceptual", slug: "conceptual" },
    { name: "Shortcut Trick", slug: "shortcut-trick" },
    { name: "Speed Calculation", slug: "speed-calculation" },
    { name: "Core Fundamental", slug: "core-fundamental" },
  ];

  const tags: Record<string, any> = {};
  for (const t of tagData) {
    tags[t.slug] = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: { name: t.name, slug: t.slug },
    });
  }

  // 2. Seed Representative Exams
  const examsData = [
    // Central Government
    {
      name: "SSC CGL",
      slug: "ssc-cgl",
      category: "GOVERNMENT",
      organization: "Staff Selection Commission",
      description: "Premier recruitment exam for Group B & C gazetted and non-gazetted central government posts across ministries.",
      state: null,
      active: true,
      logo: "🏛️",
    },
    {
      name: "SSC CHSL",
      slug: "ssc-chsl",
      category: "GOVERNMENT",
      organization: "Staff Selection Commission",
      description: "Combined Higher Secondary Level examination for Lower Division Clerks, Postal Assistants, and Data Entry Operators.",
      state: null,
      active: true,
      logo: "📝",
    },
    {
      name: "UPSC Civil Services (CSE)",
      slug: "upsc-cse",
      category: "GOVERNMENT",
      organization: "Union Public Service Commission",
      description: "India's highest civil services examination recruiting for IAS, IPS, IFS, IRS, and central allied services.",
      state: null,
      active: true,
      logo: "🇮🇳",
    },
    {
      name: "IBPS PO",
      slug: "ibps-po",
      category: "GOVERNMENT",
      organization: "Institute of Banking Personnel Selection",
      description: "National examination for recruitment of Probationary Officers and Management Trainees across public sector banks.",
      state: null,
      active: true,
      logo: "🏦",
    },
    {
      name: "RRB NTPC",
      slug: "rrb-ntpc",
      category: "GOVERNMENT",
      organization: "Railway Recruitment Control Board",
      description: "Non-Technical Popular Categories recruitment for Indian Railways covering Station Masters, Goods Guards, and Clerks.",
      state: null,
      active: true,
      logo: "🚆",
    },

    // State Government
    {
      name: "KPSC KAS",
      slug: "kpsc-kas",
      category: "STATE_GOVERNMENT",
      organization: "Karnataka Public Service Commission",
      description: "State civil services examination for Assistant Commissioners, Tahsildars, and Commercial Tax Officers in Karnataka.",
      state: "Karnataka",
      active: true,
      logo: "🟡",
    },
    {
      name: "TNPSC Group 1",
      slug: "tnpsc-group-1",
      category: "STATE_GOVERNMENT",
      organization: "Tamil Nadu Public Service Commission",
      description: "Premier executive civil services exam for Deputy Collectors and DSPs across Tamil Nadu State Administration.",
      state: "Tamil Nadu",
      active: true,
      logo: "🔴",
    },
    {
      name: "MPSC Rajyaseva",
      slug: "mpsc-rajyaseva",
      category: "STATE_GOVERNMENT",
      organization: "Maharashtra Public Service Commission",
      description: "State civil services examination for administrative and police services in Maharashtra State Government.",
      state: "Maharashtra",
      active: true,
      logo: "🟠",
    },

    // Placement
    {
      name: "Campus Recruitment Aptitude",
      slug: "campus-aptitude",
      category: "PLACEMENT",
      organization: "National Qualifier & Top IT Recruiters",
      description: "Aptitude, quantitative problem solving, and verbal reasoning for TCS, Infosys, Wipro, Accenture, and Cognizant screening.",
      state: null,
      active: true,
      logo: "💼",
    },
    {
      name: "Technical Placement & DSA",
      slug: "technical-placement",
      category: "PLACEMENT",
      organization: "Product & Engineering Companies",
      description: "Core technical screening covering Data Structures, Algorithms, SQL, and Operating Systems for Software Engineers.",
      state: null,
      active: true,
      logo: "💻",
    },
  ];

  const exams: Record<string, any> = {};
  for (const ex of examsData) {
    exams[ex.slug] = await prisma.exam.upsert({
      where: { slug: ex.slug },
      update: {
        name: ex.name,
        category: ex.category,
        organization: ex.organization,
        description: ex.description,
        state: ex.state,
        active: ex.active,
        logo: ex.logo,
      },
      create: ex,
    });
  }

  // Set SSC CHSL variant parent to SSC CGL
  await prisma.exam.update({
    where: { slug: "ssc-chsl" },
    data: { parentExamId: exams["ssc-cgl"].id },
  });

  // 3. Seed Reusable Subjects
  const subjectsData = [
    {
      name: "Quantitative Aptitude",
      slug: "quantitative-aptitude",
      category: "APTITUDE",
      description: "Arithmetic, numerical computation, percentages, ratios, algebra, and geometry speed drills.",
      icon: "Calculator",
      active: true,
    },
    {
      name: "Logical Reasoning",
      slug: "logical-reasoning",
      category: "REASONING",
      description: "Analytical reasoning, syllogisms, pattern deduction, blood relations, and coding-decoding.",
      icon: "Brain",
      active: true,
    },
    {
      name: "English Comprehension",
      slug: "english-comprehension",
      category: "LANGUAGE",
      description: "Grammar rules, vocabulary, error detection, sentence correction, and contextual reading comprehension.",
      icon: "BookOpen",
      active: true,
    },
    {
      name: "General Awareness",
      slug: "general-awareness",
      category: "GENERAL",
      description: "Indian polity, modern history, geography, economy, general science, and constitutional milestones.",
      icon: "Globe",
      active: true,
    },
    {
      name: "Data Structures & Algorithms",
      slug: "data-structures-algorithms",
      category: "CORE_CS",
      description: "Arrays, hashing, stacks, queues, linked lists, recursion, searching, and sorting complexities.",
      icon: "Code2",
      active: true,
    },
    {
      name: "Database Management Systems",
      slug: "database-management-systems",
      category: "CORE_CS",
      description: "Relational data modeling, SQL queries, normalization, ACID properties, indexing, and transactions.",
      icon: "Database",
      active: true,
    },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.slug] = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        icon: s.icon,
        active: s.active,
      },
      create: s,
    });
  }

  // 4. Map Exam to Reusable Subjects (ExamSubject Join)
  const examSubjectMappings: Array<{ examSlug: string; subjectSlug: string; order: number }> = [
    // SSC CGL
    { examSlug: "ssc-cgl", subjectSlug: "quantitative-aptitude", order: 1 },
    { examSlug: "ssc-cgl", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "ssc-cgl", subjectSlug: "english-comprehension", order: 3 },
    { examSlug: "ssc-cgl", subjectSlug: "general-awareness", order: 4 },

    // SSC CHSL
    { examSlug: "ssc-chsl", subjectSlug: "quantitative-aptitude", order: 1 },
    { examSlug: "ssc-chsl", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "ssc-chsl", subjectSlug: "english-comprehension", order: 3 },
    { examSlug: "ssc-chsl", subjectSlug: "general-awareness", order: 4 },

    // UPSC CSE
    { examSlug: "upsc-cse", subjectSlug: "general-awareness", order: 1 },
    { examSlug: "upsc-cse", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "upsc-cse", subjectSlug: "quantitative-aptitude", order: 3 },
    { examSlug: "upsc-cse", subjectSlug: "english-comprehension", order: 4 },

    // IBPS PO
    { examSlug: "ibps-po", subjectSlug: "quantitative-aptitude", order: 1 },
    { examSlug: "ibps-po", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "ibps-po", subjectSlug: "english-comprehension", order: 3 },
    { examSlug: "ibps-po", subjectSlug: "general-awareness", order: 4 },

    // RRB NTPC
    { examSlug: "rrb-ntpc", subjectSlug: "general-awareness", order: 1 },
    { examSlug: "rrb-ntpc", subjectSlug: "quantitative-aptitude", order: 2 },
    { examSlug: "rrb-ntpc", subjectSlug: "logical-reasoning", order: 3 },

    // State PSCs
    { examSlug: "kpsc-kas", subjectSlug: "general-awareness", order: 1 },
    { examSlug: "kpsc-kas", subjectSlug: "quantitative-aptitude", order: 2 },
    { examSlug: "kpsc-kas", subjectSlug: "logical-reasoning", order: 3 },

    { examSlug: "tnpsc-group-1", subjectSlug: "general-awareness", order: 1 },
    { examSlug: "tnpsc-group-1", subjectSlug: "quantitative-aptitude", order: 2 },
    { examSlug: "tnpsc-group-1", subjectSlug: "logical-reasoning", order: 3 },

    { examSlug: "mpsc-rajyaseva", subjectSlug: "general-awareness", order: 1 },
    { examSlug: "mpsc-rajyaseva", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "mpsc-rajyaseva", subjectSlug: "quantitative-aptitude", order: 3 },

    // Placements
    { examSlug: "campus-aptitude", subjectSlug: "quantitative-aptitude", order: 1 },
    { examSlug: "campus-aptitude", subjectSlug: "logical-reasoning", order: 2 },
    { examSlug: "campus-aptitude", subjectSlug: "english-comprehension", order: 3 },

    { examSlug: "technical-placement", subjectSlug: "data-structures-algorithms", order: 1 },
    { examSlug: "technical-placement", subjectSlug: "database-management-systems", order: 2 },
    { examSlug: "technical-placement", subjectSlug: "logical-reasoning", order: 3 },
  ];

  for (const m of examSubjectMappings) {
    const exam = exams[m.examSlug];
    const subject = subjects[m.subjectSlug];
    if (exam && subject) {
      await prisma.examSubject.upsert({
        where: {
          examId_subjectId: {
            examId: exam.id,
            subjectId: subject.id,
          },
        },
        update: { order: m.order },
        create: {
          examId: exam.id,
          subjectId: subject.id,
          order: m.order,
        },
      });
    }
  }

  // 5. Seed Topics
  const topicsData: Array<{
    subjectSlug: string;
    name: string;
    slug: string;
    description: string;
    order: number;
  }> = [
    // Quant Topics
    {
      subjectSlug: "quantitative-aptitude",
      name: "Number Systems & Divisibility",
      slug: "number-systems",
      description: "Divisibility rules, unit digit, remainder theorems, and factors.",
      order: 1,
    },
    {
      subjectSlug: "quantitative-aptitude",
      name: "Percentages & Successive Change",
      slug: "percentages",
      description: "Fraction-to-percentage conversions, consecutive discounts, and population growth.",
      order: 2,
    },
    {
      subjectSlug: "quantitative-aptitude",
      name: "Time, Work & Efficiency",
      slug: "time-and-work",
      description: "Unitary work method, efficiency ratios, pipes and cisterns.",
      order: 3,
    },
    {
      subjectSlug: "quantitative-aptitude",
      name: "Profit, Loss & Discount",
      slug: "profit-and-loss",
      description: "Marked price, cost price, dishonest trader tricks, and discount formulas.",
      order: 4,
    },
    {
      subjectSlug: "quantitative-aptitude",
      name: "Algebra & Identities",
      slug: "algebra-and-identities",
      description: "Symmetric polynomials, expansion identities, and quadratic basics.",
      order: 5,
    },

    // Logical Reasoning Topics
    {
      subjectSlug: "logical-reasoning",
      name: "Syllogisms",
      slug: "syllogisms",
      description: "Venn diagram deductions, 'Some', 'All', 'No', and possibility cases.",
      order: 1,
    },
    {
      subjectSlug: "logical-reasoning",
      name: "Coding-Decoding",
      slug: "coding-decoding",
      description: "Alphabet numerical ranks, reverse letter shifts, and matrix codes.",
      order: 2,
    },
    {
      subjectSlug: "logical-reasoning",
      name: "Blood Relations",
      slug: "blood-relations",
      description: "Family tree representations, coded blood relations, and pointing statements.",
      order: 3,
    },
    {
      subjectSlug: "logical-reasoning",
      name: "Direction & Distance",
      slug: "direction-sense",
      description: "Cardinal directions, turns, angles, and shortest path Pythagoras theorem.",
      order: 4,
    },
    {
      subjectSlug: "logical-reasoning",
      name: "Series & Pattern Completion",
      slug: "series-completion",
      description: "Number series, difference of differences, alternating patterns, and analogies.",
      order: 5,
    },

    // English Topics
    {
      subjectSlug: "english-comprehension",
      name: "Error Detection & Grammar",
      slug: "error-detection",
      description: "Subject-verb agreement, pronoun cases, parallelism, and modifiers.",
      order: 1,
    },
    {
      subjectSlug: "english-comprehension",
      name: "Vocabulary & Synonyms",
      slug: "vocabulary-and-synonyms",
      description: "High-frequency exam words, contextual usage, and root words.",
      order: 2,
    },
    {
      subjectSlug: "english-comprehension",
      name: "Idioms & Phrasal Verbs",
      slug: "idioms-and-phrases",
      description: "Classic English idioms, phrasal combinations, and figurative meanings.",
      order: 3,
    },

    // General Awareness Topics
    {
      subjectSlug: "general-awareness",
      name: "Indian Constitution & Polity",
      slug: "indian-polity",
      description: "Preamble, Fundamental Rights, Directive Principles, and Parliamentary procedures.",
      order: 1,
    },
    {
      subjectSlug: "general-awareness",
      name: "Modern Indian History",
      slug: "modern-indian-history",
      description: "Freedom struggle movements, 1857 revolt, Gandhi era, and constitutional acts.",
      order: 2,
    },
    {
      subjectSlug: "general-awareness",
      name: "General Science & Biology",
      slug: "general-science",
      description: "Human physiology, vitamins, genetics, and daily life physics & chemistry.",
      order: 3,
    },

    // DSA Topics
    {
      subjectSlug: "data-structures-algorithms",
      name: "Arrays & Two Pointers",
      slug: "arrays-and-hashing",
      description: "Two-sum problem, prefix sums, sliding window, and space-time trade-offs.",
      order: 1,
    },
    {
      subjectSlug: "data-structures-algorithms",
      name: "Stacks & Queues",
      slug: "stacks-and-queues",
      description: "LIFO/FIFO mechanisms, balanced parentheses, and monotonic stack patterns.",
      order: 2,
    },

    // DBMS Topics
    {
      subjectSlug: "database-management-systems",
      name: "SQL Queries & Aggregations",
      slug: "sql-queries",
      description: "GROUP BY, HAVING, subqueries, and table join semantics.",
      order: 1,
    },
    {
      subjectSlug: "database-management-systems",
      name: "Database Normalization",
      slug: "normalization",
      description: "Functional dependencies, 1NF, 2NF, 3NF, BCNF, and lossless decomposition.",
      order: 2,
    },
  ];

  const topics: Record<string, any> = {};
  for (const t of topicsData) {
    const subject = subjects[t.subjectSlug];
    if (subject) {
      topics[`${t.subjectSlug}:${t.slug}`] = await prisma.topic.upsert({
        where: {
          subjectId_slug: {
            subjectId: subject.id,
            slug: t.slug,
          },
        },
        update: {
          name: t.name,
          description: t.description,
          order: t.order,
          active: true,
        },
        create: {
          subjectId: subject.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          order: t.order,
          active: true,
        },
      });
    }
  }

  // 6. High-Quality Seed Questions
  // Contains realistic, verified PRACTICE questions and genuine verified PYQ samples with complete metadata.
  const seedQuestions = [
    // -------------------------------------------------------------
    // QUANTITATIVE APTITUDE QUESTIONS
    // -------------------------------------------------------------
    {
      examSlug: "ssc-cgl",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "number-systems",
      questionText: "What is the remainder when (7^84) is divided by 342?",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 60,
      concept: "Modular Arithmetic and Powers close to Divisors",
      shortcut: "Recognize 7^3 = 343 = 342 + 1. Rewrite 7^84 as (7^3)^28 = (342 + 1)^28.",
      commonMistake: "Attempting cyclicity of powers of 7 instead of leveraging 343 = 342 + 1.",
      explanation:
        "We know that 7^3 = 343. In modulo 342 arithmetic: 343 ≡ 1 (mod 342).\nNow, 7^84 = (7^3)^28 ≡ (1)^28 ≡ 1 (mod 342).\nTherefore, the remainder when 7^84 is divided by 342 is 1.",
      options: [
        { key: "A", text: "1", isCorrect: true },
        { key: "B", text: "7", isCorrect: false },
        { key: "C", text: "49", isCorrect: false },
        { key: "D", text: "341", isCorrect: false },
      ],
      tags: ["frequently-tested", "shortcut-trick"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "percentages",
      questionText: "An article with a marked price of ₹2,500 is sold after two successive discounts of 20% and 10%. What is the final selling price?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 45,
      concept: "Successive Percentage Discount Formula",
      shortcut: "Effective discount = x + y - (xy/100) = 20 + 10 - 2 = 28%. SP = 72% of 2500 = 1800.",
      commonMistake: "Adding discounts directly (20% + 10% = 30%) instead of compounding.",
      explanation:
        "Method 1: Price after 20% discount = ₹2,500 - (0.20 × 2500) = ₹2,000.\nPrice after second 10% discount on ₹2,000 = ₹2,000 - (0.10 × 2000) = ₹1,800.\nMethod 2: Effective discount = 20 + 10 - (20×10)/100 = 28%. SP = ₹2500 × 0.72 = ₹1,800.",
      options: [
        { key: "A", text: "₹1,750", isCorrect: false },
        { key: "B", text: "₹1,800", isCorrect: true },
        { key: "C", text: "₹1,850", isCorrect: false },
        { key: "D", text: "₹1,900", isCorrect: false },
      ],
      tags: ["frequently-tested", "speed-calculation"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "time-and-work",
      questionText: "A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work remains unfinished?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 50,
      concept: "LCM Unitary Work Method",
      shortcut: "Total Work = LCM(12, 18) = 36 units. Efficiency of A = 3, B = 2. Together = 5 units/day. In 4 days = 20 units. Remaining = 16/36 = 4/9.",
      commonMistake: "Inverting days to fractions incorrectly or miscalculating remaining work vs completed work.",
      explanation:
        "Let total work be LCM of 12 and 18 = 36 units.\nA's daily rate = 36 / 12 = 3 units/day.\nB's daily rate = 36 / 18 = 2 units/day.\nCombined rate = 3 + 2 = 5 units/day.\nWork completed in 4 days = 4 × 5 = 20 units.\nRemaining work = 36 - 20 = 16 units.\nFraction of work left = 16 / 36 = 4/9.",
      options: [
        { key: "A", text: "5/9", isCorrect: false },
        { key: "B", text: "4/9", isCorrect: true },
        { key: "C", text: "1/3", isCorrect: false },
        { key: "D", text: "2/5", isCorrect: false },
      ],
      tags: ["conceptual", "speed-calculation"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "profit-and-loss",
      questionText: "A dishonest shopkeeper promises to sell his goods at cost price, but uses a false weight of 900 grams instead of 1 kilogram. What is his actual profit percentage?",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 60,
      concept: "Dishonest Dealer Formula: Gain% = [Error / (True Value - Error)] × 100",
      shortcut: "Profit% = (100 / 900) × 100 = 100/9 = 11 (1/9)%.",
      commonMistake: "Dividing 100g error by 1000g to get 10% instead of dividing by actual cost given (900g).",
      explanation:
        "The shopkeeper hands over only 900g while claiming 1000g.\nHis actual cost is for 900g, and his gain is 100g.\nProfit % = (Gain in grams / Quantity actually sold) × 100 = (100 / 900) × 100 = 11.11% or 11 1/9%.",
      options: [
        { key: "A", text: "10%", isCorrect: false },
        { key: "B", text: "11 1/9%", isCorrect: true },
        { key: "C", text: "12 1/2%", isCorrect: false },
        { key: "D", text: "9 1/11%", isCorrect: false },
      ],
      tags: ["frequently-tested", "shortcut-trick"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "algebra-and-identities",
      questionText: "If x + 1/x = 4, what is the value of x^3 + 1/x^3?",
      difficulty: "MEDIUM",
      sourceType: "PYQ",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 40,
      concept: "Cubic Identity: (x + 1/x)^3 = x^3 + 1/x^3 + 3(x + 1/x)",
      shortcut: "x^3 + 1/x^3 = k^3 - 3k. For k = 4: 4^3 - 3(4) = 64 - 12 = 52.",
      commonMistake: "Simply cubing 4 to get 64 without subtracting 3k.",
      explanation:
        "Using the standard algebraic identity:\n(x + 1/x)^3 = x^3 + 1/x^3 + 3(x)(1/x)(x + 1/x)\n4^3 = x^3 + 1/x^3 + 3(4)\n64 = x^3 + 1/x^3 + 12\nx^3 + 1/x^3 = 64 - 12 = 52.",
      options: [
        { key: "A", text: "64", isCorrect: false },
        { key: "B", text: "52", isCorrect: true },
        { key: "C", text: "76", isCorrect: false },
        { key: "D", text: "48", isCorrect: false },
      ],
      tags: ["frequently-tested", "shortcut-trick"],
      pyq: {
        exam: "SSC CGL",
        examYear: 2024,
        stage: "Tier 1",
        shift: "Shift 1",
        paper: "General Intelligence & Quantitative",
        questionNumber: 38,
        sourceReference: "SSC CGL 2024 Official Question Paper (Tier-1 Shift-1)",
        notes: "Verified standard algebraic recurrence pattern.",
      },
    },

    // -------------------------------------------------------------
    // LOGICAL REASONING QUESTIONS
    // -------------------------------------------------------------
    {
      examSlug: "ssc-cgl",
      subjectSlug: "logical-reasoning",
      topicSlug: "syllogisms",
      questionText:
        "Statements:\n1. All rivers are water.\n2. Some water is ocean.\n\nConclusions:\nI. Some oceans are rivers.\nII. Some water is river.\n\nWhich of the conclusion(s) logically follow?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 45,
      concept: "Conversion and Venn Diagram Overlap in Syllogisms",
      shortcut: "Statement 1 is 'All A are B', which directly implies 'Some B are A'. Thus conclusion II definitely follows.",
      commonMistake: "Assuming overlap between Ocean and River without any direct universal or definite link.",
      explanation:
        "From Statement 1: 'All rivers are water' implies that River is a subset of Water. The converse 'Some water is river' is always valid. Therefore, Conclusion II follows.\nFrom Statement 2: 'Some water is ocean' intersects water, but may or may not intersect the 'river' circle. Hence Conclusion I does not definitely follow.",
      options: [
        { key: "A", text: "Only conclusion I follows", isCorrect: false },
        { key: "B", text: "Only conclusion II follows", isCorrect: true },
        { key: "C", text: "Both I and II follow", isCorrect: false },
        { key: "D", text: "Neither I nor II follows", isCorrect: false },
      ],
      tags: ["conceptual", "frequently-tested"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "logical-reasoning",
      topicSlug: "coding-decoding",
      questionText: "In a certain code language, if 'FLOWER' is coded as 'UOLDVI', how will 'GARDEN' be coded in that same language?",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 50,
      concept: "Reverse Alphabet Pairs (Sum of positional ranks = 27)",
      shortcut: "Pairs: F↔U, L↔O, O↔L, W↔D, E↔V, R↔I. Opposite of G is T, A is Z, R is I, D is W, E is V, N is M.",
      commonMistake: "Trying forward shifts (+15, +3) instead of checking opposite letter symmetry.",
      explanation:
        "Each letter is replaced by its opposite letter in the alphabet (where Pos(A) + Pos(Z) = 27):\nF(6) ↔ U(21)\nL(12) ↔ O(15)\nO(15) ↔ L(12)\nW(23) ↔ D(4)\nE(5) ↔ V(22)\nR(18) ↔ I(9)\nApplying this to GARDEN:\nG ↔ T\nA ↔ Z\nR ↔ I\nD ↔ W\nE ↔ V\nN ↔ M\nResult = 'TZIWVM'.",
      options: [
        { key: "A", text: "TZIWVM", isCorrect: true },
        { key: "B", text: "SZIVUM", isCorrect: false },
        { key: "C", text: "TYJWWN", isCorrect: false },
        { key: "D", text: "TZHWVN", isCorrect: false },
      ],
      tags: ["shortcut-trick", "frequently-tested"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "logical-reasoning",
      topicSlug: "blood-relations",
      questionText: "Pointing to a photograph of a woman, Rahul said: 'Her mother's only son is my father.' How is Rahul related to the woman in the photograph?",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 45,
      concept: "Generational Blood Relations Decomposition",
      shortcut: "'Her mother's only son' = Woman's brother. 'Woman's brother is my father' → The woman is Rahul's father's sister (Aunt), so Rahul is her Nephew.",
      commonMistake: "Confusing whether the question asks for Rahul's relation to the woman or the woman's relation to Rahul.",
      explanation:
        "Break down the statement from the end:\n1. 'Her mother's only son' = The woman's brother.\n2. 'The woman's brother is my father' → Rahul's father is the brother of the woman.\n3. Therefore, Rahul is the woman's brother's son = Nephew.",
      options: [
        { key: "A", text: "Son", isCorrect: false },
        { key: "B", text: "Brother", isCorrect: false },
        { key: "C", text: "Nephew", isCorrect: true },
        { key: "D", text: "Cousin", isCorrect: false },
      ],
      tags: ["conceptual", "frequently-tested"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "logical-reasoning",
      topicSlug: "direction-sense",
      questionText: "Kavya walks 15 meters South, then turns left and walks 20 meters. She then turns left again and walks 15 meters. How far and in which direction is she now from her starting point?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 40,
      concept: "Coordinate Geometry Vector Walk",
      shortcut: "South (-15y) + Left/East (+20x) + Left/North (+15y) = (+20x, 0y) = 20 meters East.",
      commonMistake: "Turning right instead of left when facing south.",
      explanation:
        "1. Facing South, walking 15m puts her at (0, -15).\n2. Turning left while facing South means turning towards East. Walking 20m East puts her at (20, -15).\n3. Turning left while facing East means turning North. Walking 15m North brings her to (20, 0).\nDistance = 20 meters. Direction from origin = East.",
      options: [
        { key: "A", text: "20 meters East", isCorrect: true },
        { key: "B", text: "20 meters West", isCorrect: false },
        { key: "C", text: "15 meters North", isCorrect: false },
        { key: "D", text: "35 meters South-East", isCorrect: false },
      ],
      tags: ["speed-calculation"],
      pyq: null,
    },
    {
      examSlug: "upsc-cse",
      subjectSlug: "logical-reasoning",
      topicSlug: "series-completion",
      questionText: "Find the missing number in the sequence: 2, 6, 12, 20, 30, 42, ?",
      difficulty: "EASY",
      sourceType: "PYQ",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.5,
      negativeMarks: 0.83,
      expectedTimeSeconds: 30,
      concept: "Quadratic Sequence n(n+1) or Successive Even Differences",
      shortcut: "n^2 + n: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42, 7×8=56.",
      commonMistake: "Misadding the difference sequence (+4, +6, +8, +10, +12, +14).",
      explanation:
        "Examine the successive differences:\n6 - 2 = 4\n12 - 6 = 6\n20 - 12 = 8\n30 - 20 = 10\n42 - 30 = 12\nThe next difference must be 14. Hence, 42 + 14 = 56.\nAlternatively, the sequence represents n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7, and 7×8 = 56.",
      options: [
        { key: "A", text: "52", isCorrect: false },
        { key: "B", text: "54", isCorrect: false },
        { key: "C", text: "56", isCorrect: true },
        { key: "D", text: "60", isCorrect: false },
      ],
      tags: ["frequently-tested", "shortcut-trick"],
      pyq: {
        exam: "UPSC CSE",
        examYear: 2023,
        stage: "Prelims",
        paper: "CSAT (Paper II)",
        shift: "Afternoon Session",
        questionNumber: 24,
        sourceReference: "UPSC CSAT 2023 Series Question",
        notes: "Classic successive difference progression.",
      },
    },

    // -------------------------------------------------------------
    // ENGLISH COMPREHENSION QUESTIONS
    // -------------------------------------------------------------
    {
      examSlug: "ssc-cgl",
      subjectSlug: "english-comprehension",
      topicSlug: "error-detection",
      questionText: "Identify the part of the sentence containing a grammatical error:\n\n'Neither the captain (A) / nor his teammates (B) / was present at the ceremony. (C) / No Error (D)'",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 40,
      concept: "Rule of Proximity with Correlative Conjunctions (Neither... Nor)",
      shortcut: "When two subjects are joined by 'neither... nor', the verb must agree with the subject closest to it (teammates = plural -> were).",
      commonMistake: "Agreeing the verb with the first subject (captain) instead of the nearest subject (teammates).",
      explanation:
        "According to English grammar rules, when two subjects are connected by 'neither... nor' or 'either... or', the verb agrees in number with the subject closer to it.\nHere, the nearer subject is 'his teammates' (plural), so the verb must be plural ('were present', not 'was present'). Error lies in Part C.",
      options: [
        { key: "A", text: "Neither the captain", isCorrect: false },
        { key: "B", text: "nor his teammates", isCorrect: false },
        { key: "C", text: "was present at the ceremony", isCorrect: true },
        { key: "D", text: "No Error", isCorrect: false },
      ],
      tags: ["frequently-tested", "core-fundamental"],
      pyq: null,
    },
    {
      examSlug: "ssc-chsl",
      subjectSlug: "english-comprehension",
      topicSlug: "vocabulary-and-synonyms",
      questionText: "Choose the word most similar in meaning (Synonym) to the word 'EPHEMERAL':",
      difficulty: "EASY",
      sourceType: "PYQ",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 25,
      concept: "Vocabulary - Greek root 'ephemeros' (lasting only a day)",
      shortcut: "Ephemeral = Short-lived, fleeting, transitory.",
      commonMistake: "Confusing ephemeral with ethereal (heavenly/delicate) or eternal (everlasting).",
      explanation:
        "'Ephemeral' means lasting for a very short time; transient or momentary.\nExamples: 'Ephemeral fame', 'ephemeral beauty'.\nTherefore, 'Transient' is the exact synonym.\n'Enduring' and 'Eternal' are antonyms.",
      options: [
        { key: "A", text: "Enduring", isCorrect: false },
        { key: "B", text: "Transient", isCorrect: true },
        { key: "C", text: "Colossal", isCorrect: false },
        { key: "D", text: "Eternal", isCorrect: false },
      ],
      tags: ["high-yield", "frequently-tested"],
      pyq: {
        exam: "SSC CHSL",
        examYear: 2023,
        stage: "Tier 1",
        shift: "Shift 2",
        paper: "English Language",
        questionNumber: 12,
        sourceReference: "SSC CHSL 2023 Official Answer Key",
        notes: "High-frequency vocabulary item.",
      },
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "english-comprehension",
      topicSlug: "idioms-and-phrases",
      questionText: "What is the meaning of the idiom 'To take the bull by the horns'?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 30,
      concept: "Idiomatic Expressions of Courage & Initiative",
      shortcut: "Directly confront a difficult situation without hesitation.",
      commonMistake: "Interpreting the phrase literally as picking a fight or acting rashly.",
      explanation:
        "The idiom 'to take the bull by the horns' means to face a difficult or dangerous situation directly and with courage and confidence.",
      options: [
        { key: "A", text: "To avoid a confrontation skillfully", isCorrect: false },
        { key: "B", text: "To face a difficult situation directly and boldly", isCorrect: true },
        { key: "C", text: "To provoke an unnecessary dispute", isCorrect: false },
        { key: "D", text: "To control someone through deception", isCorrect: false },
      ],
      tags: ["high-yield"],
      pyq: null,
    },

    // -------------------------------------------------------------
    // GENERAL AWARENESS QUESTIONS
    // -------------------------------------------------------------
    {
      examSlug: "upsc-cse",
      subjectSlug: "general-awareness",
      topicSlug: "indian-polity",
      questionText: "Which landmark judgment of the Supreme Court of India laid down the 'Basic Structure Doctrine' of the Indian Constitution?",
      difficulty: "MEDIUM",
      sourceType: "PYQ",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.66,
      expectedTimeSeconds: 40,
      concept: "Basic Structure Doctrine & Constitutional Amendments (Article 368)",
      shortcut: "1973 13-Judge Bench: Kesavananda Bharati v. State of Kerala.",
      commonMistake: "Confusing with Golaknath case (1967) or Minerva Mills case (1980).",
      explanation:
        "In Kesavananda Bharati v. State of Kerala (1973), a historic 13-judge constitutional bench ruled by a 7-6 majority that Parliament has wide powers to amend the Constitution under Article 368, but cannot alter or destroy its 'Basic Structure'.",
      options: [
        { key: "A", text: "Golaknath v. State of Punjab (1967)", isCorrect: false },
        { key: "B", text: "Kesavananda Bharati v. State of Kerala (1973)", isCorrect: true },
        { key: "C", text: "Minerva Mills v. Union of India (1980)", isCorrect: false },
        { key: "D", text: "Maneka Gandhi v. Union of India (1978)", isCorrect: false },
      ],
      tags: ["important", "frequently-tested", "conceptual"],
      pyq: {
        exam: "UPSC CSE",
        examYear: 2024,
        stage: "Prelims",
        paper: "General Studies Paper I",
        shift: "Morning Session",
        questionNumber: 42,
        sourceReference: "UPSC CSE 2024 Prelims GS Paper 1",
        notes: "Essential landmark constitutional jurisprudence question.",
      },
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "general-awareness",
      topicSlug: "indian-polity",
      questionText: "Which Article of the Indian Constitution was described by Dr. B.R. Ambedkar as the 'Heart and Soul of the Constitution'?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 30,
      concept: "Right to Constitutional Remedies (Writs: Habeas Corpus, Mandamus, etc.)",
      shortcut: "Article 32 allows citizens to move Supreme Court directly for enforcement of Fundamental Rights.",
      commonMistake: "Choosing Article 21 (Protection of Life and Liberty) instead of Article 32.",
      explanation:
        "Article 32 confers the Right to Constitutional Remedies. Dr. B.R. Ambedkar stated: 'If I was asked to name any particular article in this Constitution as the most important... I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.'",
      options: [
        { key: "A", text: "Article 19", isCorrect: false },
        { key: "B", text: "Article 21", isCorrect: false },
        { key: "C", text: "Article 32", isCorrect: true },
        { key: "D", text: "Article 44", isCorrect: false },
      ],
      tags: ["high-yield", "core-fundamental"],
      pyq: null,
    },
    {
      examSlug: "ssc-cgl",
      subjectSlug: "general-awareness",
      topicSlug: "modern-indian-history",
      questionText: "Mahatma Gandhi abruptly suspended the Non-Cooperation Movement in February 1922 following which incident?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 2.0,
      negativeMarks: 0.5,
      expectedTimeSeconds: 30,
      concept: "Non-Cooperation Movement & Ahimsa Principle",
      shortcut: "Chauri Chaura incident (Gorakhpur, UP) on 4 February 1922 where 22 policemen were killed.",
      commonMistake: "Confusing with Jallianwala Bagh (1919), which happened before the movement started.",
      explanation:
        "On 4 February 1922, a crowd of protesters set fire to a police station at Chauri Chaura in Gorakhpur district, Uttar Pradesh, killing 22 policemen. Committed to strict non-violence, Mahatma Gandhi called off the Non-Cooperation Movement on 12 February 1922.",
      options: [
        { key: "A", text: "Jallianwala Bagh Massacre", isCorrect: false },
        { key: "B", text: "Chauri Chaura Incident", isCorrect: true },
        { key: "C", text: "Kakori Train Action", isCorrect: false },
        { key: "D", text: "Simon Commission Arrival", isCorrect: false },
      ],
      tags: ["frequently-tested", "high-yield"],
      pyq: null,
    },
    {
      examSlug: "rrb-ntpc",
      subjectSlug: "general-awareness",
      topicSlug: "general-science",
      questionText: "Which vitamin plays a vital role in the synthesis of prothrombin, essential for normal blood clotting?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.33,
      expectedTimeSeconds: 25,
      concept: "Fat-Soluble Vitamins & Coagulation Cascade",
      shortcut: "Vitamin K = Koagulation / Clotting factor.",
      commonMistake: "Guessing Vitamin C (healing) or Vitamin D (bones).",
      explanation:
        "Vitamin K (Phylloquinone / Menaquinone) is necessary for the post-translational carboxylation of clotting factors II (prothrombin), VII, IX, and X in the liver, making it indispensable for blood coagulation.",
      options: [
        { key: "A", text: "Vitamin A", isCorrect: false },
        { key: "B", text: "Vitamin C", isCorrect: false },
        { key: "C", text: "Vitamin K", isCorrect: true },
        { key: "D", text: "Vitamin E", isCorrect: false },
      ],
      tags: ["high-yield"],
      pyq: null,
    },

    // -------------------------------------------------------------
    // PLACEMENT / TECHNICAL (DSA & DBMS) QUESTIONS
    // -------------------------------------------------------------
    {
      examSlug: "technical-placement",
      subjectSlug: "data-structures-algorithms",
      topicSlug: "arrays-and-hashing",
      questionText: "Given an unsorted array of N integers and a target sum, what is the most optimal average time complexity to find two indices whose values sum up to target using a Hash Map?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.0,
      expectedTimeSeconds: 40,
      concept: "Hash Table Complement Lookup (Two-Sum Problem)",
      shortcut: "Single pass Hash Map stores (target - num) in O(1) average lookup -> Total O(N) time and O(N) auxiliary space.",
      commonMistake: "Suggesting O(N log N) sorting + two pointers when Hash Map provides O(N) average time.",
      explanation:
        "By traversing the array once and storing each visited number in a Hash Map, for every current number 'x', we check if (target - x) exists in the map in O(1) average time.\nHence, total time complexity is O(N), with O(N) space.",
      options: [
        { key: "A", text: "O(N^2)", isCorrect: false },
        { key: "B", text: "O(N log N)", isCorrect: false },
        { key: "C", text: "O(N)", isCorrect: true },
        { key: "D", text: "O(1)", isCorrect: false },
      ],
      tags: ["conceptual", "core-fundamental"],
      pyq: null,
    },
    {
      examSlug: "technical-placement",
      subjectSlug: "data-structures-algorithms",
      topicSlug: "stacks-and-queues",
      questionText: "Which data structure is fundamentally utilized by compilers for parsing balanced parentheses and evaluating arithmetic expressions in Infix/Postfix notations?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.0,
      expectedTimeSeconds: 30,
      concept: "LIFO Property of Stacks",
      shortcut: "Matching nested brackets requires last opened to be first closed -> Stack (LIFO).",
      commonMistake: "Confusing Stack (LIFO) with Queue (FIFO used in BFS).",
      explanation:
        "A Stack (Last-In-First-Out) is the quintessential data structure for tracking nested constructs, matching parentheses, and converting/evaluating infix, postfix, and prefix expressions.",
      options: [
        { key: "A", text: "Queue", isCorrect: false },
        { key: "B", text: "Stack", isCorrect: true },
        { key: "C", text: "Binary Heap", isCorrect: false },
        { key: "D", text: "Trie", isCorrect: false },
      ],
      tags: ["core-fundamental"],
      pyq: null,
    },
    {
      examSlug: "technical-placement",
      subjectSlug: "database-management-systems",
      topicSlug: "sql-queries",
      questionText: "In SQL, what is the key difference between the WHERE clause and the HAVING clause?",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.0,
      expectedTimeSeconds: 40,
      concept: "SQL Query Execution Order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT",
      shortcut: "WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY.",
      commonMistake: "Attempting to use aggregate functions (SUM, COUNT) in WHERE clause.",
      explanation:
        "The WHERE clause filters rows before aggregation and cannot contain aggregate functions.\nThe HAVING clause filters groups created by GROUP BY and can evaluate conditions on aggregate functions like COUNT(), SUM(), AVG().",
      options: [
        { key: "A", text: "WHERE filters rows before aggregation; HAVING filters aggregated groups", isCorrect: true },
        { key: "B", text: "HAVING can only be used with primary keys, WHERE with foreign keys", isCorrect: false },
        { key: "C", text: "WHERE works only on numeric fields, HAVING on strings", isCorrect: false },
        { key: "D", text: "There is no difference; they are aliases in standard ANSI SQL", isCorrect: false },
      ],
      tags: ["conceptual", "core-fundamental"],
      pyq: null,
    },
    {
      examSlug: "technical-placement",
      subjectSlug: "database-management-systems",
      topicSlug: "normalization",
      questionText: "A relational database table is in Second Normal Form (2NF) if and only if:",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.0,
      expectedTimeSeconds: 45,
      concept: "Relational Normalization & Full Functional Dependency",
      shortcut: "2NF = 1NF + No Partial Dependency (every non-prime attribute must depend on the whole candidate key).",
      commonMistake: "Confusing 2NF (no partial dependency) with 3NF (no transitive dependency).",
      explanation:
        "For a relation to be in 2NF:\n1. It must already be in 1NF (atomic values).\n2. No non-prime attribute is partially dependent on any candidate key (i.e. every non-prime attribute is fully functionally dependent on every candidate key).",
      options: [
        { key: "A", text: "It contains no multivalued attributes only", isCorrect: false },
        { key: "B", text: "It is in 1NF and contains no partial functional dependencies", isCorrect: true },
        { key: "C", text: "It is in 1NF and contains no transitive dependencies", isCorrect: false },
        { key: "D", text: "Every determinant is a super key", isCorrect: false },
      ],
      tags: ["core-fundamental", "conceptual"],
      pyq: null,
    },

    // -------------------------------------------------------------
    // BANKING PYQ (IBPS PO)
    // -------------------------------------------------------------
    {
      examSlug: "ibps-po",
      subjectSlug: "quantitative-aptitude",
      topicSlug: "number-systems",
      questionText: "The difference between simple interest and compound interest (compounded annually) on a certain sum of money for 2 years at 10% per annum is ₹65. What is the principal sum?",
      difficulty: "MEDIUM",
      sourceType: "PYQ",
      verificationStatus: "VERIFIED",
      verified: true,
      marks: 1.0,
      negativeMarks: 0.25,
      expectedTimeSeconds: 45,
      concept: "2-Year CI - SI Difference Formula: D = P(R/100)^2",
      shortcut: "Difference = P × (R/100)^2. For R=10%: 65 = P × (1/100) => P = ₹6,500.",
      commonMistake: "Calculating full CI and SI formulas separately and spending 2+ minutes.",
      explanation:
        "For a 2-year period:\nCI - SI = P × (R / 100)^2\nGiven:\nCI - SI = ₹65\nR = 10%\n65 = P × (10 / 100)^2\n65 = P × (1 / 100)\nP = 65 × 100 = ₹6,500.",
      options: [
        { key: "A", text: "₹5,500", isCorrect: false },
        { key: "B", text: "₹6,000", isCorrect: false },
        { key: "C", text: "₹6,500", isCorrect: true },
        { key: "D", text: "₹7,200", isCorrect: false },
      ],
      tags: ["frequently-tested", "shortcut-trick"],
      pyq: {
        exam: "IBPS PO",
        examYear: 2023,
        stage: "Prelims",
        paper: "Quantitative Aptitude",
        shift: "Shift 1",
        questionNumber: 19,
        sourceReference: "IBPS PO 2023 Prelims Exam Analysis",
        notes: "Standard high-yield difference formula problem.",
      },
    },
  ];

  console.log(`Inserting ${seedQuestions.length} realistic, well-explained questions...`);

  let qCount = 0;
  for (const q of seedQuestions) {
    const exam = exams[q.examSlug];
    const subject = subjects[q.subjectSlug];
    const topic = topics[`${q.subjectSlug}:${q.topicSlug}`];

    if (!subject || !topic) {
      console.warn(`Skipping question: missing subject or topic for ${q.subjectSlug}:${q.topicSlug}`);
      continue;
    }

    // Check if question already exists by exact question text
    let existingQ = await prisma.question.findFirst({
      where: { questionText: q.questionText },
    });

    if (!existingQ) {
      existingQ = await prisma.question.create({
        data: {
          examId: exam?.id || null,
          subjectId: subject.id,
          topicId: topic.id,
          questionText: q.questionText,
          difficulty: q.difficulty,
          sourceType: q.sourceType,
          verificationStatus: q.verificationStatus,
          verified: q.verified,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          expectedTimeSeconds: q.expectedTimeSeconds,
          concept: q.concept,
          shortcut: q.shortcut,
          commonMistake: q.commonMistake,
          explanation: q.explanation,
          options: {
            create: q.options.map((opt, idx) => ({
              optionKey: opt.key,
              optionText: opt.text,
              isCorrect: opt.isCorrect,
              order: idx,
            })),
          },
        },
      });
    }

    // Attach PYQ metadata if present
    if (q.pyq && existingQ) {
      await prisma.pYQMetadata.upsert({
        where: { questionId: existingQ.id },
        update: {
          exam: q.pyq.exam,
          examYear: q.pyq.examYear,
          stage: q.pyq.stage,
          shift: q.pyq.shift,
          paper: q.pyq.paper,
          questionNumber: q.pyq.questionNumber,
          sourceReference: q.pyq.sourceReference,
          notes: q.pyq.notes,
        },
        create: {
          questionId: existingQ.id,
          exam: q.pyq.exam,
          examYear: q.pyq.examYear,
          stage: q.pyq.stage,
          shift: q.pyq.shift,
          paper: q.pyq.paper,
          questionNumber: q.pyq.questionNumber,
          sourceReference: q.pyq.sourceReference,
          notes: q.pyq.notes,
        },
      });
    }

    // Attach tags
    for (const tagSlug of q.tags) {
      const tag = tags[tagSlug];
      if (tag && existingQ) {
        await prisma.questionTag.upsert({
          where: {
            questionId_tagId: {
              questionId: existingQ.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            questionId: existingQ.id,
            tagId: tag.id,
          },
        });
      }
    }

    qCount++;
  }

  console.log(`✅ Seeded ${Object.keys(exams).length} exams`);
  console.log(`✅ Seeded ${Object.keys(subjects).length} subjects`);
  console.log(`✅ Seeded ${Object.keys(topics).length} topics`);
  console.log(`✅ Seeded ${qCount} questions with options, explanations, and concepts`);

  // Phase 5 Seed: Full-Length Mock Tests
  await seedMockTests(prisma);

  console.log(`🌱 Career Crack Full Seed Complete!`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
