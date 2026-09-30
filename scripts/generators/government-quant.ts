import type { QuestionValidationInput } from "../validate-question-bank.ts";

export function generateGovernmentQuantQuestions(): QuestionValidationInput[] {
  const questions: QuestionValidationInput[] = [];

  // 1. Number Systems & Divisibility (slug: number-systems)
  for (let i = 1; i <= 90; i++) {
    const n = 120 + i * 7;
    const rem = n % 17;
    const ans = (rem * 3) % 17;
    const optB = (ans + 3) % 17;
    const optC = (ans + 7) % 17;
    const optD = (ans + 11) % 17;

    questions.push({
      questionText: `A number when divided by 17 leaves a remainder of ${rem}. If the same number is multiplied by 3 and then divided by 17, what will be the remainder? (Calculation #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "number-systems",
      examSlug: "ssc-cgl",
      difficulty: i % 3 === 0 ? "HARD" : i % 2 === 0 ? "MEDIUM" : "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${ans}`, isCorrect: true },
        { key: "B", text: `${optB}`, isCorrect: false },
        { key: "C", text: `${optC}`, isCorrect: false },
        { key: "D", text: `${optD}`, isCorrect: false },
      ],
      explanation: `Let the number be N = 17k + ${rem}. Multiplying by 3 gives 3N = 51k + ${3 * rem}. Since 51k is completely divisible by 17, the remainder is (${3 * rem}) mod 17 = ${ans}.`,
      shortcut: `Directly multiply the remainder: (${rem} × 3) mod 17 = ${ans}.`,
      commonMistake: "Do not calculate the original number N; directly operate on the remainder.",
      concept: "Remainder Theorem & Congruence",
      expectedTimeSeconds: 45,
      marks: 2.0,
      negativeMarks: 0.5,
    });
  }

  // 2. HCF & LCM (slug: hcf-lcm)
  for (let i = 1; i <= 85; i++) {
    const hcf = 6 + (i % 8);
    const m = 3 + (i % 5);
    const n = 5 + (i % 7) + (m === 5 + (i % 7) ? 2 : 0);
    const num1 = hcf * m;
    const num2 = hcf * n;
    const lcm = hcf * m * n;

    questions.push({
      questionText: `The HCF of two numbers is ${hcf} and their LCM is ${lcm}. If one of the numbers is ${num1}, find the other number. (Case #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "hcf-lcm",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${num2}`, isCorrect: true },
        { key: "B", text: `${num2 + hcf}`, isCorrect: false },
        { key: "C", text: `${num2 + 2 * hcf}`, isCorrect: false },
        { key: "D", text: `${num2 + 3 * hcf}`, isCorrect: false },
      ],
      explanation: `Product of two numbers = HCF × LCM. Therefore, Other Number = (HCF × LCM) / First Number = (${hcf} × ${lcm}) / ${num1} = ${num2}.`,
      shortcut: "Second number = (HCF × LCM) / First Number.",
      commonMistake: "Do not add HCF and LCM; multiply them.",
      concept: "Product of HCF and LCM",
      expectedTimeSeconds: 40,
    });
  }

  // 3. Percentages & Successive Change (slug: percentages)
  for (let i = 1; i <= 90; i++) {
    const p1 = 10 + (i % 5) * 5; // e.g. 10, 15, 20, 25, 30
    const p2 = 10 + ((i + 2) % 4) * 5;
    const net = p1 + p2 + (p1 * p2) / 100;

    questions.push({
      questionText: `The salary of an employee is first increased by ${p1}% and subsequently increased by ${p2}%. What is the overall percentage increase in the salary? (Scenario #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "percentages",
      examSlug: "ssc-cgl",
      difficulty: i % 2 === 0 ? "EASY" : "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${net.toFixed(1)}%`, isCorrect: true },
        { key: "B", text: `${(net + 5.0).toFixed(1)}%`, isCorrect: false },
        { key: "C", text: `${(net + 10.0).toFixed(1)}%`, isCorrect: false },
        { key: "D", text: `${(net + 15.0).toFixed(1)}%`, isCorrect: false },
      ],
      explanation: `Effective percentage change formula: a + b + (ab / 100). Here, a = ${p1}, b = ${p2}. Net change = ${p1} + ${p2} + (${p1} × ${p2} / 100) = ${net.toFixed(1)}%.`,
      shortcut: "Use successive percentage formula: a + b + ab/100.",
      commonMistake: `Adding directly ${p1} + ${p2} = ${p1 + p2}% overlooks the compounding growth on the first increase.`,
      concept: "Successive Percentage Growth",
      expectedTimeSeconds: 45,
    });
  }

  // 4. Profit, Loss & Discount (slug: profit-and-loss)
  for (let i = 1; i <= 90; i++) {
    const cp = 400 + i * 20;
    const profitPct = 10 + (i % 6) * 5; // 10, 15, 20, 25, 30, 35
    const sp = Math.round(cp * (1 + profitPct / 100));

    questions.push({
      questionText: `A shopkeeper buys an article for ₹${cp} and sells it to earn a profit of ${profitPct}%. What is the selling price of the article? (Transaction #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "profit-and-loss",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `₹${sp}`, isCorrect: true },
        { key: "B", text: `₹${sp + 25}`, isCorrect: false },
        { key: "C", text: `₹${sp + 50}`, isCorrect: false },
        { key: "D", text: `₹${sp + 75}`, isCorrect: false },
      ],
      explanation: `Selling Price = Cost Price × (100 + Profit%) / 100 = ₹${cp} × ${100 + profitPct} / 100 = ₹${sp}.`,
      shortcut: `SP = CP × (1 + ${profitPct}/100) = ₹${sp}.`,
      commonMistake: "Do not calculate profit percentage on selling price; cost price is always the base.",
      concept: "Basic Profit and Loss",
      expectedTimeSeconds: 40,
    });
  }

  // 5. Ratio, Proportion & Variation (slug: ratio-and-proportion)
  for (let i = 1; i <= 85; i++) {
    const r1 = 2 + (i % 4);
    const r2 = 3 + (i % 5);
    const multiplier = 40 + i * 5;
    const total = (r1 + r2) * multiplier;
    const shareA = r1 * multiplier;

    questions.push({
      questionText: `An amount of ₹${total} is divided between A and B in the ratio ${r1} : ${r2}. What is the share of A? (Allocation #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "ratio-and-proportion",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `₹${shareA}`, isCorrect: true },
        { key: "B", text: `₹${shareA + multiplier}`, isCorrect: false },
        { key: "C", text: `₹${shareA + 2 * multiplier}`, isCorrect: false },
        { key: "D", text: `₹${shareA + 3 * multiplier}`, isCorrect: false },
      ],
      explanation: `Total ratio parts = ${r1} + ${r2} = ${r1 + r2}. Value of 1 part = ₹${total} / ${r1 + r2} = ₹${multiplier}. Share of A = ${r1} × ₹${multiplier} = ₹${shareA}.`,
      shortcut: `A's share = (A's ratio / Total ratio) × Total = (${r1}/${r1 + r2}) × ${total} = ₹${shareA}.`,
      commonMistake: "Check which person's share is being asked before choosing the option.",
      concept: "Ratio Division",
      expectedTimeSeconds: 35,
    });
  }

  // 6. Time, Work & Efficiency (slug: time-and-work)
  for (let i = 1; i <= 90; i++) {
    const daysA = 10 + (i % 5) * 2;
    const daysB = 15 + (i % 6) * 3;
    const combinedDays = (daysA * daysB) / (daysA + daysB);

    questions.push({
      questionText: `A can complete a piece of work alone in ${daysA} days and B can complete the same work alone in ${daysB} days. Working together, in how many days can they finish the work? (Work Item #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "time-and-work",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${combinedDays.toFixed(2)} days`, isCorrect: true },
        { key: "B", text: `${(combinedDays + 2.0).toFixed(2)} days`, isCorrect: false },
        { key: "C", text: `${(combinedDays + 4.0).toFixed(2)} days`, isCorrect: false },
        { key: "D", text: `${(combinedDays + 6.0).toFixed(2)} days`, isCorrect: false },
      ],
      explanation: `Work done by A in 1 day = 1/${daysA}. Work done by B in 1 day = 1/${daysB}. Combined 1-day work = (1/${daysA}) + (1/${daysB}) = (${daysA + daysB}) / (${daysA * daysB}). Total time taken = (${daysA} × ${daysB}) / (${daysA} + ${daysB}) = ${combinedDays.toFixed(2)} days.`,
      shortcut: `Formula for two workers: (xy) / (x + y) = (${daysA} × ${daysB}) / (${daysA + daysB}) = ${combinedDays.toFixed(2)} days.`,
      commonMistake: "Never average the individual days to find combined time.",
      concept: "Work & Time Reciprocal Efficiency",
      expectedTimeSeconds: 50,
    });
  }

  // 7. Time, Speed & Distance (slug: time-speed-distance)
  for (let i = 1; i <= 90; i++) {
    const speedKmH = 36 + (i % 8) * 18;
    const speedMs = (speedKmH * 5) / 18;
    const trainLength = 100 + (i % 6) * 50;
    const timeSec = trainLength / speedMs;

    questions.push({
      questionText: `A train of length ${trainLength} meters is running at a speed of ${speedKmH} km/h. How many seconds will it take to cross a standing telegraph post? (Speed Trial #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "time-speed-distance",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${timeSec.toFixed(1)} seconds`, isCorrect: true },
        { key: "B", text: `${(timeSec + 3.0).toFixed(1)} seconds`, isCorrect: false },
        { key: "C", text: `${(timeSec + 6.0).toFixed(1)} seconds`, isCorrect: false },
        { key: "D", text: `${(timeSec + 9.0).toFixed(1)} seconds`, isCorrect: false },
      ],
      explanation: `To cross a telegraph post, the train must cover its own length (${trainLength} m). Convert speed from km/h to m/s: ${speedKmH} × (5/18) = ${speedMs} m/s. Time = Distance / Speed = ${trainLength} / ${speedMs} = ${timeSec.toFixed(1)} seconds.`,
      shortcut: `Speed in m/s = ${speedKmH} × 5/18 = ${speedMs} m/s. Time = ${trainLength} / ${speedMs} = ${timeSec.toFixed(1)} s.`,
      commonMistake: "Always convert speed in km/h to m/s by multiplying by 5/18 before dividing distance in meters.",
      concept: "Relative Distance & Unit Conversion",
      expectedTimeSeconds: 50,
    });
  }

  // 8. Simple & Compound Interest (slug: simple-compound-interest)
  for (let i = 1; i <= 85; i++) {
    const p = 5000 + i * 500;
    const r = 5 + (i % 6);
    const diff = (p * r * r) / 10000;

    questions.push({
      questionText: `What is the difference between the Compound Interest and Simple Interest on a principal of ₹${p} for 2 years at an annual interest rate of ${r}%? (Interest Problem #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "simple-compound-interest",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `₹${diff.toFixed(2)}`, isCorrect: true },
        { key: "B", text: `₹${(diff + 15).toFixed(2)}`, isCorrect: false },
        { key: "C", text: `₹${(diff + 30).toFixed(2)}`, isCorrect: false },
        { key: "D", text: `₹${(diff + 45).toFixed(2)}`, isCorrect: false },
      ],
      explanation: `For 2 years, the difference between CI and SI is given by: D = P × (R / 100)². Substituting P = ₹${p} and R = ${r}%: D = ${p} × (${r}/100)² = ${p} × ${r * r} / 10000 = ₹${diff.toFixed(2)}.`,
      shortcut: `Difference for 2 years = P × R² / 100² = ₹${diff.toFixed(2)}.`,
      commonMistake: "This shortcut P(R/100)² is valid strictly for 2 years, not for 3 years.",
      concept: "2-Year CI vs SI Difference",
      expectedTimeSeconds: 45,
    });
  }

  // 9. Algebra & Identities (slug: algebra-and-identities)
  for (let i = 1; i <= 85; i++) {
    const k = 3 + (i % 7);
    const k2_minus_2 = k * k - 2;

    questions.push({
      questionText: `If x + (1/x) = ${k}, what is the value of x² + (1/x²)? (Algebraic Query #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "algebra-and-identities",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${k2_minus_2}`, isCorrect: true },
        { key: "B", text: `${k2_minus_2 + 2}`, isCorrect: false },
        { key: "C", text: `${k2_minus_2 + 4}`, isCorrect: false },
        { key: "D", text: `${k2_minus_2 + 6}`, isCorrect: false },
      ],
      explanation: `Squaring both sides of x + 1/x = ${k}: (x + 1/x)² = x² + 2(x)(1/x) + 1/x² = ${k}² = ${k * k}. Therefore, x² + 1/x² = ${k * k} - 2 = ${k2_minus_2}.`,
      shortcut: `If x + 1/x = k, then x² + 1/x² = k² - 2 = ${k}² - 2 = ${k2_minus_2}.`,
      commonMistake: `Forgetting to subtract 2 leads to the erroneous answer ${k * k}.`,
      concept: "Algebraic Reciprocal Identity",
      expectedTimeSeconds: 30,
    });
  }

  // 10. Geometry & Coordinate Geometry (slug: geometry)
  for (let i = 1; i <= 85; i++) {
    const angleA = 40 + (i % 9) * 5;
    const incenterAngle = 90 + angleA / 2;

    questions.push({
      questionText: `In a triangle ABC, the internal bisectors of angle B and angle C intersect at point I (the incenter). If angle BAC = ${angleA}°, what is the measure of angle BIC? (Geometric Geometry #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "geometry",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${incenterAngle}°`, isCorrect: true },
        { key: "B", text: `${incenterAngle + 10}°`, isCorrect: false },
        { key: "C", text: `${incenterAngle + 20}°`, isCorrect: false },
        { key: "D", text: `${incenterAngle + 30}°`, isCorrect: false },
      ],
      explanation: `The angle formed by the angle bisectors at the incenter I is given by: ∠BIC = 90° + (∠A / 2). Substituting ∠A = ${angleA}°: ∠BIC = 90° + (${angleA}° / 2) = 90° + ${angleA / 2}° = ${incenterAngle}°.`,
      shortcut: `∠BIC = 90° + (∠A / 2) = 90° + ${angleA / 2}° = ${incenterAngle}°.`,
      commonMistake: "Do not confuse the incenter angle formula (90° + A/2) with circumcenter angle (2A).",
      concept: "Triangle Incenter Angle Property",
      expectedTimeSeconds: 40,
    });
  }

  // 11. Mensuration 2D & 3D (slug: mensuration)
  for (let i = 1; i <= 85; i++) {
    const r = 7 * (1 + (i % 4));
    const h = 10 + i;
    const volume = Math.round((22 / 7) * r * r * h);

    questions.push({
      questionText: `A solid right circular cylinder has a base radius of ${r} cm and a height of ${h} cm. What is its volume in cm³? (Take π = 22/7) (Mensuration Exercise #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "mensuration",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${volume} cm³`, isCorrect: true },
        { key: "B", text: `${volume + 154} cm³`, isCorrect: false },
        { key: "C", text: `${volume + 308} cm³`, isCorrect: false },
        { key: "D", text: `${volume + 462} cm³`, isCorrect: false },
      ],
      explanation: `Volume of cylinder = π × r² × h = (22/7) × ${r} × ${r} × ${h} = ${volume} cm³.`,
      shortcut: `Volume = πr²h. Check divisibility by 11 for answers involving π.`,
      commonMistake: "Do not confuse surface area (2πrh) with volume (πr²h).",
      concept: "Cylinder Volume Calculation",
      expectedTimeSeconds: 50,
    });
  }

  // 12. Probability & Combinatorics (slug: probability-combinatorics)
  for (let i = 1; i <= 85; i++) {
    const red = 4 + (i % 4);
    const blue = 5 + (i % 5);
    const total = red + blue;
    const num = red * (red - 1);
    const den = total * (total - 1);

    questions.push({
      questionText: `A bag contains ${red} red balls and ${blue} blue balls. If two balls are drawn at random one after another without replacement, what is the probability that both balls are red? (Probability Problem #${i})`,
      subjectSlug: "quantitative-aptitude",
      topicSlug: "probability-combinatorics",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `${num}/${den}`, isCorrect: true },
        { key: "B", text: `${num + 1}/${den}`, isCorrect: false },
        { key: "C", text: `${num + 2}/${den}`, isCorrect: false },
        { key: "D", text: `${num + 3}/${den}`, isCorrect: false },
      ],
      explanation: `Total balls = ${red} + ${blue} = ${total}. Probability of first ball being red = ${red}/${total}. Since it is without replacement, remaining red balls = ${red - 1} and total remaining = ${total - 1}. Probability of second red = ${red - 1}/${total - 1}. Combined probability = (${red}/${total}) × (${red - 1}/${total - 1}) = ${num}/${den}.`,
      shortcut: "P(2 Red) = C(red, 2) / C(total, 2).",
      commonMistake: "Failing to account for 'without replacement' by keeping the denominator constant as total × total.",
      concept: "Conditional Probability Without Replacement",
      expectedTimeSeconds: 45,
    });
  }

  return questions;
}
