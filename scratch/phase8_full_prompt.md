<USER_REQUEST>
# 🚀 CAREER CRACK 🌱 — PHASE 8

## Exam Intelligence, Adaptive Learning & Placement Preparation Ecosystem

You are continuing development of the existing **Career Crack 🌱** application.

Career Crack has already completed Phases 1–7.

The application currently contains:

* Authentication
* Onboarding
* Dashboard
* Exams
* Subjects
* Topics
* Questions
* Verified PYQs
* Practice Engine
* Learning Mode
* Test Mode
* Mistake Vault
* Progress Tracking
* Daily Crack
* Streaks
* Achievements
* XP and Levels
* Full-Length Mock Tests
* Mock Test Results
* AI Study Coach
* AI Performance Analysis
* AI Targeted Drills
* Advanced Profile
* Personal Records
* Leaderboard
* Bookmarks/Saved Questions

# 🚨 CRITICAL FIRST STEP

Before changing anything:

1. Inspect the entire existing repository.
2. Inspect `prisma/schema.prisma`.
3. Inspect existing API routes.
4. Inspect Phase 1–7 implementations.
5. Inspect current database records.
6. Inspect Practice Engine.
7. Inspect Mock Test Engine.
8. Inspect Mistake Vault.
9. Inspect AI Coach.
10. Inspect XP/Achievement systems.
11. Inspect Profile and Leaderboard.
12. Identify reusable components.
13. Identify duplicate functionality.
14. Determine what is already implemented.

**Do not assume that a feature is missing simply because it is mentioned in this prompt.**

If it already exists:

> EXTEND IT.

Do not create a duplicate.

---

# 🎯 PHASE 8 OBJECTIVE

Transform Career Crack into a system that can answer:

> **"Based on everything I have done so far, what is the smartest way for me to prepare for my target exam or placement?"**

Phase 8 should introduce:

### 🧠 Exam Intelligence

Understand exam structure, subjects, topics, difficulty and user performance.

### 🎯 Adaptive Learning

Continuously adjust what questions and topics the user receives.

### 📊 Advanced Readiness Analysis

Explain preparation status using actual performance.

### 🗺️ Career Preparation Roadmap

Show a structured path from current level to target exam/placement preparation.

### 💻 Placement Preparation

Technical + aptitude + interview preparation.

### 🎤 Interview Ecosystem

Technical, HR and project-based preparation.

### 🔄 Intelligent Revision

Spaced revision based on actual mistakes and performance.

---

# 🚨 DATA INTEGRITY

Never fabricate:

* exam statistics
* PYQs
* user scores
* readiness
* percentiles
* ranks
* difficulty
* exam patterns
* placement statistics
* company hiring claims
* interview outcomes

Use actual database data.

If official exam information is not available in the database, clearly mark information as:

`Not configured`

or

`User-provided`

Do not present invented information as official.

---

# 🧠 FEATURE 1 — EXAM INTELLIGENCE CENTER

Create:

`/exam-intelligence`

This should become the central preparation-analysis page.

Header:

# Exam Intelligence

Subtitle:

> Understand your exam. Understand your preparation. Know what to work on next.

---

# 🎯 TARGET EXAM SELECTOR

Allow the user to select one of their configured exams.

Display:

* Exam name
* Category
* Subjects
* Topics
* Question count information if configured
* Mock availability
* User's progress

Do not invent official exam details.

Only display fields available in the database.

---

# 📚 EXAM STRUCTURE

For the selected exam, display:

### Subjects

For each subject:

* Topic count
* Questions attempted
* Accuracy
* Mistakes
* Completion
* Current performance

Example:

```text
Quantitative Aptitude

Topics: 12
Attempted: 146
Accuracy: 68%
Mistakes: 31
Coverage: 74%
```

All values must come from actual records.

---

# 🗺️ FEATURE 2 — PREPARATION ROADMAP

Create:

`/roadmap`

The roadmap should visualize:

```text
START
  ↓
FOUNDATION
  ↓
TOPIC COVERAGE
  ↓
PRACTICE
  ↓
WEAKNESS REPAIR
  ↓
SECTIONAL TESTS
  ↓
FULL MOCKS
  ↓
REVISION
  ↓
EXAM READY
```

