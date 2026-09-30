"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  Zap,
  HelpCircle,
} from "lucide-react";

interface DailyQuestion {
  id: string;
  order: number;
  questionText: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  topic?: string;
  subject?: string;
  options: Array<{
    id: string;
    optionKey: string;
    optionText: string;
    isCorrect?: boolean;
  }>;
  explanation?: string;
  concept?: string;
  shortcut?: string;
  commonMistake?: string;
}

interface DailyChallengeData {
  challenge: {
    id: string;
    date: string;
    title: string;
    totalQuestions: number;
  };
  isCompleted: boolean;
  attempt: {
    score: number;
    accuracy: number;
    correctCount: number;
    incorrectCount: number;
    timeSpentSeconds: number;
    completedAt: string;
  } | null;
  questions: DailyQuestion[];
}

function DailyCrackContent() {
  const [data, setData] = useState<DailyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Test State (if not completed)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchDailyChallenge = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/daily-crack");
      if (!res.ok) throw new Error("Failed to load daily challenge");
      const json = await res.json();
      setData(json);

      // If already completed and accuracy >= 75%, trigger confetti
      if (json.isCompleted && json.attempt?.accuracy >= 75) {
        import("canvas-confetti").then((confetti) => {
          confetti.default({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error("Error loading daily challenge:", err);
      setError(err.message || "Failed to load challenge.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  // Timer for active challenge
  useEffect(() => {
    if (!data || data.isCompleted) return;

    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  // Keyboard navigation
  useEffect(() => {
    if (!data || data.isCompleted || loading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentQ = data.questions[currentIndex];
      if (!currentQ) return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        const keyMap: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D" };
        setUserAnswers((prev) => ({ ...prev, [currentQ.id]: keyMap[e.key] }));
      } else if (["a", "b", "c", "d", "A", "B", "C", "D"].includes(e.key)) {
        setUserAnswers((prev) => ({ ...prev, [currentQ.id]: e.key.toUpperCase() }));
      } else if (e.key === "ArrowRight" || (e.key === "Enter" && !e.shiftKey)) {
        if (currentIndex < data.questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, currentIndex, loading]);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitChallenge = async () => {
    if (!data || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/daily-crack/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: data.challenge.id,
          answers: userAnswers,
          timeSpentSeconds: elapsedSeconds,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit challenge");
      }

      // Re-fetch to display full completed state with revealed answers
      await fetchDailyChallenge();
    } catch (err: any) {
      alert(err.message || "Failed to submit challenge");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-28 pb-16 animate-pulse space-y-6">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-44 bg-white rounded-3xl border border-slate-200" />
          <div className="h-96 bg-white rounded-3xl border border-slate-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-black text-slate-900">Daily Challenge Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <span>Back to Dashboard</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { challenge, isCompleted, attempt, questions } = data;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Daily Crack 10</span>
        </nav>

        {/* Challenge Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Streak Protected Challenge</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {challenge.title}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                10 curated questions across core syllabus subjects to protect your daily streak.
              </p>
            </div>

            {isCompleted ? (
              <div className="shrink-0 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed for Today</span>
              </div>
            ) : (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 text-xs font-extrabold font-mono">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  {Math.floor(elapsedSeconds / 60)}:
                  {(elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: COMPLETED SUMMARY & ANSWERS REVIEW */}
        {isCompleted && attempt && (
          <div className="space-y-8">
            {/* Score Ring Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {attempt.accuracy >= 75 ? "Mastery Achieved 🌟" : "Streak Alive 🔥"}
                </span>
                <h2 className="text-2xl font-black text-slate-900">Today&apos;s Results Summary</h2>
                <p className="text-xs text-slate-500">
                  You earned +3 Readiness Points and extended your preparation streak.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">{attempt.accuracy}%</div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-700">
                    {attempt.score > 0 ? `+${attempt.score}` : attempt.score}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-800">
                    {attempt.correctCount}/{challenge.totalQuestions}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Correct</div>
                </div>
              </div>
            </div>

            {/* Questions Review Stream */}
            <div className="space-y-5">
              <h3 className="text-lg font-black text-slate-900">Answer Key & Explanations</h3>

              {questions.map((q) => {
                const correctOpt = q.options.find((o) => o.isCorrect);

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        Q{q.order}
                      </span>
                      {q.topic && (
                        <span className="text-xs font-semibold text-slate-500">{q.topic}</span>
                      )}
                    </div>

                    <div className="text-sm sm:text-base font-bold text-slate-900">
                      {q.questionText}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
                            opt.isCorrect
                              ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center text-xs font-black">
                              {opt.optionKey}
                            </span>
                            <span>{opt.optionText}</span>
                          </div>
                          {opt.isCorrect && (
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Correct ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detailed Explanation</span>
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE QUESTION SOLVING INTERFACE */}
        {!isCompleted && currentQ && (
          <div className="space-y-6">
            {/* Progress Bar & Question Tabs */}
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-2">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{answeredCount} of {questions.length} Answered</span>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">
                  {currentQ.topic || "Core Syllabus"}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  +{currentQ.marks} / -{currentQ.negativeMarks}
                </span>
              </div>

              <div className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = userAnswers[currentQ.id] === opt.optionKey;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.optionKey)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 bg-white"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed pt-0.5">
                        {opt.optionText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav inside Card */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        idx === currentIndex
                          ? "bg-slate-900 text-white"
                          : userAnswers[q.id]
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitChallenge}
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Daily Crack"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function DailyCrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <DailyCrackContent />
    </Suspense>
  );
}
