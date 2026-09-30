import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Ensuring all subjects and topics for Phase 9 exist...");

  const subjectsToEnsure = [
    {
      name: "Operating Systems",
      slug: "operating-systems",
      category: "TECHNICAL",
      icon: "💻",
      description: "Processes, Memory Management, CPU Scheduling, Synchronization, and File Systems",
      topics: [
        { name: "Process Management & CPU Scheduling", slug: "process-scheduling", description: "Processes, threads, context switching, FCFS, Round Robin, SJF" },
        { name: "Memory Management & Virtual Memory", slug: "memory-management", description: "Paging, segmentation, TLB, page fault, LRU, FIFO page replacement" },
        { name: "Concurrency, Deadlocks & Synchronization", slug: "deadlocks-sync", description: "Deadlocks, Banker's algorithm, semaphores, mutex, critical section" },
        { name: "File Systems & I/O Systems", slug: "file-systems-io", description: "Disk scheduling (SCAN, C-SCAN), file allocation tables, inodes" },
        { name: "Operating Systems Fundamentals", slug: "os-general", description: "System calls, kernel vs user mode, interrupts" },
      ],
    },
    {
      name: "Computer Networks",
      slug: "computer-networks",
      category: "TECHNICAL",
      icon: "🌐",
      description: "OSI & TCP/IP Model, Subnetting, Routing, Transport Protocols, and Network Security",
      topics: [
        { name: "OSI & TCP/IP Layer Architecture", slug: "osi-tcpip", description: "Layers, functions, protocols, encapsulation, PDU" },
        { name: "IP Addressing, Subnetting & CIDR", slug: "routing-subnetting", description: "IPv4/IPv6 addressing, subnet masks, CIDR notation, routing algorithms" },
        { name: "Transport Layer Protocols (TCP & UDP)", slug: "tcp-udp", description: "3-way handshake, flow control, congestion control, windowing, UDP checksum" },
        { name: "Application Protocols & Security", slug: "network-security", description: "DNS, HTTP/HTTPS, SSL/TLS, FTP, SMTP, firewalls" },
        { name: "Computer Networks Fundamentals", slug: "networks-general", description: "Bandwidth, latency, topologies, CSMA/CD, MAC addressing" },
      ],
    },
    {
      name: "Object-Oriented Programming & Software Engineering",
      slug: "oop-software-engineering",
      category: "TECHNICAL",
      icon: "⚙️",
      description: "OOP Principles, SOLID, Design Patterns, SDLC, Testing and Clean Code",
      topics: [
        { name: "OOP Principles & Fundamentals", slug: "oop-concepts", description: "Inheritance, Polymorphism, Encapsulation, Abstraction, Interfaces" },
        { name: "Design Patterns & SOLID Principles", slug: "design-patterns", description: "Singleton, Factory, Observer, Strategy, SOLID design guidelines" },
        { name: "Software Engineering & SDLC", slug: "sdlc-testing", description: "Agile, Waterfall, Unit Testing, Integration Testing, CI/CD" },
        { name: "Programming Languages & Runtime", slug: "programming-languages", description: "Memory management, garbage collection, compilers, interpreters" },
      ],
    },
  ];

  // Additional topics for existing subjects to guarantee broad coverage
  const additionalTopicsForExistingSubjects: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    "quantitative-aptitude": [
      { name: "HCF & LCM", slug: "hcf-lcm", description: "Highest Common Factor, Least Common Multiple and applications" },
      { name: "Ratio, Proportion & Variation", slug: "ratio-and-proportion", description: "Direct and inverse proportions, compound ratio" },
      { name: "Averages & Mixtures", slug: "average", description: "Weighted averages, alligation and mixtures" },
      { name: "Time, Speed & Distance", slug: "time-speed-distance", description: "Relative speed, trains, boats and streams" },
      { name: "Simple & Compound Interest", slug: "simple-compound-interest", description: "Annual and half-yearly compounding, difference between CI and SI" },
      { name: "Geometry & Coordinate Geometry", slug: "geometry", description: "Triangles, circles, quadrilaterals, tangents, angles" },
      { name: "Mensuration 2D & 3D", slug: "mensuration", description: "Perimeter, area, surface area, volume of prisms, cones, spheres" },
      { name: "Data Interpretation", slug: "data-interpretation", description: "Bar graphs, pie charts, line graphs, tables" },
      { name: "Probability & Combinatorics", slug: "probability-combinatorics", description: "Permutations, combinations, independent and conditional probability" },
    ],
    "logical-reasoning": [
      { name: "Analogy & Classification", slug: "analogy-classification", description: "Word, letter, number analogies and odd-one-out" },
      { name: "Seating Arrangement & Puzzles", slug: "seating-arrangement", description: "Linear, circular, square seating and multi-variable puzzles" },
      { name: "Venn Diagrams", slug: "venn-diagrams", description: "Logical Venn diagrams, set representation and intersections" },
      { name: "Statement & Conclusions / Assumptions", slug: "statement-conclusion", description: "Critical reasoning, course of action, strong and weak arguments" },
    ],
    "english-comprehension": [
      { name: "Sentence Correction & Improvement", slug: "sentence-correction", description: "Subject-verb agreement, modifiers, parallelism, tense errors" },
      { name: "Reading Comprehension & Cloze Test", slug: "reading-comprehension", description: "Passage inference, central theme, cloze blank completion" },
      { name: "Para Jumbles & Sentence Rearrangement", slug: "para-jumbles", description: "Coherent paragraph ordering and sentence structuring" },
    ],
    "general-awareness": [
      { name: "Ancient & Medieval Indian History", slug: "ancient-medieval-history", description: "Indus Valley, Maurya, Gupta, Delhi Sultanate, Mughal Empire" },
      { name: "Indian & World Geography", slug: "geography", description: "Rivers, mountains, climate zones, minerals, physical geography" },
      { name: "Indian Economy & Financial System", slug: "indian-economy", description: "Monetary policy, RBI, fiscal deficit, GDP, inflation, banking" },
      { name: "Environmental Ecology & Biodiversity", slug: "environment-ecology", description: "National parks, wildlife sanctuaries, climate treaties, ecosystems" },
      { name: "Static General Knowledge", slug: "static-gk", description: "Headquarters, awards, dance forms, festivals, international organizations" },
    ],
    "data-structures-algorithms": [
      { name: "Linked Lists & Pointers", slug: "linked-lists", description: "Singly, doubly, circular linked lists, cycle detection" },
      { name: "Trees & Binary Search Trees", slug: "trees-and-bst", description: "Binary trees, traversals, BST properties, AVL, LCA" },
      { name: "Heaps & Priority Queues", slug: "heaps", description: "Min-heap, max-heap, heap sort, top-k elements" },
      { name: "Graph Algorithms & Traversals", slug: "graphs", description: "BFS, DFS, Dijkstra, topological sort, minimum spanning tree" },
      { name: "Searching & Sorting", slug: "searching-and-sorting", description: "Binary search, quicksort, mergesort, time complexities" },
      { name: "Dynamic Programming & Recursion", slug: "dynamic-programming", description: "0/1 Knapsack, LCS, LIS, memoization, tabulation" },
    ],
    "database-management-systems": [
      { name: "Transactions, Concurrency & ACID", slug: "transactions-acid", description: "ACID properties, serializability, 2PL, isolation levels" },
      { name: "Indexing, B-Trees & Query Optimization", slug: "indexing", description: "B-Trees, B+ Trees, clustered vs non-clustered indexes, execution plans" },
    ],
  };

  // Upsert subjects
  for (const s of subjectsToEnsure) {
    let subject = await prisma.subject.findUnique({ where: { slug: s.slug } });
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: s.name,
          slug: s.slug,
          category: s.category,
          icon: s.icon,
          description: s.description,
        },
      });
      console.log(`Created subject: ${s.name}`);
    }

    for (const t of s.topics) {
      const existingTopic = await prisma.topic.findUnique({
        where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
      });
      if (!existingTopic) {
        await prisma.topic.create({
          data: {
            subjectId: subject.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
          },
        });
        console.log(`   + Topic: ${t.name}`);
      }
    }
  }

  // Add additional topics to existing subjects
  for (const [subSlug, topics] of Object.entries(additionalTopicsForExistingSubjects)) {
    const subject = await prisma.subject.findUnique({ where: { slug: subSlug } });
    if (subject) {
      for (const t of topics) {
        const existingTopic = await prisma.topic.findUnique({
          where: { subjectId_slug: { subjectId: subject.id, slug: t.slug } },
        });
        if (!existingTopic) {
          await prisma.topic.create({
            data: {
              subjectId: subject.id,
              name: t.name,
              slug: t.slug,
              description: t.description,
            },
          });
          console.log(`   + [${subSlug}] Topic: ${t.name}`);
        }
      }
    }
  }

  // Link newly created technical subjects to "technical-placement" exam
  const techExam = await prisma.exam.findUnique({ where: { slug: "technical-placement" } });
  if (techExam) {
    const techSubjectSlugs = ["operating-systems", "computer-networks", "oop-software-engineering"];
    for (const slug of techSubjectSlugs) {
      const sub = await prisma.subject.findUnique({ where: { slug } });
      if (sub) {
        const link = await prisma.examSubject.findUnique({
          where: { examId_subjectId: { examId: techExam.id, subjectId: sub.id } },
        });
        if (!link) {
          await prisma.examSubject.create({
            data: { examId: techExam.id, subjectId: sub.id, order: 10 },
          });
          console.log(`Linked ${techExam.name} -> ${sub.name}`);
        }
      }
    }
  }

  console.log("Subjects and topics structure successfully verified and up to date!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