The user's current position must be determined from actual activity.

Do not simply mark stages as completed based on page visits.

---

# 🧭 ROADMAP STATES

Each stage can be:

### Locked

Prerequisites not yet completed.

### Active

Current recommended preparation stage.

### Completed

Evidence exists that the stage was completed.

### Needs Revision

Previously completed but current performance has deteriorated.

Use meaningful visual states.

---

# 🧠 FEATURE 3 — ADAPTIVE LEARNING ENGINE

Build a centralized recommendation engine.

Potential service:

`src/lib/adaptive-engine.ts`

The engine should determine the user's next learning activity.

Inputs:

* Target exam
* Subject
* Topic
* Historical accuracy
* Recent accuracy
* Mistakes
* Repeated mistakes
* Time spent
* Question difficulty
* Practice history
* Mock results
* Daily Crack
* AI Coach recommendations
* Revision history
* Question exposure

---

# 🎯 ADAPTIVE PRIORITY

Use a transparent priority system.

Example conceptual priority:

```text
Repeated Mistake
       ↓
Weak Topic
       ↓
Recently Declining Topic
       ↓
Insufficient Coverage
       ↓
Revision Due
       ↓
Balanced Practice
       ↓
Challenge
```

Do not blindly follow this exact ordering if existing data indicates another action is more appropriate.

The recommendation should be explainable.

---

# 💡 "WHY THIS QUESTION?" FEATURE

On adaptive questions show:

### Why this question?

Example:

> This topic has 48% accuracy across your last 25 attempts.

or:

> You previously answered a similar question incorrectly.

or:

> This topic has not been practiced recently.

Only display explanations supported by actual data.

---

# 🔄 FEATURE 4 — ADAPTIVE CRACK MODE

Create:

`/crack-mode`

This becomes the intelligent practice mode.

User selects:

* 5 questions
* 10 questions
* 20 questions

Optional:

* Quick
* Balanced
* Challenge

The system automatically selects questions.

---

# 🧠 QUESTION SELECTION

Prefer:

1. unresolved mistakes
2. weak topics
3. revision-due topics
4. insufficiently practiced topics
5. balanced questions

Avoid repeatedly serving the same questions.

Track exposure.

---

# 📊 ADAPTIVE SESSION RESULTS

After completion:

Show:

### Session Performance

Accuracy

### Improvement

Compared with previous related sessions.

### Topics

Improved / unchanged / needs work.

### Next Action

One clear recommendation.

---

# 📅 FEATURE 5 — INTELLIGENT REVISION CENTER

Create:

`/revision`

This should be different from the Mistake Vault.

Mistake Vault:

> What did I get wrong?

Revision Center:

> What should I revise now?

---

# 🔁 REVISION QUEUE

Generate a revision queue using:

* mistakes
* weak topics
* previously strong topics that declined
* topics not practiced recently
* previously reviewed material

Each item:

```text
Topic
Reason
Last practiced
Accuracy
Priority
```

---

# 🧠 SPACED REVISION

If enough historical data exists, use intervals such as:

```text
1 day
3 days
7 days
14 days
30 days
```

Do not pretend that a topic needs revision if there is insufficient evidence.

Allow:

**Review Now**

**Snooze**

**Mark Mastered**

Mastery must not permanently hide the topic if later performance declines.

---

# 📈 FEATURE 6 — TOPIC MASTERY ENGINE

Create a topic mastery indicator.

Possible states:

### New

Insufficient attempts.

### Learning

Initial practice underway.

### Developing

Moderate performance.

### Strong

Consistently good performance.

### Mastered

Strong performance over sufficient attempts and time.

### Needs Revision

Previously strong but recent performance has dropped.

---

# 🚨 MASTERY RULE

Do not mark a topic as mastered from only:

* one question
* one correct answer
* one practice session

Require sufficient evidence.

Use configurable thresholds.

Document the thresholds in code.

---

# 📊 FEATURE 7 — ADVANCED READINESS ANALYSIS

Create:

`/readiness`

