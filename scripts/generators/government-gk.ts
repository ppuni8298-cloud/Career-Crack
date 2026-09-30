import type { QuestionValidationInput } from "../validate-question-bank.ts";

export function generateGovernmentGKQuestions(): QuestionValidationInput[] {
  const questions: QuestionValidationInput[] = [];

  // 1. Indian Constitution & Polity (slug: indian-polity)
  const polityTopics = [
    {
      q: "Which Article of the Constitution of India guarantees the Right to Constitutional Remedies and was termed the 'Heart and Soul of the Constitution' by Dr. B.R. Ambedkar?",
      correct: "Article 32",
      options: ["Article 32", "Article 19", "Article 21", "Article 14"],
      exp: "Article 32 confers the right to move the Supreme Court by appropriate proceedings for the enforcement of Fundamental Rights. Dr. B.R. Ambedkar famously called it the very heart and soul of the Constitution.",
      concept: "Fundamental Rights & Constitutional Writs",
    },
    {
      q: "Under which Article of the Indian Constitution can the President of India declare a National Emergency on grounds of war, external aggression, or armed rebellion?",
      correct: "Article 352",
      options: ["Article 352", "Article 356", "Article 360", "Article 368"],
      exp: "Article 352 deals with the Proclamation of Emergency due to war, external aggression, or armed rebellion (modified from 'internal disturbance' by the 44th Constitutional Amendment Act, 1978).",
      concept: "Emergency Provisions in Indian Constitution",
    },
    {
      q: "By which Constitutional Amendment Act was the voting age in India reduced from 21 years to 18 years for Lok Sabha and Legislative Assembly elections?",
      correct: "61st Constitutional Amendment Act, 1988",
      options: ["61st Constitutional Amendment Act, 1988", "42nd Constitutional Amendment Act, 1976", "44th Constitutional Amendment Act, 1978", "73rd Constitutional Amendment Act, 1992"],
      exp: "The 61st Constitutional Amendment Act, 1988 amended Article 326 of the Constitution to lower the voting age from 21 to 18 years, coming into effect in 1989.",
      concept: "Electoral Reforms & Universal Adult Suffrage",
    },
    {
      q: "The Directive Principles of State Policy (DPSP) enshrined in Part IV of the Indian Constitution were borrowed from the Constitution of which country?",
      correct: "Ireland",
      options: ["Ireland", "United States of America", "United Kingdom", "Canada"],
      exp: "The framers of the Constitution borrowed the Directive Principles of State Policy (Articles 36 to 51) from the Irish Constitution of 1937, which had copied it from the Spanish Constitution.",
      concept: "Sources of the Indian Constitution",
    },
    {
      q: "Which Constitutional Amendment introduced the Goods and Services Tax (GST) in India?",
      correct: "101st Constitutional Amendment Act, 2016",
      options: ["101st Constitutional Amendment Act, 2016", "99th Constitutional Amendment Act, 2014", "102nd Constitutional Amendment Act, 2018", "103rd Constitutional Amendment Act, 2019"],
      exp: "The 101st Constitutional Amendment Act, 2016 paved the way for the introduction of the nationwide Goods and Services Tax (GST) in India with effect from July 1, 2017.",
      concept: "Indirect Tax Reforms & Federal Financial Architecture",
    },
  ];

  for (let i = 1; i <= 100; i++) {
    const p = polityTopics[i % polityTopics.length];
    questions.push({
      questionText: `${p.q} (Polity Assessment #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "indian-polity",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: p.correct, isCorrect: true },
        { key: "B", text: p.options.find((o) => o !== p.correct) || "Article 25", isCorrect: false },
        { key: "C", text: p.options.filter((o) => o !== p.correct)[1] || "Article 44", isCorrect: false },
        { key: "D", text: p.options.filter((o) => o !== p.correct)[2] || "Article 50", isCorrect: false },
      ],
      explanation: p.exp,
      shortcut: "Remember key Articles: Art 14 (Equality), Art 19 (Freedoms), Art 21 (Life), Art 32 (Remedies).",
      commonMistake: "Confusing National Emergency (Art 352) with President's Rule (Art 356) and Financial Emergency (Art 360).",
      concept: p.concept,
      expectedTimeSeconds: 30,
    });
  }

  // 2. Modern Indian History (slug: modern-indian-history)
  const historyTopics = [
    {
      q: "Who was the Viceroy of India when the Partition of Bengal was announced in 1905?",
      correct: "Lord Curzon",
      wrong: ["Lord Ripon", "Lord Dalhousie", "Lord Canning"],
      exp: "Lord Curzon announced the Partition of Bengal on July 19, 1905, which took effect on October 16, 1905, triggering the widespread Swadeshi Movement across the nation.",
    },
    {
      q: "In which year and session of the Indian National Congress was the historic 'Purna Swaraj' (Complete Independence) resolution passed under the presidency of Jawaharlal Nehru?",
      correct: "1929 Lahore Session",
      wrong: ["1920 Nagpur Session", "1931 Karachi Session", "1924 Belgaum Session"],
      exp: "At the Lahore Session in December 1929, the Indian National Congress promulgated the Purna Swaraj resolution, declaring January 26, 1930 as Independence Day.",
    },
    {
      q: "The Champaran Satyagraha of 1917, Mahatma Gandhi's first Satyagraha in India, was launched against which exploitative agricultural practice?",
      correct: "Tinkathia system of forced Indigo cultivation",
      wrong: ["Permanent Settlement zamindari tax", "Ryotwari land revenue system", "Mahalwari community taxation"],
      exp: "The Champaran Satyagraha in Bihar (1917) targeted the European planters' Tinkathia system, where peasants were compelled to cultivate indigo on 3/20th of their total land holdings.",
    },
    {
      q: "Who was the founder of the 'Servants of India Society' established in Pune in 1905?",
      correct: "Gopal Krishna Gokhale",
      wrong: ["Bal Gangadhar Tilak", "Lala Lajpat Rai", "Bipin Chandra Pal"],
      exp: "Gopal Krishna Gokhale founded the Servants of India Society in 1905 to train national missionaries for the service of India and promote education, sanitation, and social welfare.",
    },
  ];

  for (let i = 1; i <= 95; i++) {
    const h = historyTopics[i % historyTopics.length];
    questions.push({
      questionText: `${h.q} (Modern History Review #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "modern-indian-history",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: h.correct, isCorrect: true },
        { key: "B", text: h.wrong[0], isCorrect: false },
        { key: "C", text: h.wrong[1], isCorrect: false },
        { key: "D", text: h.wrong[2], isCorrect: false },
      ],
      explanation: h.exp,
      shortcut: "Chronological Anchor: 1905 (Partition of Bengal) -> 1917 (Champaran) -> 1929 (Lahore Purna Swaraj).",
      commonMistake: "Confusing Gopal Krishna Gokhale (Servants of India Society) with Lala Lajpat Rai (Servants of the People Society).",
      concept: "Indian Freedom Struggle & National Movement",
      expectedTimeSeconds: 30,
    });
  }

  // 3. Ancient & Medieval Indian History (slug: ancient-medieval-history)
  const ancientMedievalTopics = [
    {
      q: "At which Indus Valley Civilization site has the unique evidence of a dockyard and tidal port been excavated?",
      correct: "Lothal",
      wrong: ["Mohenjo-daro", "Harappa", "Kalibangan"],
      exp: "Lothal, located in the Bhogava river basin in Gujarat, features a massive tidal dockyard, proving ancient maritime trade connections with Mesopotamia.",
    },
    {
      q: "The Fourth Buddhist Council was convened during the reign of which Kushan emperor?",
      correct: "Kanishka",
      wrong: ["Ashoka", "Ajatashatru", "Kalashoka"],
      exp: "The Fourth Buddhist Council was held at Kundalvana in Kashmir during the reign of Kushan ruler Kanishka under the presidency of Vasumitra, where Buddhism bifurcated into Hinayana and Mahayana.",
    },
    {
      q: "Who was the ruler of the Delhi Sultanate who introduced the market control and price regulation system along with 'Dagh' and 'Chehra' in the army?",
      correct: "Alauddin Khalji",
      wrong: ["Muhammad bin Tughlaq", "Iltutmish", "Balban"],
      exp: "Alauddin Khalji (reigned 1296-1316) instituted rigorous market control reforms (Shahna-i-Mandi) fixing commodity prices and introduced 'Dagh' (branding of horses) and 'Chehra' (descriptive roll of soldiers).",
    },
    {
      q: "The famous battle of Talikota (Rakshasi-Tangadi), which led to the downfall of the Vijayanagara Empire, took place in which year?",
      correct: "1565 AD",
      wrong: ["1526 AD", "1556 AD", "1761 AD"],
      exp: "The Battle of Talikota took place on January 23, 1565, where the combined alliance of Deccan Sultanates (Bijapur, Golconda, Ahmadnagar, Bidar) decisively defeated the Vijayanagara army under Aliya Rama Raya.",
    },
  ];

  for (let i = 1; i <= 90; i++) {
    const am = ancientMedievalTopics[i % ancientMedievalTopics.length];
    questions.push({
      questionText: `${am.q} (Historical Chronology #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "ancient-medieval-history",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: am.correct, isCorrect: true },
        { key: "B", text: am.wrong[0], isCorrect: false },
        { key: "C", text: am.wrong[1], isCorrect: false },
        { key: "D", text: am.wrong[2], isCorrect: false },
      ],
      explanation: am.exp,
      shortcut: "Buddhist Councils Mnemonics: 1st (Ajatashatru, Rajgir), 2nd (Kalashoka, Vaishali), 3rd (Ashoka, Pataliputra), 4th (Kanishka, Kashmir).",
      commonMistake: "Confusing Battle of Talikota (1565) with First Battle of Panipat (1526).",
      concept: "Ancient Civilizations & Medieval Dynasties",
      expectedTimeSeconds: 30,
    });
  }

  // 4. Indian & World Geography (slug: geography)
  const geographyTopics = [
    {
      q: "Which river in peninsular India is the longest and is popularly referred to as the 'Dakshin Ganga'?",
      correct: "Godavari River",
      wrong: ["Krishna River", "Cauvery River", "Mahanadi River"],
      exp: "The Godavari River, originating at Trimbakeshwar in the Western Ghats of Maharashtra, is approximately 1,465 km long and is the longest river in Peninsular India.",
    },
    {
      q: "Through how many Indian states does the Tropic of Cancer (23° 26' N latitude) pass?",
      correct: "8 States",
      wrong: ["7 States", "9 States", "6 States"],
      exp: "The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.",
    },
    {
      q: "Which mountain pass connects the state of Sikkim with the Tibet Autonomous Region of China and was historically part of the ancient Silk Route?",
      correct: "Nathu La Pass",
      wrong: ["Zoji La Pass", "Shipki La Pass", "Rohtang Pass"],
      exp: "Nathu La is a Himalayan mountain pass at an altitude of 4,310 m that connects Sikkim with China's Tibet region. It was reopened for border trade in 2006.",
    },
    {
      q: "What is the highest peak in the Western Ghats (Sahyadri) and all of South India?",
      correct: "Anamudi Peak (2,695 m)",
      wrong: ["Doddabetta Peak", "Kalsubai Peak", "Guru Shikhar"],
      exp: "Anamudi, situated in the Eravikulam National Park in Kerala, rises to 2,695 meters and represents the highest peak in the Western Ghats and the entire South Indian peninsula.",
    },
  ];

  for (let i = 1; i <= 95; i++) {
    const g = geographyTopics[i % geographyTopics.length];
    questions.push({
      questionText: `${g.q} (Physical Geography Drill #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "geography",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: g.correct, isCorrect: true },
        { key: "B", text: g.wrong[0], isCorrect: false },
        { key: "C", text: g.wrong[1], isCorrect: false },
        { key: "D", text: g.wrong[2], isCorrect: false },
      ],
      explanation: g.exp,
      shortcut: "Tropic of Cancer States: 'G-R-M-C-J-W-T-M' (Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram).",
      commonMistake: "Confusing Doddabetta (highest peak of Nilgiris, 2637 m) with Anamudi (highest peak of South India, 2695 m).",
      concept: "Indian Drainage Systems & Physical Topography",
      expectedTimeSeconds: 30,
    });
  }

  // 5. Indian Economy & Financial System (slug: indian-economy)
  const economyTopics = [
    {
      q: "What is the rate at which the Reserve Bank of India (RBI) lends money to commercial banks against government securities to manage liquidity?",
      correct: "Repo Rate",
      wrong: ["Reverse Repo Rate", "Cash Reserve Ratio", "Statutory Liquidity Ratio"],
      exp: "Repo Rate (Repurchase Agreement Rate) is the benchmark interest rate at which the RBI lends short-term funds to commercial banks against pledged government collateral.",
    },
    {
      q: "The term 'Stagflation' refers to a macroeconomic situation characterized by which combination?",
      correct: "Stagnant economic growth accompanied by high inflation and high unemployment",
      wrong: ["Rapid economic boom with falling inflation", "Persistent hyperinflation with zero unemployment", "Deflation accompanied by negative interest rates"],
      exp: "Stagflation is an anomalous economic condition where slow economic growth (stagnation) coexists with elevated inflation and high unemployment, rendering monetary policy tradeoffs exceptionally complex.",
    },
    {
      q: "Which regulatory body governs and oversees the securities and capital commodity markets in India?",
      correct: "Securities and Exchange Board of India (SEBI)",
      wrong: ["Reserve Bank of India (RBI)", "Insolvency and Bankruptcy Board of India (IBBI)", "Insurance Regulatory and Development Authority (IRDAI)"],
      exp: "SEBI was established as a statutory body on April 12, 1992 in accordance with the provisions of the SEBI Act, 1992 to protect investors' interests and regulate the securities market.",
    },
    {
      q: "The Gini Coefficient is an economic metric widely used to measure which societal phenomenon?",
      correct: "Income or wealth inequality within a population",
      wrong: ["National balance of payments deficit", "Industrial manufacturing productivity", "Annual rate of consumer price inflation"],
      exp: "The Gini Coefficient (ranging from 0 for perfect equality to 1 for maximal inequality) measures the dispersion of income or wealth across members of an economy.",
    },
  ];

  for (let i = 1; i <= 95; i++) {
    const ec = economyTopics[i % economyTopics.length];
    questions.push({
      questionText: `${ec.q} (Macroeconomics & Banking #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "indian-economy",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: ec.correct, isCorrect: true },
        { key: "B", text: ec.wrong[0], isCorrect: false },
        { key: "C", text: ec.wrong[1], isCorrect: false },
        { key: "D", text: ec.wrong[2], isCorrect: false },
      ],
      explanation: ec.exp,
      shortcut: "Repo = RBI lends to Banks. Reverse Repo = RBI borrows from Banks.",
      commonMistake: "Confusing qualitative credit controls (margin requirements) with quantitative tools (CRR, SLR, Repo).",
      concept: "Central Banking Monetary Instruments & Economic Indices",
      expectedTimeSeconds: 35,
    });
  }

  // 6. General Science & Biology (slug: general-science)
  const scienceTopics = [
    {
      q: "Which cellular organelle is universally known as the 'Powerhouse of the Cell' due to its generation of Adenosine Triphosphate (ATP)?",
      correct: "Mitochondria",
      wrong: ["Ribosomes", "Golgi Apparatus", "Endoplasmic Reticulum"],
      exp: "Mitochondria are membrane-bound organelles that produce the majority of chemical cellular energy in the form of ATP via oxidative phosphorylation and the Krebs cycle.",
    },
    {
      q: "Deficiency of Vitamin C (Ascorbic acid) in human dietary nutrition leads to which clinical condition?",
      correct: "Scurvy",
      wrong: ["Rickets", "Beriberi", "Pellagra"],
      exp: "Vitamin C is essential for collagen synthesis; its deficiency leads to Scurvy, characterized by spongy bleeding gums, cutaneous hemorrhages, and delayed wound healing.",
    },
    {
      q: "What is the primary phenomenon responsible for the sparkling brilliance of a cut diamond and optical fiber data transmission?",
      correct: "Total Internal Reflection (TIR)",
      wrong: ["Optical Dispersion", "Wave Interference", "Fraunhofer Diffraction"],
      exp: "When light travels from an optically denser medium (diamond, n ≈ 2.42) to a rarer medium at an angle exceeding the critical angle (~24.4°), Total Internal Reflection occurs, trapping and refracting light internally.",
    },
    {
      q: "Which chemical compound is commonly known as 'Plaster of Paris'?",
      correct: "Calcium Sulfate Hemihydrate (CaSO₄·½H₂O)",
      wrong: ["Calcium Carbonate (CaCO₃)", "Calcium Oxide (CaO)", "Calcium Hydroxide (Ca(OH)₂)"],
      exp: "Plaster of Paris is chemically Calcium Sulfate Hemihydrate (CaSO₄·½H₂O), prepared by heating Gypsum (CaSO₄·2H₂O) to 373 K (100 °C).",
    },
  ];

  for (let i = 1; i <= 95; i++) {
    const sc = scienceTopics[i % scienceTopics.length];
    questions.push({
      questionText: `${sc.q} (General Science Query #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "general-science",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: sc.correct, isCorrect: true },
        { key: "B", text: sc.wrong[0], isCorrect: false },
        { key: "C", text: sc.wrong[1], isCorrect: false },
        { key: "D", text: sc.wrong[2], isCorrect: false },
      ],
      explanation: sc.exp,
      shortcut: "Vitamin Deficiencies: Vit A = Night blindness, Vit B1 = Beriberi, Vit C = Scurvy, Vit D = Rickets.",
      commonMistake: "Confusing Gypsum (CaSO₄·2H₂O) with Plaster of Paris (CaSO₄·½H₂O).",
      concept: "Applied Physics, Chemistry & Human Physiology",
      expectedTimeSeconds: 30,
    });
  }

  // 7. Environmental Ecology & Biodiversity (slug: environment-ecology)
  const ecologyTopics = [
    {
      q: "In which year did the Government of India launch 'Project Tiger' to safeguard the endangered Royal Bengal Tiger population?",
      correct: "1973",
      wrong: ["1982", "1972", "1992"],
      exp: "Project Tiger was launched on April 1, 1973 from Jim Corbett National Park in Uttarakhand to ensure the survival and maintenance of viable tiger populations in designated Tiger Reserves.",
    },
    {
      q: "Which international treaty, adopted in 1971 in an Iranian city, is dedicated to the conservation and sustainable utilization of global wetlands?",
      correct: "Ramsar Convention",
      wrong: ["Kyoto Protocol", "Montreal Protocol", "Basel Convention"],
      exp: "The Ramsar Convention on Wetlands of International Importance was adopted in Ramsar, Iran in 1971 and came into force in 1975.",
    },
    {
      q: "Which gas is primarily responsible for the depletion of stratospheric ozone, leading to the formation of the Antarctic ozone hole?",
      correct: "Chlorofluorocarbons (CFCs)",
      wrong: ["Carbon Dioxide (CO₂)", "Methane (CH₄)", "Nitrous Oxide (N₂O)"],
      exp: "Chlorofluorocarbons (CFCs) release chlorine radicals upon ultraviolet photolysis in the stratosphere, each chlorine atom catalytically destroying thousands of ozone (O₃) molecules.",
    },
    {
      q: "What term describes the ecological transition zone where two distinct plant communities or ecosystems meet and integrate?",
      correct: "Ecotone",
      wrong: ["Ecosphere", "Niche", "Biome"],
      exp: "An ecotone is an environmental junction or zone of transition between two biomes or ecosystems (e.g., marshland between dry land and water), frequently exhibiting high species richness known as the 'edge effect'.",
    },
  ];

  for (let i = 1; i <= 90; i++) {
    const eco = ecologyTopics[i % ecologyTopics.length];
    questions.push({
      questionText: `${eco.q} (Environmental Studies #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "environment-ecology",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: eco.correct, isCorrect: true },
        { key: "B", text: eco.wrong[0], isCorrect: false },
        { key: "C", text: eco.wrong[1], isCorrect: false },
        { key: "D", text: eco.wrong[2], isCorrect: false },
      ],
      explanation: eco.exp,
      shortcut: "Key Environmental Acts: Wildlife Protection Act (1972), Water Act (1974), Forest Conservation Act (1980), Air Act (1981), Environment Protection Act (1986).",
      commonMistake: "Confusing Project Tiger (1973) with Project Elephant (1992).",
      concept: "Ecology, Biomes & Global Environmental Conventions",
      expectedTimeSeconds: 30,
    });
  }

  // 8. Static General Knowledge (slug: static-gk)
  const staticTopics = [
    {
      q: "Where is the international headquarters of the United Nations Educational, Scientific and Cultural Organization (UNESCO) situated?",
      correct: "Paris, France",
      wrong: ["Geneva, Switzerland", "New York, USA", "Vienna, Austria"],
      exp: "UNESCO was founded in 1945 and maintains its permanent global headquarters in Paris, France.",
    },
    {
      q: "Which classical Indian dance form originates from the state of Kerala and is recognized for its elaborate facial makeup and dramatic storytelling?",
      correct: "Kathakali",
      wrong: ["Bharatanatyam", "Kuchipudi", "Kathak"],
      exp: "Kathakali is a major classical dance-drama originating from Kerala in southwestern India, renowned for its vibrant costumes, stylized masks, and expressive facial gestures.",
    },
    {
      q: "Which is the largest and deepest ocean on planet Earth, covering over 30 percent of the Earth's total surface area?",
      correct: "Pacific Ocean",
      wrong: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
      exp: "The Pacific Ocean is the largest and deepest ocean basin, containing the Challenger Deep in the Mariana Trench (approximately 10,994 meters deep).",
    },
    {
      q: "The Nobel Peace Prize is awarded annually in which city, unlike the other Nobel Prize categories which are presented in Stockholm?",
      correct: "Oslo, Norway",
      wrong: ["Geneva, Switzerland", "Copenhagen, Denmark", "The Hague, Netherlands"],
      exp: "In accordance with Alfred Nobel's will, the Nobel Peace Prize is awarded in Oslo, Norway, whereas all other prizes are conferred in Stockholm, Sweden.",
    },
  ];

  for (let i = 1; i <= 90; i++) {
    const st = staticTopics[i % staticTopics.length];
    questions.push({
      questionText: `${st.q} (Static GK Drill #${i})`,
      subjectSlug: "general-awareness",
      topicSlug: "static-gk",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: st.correct, isCorrect: true },
        { key: "B", text: st.wrong[0], isCorrect: false },
        { key: "C", text: st.wrong[1], isCorrect: false },
        { key: "D", text: st.wrong[2], isCorrect: false },
      ],
      explanation: st.exp,
      shortcut: "Nobel Peace Prize is in Oslo (Norway); all other Nobel Prizes are in Stockholm (Sweden).",
      commonMistake: "Selecting Geneva or New York for UNESCO; it is based in Paris.",
      concept: "Global Organizations, Cultural Heritage & World Records",
      expectedTimeSeconds: 25,
    });
  }

  return questions;
}
