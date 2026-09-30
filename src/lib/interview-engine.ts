import { prisma } from "@/lib/prisma";

export interface TechnicalTopicCurriculum {
  topic: string;
  category: "TECHNICAL" | "CORE_CS" | "PROGRAMMING";
  questions: Array<{
    question: string;
    expectedKeywords: string[];
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    idealStructure: string;
    followUp: string;
  }>;
}

export const INTERVIEW_CURRICULUM: Record<string, TechnicalTopicCurriculum> = {
  DSA: {
    topic: "Data Structures & Algorithms",
    category: "TECHNICAL",
    questions: [
      {
        question: "Explain the internal working of a Hash Table and how collision resolution techniques like Separate Chaining and Open Addressing differ in worst-case time complexity.",
        expectedKeywords: ["hash function", "bucket", "chaining", "linked list", "clustering", "O(1) average", "O(n) worst case", "load factor"],
        difficulty: "INTERMEDIATE",
        idealStructure: "1. Define Hash Table & Hash function. 2. Explain Separate Chaining with load factor. 3. Explain Open Addressing (Linear, Quadratic, Double Hashing). 4. Compare space overhead and cache locality.",
        followUp: "How does rehashing occur when the load factor exceeds 0.75 in Java's HashMap?",
      },
      {
        question: "What is the difference between Dijkstra's algorithm and the Bellman-Ford algorithm for finding shortest paths in a graph? When would you strictly choose Bellman-Ford?",
        expectedKeywords: ["greedy", "dynamic programming", "negative weight edges", "negative cycles", "relaxation", "O((V+E)logV)", "O(V*E)"],
        difficulty: "ADVANCED",
        idealStructure: "1. State greedy vs DP paradigm. 2. Discuss edge weight constraints (non-negative vs negative). 3. Explain cycle detection in Bellman-Ford. 4. Contrast time complexity.",
        followUp: "Can Dijkstra's algorithm work with negative edge weights if we add a large constant to make all weights positive?",
      },
      {
        question: "Compare an Array and a Linked List in terms of memory layout, random access, and insertion/deletion efficiency.",
        expectedKeywords: ["contiguous memory", "pointer overhead", "cache locality", "O(1) index access", "O(1) head insertion", "O(n) traversal"],
        difficulty: "BEGINNER",
        idealStructure: "1. Memory layout comparison. 2. Time complexity comparison table. 3. Cache performance & modern hardware implications. 4. Real-world use cases.",
        followUp: "Why does traversing an array typically run significantly faster than a linked list of the same size on modern CPUs?",
      },
    ],
  },
  DBMS: {
    topic: "Database Management Systems",
    category: "CORE_CS",
    questions: [
      {
        question: "What are the ACID properties in database transactions? Explain how Isolation is maintained in modern RDBMS systems.",
        expectedKeywords: ["Atomicity", "Consistency", "Isolation", "Durability", "WAL", "2PL", "MVCC", "Dirty Read", "Phantom Read", "Serializable"],
        difficulty: "INTERMEDIATE",
        idealStructure: "1. Define each letter of ACID. 2. Describe concurrency anomalies (dirty read, non-repeatable read, phantom read). 3. Explain isolation levels. 4. Describe MVCC or locking mechanisms.",
        followUp: "How does Multi-Version Concurrency Control (MVCC) eliminate read locks without blocking writes?",
      },
      {
        question: "Explain the difference between Clustered and Non-Clustered Indexes. How does a B+ Tree support range queries so efficiently?",
        expectedKeywords: ["physical ordering", "leaf node", "linked list", "B+ Tree", "pointer", "lookup overhead", "range scan"],
        difficulty: "ADVANCED",
        idealStructure: "1. Define Clustered Index (data row order). 2. Define Non-Clustered Index (pointers to clustered key/row). 3. Detail B+ Tree internal nodes vs leaf nodes. 4. Highlight doubly linked leaves for range traversal.",
        followUp: "Why do databases use B+ Trees rather than Balanced Binary Search Trees (like AVL or Red-Black Trees) for disk storage?",
      },
      {
        question: "What is Database Normalization? Explain the difference between 2NF and 3NF with a simple example.",
        expectedKeywords: ["redundancy", "anomaly", "1NF atomic", "2NF partial dependency", "3NF transitive dependency", "candidate key"],
        difficulty: "BEGINNER",
        idealStructure: "1. Motivation behind normalization. 2. Explain 1NF briefly. 3. 2NF and partial functional dependency. 4. 3NF and transitive dependency with a schema example.",
        followUp: "In what scenarios would you intentionally denormalize a database schema in production?",
      },
    ],
  },
  OS: {
    topic: "Operating Systems",
    category: "CORE_CS",
    questions: [
      {
        question: "Explain the difference between a Process and a Thread. How does the Operating System perform Context Switching between threads of the same process vs different processes?",
        expectedKeywords: ["address space", "PCB", "TCB", "virtual memory", "page table", "TLB flush", "stack", "heap", "registers"],
        difficulty: "INTERMEDIATE",
        idealStructure: "1. Definition of Process vs Thread. 2. Shared resources (code, data, files) vs private resources (registers, stack). 3. Context switch overhead comparison (TLB invalidation).",
        followUp: "What happens to the Translation Lookaside Buffer (TLB) during a full process context switch?",
      },
      {
        question: "What are the four necessary Coffman conditions for a Deadlock to occur? How does an OS prevent or avoid deadlocks using Banker's Algorithm?",
        expectedKeywords: ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait", "Safe State", "Resource Allocation Graph", "Banker's Algorithm"],
        difficulty: "ADVANCED",
        idealStructure: "1. List and define the 4 Coffman conditions. 2. Explain prevention by breaking one condition. 3. Detail Banker's Algorithm safe state vs unsafe state.",
        followUp: "Why is Banker's algorithm rarely used in modern general-purpose operating systems like Linux or Windows?",
      },
      {
        question: "What is Virtual Memory and Paging? What causes a Page Fault and how does the OS kernel handle it?",
        expectedKeywords: ["virtual address", "physical memory", "page table", "MMU", "trap to OS", "swap disk", "dirty bit", "page replacement LRU"],
        difficulty: "BEGINNER",
        idealStructure: "1. Purpose of Virtual Memory. 2. Paging mechanism. 3. Step-by-step Page Fault sequence from CPU interrupt to disk retrieval. 4. Resumption of executing instruction.",
        followUp: "What is Thrashing in virtual memory and how does the OS detect and mitigate it?",
      },
    ],
  },
  NETWORKS: {
    topic: "Computer Networks",
    category: "CORE_CS",
    questions: [
      {
        question: "Walk through what happens under the hood from the moment you type 'https://example.com' in your browser and press Enter until the page renders.",
        expectedKeywords: ["DNS resolution", "ARP", "TCP 3-way handshake", "SYN SYN-ACK ACK", "TLS handshake", "certificates", "HTTP GET", "DOM rendering"],
        difficulty: "INTERMEDIATE",
        idealStructure: "1. URL parsing & DNS lookup (cache, resolver, root, TLD, authoritative). 2. TCP 3-way handshake. 3. TLS 1.3 cryptographic negotiation. 4. HTTP request/response. 5. Browser DOM/CSSOM render tree.",
        followUp: "How does HTTP/2 or HTTP/3 improve upon HTTP/1.1 in terms of head-of-line blocking?",
      },
      {
        question: "Explain the TCP 3-way handshake and 4-way termination handshake. Why does TIME_WAIT state exist on the client side?",
        expectedKeywords: ["SYN", "ACK", "FIN", "Sequence Number", "2MSL", "TIME_WAIT", "duplicate packets", "clean socket close"],
        difficulty: "ADVANCED",
        idealStructure: "1. Diagram 3-way handshake (SYN, SYN-ACK, ACK). 2. Diagram 4-way termination (FIN, ACK, FIN, ACK). 3. Explain TIME_WAIT duration (2 * Maximum Segment Lifetime). 4. Prevent stale packets in new connections.",
        followUp: "What problems can arise if a server has tens of thousands of connections lingering in TIME_WAIT state?",
      },
    ],
  },
  OOP: {
    topic: "Object-Oriented Programming",
    category: "PROGRAMMING",
    questions: [
      {
        question: "Explain the SOLID principles of Object-Oriented Software Design with concrete architectural examples.",
        expectedKeywords: ["Single Responsibility", "Open Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion", "abstraction", "coupling"],
        difficulty: "INTERMEDIATE",
        idealStructure: "1. Define each principle with its acronym. 2. Provide a code/design violation and refactored fix for at least 2 principles (e.g. LSP and DIP). 3. Discuss long-term maintainability.",
        followUp: "How does the Dependency Inversion Principle differ from Dependency Injection in frameworks like Spring or NestJS?",
      },
      {
        question: "Explain the difference between Compile-time (Static) Polymorphism and Runtime (Dynamic) Polymorphism. How do virtual method tables (vtable) work under the hood?",
        expectedKeywords: ["method overloading", "method overriding", "virtual table", "vptr", "pointer indirection", "dynamic dispatch"],
        difficulty: "ADVANCED",
        idealStructure: "1. Contrast overloading vs overriding. 2. Explain compiler symbol resolution vs runtime dispatch. 3. Detail the vtable memory structure and pointer resolution overhead.",
        followUp: "Why cannot static methods or private methods be declared virtual or overridden in OOP?",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// EVALUATE USER'S ANSWER
// ---------------------------------------------------------------------------

export function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  expectedKeywords: string[],
  idealStructure: string,
  followUp: string
): {
  score: number; // 0 - 100
  strongPoints: string[];
  missingPoints: string[];
  suggestedStructure: string;
  followUpQuestion: string;
} {
  const answerLower = userAnswer.toLowerCase();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  expectedKeywords.forEach((kw) => {
    if (answerLower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const wordCount = userAnswer.trim().split(/\s+/).length;

  // Keyword match ratio
  const keywordRatio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0.5;

  let baseScore = Math.round(keywordRatio * 60);

  // Depth & elaboration bonus
  if (wordCount >= 40) baseScore += 15;
  if (wordCount >= 80) baseScore += 15;
  if (wordCount < 20) baseScore = Math.min(baseScore, 35); // Too brief

  const finalScore = Math.min(100, Math.max(20, baseScore));

  const strongPoints: string[] = [];
  const missingPoints: string[] = [];

  if (matchedKeywords.length > 0) {
    strongPoints.push(`Correctly identified key terminology: ${matchedKeywords.slice(0, 4).join(", ")}.`);
  }
  if (wordCount >= 50) {
    strongPoints.push("Provided a structured response with contextual elaboration rather than a single-line definition.");
  } else {
    missingPoints.push("Response was concise; technical interviewers expect step-by-step reasoning or a architectural trade-off.");
  }

  if (missingKeywords.length > 0) {
    missingPoints.push(`Overlooked important concepts: ${missingKeywords.slice(0, 3).join(", ")}.`);
  }

  return {
    score: finalScore,
    strongPoints,
    missingPoints,
    suggestedStructure: idealStructure,
    followUpQuestion: followUp,
  };
}

// ---------------------------------------------------------------------------
// PROJECT INTERVIEW GENERATOR
// ---------------------------------------------------------------------------

export function generateProjectQuestions(projectContext: {
  name: string;
  description: string;
  techStack: string;
  role?: string;
  challenges?: string;
  results?: string;
}): Array<{ question: string; expectedKeywords: string[]; idealStructure: string; followUp: string }> {
  const { name, description, techStack, role, challenges } = projectContext;

  return [
    {
      question: `In your project '${name}', what architectural considerations led you to choose ${techStack}? What was the primary technical trade-off?`,
      expectedKeywords: [techStack.split(",")[0]?.trim() || "framework", "architecture", "trade-off", "performance", "scalability"],
      idealStructure: "1. Problem statement. 2. Candidate technologies evaluated. 3. Explicit trade-off chosen (e.g. speed vs complexity). 4. Outcome in production.",
      followUp: "If you had to scale this architecture to 100,000 daily active users, where would the first bottleneck appear?",
    },
    {
      question: `What was the most challenging technical bug or hurdle you personally resolved while building ${name}?`,
      expectedKeywords: ["root cause", "debugging", "profiling", "resolution", "prevention"],
      idealStructure: "1. Symptom observed. 2. Root-cause diagnosis methodology. 3. Fix applied. 4. Post-incident monitoring or automated test added.",
      followUp: "How did you measure that your fix actually resolved the issue without causing regressions?",
    },
    {
      question: `Walk through the end-to-end data flow for the primary user action in ${name} (from client request to database persistence).`,
      expectedKeywords: ["API", "database", "validation", "controller", "transaction", "state"],
      idealStructure: "1. Client trigger & payload. 2. Middleware & authentication. 3. Business logic execution. 4. DB transaction & indexing. 5. Response handling.",
      followUp: "How did you handle database transaction failures or partial network drops during this flow?",
    },
  ];
}

// ---------------------------------------------------------------------------
// RESUME INTERVIEW GENERATOR
// ---------------------------------------------------------------------------

export function generateResumeQuestions(resumeText: string): Array<{
  question: string;
  type: "RESUME_DERIVED" | "GENERAL";
  expectedKeywords: string[];
  idealStructure: string;
  followUp: string;
}> {
  const text = resumeText.toLowerCase();
  const questions: Array<{
    question: string;
    type: "RESUME_DERIVED" | "GENERAL";
    expectedKeywords: string[];
    idealStructure: string;
    followUp: string;
  }> = [];

  // Check for React / Frontend
  if (text.includes("react") || text.includes("next")) {
    questions.push({
      question: "[Resume-Derived] You highlighted React/Next.js on your resume. How do you prevent unnecessary component re-renders and manage server vs client component boundaries?",
      type: "RESUME_DERIVED",
      expectedKeywords: ["useMemo", "useCallback", "server components", "props drilling", "memo", "hydration"],
      idealStructure: "1. Virtual DOM reconciliation. 2. Hook usage (useMemo/useCallback). 3. Server Components vs Client boundary rules. 4. Profiling in React DevTools.",
      followUp: "What is hydration mismatch in Next.js and how do you resolve it?",
    });
  }

  // Check for Node / Backend / Express
  if (text.includes("node") || text.includes("express") || text.includes("backend")) {
    questions.push({
      question: "[Resume-Derived] You listed Node.js backend experience. Explain the Node.js Event Loop phases (timers, I/O callbacks, poll, check) and how async I/O is handled without blocking.",
      type: "RESUME_DERIVED",
      expectedKeywords: ["libuv", "thread pool", "event loop", "microtasks", "process.nextTick", "non-blocking I/O"],
      idealStructure: "1. Single-threaded JS execution vs multi-threaded C++ libuv. 2. Phases of event loop. 3. Microtasks vs macrotasks. 4. Best practices to avoid blocking.",
      followUp: "What is the difference between process.nextTick() and setImmediate()?",
    });
  }

  // Check for SQL / MongoDB / Database
  if (text.includes("sql") || text.includes("postgres") || text.includes("mongo")) {
    questions.push({
      question: "[Resume-Derived] Your resume mentions database engineering. How did you design database indexes for optimal query latency in your projects?",
      type: "RESUME_DERIVED",
      expectedKeywords: ["composite index", "explain plan", "b-tree", "full table scan", "cardinality"],
      idealStructure: "1. Query analysis using EXPLAIN ANALYZE. 2. Column selection by cardinality. 3. Trade-off between read speed and write overhead.",
      followUp: "When can an index actually harm database performance rather than help it?",
    });
  }

  // Fallback general questions if resume is minimal
  if (questions.length === 0) {
    questions.push({
      question: "[General Interview] Walk me through your primary programming language. How does its memory management or garbage collection work under the hood?",
      type: "GENERAL",
      expectedKeywords: ["stack", "heap", "garbage collection", "memory leak", "reference counting", "mark and sweep"],
      idealStructure: "1. Language runtime description. 2. Stack vs Heap memory allocation. 3. Garbage collection algorithm. 4. Common memory leak patterns.",
      followUp: "How would you diagnose a memory leak in a live production environment?",
    });
  }

  return questions;
}
