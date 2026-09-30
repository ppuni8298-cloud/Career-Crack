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

### 🗺️ Care
<truncated 13083 bytes>
ATURE 18 — COMPARATIVE PERSONAL ANALYTICS

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