Use existing readiness information where available.

Do not replace existing readiness calculations without first understanding them.

Display:

## Preparation Snapshot

* Readiness
* Coverage
* Accuracy
* Mock performance
* Consistency
* Mistake health
* Revision health

---

# 🎯 READINESS COMPONENTS

Possible components:

### Coverage

How much of the selected syllabus has actual activity?

### Accuracy

How accurately is the user solving questions?

### Consistency

How regularly is the user studying?

### Mock Performance

How is the user performing in full-length tests?

### Mistake Health

Are mistakes being reviewed and corrected?

### Revision Health

Are previously studied topics being revisited?

Every metric must use actual data.

---

# 📈 READINESS TREND

Show:

```text
Previous period
Current period
Change
```

Example:

> Recorded accuracy increased from 61% to 68%.

Do not use misleading language.

---

# 🧠 FEATURE 8 — "WHAT IS HOLDING ME BACK?"

Add a highly visible diagnostic card.

Example:

# What is holding you back?

1. Quantitative Aptitude — low recent accuracy
2. Time management — high average time
3. Repeated mistakes — 7 unresolved
4. Revision gap — 4 topics overdue

Each item should have:

**Fix This →**

which takes the user directly to the relevant action.

---

# 🎯 FEATURE 9 — ONE NEXT BEST ACTION

Create a global recommendation component:

`NextBestAction`

This should appear on:

* Dashboard
* Exam Intelligence
* Readiness
* Roadmap
* AI Coach

Example:

> **Your next best action**

> Review 6 unresolved Time & Work mistakes.

Button:

**Start Now →**

There must be only ONE primary action.

It should be calculated from actual user data.

---

# 💻 FEATURE 10 — PLACEMENT PREPARATION HUB

Create:

`/placements`

Career Crack should support placement preparation separately from government exams.

Sections:

### Aptitude

* Quantitative Aptitude
* Logical Reasoning
* Verbal Ability

### Technical

* DSA
* OOP
* DBMS
* Operating Systems
* Computer Networks
* Programming

### Interview

* Technical Interview
* HR Interview
* Project Interview

Only display subjects/topics that are actually configured.

---

# 🎯 PLACEMENT READINESS

Create a placement preparation overview.

Example:

```text
Aptitude       72%
DSA            61%
Core CS        67%
Interview      Not enough data
```

Do not fabricate interview scores if no interview sessions exist.

---

# 🧑💻 FEATURE 11 — TECHNICAL INTERVIEW SIMULATOR

Extend the Phase 6 interview functionality if it already exists.

Create:

`/interview/technical`

Modes:

### DSA

### Programming

### DBMS

### OS

### Computer Networks

### OOP

The user selects:

* Beginner
* Intermediate
* Advanced

Then the system asks questions.

---

# 🎤 INTERVIEW EVALUATION

Evaluate the user's answer using:

* relevance
* correctness where objectively checkable
* explanation quality
* completeness
* structure

Do not claim:

> "You will get selected."

Instead provide:

### Strong Points

### Missing Points

### Suggested Answer Structure

### Follow-Up Question

---

# 📁 FEATURE 12 — PROJECT INTERVIEW MODE

Create:

`/interview/project`

Allow the user to enter:

* Project name
* Project description
* Technologies
* Their role
* Challenges
* Results

Then generate interview questions based ONLY on the information provided.

Example:

> Explain why you selected this architecture.

> What was the hardest technical problem?

> How would you improve the system?

Do not invent project details.

---

# 📄 FEATURE 13 — RESUME-BASED INTERVIEW

If a resume upload system already exists, integrate with it.

If it does not exist:

Create an optional resume upload area.

Supported:

* PDF
* DOCX

Extract relevant information server-side.

Do not permanently store the resume unless the user explicitly chooses to save it.

Do not expose uploaded resume content publicly.

---

# 🧠 RESUME INTERVIEW

Generate interview questions based on actual resume content.

Categories:

* Projects
* Skills
* Education
* Experience
* Certifications

Clearly distinguish:

**Resume-derived question**

from

**General interview question**

---

