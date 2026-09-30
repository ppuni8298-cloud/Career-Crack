"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  X,
  Layers,
  HelpCircle,
} from "lucide-react";

interface Option {
  id: string;
  key: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

interface QuestionReview {
  id: string;
  questionOrder: number;
  sectionId: string;
  sectionTitle: string;
  topicName: string;
  text: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  marksEarned: number;
  userSelectedKey: string | null;
  correctKey: string;
  status: "CORRECT" | "INCORRECT" | "SKIPPED";
  options: Option[];
  explanation: string;
  concept?: string;
  shortcut?: string;
  commonMistake?: string;
}

interface SectionBreakdown {
  sectionId: string;
  title: string;
  subjectName: string;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  marksObtained: number;
  maxMarks: number;
  accuracy: number;
  timeSpentSeconds: number;
}

interface AttemptResults {
  id: string;
  status: string;
  score: number;
  totalMarks: number;
  passingMarks?: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  mockTest: {
    id: string;
    title: string;
    slug: string;
    mockType: string;
    difficulty: string;
    exam: {
      id: string;
      name: string;
      slug: string;
      category: string;
      organization?: string;
      logo?: string;
    };
  };
  sectionsBreakdown: SectionBreakdown[];
  questions: QuestionReview[];
}

export default function MockTestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [results, setResults] = useState<AttemptResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "INCORRECT" | "CORRECT" | "SKIPPED">("ALL");
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mock-tests/attempts/${id}/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.attempt);
        // Expand first 3 questions by default
        const initialExpand: Record<string, boolean> = {};
        data.attempt.questions.slice(0, 3).forEach((q: QuestionReview) => {
          initialExpand[q.id] = true;
        });
        setExpandedSolutions(initialExpand);
      } else {
        router.push("/mock-tests");
      }
    } catch (err) {
      console.error("Failed to load results:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center pt-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-semibold">Generating In-Depth Performance Analytics...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Results Not Found</h2>
          <Link href="/mock-tests" className="mt-4 inline-block text-emerald-600 font-semibold">
            Return to Mock Tests
          </Link>
        </div>
      </div>
    );
  }

  const isQualified =
    results.passingMarks && results.score >= results.passingMarks;

  const filteredQuestions = results.questions.filter((q) => {
    if (activeFilter === "ALL") return true;
    return q.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-24 pt-20">
      {/* Top Results Hero Bar */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {results.mockTest.exam.name}
                </span>
                <span className="text-xs text-slate-400">
                  Completed on {new Date(results.completedAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                {results.mockTest.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Official Examination Diagnostic & Question Solution Review
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/mock-tests/${results.mockTest.slug}`}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake Test
              </Link>
              <Link
                href="/mistakes"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> Mistake Vault
              </Link>
            </div>
          </div>

          {/* Key Metric Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Score Obtained</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {results.score}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {results.totalMarks}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {results.percentage}% Marks Scored
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Accuracy</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-teal-300">
                  {results.accuracy}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {results.correctCount} correct of {results.correctCount + results.incorrectCount} attempted
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Time Invested</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  {formatSeconds(results.timeSpentSeconds)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Allocated: {Math.round(results.durationSeconds / 60)} mins
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Result Outcome</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-black ${isQualified ? "text-emerald-400" : "text-amber-400"}`}>
                  {isQualified ? "Qualified" : "Practice Needed"}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Passing Cutoff: {results.passingMarks || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Quick Answer Summary Counters */}
        <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
          <div className="flex items-center justify-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900">{results.correctCount}</span>
              <p className="text-xs font-semibold text-emerald-700">Correct Answers</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2 border-x border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900">{results.incorrectCount}</span>
              <p className="text-xs font-semibold text-rose-700">Mistakes (-penalty)</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900">{results.skippedCount}</span>
              <p className="text-xs font-semibold text-slate-500">Unanswered</p>
            </div>
          </div>
        </div>

        {/* Sectional Performance Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Section-wise Diagnostic Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze your sectional strengths and identify areas requiring speed & accuracy improvement.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="pb-3 pl-2">Section</th>
                  <th className="pb-3 text-center">Questions</th>
                  <th className="pb-3 text-center">Attempted</th>
                  <th className="pb-3 text-center">Correct</th>
                  <th className="pb-3 text-center">Incorrect</th>
                  <th className="pb-3 text-center">Marks Obtained</th>
                  <th className="pb-3 text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.sectionsBreakdown.map((sec) => (
                  <tr key={sec.sectionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      <div>
                        {sec.title}
                        <span className="text-[11px] text-slate-400 font-normal block">
                          {sec.subjectName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-medium text-slate-700">
                      {sec.totalQuestions}
                    </td>
                    <td className="py-3.5 text-center font-medium text-slate-700">
                      {sec.attemptedCount}
                    </td>
                    <td className="py-3.5 text-center font-bold text-emerald-600">
                      {sec.correctCount}
                    </td>
                    <td className="py-3.5 text-center font-bold text-rose-500">
                      {sec.incorrectCount}
                    </td>
                    <td className="py-3.5 text-center font-black text-slate-900">
                      {sec.marksObtained} / {sec.maxMarks}
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              sec.accuracy >= 70
                                ? "bg-emerald-500"
                                : sec.accuracy >= 40
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${sec.accuracy}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{sec.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Question Review & Solution Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Comprehensive Question Solutions & Shortcuts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Examine detailed step-by-step solutions, key elimination tricks, and mistakes synced to your vault.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              {(
                [
                  { key: "ALL", label: `All (${results.questions.length})` },
                  { key: "INCORRECT", label: `Mistakes (${results.incorrectCount})` },
                  { key: "CORRECT", label: `Correct (${results.correctCount})` },
                  { key: "SKIPPED", label: `Skipped (${results.skippedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === tab.key
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = !!expandedSolutions[q.id];

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    q.status === "CORRECT"
                      ? "border-emerald-200/90 shadow-2xs"
                      : q.status === "INCORRECT"
                      ? "border-rose-200/90 shadow-2xs"
                      : "border-slate-200 shadow-2xs"
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          q.status === "CORRECT"
                            ? "bg-emerald-100 text-emerald-800"
                            : q.status === "INCORRECT"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Q{q.questionOrder}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            {q.sectionTitle}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {q.topicName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.difficulty === "HARD"
                                ? "bg-rose-50 text-rose-700"
                                : q.difficulty === "MEDIUM"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold">
                          {q.status === "CORRECT" && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marksEarned})
                            </span>
                          )}
                          {q.status === "INCORRECT" && (
                            <span className="text-rose-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect ({q.marksEarned})
                            </span>
                          )}
                          {q.status === "SKIPPED" && (
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Unattempted (0.00)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {q.status === "INCORRECT" && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hidden sm:inline-block">
                        Synced to Mistake Vault
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="px-5 sm:px-6 pb-4">
                    <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.text}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="px-5 sm:px-6 pb-4 space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = q.userSelectedKey === opt.key;
                      const isCorrectChoice = opt.isCorrect;

                      let optClass = "bg-slate-50 border-slate-200 text-slate-700";
                      let badgeClass = "bg-white border-slate-300 text-slate-700";

                      if (isCorrectChoice) {
                        optClass = "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-medium";
                        badgeClass = "bg-emerald-600 text-white font-bold";
                      } else if (isUserChoice && !isCorrectChoice) {
                        optClass = "bg-rose-50/80 border-rose-400 text-rose-950 font-medium";
                        badgeClass = "bg-rose-600 text-white font-bold";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 border ${badgeClass}`}
                            >
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isUserChoice && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                                Your Selection
                              </span>
                            )}
                            {isCorrectChoice && (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution Toggle Bar */}
                  <div className="px-5 sm:px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? "Hide Full Solution" : "View Step-by-Step Solution & Concepts"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <span className="text-xs text-slate-400">
                      Correct Key: <strong>Option {q.correctKey}</strong>
                    </span>
                  </div>

                  {/* Expandable Explanation Body */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-emerald-50/20 border-t border-emerald-100/60 space-y-4">
                      {/* Step by step explanation */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                          Detailed Solution
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                          {q.explanation}
                        </p>
                      </div>

                      {/* Concept & Shortcut Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {q.concept && (
                          <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                            <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5" /> Core Concept
                            </span>
                            <p className="text-xs text-slate-700">{q.concept}</p>
                          </div>
                        )}

                        {q.shortcut && (
                          <div className="p-3.5 rounded-xl bg-white border border-teal-100 shadow-2xs">
                            <span className="text-xs font-extrabold text-teal-700 flex items-center gap-1.5 mb-1">
                              <Zap className="w-3.5 h-3.5" /> Speed Shortcut / Elimination
                            </span>
                            <p className="text-xs text-slate-700">{q.shortcut}</p>
                          </div>
                        )}
                      </div>

                      {q.commonMistake && (
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                          <span className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Common Trap to Avoid
                          </span>
                          <p className="text-amber-800">{q.commonMistake}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation CTAs */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">Next Steps for Improvement</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review wrong questions in your Mistake Vault or practice topic drills to solidify concepts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mistakes"
              className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold border border-rose-200 transition-colors inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> Mistake Vault
            </Link>
            <Link
              href="/mock-tests"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] inline-flex items-center gap-2"
            >
              Explore More Mocks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
