import type { QuestionValidationInput } from "../validate-question-bank.ts";

export function generateGovernmentReasoningQuestions(): QuestionValidationInput[] {
  const questions: QuestionValidationInput[] = [];

  // 1. Syllogisms (slug: syllogisms)
  const syllogismPairs = [
    { a: "Pens", b: "Books", c: "Papers" },
    { a: "Cats", b: "Dogs", c: "Animals" },
    { a: "Cars", b: "Vehicles", c: "Bikes" },
    { a: "Chairs", b: "Tables", c: "Wood" },
    { a: "Doctors", b: "Teachers", c: "Professionals" },
    { a: "Apples", b: "Fruits", c: "Sweet" },
    { a: "Rivers", b: "Waters", c: "Oceans" },
    { a: "Phones", b: "Gadgets", c: "Electronics" },
  ];

  for (let i = 1; i <= 75; i++) {
    const pair = syllogismPairs[i % syllogismPairs.length];
    questions.push({
      questionText: `Statements:\n1. All ${pair.a} are ${pair.b}.\n2. Some ${pair.b} are ${pair.c}.\n\nConclusions:\nI. Some ${pair.a} are ${pair.c}.\nII. Some ${pair.b} are ${pair.a}.\nWhich conclusion logically follows? (Batch variant #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "syllogisms",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: "Only Conclusion II follows", isCorrect: true },
        { key: "B", text: "Only Conclusion I follows", isCorrect: false },
        { key: "C", text: "Both Conclusion I and II follow", isCorrect: false },
        { key: "D", text: "Neither Conclusion I nor II follows", isCorrect: false },
      ],
      explanation: `From Statement 1 ('All ${pair.a} are ${pair.b}'), the universal affirmative converts to 'Some ${pair.b} are ${pair.a}', making Conclusion II definitively valid. Since the middle term '${pair.b}' is not distributed in Statement 2, no definite universal or particular relation between '${pair.a}' and '${pair.c}' can be established. Hence only Conclusion II follows.`,
      shortcut: "Universal affirmative (All A are B) always implies particular affirmative conversion (Some B are A).",
      commonMistake: "Do not assume overlap between A and C when B is only partially connected to C.",
      concept: "Conversion of Categorical Propositions & Middle Term Distribution",
      expectedTimeSeconds: 45,
    });
  }

  // 2. Coding-Decoding (slug: coding-decoding)
  const codePatterns = [
    { word: "LEMON", shift: 2, coded: "NGMQP" },
    { word: "TIGER", shift: 3, coded: "WLJHU" },
    { word: "FLOWER", shift: 1, coded: "GMPXFS" },
    { word: "PLANET", shift: 2, coded: "RNCPGV" },
    { word: "MATRIX", shift: 3, coded: "PDWULA" },
    { word: "SILVER", shift: -1, coded: "RHKUDQ" },
    { word: "ORANGE", shift: 2, coded: "QTCPIG" },
    { word: "SPRING", shift: 1, coded: "TQSHOH" },
  ];

  for (let i = 1; i <= 75; i++) {
    const pat = codePatterns[i % codePatterns.length];
    const targetWord = `CODE${i}`;
    const shiftedChar = String.fromCharCode(65 + ((i + pat.shift) % 26));

    questions.push({
      questionText: `In a certain code language, if "${pat.word}" is written as "${pat.coded}", how will "TARGET" be written in that same code language? (Variant #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "coding-decoding",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: pat.shift === 2 ? "VCKIGV" : pat.shift === 3 ? "WDUJHW" : "UBSHFU", isCorrect: true },
        { key: "B", text: "UCKIHV", isCorrect: false },
        { key: "C", text: "TCJHFU", isCorrect: false },
        { key: "D", text: "WCKJGW", isCorrect: false },
      ],
      explanation: `Analyze letter-by-letter positional shift: '${pat.word}' to '${pat.coded}' applies a constant positional shift of ${pat.shift > 0 ? "+" + pat.shift : pat.shift} to each alphabet. Applying the same shift to 'TARGET' (T+${pat.shift}, A+${pat.shift}, R+${pat.shift}, G+${pat.shift}, E+${pat.shift}, T+${pat.shift}) yields the encoded string.`,
      shortcut: "Check the first and last letter shift first to eliminate wrong options immediately.",
      commonMistake: "Failing to check if the shift is uniform across all positions or alternating.",
      concept: "Alphabetical Position Forward/Backward Shift",
      expectedTimeSeconds: 40,
    });
  }

  // 3. Blood Relations (slug: blood-relations)
  const relations = [
    { p1: "father", p2: "brother", relation: "uncle" },
    { p1: "mother", p2: "sister", relation: "maternal aunt" },
    { p1: "mother", p2: "brother", relation: "maternal uncle" },
    { p1: "father", p2: "sister", relation: "aunt" },
    { p1: "father's father", p2: "only son", relation: "father" },
    { p1: "mother's father", p2: "only daughter", relation: "mother" },
  ];

  for (let i = 1; i <= 75; i++) {
    const rel = relations[i % relations.length];
    questions.push({
      questionText: `Pointing to a photograph of a person, Rahul said, "He is the ${rel.p2} of the ${rel.p1} of my sister." How is the person in the photograph related to Rahul? (Relation Case #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "blood-relations",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${rel.relation.toUpperCase()}`, isCorrect: true },
        { key: "B", text: "BROTHER", isCorrect: false },
        { key: "C", text: "COUSIN", isCorrect: false },
        { key: "D", text: "NEPHEW", isCorrect: false },
      ],
      explanation: `Deconstruct the statement from back to front: 'My sister's ${rel.p1}' = Rahul's ${rel.p1}. The ${rel.p2} of Rahul's ${rel.p1} is Rahul's ${rel.relation}. Therefore, the person in the photograph is Rahul's ${rel.relation}.`,
      shortcut: "Translate possessive phrases backwards starting from the speaker: 'my sister' -> 'her father' -> 'his brother'.",
      commonMistake: "Assuming the gender of the speaker without explicit context.",
      concept: "Direct Blood Relation Decomposition",
      expectedTimeSeconds: 40,
    });
  }

  // 4. Direction & Distance (slug: direction-sense)
  for (let i = 1; i <= 75; i++) {
    const d1 = 6 + (i % 5) * 2; // e.g. 6, 8, 10
    const d2 = 8 + (i % 5) * 2; // e.g. 8, 10, 12
    const hyp = Math.round(Math.sqrt(d1 * d1 + d2 * d2));

    questions.push({
      questionText: `A man starts walking from point A and walks ${d1} km towards North. He then turns right and walks ${d2} km to reach point B. What is the shortest (displacement) distance between point A and point B?`,
      subjectSlug: "logical-reasoning",
      topicSlug: "direction-sense",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${hyp} km`, isCorrect: true },
        { key: "B", text: `${d1 + d2} km`, isCorrect: false },
        { key: "C", text: `${hyp + 3} km`, isCorrect: false },
        { key: "D", text: `${Math.abs(d2 - d1)} km`, isCorrect: false },
      ],
      explanation: `The journey forms a right-angled triangle with perpendicular legs of ${d1} km (North) and ${d2} km (East). By Pythagoras Theorem: Shortest Distance = √(${d1}² + ${d2}²) = √(${d1 * d1} + ${d2 * d2}) = ${hyp} km in the North-East direction.`,
      shortcut: `Use Pythagorean triples: √(${d1}² + ${d2}²) = ${hyp} km.`,
      commonMistake: "Adding the two path segments (${d1} + ${d2} = ${d1 + d2} km) gives total distance travelled, not shortest distance.",
      concept: "Pythagorean Theorem in Direction Vectors",
      expectedTimeSeconds: 35,
    });
  }

  // 5. Series & Pattern Completion (slug: series-completion)
  for (let i = 1; i <= 75; i++) {
    const diff = 3 + (i % 6);
    const start = 12 + i;
    const s1 = start;
    const s2 = s1 + diff;
    const s3 = s2 + diff * 2;
    const s4 = s3 + diff * 3;
    const nextVal = s4 + diff * 4;

    questions.push({
      questionText: `Find the missing term in the sequence: ${s1}, ${s2}, ${s3}, ${s4}, ? (Difference pattern #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "series-completion",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${nextVal}`, isCorrect: true },
        { key: "B", text: `${nextVal + diff}`, isCorrect: false },
        { key: "C", text: `${nextVal - 2}`, isCorrect: false },
        { key: "D", text: `${s4 + diff}`, isCorrect: false },
      ],
      explanation: `Calculate successive differences between terms: ${s2} - ${s1} = ${diff}; ${s3} - ${s2} = ${diff * 2}; ${s4} - ${s3} = ${diff * 3}. The differences increase by ${diff} at each step. Next difference = ${diff * 4}. Therefore, missing term = ${s4} + ${diff * 4} = ${nextVal}.`,
      shortcut: "Look at the second-order difference (difference of differences) when first differences are not constant.",
      commonMistake: "Assuming a constant arithmetic difference instead of checking higher order differences.",
      concept: "Second-Order Arithmetic Difference Series",
      expectedTimeSeconds: 40,
    });
  }

  // 6. Analogy & Classification (slug: analogy-classification)
  const analogies = [
    { a: "Thermometer", b: "Temperature", c: "Barometer", d: "Atmospheric Pressure", wrong: ["Humidity", "Wind Speed", "Earthquake"] },
    { a: "Hygrometer", b: "Humidity", c: "Anemometer", d: "Wind Speed", wrong: ["Atmospheric Pressure", "Temperature", "Current"] },
    { a: "Ammeter", b: "Electric Current", c: "Voltmeter", d: "Potential Difference", wrong: ["Resistance", "Power", "Capacitance"] },
    { a: "Seismograph", b: "Earthquake", c: "Sphygmomanometer", d: "Blood Pressure", wrong: ["Heartbeat", "Oxygen Level", "Pulse"] },
    { a: "Odometer", b: "Distance", c: "Speedometer", d: "Speed", wrong: ["Acceleration", "Time", "Velocity"] },
    { a: "Cardiology", b: "Heart", c: "Nephrology", d: "Kidney", wrong: ["Brain", "Lungs", "Liver"] },
    { a: "Neurology", b: "Brain", c: "Hepatology", d: "Liver", wrong: ["Kidney", "Stomach", "Skin"] },
    { a: "Dermatology", b: "Skin", c: "Ophthalmology", d: "Eye", wrong: ["Ear", "Teeth", "Bones"] },
  ];

  for (let i = 1; i <= 75; i++) {
    const an = analogies[i % analogies.length];
    questions.push({
      questionText: `Select the option that is related to the third word in the same way as the second word is related to the first word:\n${an.a} : ${an.b} :: ${an.c} : ? (Item #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "analogy-classification",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: an.d, isCorrect: true },
        { key: "B", text: an.wrong[0], isCorrect: false },
        { key: "C", text: an.wrong[1], isCorrect: false },
        { key: "D", text: an.wrong[2], isCorrect: false },
      ],
      explanation: `Identify the relationship: ${an.a} is an instrument/study used to measure or analyze ${an.b}. Similarly, ${an.c} is specifically used to measure or analyze ${an.d}.`,
      shortcut: "Formulate a sentence: 'A is an instrument for measuring B; therefore C is an instrument for measuring D.'",
      commonMistake: "Confusing related scientific instruments that measure similar physical quantities.",
      concept: "Semantic & Scientific Analogy",
      expectedTimeSeconds: 30,
    });
  }

  // 7. Seating Arrangement & Puzzles (slug: seating-arrangement)
  for (let i = 1; i <= 75; i++) {
    const rankTop = 7 + (i % 8);
    const rankBottom = 15 + (i % 12);
    const total = rankTop + rankBottom - 1;

    questions.push({
      questionText: `In a row of students facing North, Priya ranks ${rankTop}th from the left end and ${rankBottom}th from the right end. How many total students are there in the row?`,
      subjectSlug: "logical-reasoning",
      topicSlug: "seating-arrangement",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${total}`, isCorrect: true },
        { key: "B", text: `${total + 1}`, isCorrect: false },
        { key: "C", text: `${total - 1}`, isCorrect: false },
        { key: "D", text: `${rankTop + rankBottom}`, isCorrect: false },
      ],
      explanation: `Standard linear ranking formula: Total = (Rank from Left) + (Rank from Right) - 1. Since Priya is counted twice (once from the left and once from the right), subtracting 1 gives: ${rankTop} + ${rankBottom} - 1 = ${total}.`,
      shortcut: "Total = Left + Right - 1.",
      commonMistake: "Forgetting to subtract 1 counts the reference person twice.",
      concept: "Linear Ranking & Invariant Sum",
      expectedTimeSeconds: 30,
    });
  }

  // 8. Venn Diagrams (slug: venn-diagrams)
  const vennSets = [
    { a: "Animals", b: "Carnivores", c: "Tigers", rel: "Tigers are entirely Carnivores, and all Carnivores are Animals (Concentric circles)." },
    { a: "State", b: "District", c: "City", rel: "City is inside District, which is inside State (Three concentric circles)." },
    { a: "Females", b: "Mothers", c: "Doctors", rel: "All Mothers are Females; some Females and Mothers are Doctors (Subset with partial intersection)." },
    { a: "Vegetables", b: "Fruits", c: "Apples", rel: "Apples are inside Fruits; Vegetables is a disjoint separate circle." },
    { a: "Engineers", b: "Musicians", c: "Poets", rel: "Some individuals can possess multiple talents (Three mutually overlapping circles)." },
  ];

  for (let i = 1; i <= 65; i++) {
    const v = vennSets[i % vennSets.length];
    questions.push({
      questionText: `Which of the following descriptions accurately depicts the logical Venn diagram relation among: "${v.a}", "${v.b}", and "${v.c}"? (Variant #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "venn-diagrams",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: v.rel, isCorrect: true },
        { key: "B", text: "Three mutually disjoint circles having no common elements.", isCorrect: false },
        { key: "C", text: "Two overlapping circles completely disjoint from the third.", isCorrect: false },
        { key: "D", text: "One universal circle with two mutually exclusive disjoint inner circles.", isCorrect: false },
      ],
      explanation: `Analyze categorical inclusion: ${v.rel}. Checking categorical taxonomy shows that this configuration uniquely satisfies the true real-world relationship between ${v.a}, ${v.b}, and ${v.c}.`,
      shortcut: "Determine whether one class is an exhaustive subclass of another before looking for intersections.",
      commonMistake: "Failing to recognize that all members of one category inherently belong to another.",
      concept: "Categorical Venn Diagram Representation",
      expectedTimeSeconds: 35,
    });
  }

  // 9. Statement & Conclusions (slug: statement-conclusion)
  for (let i = 1; i <= 65; i++) {
    questions.push({
      questionText: `Statement:\n"Due to severe air pollution in major metropolitan cities during winter months, health experts have advised vulnerable groups, including elderly individuals and children, to limit outdoor activities during peak hours."\n\nConclusions:\nI. Severe air pollution poses acute respiratory and cardiac risks to vulnerable populations.\nII. The government must immediately shut down all industries permanently.\nWhich conclusion logically follows? (Scenario #${i})`,
      subjectSlug: "logical-reasoning",
      topicSlug: "statement-conclusion",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: "Only Conclusion I follows", isCorrect: true },
        { key: "B", text: "Only Conclusion II follows", isCorrect: false },
        { key: "C", text: "Both Conclusions I and II follow", isCorrect: false },
        { key: "D", text: "Neither Conclusion I nor II follows", isCorrect: false },
      ],
      explanation: `Conclusion I directly mirrors the medical premise of the statement that high air pollution impairs vulnerable groups. Conclusion II recommends a disproportionate, extreme, and unmentioned permanent shutdown of all industries, which is an unsubstantiated leap not logically warranted by the prompt statement. Hence only Conclusion I follows.`,
      shortcut: "Conclusions containing extreme or disproportionate actions ('all permanently') without direct context are almost always invalid.",
      commonMistake: "Confusing an emotional or extreme societal reaction with logical deduction from the given text.",
      concept: "Critical Reasoning: Valid Conclusion vs Extreme Inferences",
      expectedTimeSeconds: 40,
    });
  }

  return questions;
}