# 🎤 FEATURE 14 — INTERVIEW SESSION REPORT

After interview completion:

Show:

### Interview Summary

Questions answered

### Strong Areas

### Improvement Areas

### Technical Concepts to Revise

### Communication Suggestions

### Follow-Up Practice

Link recommendations back to:

* Practice
* Topics
* AI Coach
* Revision Center

---

# 🔗 FEATURE 15 — CONNECT EVERYTHING

This is extremely important.

Career Crack should stop feeling like separate pages.

Create a connected learning loop:

```text
Practice
   ↓
Mistake
   ↓
Mistake Vault
   ↓
Revision
   ↓
Adaptive Practice
   ↓
Sectional Test
   ↓
Mock Test
   ↓
Performance Analysis
   ↓
AI Coach
   ↓
Next Best Action
   ↓
Practice
```

For placements:

```text
Aptitude
   ↓
Technical Practice
   ↓
DSA
   ↓
Project Interview
   ↓
Technical Interview
   ↓
AI Feedback
   ↓
Revision
   ↓
Retry
```

---

# 🤖 FEATURE 16 — AI COACH PHASE 8 INTEGRATION

Extend the existing AI Coach.

Do not create a new AI assistant.

The AI Coach should now understand:

* adaptive recommendations
* revision queue
* topic mastery
* readiness
* roadmap stage
* XP
* achievements
* mock performance
* interview progress
* placement preparation

Possible questions:

> "Why is Time & Work my priority?"

> "What should I revise today?"

> "Which subjects have I neglected?"

> "How did my mock performance change?"

> "Prepare me for a DBMS interview."

> "Ask me questions based on my project."

All responses must be grounded in actual available data.

---

# 🗺️ FEATURE 17 — PERSONALIZED CAREER ROADMAP

Enhance `/roadmap`.

For government-exam preparation:

```text
Target Exam
     ↓
Syllabus Coverage
     ↓
Topic Mastery
     ↓
Practice
     ↓
Revision
     ↓
Sectional Tests
     ↓
Mock Tests
     ↓
Final Revision
```

For placements:

```text
Aptitude
     ↓
Programming
     ↓
DSA
     ↓
Core CS
     ↓
Projects
     ↓
Interview
```

The user can switch:

**Government Exams**

or

**Placements**

---

# 📊 FEATURE 18 — COMPARATIVE PERSONAL ANALYTICS

Allow comparisons only against the user's own history.

Examples:

### This Week vs Last Week

### This Month vs Previous Month

### Current Mock vs Previous Mock

### Current Topic Accuracy vs Previous Topic Accuracy

Avoid unnecessary public comparisons.

The goal is to show personal growth.

---

# 🧠 FEATURE 19 — SMART QUESTION EXPOSURE

Track how often a question has been shown.

Potential fields if required:

```text
QuestionExposure
- id
- userId
- questionId
- timesShown
- timesAnswered
- lastShownAt
- lastAnsweredAt
- lastResult
```

Use this to reduce excessive repetition.

Do not create this model if equivalent tracking already exists.

---

# 🧪 FEATURE 20 — DATA-DRIVEN QUESTION DIFFICULTY

Use existing question difficulty where available.

Do NOT dynamically change official difficulty labels unless there is a clear documented system.

If adaptive difficulty is introduced:

Store it separately.

For example:

```text
question difficulty = MEDIUM
adaptive challenge level = HIGH
```

Do not overwrite source metadata.

--

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-24T21:51:34+05:30.

The user's current state is as follows:
Active Document: c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\src\app\api\ai\coach\generate-drill\route.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 1
Other open documents:
- c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\src\components\dashboard\RecentActivity.tsx (LANGUAGE_TSX)
- c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\scratch\test_mock_api.js (LANGUAGE_JAVASCRIPT)
- c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\prisma\seed-mock-tests.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\src\app\api\practice\sessions\route.ts (LANGUAGE_TYPESCRIPT)
- c:\Users\ADMIN\OneDrive\Pictures\Desktop\carrer crack\src\app\api\subjects\route.ts (LANGUAGE_TYPESCRIPT)
</ADDITIONAL_METADATA>