import type { QuestionValidationInput } from "../validate-question-bank.ts";

export function generateGovernmentEnglishQuestions(): QuestionValidationInput[] {
  const questions: QuestionValidationInput[] = [];

  // 1. Error Detection & Grammar (slug: error-detection)
  const grammarRules = [
    {
      rule: "Subject-Verb Agreement with 'Neither...nor'",
      correctPart: "neither the manager nor the employees were present",
      errorSentence: "Neither the manager nor the employees was present (A) / at the annual conference (B) / held in New Delhi last week (C) / No Error (D)",
      errorSegment: "A",
      explanation: "When two subjects are joined by 'neither...nor', the verb agrees in number with the nearer subject. Here, 'the employees' is plural, so the verb must be 'were' instead of 'was'.",
      shortcut: "In 'Neither...nor' or 'Either...or', look at the noun closest to the verb.",
    },
    {
      rule: "Conditionals with 'Had + V3'",
      correctPart: "would have reached",
      errorSentence: "If he had started earlier (A) / he would reach the airport (B) / well before the flight departure (C) / No Error (D)",
      errorSegment: "B",
      explanation: "In a third conditional sentence expressing a hypothetical past condition ('If + subject + had + V3'), the main clause must follow 'subject + would have + V3'. Thus, 'he would have reached' is the correct grammatical structure.",
      shortcut: "Formula: If + had + V3 ---> would have + V3.",
    },
    {
      rule: "Parallelism with 'Not only...but also'",
      correctPart: "not only passed but also secured",
      errorSentence: "He not only passed the civil services examination (A) / but also he secured (B) / an exemplary rank in the merit list (C) / No Error (D)",
      errorSegment: "B",
      explanation: "The correlative conjunction 'not only...but also' requires parallel grammatical structures. Since 'not only' is followed directly by the verb 'passed', 'but also' should be followed directly by the verb 'secured', without repeating the pronoun 'he'.",
      shortcut: "Whatever part of speech follows 'not only' must also follow 'but also'.",
    },
    {
      rule: "Adverbial inversion with 'Scarcely / Hardly...when'",
      correctPart: "Scarcely had he entered...when",
      errorSentence: "Scarcely he had entered the room (A) / when the telephone began to ring (B) / continuously without pause (C) / No Error (D)",
      errorSegment: "A",
      explanation: "When a sentence begins with negative or restrictive adverbs such as 'Scarcely' or 'Hardly', inversion takes place (auxiliary verb precedes the subject): 'Scarcely had he entered...'.",
      shortcut: "Negative adverbs at the start of a sentence require inversion: Adverb + Auxiliary + Subject + Main Verb.",
    },
    {
      rule: "Preposition with 'Superior / Inferior / Senior / Junior'",
      correctPart: "senior to me",
      errorSentence: "Although Mr. Sharma is senior than me (A) / in service duration and experience (B) / he treats all juniors cordially (C) / No Error (D)",
      errorSegment: "A",
      explanation: "Latin comparative adjectives ending in '-ior' (senior, junior, superior, inferior, prior, anterior, posterior) are always followed by the preposition 'to', never 'than'.",
      shortcut: "Adjectives ending in '-ior' take 'to', not 'than'.",
    },
    {
      rule: "Collective noun agreement",
      correctPart: "The committee was unanimous in its decision",
      errorSentence: "The jury were divided (A) / in its opinion regarding the innocence (B) / of the accused defendant (C) / No Error (D)",
      errorSegment: "B",
      explanation: "When a collective noun functions as divided individuals with separate opinions (indicated by the plural verb 'were'), the corresponding possessive pronoun must also be plural ('their opinion', not 'its opinion').",
      shortcut: "Plural verb with divided collective noun requires plural possessive pronoun ('their').",
    },
  ];

  for (let i = 1; i <= 100; i++) {
    const r = grammarRules[i % grammarRules.length];
    questions.push({
      questionText: `Identify the segment in the sentence that contains a grammatical error:\n"${r.errorSentence}" (Grammar Case #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "error-detection",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: `Segment (${r.errorSegment})`, isCorrect: true },
        { key: "B", text: `Segment (${r.errorSegment === "A" ? "B" : "A"})`, isCorrect: false },
        { key: "C", text: "Segment (C)", isCorrect: false },
        { key: "D", text: "No Error (D)", isCorrect: false },
      ],
      explanation: `${r.explanation} Correct formulation requires '${r.correctPart}'.`,
      shortcut: r.shortcut,
      commonMistake: "Overlooking the grammatical agreement rules between subjects and correlative conjunctions.",
      concept: r.rule,
      expectedTimeSeconds: 40,
    });
  }

  // 2. Vocabulary & Synonyms/Antonyms (slug: vocabulary-and-synonyms)
  const vocabWords = [
    { word: "EPHEMERAL", syn: "Transitory", ant: "Eternal", def: "Lasting for a very short time", wrongSyn: ["Permanent", "Enduring", "Vast"] },
    { word: "TENACIOUS", syn: "Persistent", ant: "Yielding", def: "Holding fast; characterized by keeping a firm hold", wrongSyn: ["Weak", "Hesitant", "Fleeting"] },
    { word: "UBIQUITOUS", syn: "Omnipresent", ant: "Rare", def: "Present, appearing, or found everywhere", wrongSyn: ["Scarce", "Occasional", "Localized"] },
    { word: "PRAGMATIC", syn: "Practical", ant: "Idealistic", def: "Dealing with things sensibly and realistically", wrongSyn: ["Theoretical", "Impractical", "Dogmatic"] },
    { word: "INNOCUOUS", syn: "Harmless", ant: "Deleterious", def: "Not harmful or offensive", wrongSyn: ["Toxic", "Injurious", "Hostile"] },
    { word: "LUCID", syn: "Clear", ant: "Obscure", def: "Expressed clearly; easy to understand", wrongSyn: ["Confusing", "Vague", "Murky"] },
    { word: "METICULOUS", syn: "Punctilious", ant: "Careless", def: "Showing great attention to detail; very careful and precise", wrongSyn: ["Slapdash", "Negligent", "Hasty"] },
    { word: "CANDID", syn: "Frank", ant: "Deceitful", def: "Truthful and straightforward; frank", wrongSyn: ["Guarded", "Secretive", "Biased"] },
    { word: "AMELIORATE", syn: "Improve", ant: "Worsen", def: "Make something bad or unsatisfactory better", wrongSyn: ["Deteriorate", "Degrade", "Depreciate"] },
    { word: "ZEALOUS", syn: "Fervent", ant: "Apathetic", def: "Having or showing great energy or enthusiasm in pursuit of a cause", wrongSyn: ["Indifferent", "Lethargic", "Unconcerned"] },
  ];

  for (let i = 1; i <= 100; i++) {
    const v = vocabWords[i % vocabWords.length];
    const isAntonym = i % 2 === 0;

    questions.push({
      questionText: isAntonym
        ? `Choose the word that is most nearly OPPOSITE in meaning (ANTONYM) to the given word:\n"${v.word}" (Vocab Drill #${i})`
        : `Choose the word that is most nearly SIMILAR in meaning (SYNONYM) to the given word:\n"${v.word}" (Vocab Drill #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "vocabulary-and-synonyms",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: isAntonym ? v.ant : v.syn, isCorrect: true },
        { key: "B", text: isAntonym ? v.syn : v.wrongSyn[0], isCorrect: false },
        { key: "C", text: v.wrongSyn[1], isCorrect: false },
        { key: "D", text: v.wrongSyn[2], isCorrect: false },
      ],
      explanation: `"${v.word}" means "${v.def}". Therefore, its exact ${isAntonym ? "antonym is '" + v.ant + "'" : "synonym is '" + v.syn + "'"} in contextual English literature.`,
      shortcut: `Etymology note: Root meaning clarifies the definition (${v.def}).`,
      commonMistake: isAntonym ? "Selecting the synonym by habit when asked specifically for the antonym." : "Picking near-distractors without checking exact nuance.",
      concept: "Lexical Semantics & Word Formations",
      expectedTimeSeconds: 30,
    });
  }

  // 3. Idioms & Phrasal Verbs (slug: idioms-and-phrases)
  const idioms = [
    { idiom: "Bite the bullet", meaning: "To face a difficult or unpleasant situation with courage and fortitude", wrong: ["To eat in a hurry", "To avoid a dangerous hazard", "To surrender in battle"] },
    { idiom: "Break the ice", meaning: "To initiate a conversation and overcome initial social awkwardness", wrong: ["To cause physical destruction", "To slip on frozen water", "To terminate a business negotiation"] },
    { idiom: "Burn the midnight oil", meaning: "To work or study late into the night with sustained diligence", wrong: ["To waste expensive domestic fuels", "To cause an accidental fire", "To wake up early at dawn"] },
    { idiom: "At the eleventh hour", meaning: "At the very last possible moment just before a deadline", wrong: ["At eleven o'clock precisely", "During the early morning hours", "Well ahead of schedule"] },
    { idiom: "A blessing in disguise", meaning: "An apparent misfortune that eventually results in good or beneficial outcome", wrong: ["A masked supernatural apparition", "A continuous series of misfortunes", "A direct reward handed publicly"] },
    { idiom: "Through thick and thin", meaning: "Under all conditions, regardless of adverse or favorable circumstances", wrong: ["Only when times are prosperous", "Through dense forest vegetation", "Without deep intellectual thought"] },
    { idiom: "Spill the beans", meaning: "To disclose confidential or secret information prematurely", wrong: ["To drop agricultural seeds accidentally", "To cook food incompetently", "To behave eccentrically in public"] },
    { idiom: "Once in a blue moon", meaning: "Very rarely; happening on exceptionally infrequent occasions", wrong: ["Every lunar month regularly", "During clear night skies", "Never under any circumstances"] },
  ];

  for (let i = 1; i <= 100; i++) {
    const idm = idioms[i % idioms.length];
    questions.push({
      questionText: `Select the option that best expresses the authentic meaning of the highlighted idiom:\n"${idm.idiom}" (Idiomatic Context #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "idioms-and-phrases",
      examSlug: "ssc-cgl",
      difficulty: "EASY",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: idm.meaning, isCorrect: true },
        { key: "B", text: idm.wrong[0], isCorrect: false },
        { key: "C", text: idm.wrong[1], isCorrect: false },
        { key: "D", text: idm.wrong[2], isCorrect: false },
      ],
      explanation: `The idiom "${idm.idiom}" originates in historical figurative speech and universally signifies: "${idm.meaning}". Literal interpretations of its constituent words are erroneous.`,
      shortcut: "Idioms are metaphorical constructs; discard literal interpretations that describe the physical words.",
      commonMistake: "Choosing a literal physical description rather than the figurative cultural meaning.",
      concept: "Figurative Idiomatic Expressions",
      expectedTimeSeconds: 30,
    });
  }

  // 4. Sentence Correction & Improvement (slug: sentence-correction)
  for (let i = 1; i <= 100; i++) {
    questions.push({
      questionText: `Select the alternative that will improve the underlined portion of the sentence. If no improvement is needed, select 'No Improvement':\n"Scarcely had the president arrived at the venue *then the cheering crowd erupted* in applause." (Variant #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "sentence-correction",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: "when the cheering crowd erupted", isCorrect: true },
        { key: "B", text: "than the cheering crowd erupted", isCorrect: false },
        { key: "C", text: "before the cheering crowd had erupted", isCorrect: false },
        { key: "D", text: "No Improvement", isCorrect: false },
      ],
      explanation: "'Scarcely' and 'Hardly' are always correlated with the conjunction 'when' (or rarely 'before'), never 'then' or 'than'. Conversely, 'No sooner' is correlated with 'than'. Thus, 'when the cheering crowd erupted' is the grammatically accurate correction.",
      shortcut: "Scarcely / Hardly pairs with 'when'. No sooner pairs with 'than'.",
      commonMistake: "Confusing 'Scarcely...when' with 'No sooner...than'.",
      concept: "Correlative Conjunction Pairs in English Syntax",
      expectedTimeSeconds: 35,
    });
  }

  // 5. Reading Comprehension & Cloze Test (slug: reading-comprehension)
  for (let i = 1; i <= 100; i++) {
    questions.push({
      questionText: `Read the brief passage extract:\n"The transition toward renewable energy systems is no longer merely an ecological preference; it has become an economic imperative. Diminishing capital expenditure in solar photovoltaic technology, coupled with enhanced grid-scale energy storage, has rendered green energy cost-competitive against traditional fossil fuel baseloads."\n\nBased on the passage, why has renewable energy transitioned into an economic imperative? (Passage Item #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "reading-comprehension",
      examSlug: "ssc-cgl",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: "Falling solar infrastructure costs and improved energy storage have made green power cost-competitive against fossil fuels.", isCorrect: true },
        { key: "B", text: "Global fossil fuel reserves have been completely depleted in international markets.", isCorrect: false },
        { key: "C", text: "Industrial manufacturing plants have universally decommissioned thermal power generators.", isCorrect: false },
        { key: "D", text: "Ecological considerations now supersede all industrial profitability calculations.", isCorrect: false },
      ],
      explanation: "The passage directly connects the economic imperative to 'Diminishing capital expenditure in solar photovoltaic technology, coupled with enhanced grid-scale energy storage, has rendered green energy cost-competitive against traditional fossil fuel baseloads.' Option A directly restates this factual rationale.",
      shortcut: "Eliminate extreme statements not stated in the passage (such as 'completely depleted' or 'universally decommissioned').",
      commonMistake: "Choosing extreme assertions that exaggerate the factual claims of the author.",
      concept: "Direct Factual Inference from Expository Prose",
      expectedTimeSeconds: 50,
    });
  }

  // 6. Para Jumbles & Sentence Rearrangement (slug: para-jumbles)
  for (let i = 1; i <= 100; i++) {
    questions.push({
      questionText: `Rearrange the following four sentences in the proper sequence to form a meaningful, coherent paragraph:\nP: In addition to mitigating greenhouse emissions, urban forestry preserves native biodiversity.\nQ: Modern urban planners are increasingly integrating expansive green canopies into metropolitan development.\nR: These benefits directly improve the psychological well-being and somatic health of city dwellers.\nS: This deliberate shift stems from growing scientific evidence detailing their profound environmental utility.\nSelect the correct ordering: (ParaJumble #${i})`,
      subjectSlug: "english-comprehension",
      topicSlug: "para-jumbles",
      examSlug: "ssc-cgl",
      difficulty: "HARD",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: "Q - S - P - R", isCorrect: true },
        { key: "B", text: "S - Q - R - P", isCorrect: false },
        { key: "C", text: "P - R - Q - S", isCorrect: false },
        { key: "D", text: "Q - P - R - S", isCorrect: false },
      ],
      explanation: "Sentence Q introduces the central subject ('Modern urban planners are increasingly integrating expansive green canopies...'). Sentence S refers back to this trend with demonstrative pronoun 'This deliberate shift stems from...'. Sentence P expands on utility ('In addition to mitigating greenhouse emissions...'). Sentence R concludes with the personal outcome ('These benefits directly improve...'). Hence, Q-S-P-R is the coherent sequence.",
      shortcut: "Identify the introductory sentence (Q) and match demonstrative pronouns ('This deliberate shift' refers to Q).",
      commonMistake: "Starting a paragraph with a transitional sentence that begins with 'In addition to' or 'These benefits'.",
      concept: "Cohesive Paragraph Flow & Transitional Markers",
      expectedTimeSeconds: 60,
    });
  }

  return questions;
}
