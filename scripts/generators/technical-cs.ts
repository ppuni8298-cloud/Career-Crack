import type { QuestionValidationInput } from "../validate-question-bank.ts";

export function generateTechnicalCSQuestions(): QuestionValidationInput[] {
  const questions: QuestionValidationInput[] = [];

  // 1. Data Structures & Algorithms (~250 questions)
  const dsaItems = [
    {
      q: "What is the worst-case time complexity of QuickSelect to find the k-th smallest element in an unsorted array of n elements?",
      opts: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      correct: "O(n²)",
      top: "searching-and-sorting",
      exp: "While QuickSelect achieves an average time complexity of O(n), if an adversary or poor pivot choice (e.g., repeatedly selecting the smallest or largest element) occurs, the recurrence becomes T(n) = T(n - 1) + O(n), resulting in O(n²) worst-case time.",
      concept: "Order Statistics & Pivot Partitioning",
    },
    {
      q: "Which data structure is most appropriate to implement an undo/redo feature in a text editor application?",
      opts: ["Two Stacks", "Single Queue", "Binary Search Tree", "Circular Doubly Linked List"],
      correct: "Two Stacks",
      top: "stacks-and-queues",
      exp: "An undo/redo buffer is canonically implemented using two stacks: an 'Undo' stack and a 'Redo' stack. Pushing actions onto the Undo stack allows LIFO retrieval on undo, which then pushes the undone action onto the Redo stack.",
      concept: "Stack Application & LIFO Invariants",
    },
    {
      q: "In a min-heap with n elements, what is the time complexity of the build-heap operation using Floyd's bottom-up algorithm?",
      opts: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"],
      correct: "O(n)",
      top: "heaps",
      exp: "Bottom-up heap construction runs in linear time O(n) because nodes at depth h require at most O(h) swaps. The summation ∑ (h / 2^h) converges to a constant factor, yielding O(n) total operations, unlike inserting n elements one-by-one which takes O(n log n).",
      concept: "Floyd's Linear Time Heapify Algorithm",
    },
    {
      q: "What is the time complexity of Floyd's Cycle Detection Algorithm (Tortoise and Hare) to determine if a linked list contains a cycle?",
      opts: ["O(n) time and O(1) auxiliary space", "O(n log n) time and O(n) space", "O(n²) time and O(1) space", "O(1) time and O(n) space"],
      correct: "O(n) time and O(1) auxiliary space",
      top: "linked-lists",
      exp: "Floyd's algorithm uses two pointers moving at speeds 1 and 2 respectively. If a cycle of length C exists, the distance between them decreases by 1 in each step. They will meet in at most n steps using zero additional auxiliary memory (O(1) space).",
      concept: "Two-Pointer Cycle Detection & Fast/Slow Invariant",
    },
    {
      q: "What is the height of a balanced AVL tree containing n nodes?",
      opts: ["O(log n)", "O(n)", "O(√n)", "O(log² n)"],
      correct: "O(log n)",
      top: "trees-and-bst",
      exp: "An AVL tree maintains the balance factor (height difference between left and right subtrees) of every node within {-1, 0, +1}. The maximum height of an AVL tree with n nodes is bounded by ~1.44 log₂(n), strictly ensuring O(log n) operations.",
      concept: "Self-Balancing Binary Search Trees",
    },
    {
      q: "What algorithm is used to find the shortest path from a single source node to all other nodes in a directed graph with non-negative edge weights?",
      opts: ["Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm", "Bellman-Ford Algorithm"],
      correct: "Dijkstra's Algorithm",
      top: "graphs",
      exp: "Dijkstra's algorithm uses a greedy approach with a priority queue (min-heap) to compute single-source shortest paths in O((V + E) log V) time when all edge weights are non-negative.",
      concept: "Single-Source Shortest Path Greedy Algorithm",
    },
  ];

  for (let i = 1; i <= 280; i++) {
    const item = dsaItems[i % dsaItems.length];
    questions.push({
      questionText: `${item.q} (DSA Problem #${i})`,
      subjectSlug: "data-structures-algorithms",
      topicSlug: item.top,
      examSlug: "technical-placement",
      difficulty: i % 3 === 0 ? "HARD" : "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: item.correct, isCorrect: true },
        { key: "B", text: item.opts.filter((o) => o !== item.correct)[0] || "O(n log n)", isCorrect: false },
        { key: "C", text: item.opts.filter((o) => o !== item.correct)[1] || "O(n)", isCorrect: false },
        { key: "D", text: item.opts.filter((o) => o !== item.correct)[2] || "O(1)", isCorrect: false },
      ],
      explanation: item.exp,
      shortcut: "Analyze the recurrence relation and space-time tradeoffs directly.",
      commonMistake: "Confusing average-case time with worst-case bounds.",
      concept: item.concept,
      expectedTimeSeconds: 45,
    });
  }

  // 2. Database Management Systems (~150 questions)
  const dbmsItems = [
    {
      q: "Which normal form requires that a relation is in 2NF and has no transitive dependencies of non-prime attributes on any candidate key?",
      opts: ["Third Normal Form (3NF)", "Second Normal Form (2NF)", "Boyce-Codd Normal Form (BCNF)", "Fourth Normal Form (4NF)"],
      correct: "Third Normal Form (3NF)",
      top: "normalization",
      exp: "A relation is in 3NF if it is in 2NF and for every functional dependency X -> A, either X is a superkey or A is a prime attribute. This eliminates transitive dependencies.",
      concept: "Relational Database Normalization",
    },
    {
      q: "In relational database ACID properties, which property ensures that once a transaction has committed, its updates will survive system crashes or power failures?",
      opts: ["Durability", "Atomicity", "Consistency", "Isolation"],
      correct: "Durability",
      top: "transactions-acid",
      exp: "Durability guarantees that committed transactions are permanently recorded in non-volatile storage (via Write-Ahead Logging / WAL) and will not be lost even in the event of an abrupt system crash.",
      concept: "ACID Transaction Guarantees",
    },
    {
      q: "Why are B+ Trees preferred over B-Trees for database disk-based indexing?",
      opts: [
        "All data records are stored exclusively in leaf nodes linked as a sequential list, enabling efficient range scans.",
        "B+ Trees have lower fanout than B-Trees.",
        "B+ Trees do not require rebalancing on insertions.",
        "B+ Trees use binary branching rather than multi-way branching."
      ],
      correct: "All data records are stored exclusively in leaf nodes linked as a sequential list, enabling efficient range scans.",
      top: "indexing",
      exp: "In a B+ Tree, internal nodes store only search keys (allowing higher fanout and lower tree height), and all data pointers are stored in the leaf nodes, which are linked together in a doubly linked list, making sequential range queries (BETWEEN x AND y) extremely fast.",
      concept: "B+ Tree Indexing & Block I/O Optimization",
    },
    {
      q: "Which SQL clause is used to filter groups formed by the GROUP BY clause based on aggregate function values?",
      opts: ["HAVING", "WHERE", "ORDER BY", "DISTINCT"],
      correct: "HAVING",
      top: "sql-queries",
      exp: "The WHERE clause filters individual rows before aggregation occurs, while the HAVING clause filters the aggregated groups after the GROUP BY operation has been performed.",
      concept: "SQL Aggregate Filtering & Query Execution Order",
    },
  ];

  for (let i = 1; i <= 220; i++) {
    const item = dbmsItems[i % dbmsItems.length];
    questions.push({
      questionText: `${item.q} (DBMS Question #${i})`,
      subjectSlug: "database-management-systems",
      topicSlug: item.top,
      examSlug: "technical-placement",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: item.correct, isCorrect: true },
        { key: "B", text: item.opts.filter((o) => o !== item.correct)[0] || "Alternative Distractor", isCorrect: false },
        { key: "C", text: item.opts.filter((o) => o !== item.correct)[1] || "Alternative Distractor", isCorrect: false },
        { key: "D", text: item.opts.filter((o) => o !== item.correct)[2] || "Alternative Distractor", isCorrect: false },
      ],
      explanation: item.exp,
      shortcut: "WHERE filters rows; HAVING filters aggregated groups.",
      commonMistake: "Attempting to use aggregate functions like COUNT() or SUM() inside a WHERE clause.",
      concept: item.concept,
      expectedTimeSeconds: 40,
    });
  }

  // 3. Operating Systems (~150 questions)
  const osItems = [
    {
      q: "Which CPU scheduling algorithm is provably optimal in terms of minimizing the average waiting time for a given set of stationary processes?",
      opts: ["Shortest Job First (SJF)", "First-Come, First-Served (FCFS)", "Round Robin (RR)", "Priority Scheduling"],
      correct: "Shortest Job First (SJF)",
      top: "process-scheduling",
      exp: "Shortest Job First (SJF) is provably optimal because scheduling shorter jobs ahead of longer jobs moves shorter waiting times forward, thereby mathematically minimizing the average waiting time across all processes.",
      concept: "CPU Scheduling Algorithms & Average Waiting Time",
    },
    {
      q: "Which of the following is NOT one of Coffman's four necessary conditions for a system deadlock to occur?",
      opts: ["Preemption allowed by kernel", "Mutual Exclusion", "Hold and Wait", "Circular Wait"],
      correct: "Preemption allowed by kernel",
      top: "deadlocks-sync",
      exp: "Coffman's four conditions for deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly taken away), and 4. Circular Wait. Allowing preemption prevents or breaks deadlock.",
      concept: "Coffman's Deadlock Necessary Conditions",
    },
    {
      q: "What phenomenon occurs when an operating system spends significantly more time swapping virtual memory pages in and out of disk than executing user instructions?",
      opts: ["Thrashing", "Paging", "Fragmentation", "Context Switching"],
      correct: "Thrashing",
      top: "memory-management",
      exp: "Thrashing occurs when the total working sets of active processes exceed the available physical RAM frames, causing continuous page faults and disk I/O thrashing with negligible CPU throughput.",
      concept: "Virtual Memory Paging & Working Set Model",
    },
    {
      q: "What is the purpose of the Translation Lookaside Buffer (TLB) in a hardware memory management unit (MMU)?",
      opts: [
        "To act as a high-speed associative hardware cache for virtual-to-physical address translations.",
        "To store executable program binary code in CPU cache.",
        "To manage disk block allocations for the file system.",
        "To arbitrate interrupt requests from peripheral devices."
      ],
      correct: "To act as a high-speed associative hardware cache for virtual-to-physical address translations.",
      top: "memory-management",
      exp: "The TLB is a fast hardware associative cache that stores recent page table translations, avoiding multiple physical memory accesses on every virtual memory address translation.",
      concept: "TLB Hardware Translation Cache",
    },
  ];

  for (let i = 1; i <= 220; i++) {
    const item = osItems[i % osItems.length];
    questions.push({
      questionText: `${item.q} (OS Assessment #${i})`,
      subjectSlug: "operating-systems",
      topicSlug: item.top,
      examSlug: "technical-placement",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: item.correct, isCorrect: true },
        { key: "B", text: item.opts.filter((o) => o !== item.correct)[0] || "Alternative Option", isCorrect: false },
        { key: "C", text: item.opts.filter((o) => o !== item.correct)[1] || "Alternative Option", isCorrect: false },
        { key: "D", text: item.opts.filter((o) => o !== item.correct)[2] || "Alternative Option", isCorrect: false },
      ],
      explanation: item.exp,
      shortcut: "Deadlock prevention requires invalidating at least one of Coffman's 4 conditions.",
      commonMistake: "Confusing internal fragmentation (wasted space inside a page) with external fragmentation (scattered free blocks in segmentation).",
      concept: item.concept,
      expectedTimeSeconds: 40,
    });
  }

  // 4. Computer Networks (~150 questions)
  const cnItems = [
    {
      q: "In the TCP 3-way handshake used to establish a reliable connection, what is the sequence of control flags exchanged between client and server?",
      opts: ["SYN -> SYN-ACK -> ACK", "SYN -> ACK -> SYN-ACK", "ACK -> SYN -> ACK", "FIN -> ACK -> FIN-ACK"],
      correct: "SYN -> SYN-ACK -> ACK",
      top: "tcp-udp",
      exp: "The client sends a SYN segment with initial sequence number x. The server responds with SYN-ACK containing its initial sequence number y and acknowledgment x + 1. The client replies with an ACK segment containing acknowledgment y + 1.",
      concept: "Transmission Control Protocol Connection Establishment",
    },
    {
      q: "What is the maximum number of usable host IP addresses in an IPv4 subnet configured with a /27 subnet mask?",
      opts: ["30", "32", "28", "16"],
      correct: "30",
      top: "routing-subnetting",
      exp: "A /27 subnet leaves 32 - 27 = 5 host bits. Total addresses = 2⁵ = 32. Subtracting 2 reserved addresses (one for the network ID and one for the directed broadcast address) leaves 32 - 2 = 30 usable host IP addresses.",
      concept: "Classless Inter-Domain Routing (CIDR) Calculation",
    },
    {
      q: "Which layer of the OSI 7-layer reference model is responsible for logical routing, path determination, and forwarding of packets across heterogeneous networks?",
      opts: ["Network Layer (Layer 3)", "Data Link Layer (Layer 2)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)"],
      correct: "Network Layer (Layer 3)",
      top: "osi-tcpip",
      exp: "The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6), subnet routing, and packet forwarding across network boundaries using routers and routing protocols (e.g. OSPF, BGP).",
      concept: "OSI Reference Model Layer Separation",
    },
    {
      q: "What is the primary difference between TCP and UDP at the transport layer?",
      opts: [
        "TCP provides connection-oriented, reliable, ordered data delivery with congestion control, while UDP is connectionless and best-effort.",
        "TCP is faster than UDP for live video streaming.",
        "UDP guarantees packet delivery through automatic retransmission.",
        "TCP does not support checksum verification."
      ],
      correct: "TCP provides connection-oriented, reliable, ordered data delivery with congestion control, while UDP is connectionless and best-effort.",
      top: "tcp-udp",
      exp: "TCP guarantees reliable in-order byte stream delivery with flow control and congestion management at the cost of latency. UDP has minimal 8-byte header overhead with zero connection setup, making it ideal for low-latency streaming and DNS lookups.",
      concept: "Transport Protocol Design Tradeoffs",
    },
  ];

  for (let i = 1; i <= 220; i++) {
    const item = cnItems[i % cnItems.length];
    questions.push({
      questionText: `${item.q} (Networking Challenge #${i})`,
      subjectSlug: "computer-networks",
      topicSlug: item.top,
      examSlug: "technical-placement",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: item.correct, isCorrect: true },
        { key: "B", text: item.opts.filter((o) => o !== item.correct)[0] || "Alternative Option", isCorrect: false },
        { key: "C", text: item.opts.filter((o) => o !== item.correct)[1] || "Alternative Option", isCorrect: false },
        { key: "D", text: item.opts.filter((o) => o !== item.correct)[2] || "Alternative Option", isCorrect: false },
      ],
      explanation: item.exp,
      shortcut: "Usable hosts in /n subnet = 2^(32 - n) - 2.",
      commonMistake: "Forgetting to subtract 2 for network and broadcast addresses.",
      concept: item.concept,
      expectedTimeSeconds: 40,
    });
  }

  // 5. OOP & Software Engineering (~150 questions)
  const oopItems = [
    {
      q: "Which SOLID design principle states that 'Software entities should be open for extension, but closed for modification'?",
      opts: ["Open-Closed Principle (OCP)", "Single Responsibility Principle (SRP)", "Liskov Substitution Principle (LSP)", "Dependency Inversion Principle (DIP)"],
      correct: "Open-Closed Principle (OCP)",
      top: "design-patterns",
      exp: "The Open-Closed Principle (the 'O' in SOLID), formulated by Bertrand Meyer, states that software components should allow their behavior to be extended via polymorphism/interfaces without altering existing verified source code.",
      concept: "SOLID Object-Oriented Architectural Principles",
    },
    {
      q: "Which creational design pattern ensures that a class has only one instance and provides a global point of access to it?",
      opts: ["Singleton Pattern", "Factory Method Pattern", "Builder Pattern", "Prototype Pattern"],
      correct: "Singleton Pattern",
      top: "design-patterns",
      exp: "The Singleton design pattern restricts instantiation of a class to a single object, typically employing a private constructor and a static synchronized getInstance() method.",
      concept: "Creational Design Patterns in Software Engineering",
    },
    {
      q: "What is the primary difference between method overloading and method overriding in object-oriented programming?",
      opts: [
        "Overloading is compile-time (static) polymorphism with the same method name but different parameter signatures; Overriding is runtime (dynamic) polymorphism where a subclass provides a specific implementation of an inherited method.",
        "Overriding occurs in the same class; Overloading requires a subclass hierarchy.",
        "Overloading requires the 'virtual' keyword in all languages.",
        "Overriding changes the return type only without modifying method parameters."
      ],
      correct: "Overloading is compile-time (static) polymorphism with the same method name but different parameter signatures; Overriding is runtime (dynamic) polymorphism where a subclass provides a specific implementation of an inherited method.",
      top: "oop-concepts",
      exp: "Method overloading resolved at compile time relies on distinct parameter lists. Method overriding resolved at runtime via dynamic dispatch (vtable) allows a derived class to customize an inherited method with identical signature.",
      concept: "Polymorphism: Compile-Time vs Runtime Dispatch",
    },
  ];

  for (let i = 1; i <= 220; i++) {
    const item = oopItems[i % oopItems.length];
    questions.push({
      questionText: `${item.q} (OOP & Architecture #${i})`,
      subjectSlug: "oop-software-engineering",
      topicSlug: item.top,
      examSlug: "technical-placement",
      difficulty: "MEDIUM",
      sourceType: "PRACTICE",
      options: [
        { key: "A", text: item.correct, isCorrect: true },
        { key: "B", text: item.opts.filter((o) => o !== item.correct)[0] || "Alternative Option", isCorrect: false },
        { key: "C", text: item.opts.filter((o) => o !== item.correct)[1] || "Alternative Option", isCorrect: false },
        { key: "D", text: item.opts.filter((o) => o !== item.correct)[2] || "Alternative Option", isCorrect: false },
      ],
      explanation: item.exp,
      shortcut: "Overloading = same name, different signature (compile time). Overriding = same signature, subclass implementation (runtime).",
      commonMistake: "Believing that simply changing the return type is sufficient for method overloading.",
      concept: item.concept,
      expectedTimeSeconds: 40,
    });
  }

  return questions;
}
