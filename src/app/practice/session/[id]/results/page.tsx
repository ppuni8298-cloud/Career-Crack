"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Bookmark,
  ChevronRight,
  Zap,
  Lightbulb,
  AlertTriangle,
  Flame,
  Target,
  BarChart3,
  Search,
  Filter,
  ArrowLeft,
  Share2,
  Check,
  Flag,
  HelpCircle,
} from "lucide-react";

interface SessionSummary {
  id: string;
  title: string;
  mode: "LEARNING" | "TEST";
  difficulty: string;
  sourceType: string;
  status: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt: string | null;
  exam: { id: string; name: string; slug: string } | null;
  subject: { id: string; name: string; slug: string } | null;
  topic: { id: string; name: string; slug: string } | null;
}

interface TopicBreakdown {
  topicName: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
}

interface QuestionOption {
  id: string;
  optionKey: string;
  optionText: string;
  order: number;
  isCorrect: boolean;
}

interface ReviewedQuestion {
  sessionQuestionId: string;
  questionId: string;
  questionOrder: number;
  selectedOptionKey: string | null;
  correctOptionKey: string;
  correctOptionText: string;
  answerStatus: "CORRECT" | "INCORRECT" | "SKIPPED" | "UNANSWERED";
  markedForReview: boolean;
  isAnswered: boolean;
  timeSpentSeconds: number;
  questionText: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceType: "PRACTICE" | "PYQ" | "AI_GENERATED";
  marks: number;
  negativeMarks: number;
  topic?: string;
  subject?: string;
  options: QuestionOption[];
  explanation: string;
  concept?: string | null;
  shortcut?: string | null;
  commonMistake?: string | null;
  pyqMetadata?: { examName: string; year: number; shift?: string | null } | null;
  tags: string[];
  isBookmarked: boolean;
}

interface ResultsData {
  summary: SessionSummary;
  topicBreakdown: TopicBreakdown[];
  strengths: TopicBreakdown[];
  areasToImprove: TopicBreakdown[];
  questions: ReviewedQuestion[];
}

export default function PracticeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "SKIPPED" | "MARKED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [retryingSession, setRetryingSession] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/practice/sessions/${sessionId}/results`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load session results");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);

        // Confetti burst if accuracy >= 75%
        if (json.summary?.accuracy >= 75) {
          import("canvas-confetti").then((confetti) => {
            confetti.default({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#059669", "#10B981", "#34D399", "#F59E0B", "#3B82F6"],
            });
          }).catch(() => {});
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleToggleBookmark = async (questionId: string, currentStatus: boolean) => {
    if (bookmarkingId) return;
    setBookmarkingId(questionId);

    try {
      const res = await fetch(`/api/questions/${questionId}/bookmark`, {
        method: currentStatus ? "DELETE" : "POST",
      });

      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            questions: prev.questions.map((q) =>
              q.questionId === questionId ? { ...q, isBookmarked: !currentStatus } : q
            ),
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setBookmarkingId(null);
    }
  };

  const handleRetakeSession = async () => {
    if (!data?.summary || retryingSession) return;
    setRetryingSession(true);

    try {
      const res = await fetch("/api/practice/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: data.summary.exam?.id,
          subjectId: data.summary.subject?.id,
          topicId: data.summary.topic?.id,
          difficulty: data.summary.difficulty,
          sourceType: data.summary.sourceType,
          mode: data.summary.mode,
          questionCount: data.summary.totalQuestions,
          enableTimer: data.summary.timeSpentSeconds > 0,
        }),
      });

      const json = await res.json();
      if (res.ok && json.session?.id) {
        router.push(`/practice/session/${json.session.id}`);
      } else {
        alert(json.error || "Failed to retake session");
        setRetryingSession(false);
      }
    } catch (err) {
      console.error("Retake error:", err);
      alert("Network error while creating new session");
      setRetryingSession(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-56 bg-white rounded-3xl border border-slate-200" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
            <div className="h-96 bg-white rounded-3xl border border-slate-200" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
        <Navbar />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-black text-slate-900">Session Results Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">
            {error || "We couldn't retrieve the results for this practice drill."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Practice Bank</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
            >
              <span>Dashboard</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { summary, topicBreakdown, strengths, areasToImprove, questions } = data;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const avgSecondsPerQ =
    summary.totalQuestions > 0 ? Math.round(summary.timeSpentSeconds / summary.totalQuestions) : 0;

  // Accuracy status
  const getAccuracyBadge = (acc: number) => {
    if (acc >= 90) return { label: "Master Level 🏆", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (acc >= 75) return { label: "Exam Ready 🌟", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (acc >= 50) return { label: "Solid Foundation 📈", color: "text-teal-700 bg-teal-50 border-teal-200" };
    return { label: "Needs Targeted Revision 💡", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const badgeInfo = getAccuracyBadge(summary.accuracy);

  // Filter questions for review
  const filteredQuestions = questions.filter((q) => {
    // Tab filter
    if (activeFilter === "CORRECT" && q.answerStatus !== "CORRECT") return false;
    if (activeFilter === "INCORRECT" && q.answerStatus !== "INCORRECT") return false;
    if (activeFilter === "SKIPPED" && q.answerStatus !== "SKIPPED" && q.answerStatus !== "UNANSWERED") return false;
    if (activeFilter === "MARKED" && !q.markedForReview) return false;

    // Search filter
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchText = q.questionText.toLowerCase().includes(qLower);
      const matchTopic = q.topic?.toLowerCase().includes(qLower);
      const matchExpl = q.explanation.toLowerCase().includes(qLower);
      return matchText || matchTopic || matchExpl;
    }

    return true;
  });

  const markedCount = questions.filter((q) => q.markedForReview).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/practice" className="hover:text-emerald-700 transition-colors">
            Practice
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Session Results</span>
        </nav>

        {/* Hero Banner: Accuracy Ring & Main Score */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${badgeInfo.color}`}
                >
                  {badgeInfo.label}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {summary.mode === "TEST" ? "⏱️ Timed Test Mode" : "🌱 Learning Drill Mode"}
                </span>
                {summary.exam && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {summary.exam.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {summary.title || "Practice Session Summary"}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Completed on{" "}
                {new Date(summary.completedAt || summary.startedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {summary.subject && ` · Subject: ${summary.subject.name}`}
                {summary.topic && ` · Topic: ${summary.topic.name}`}
              </p>

              {/* Action Buttons in Hero */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
                <button
                  onClick={handleRetakeSession}
                  disabled={retryingSession}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${retryingSession ? "animate-spin" : ""}`} />
                  <span>{retryingSession ? "Preparing..." : "Retake Session"}</span>
                </button>

                {summary.incorrectCount > 0 && (
                  <button
                    onClick={() => {
                      setActiveFilter("INCORRECT");
                      const el = document.getElementById("review-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                  >
                    <Target className="w-4 h-4 text-rose-600" />
                    <span>Review {summary.incorrectCount} Incorrect</span>
                  </button>
                )}

                <button
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                  title="Copy Results Link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Circular Gauge / Score Widget */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-3xl border border-slate-200/80 shrink-0 min-w-[240px]">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={summary.accuracy >= 75 ? "#059669" : summary.accuracy >= 50 ? "#0D9488" : "#E11D48"}
                    strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - summary.accuracy / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {summary.accuracy}%
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Accuracy
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <div className="text-sm font-black text-slate-800">
                  Score:{" "}
                  <span className={summary.score >= 0 ? "text-emerald-700" : "text-rose-600"}>
                    {summary.score > 0 ? `+${summary.score}` : summary.score}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  {summary.correctCount} of {summary.totalQuestions} questions correct
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Questions
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{summary.totalQuestions}</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Correct
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-700">{summary.correctCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex flex-col justify-between bg-rose-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Incorrect
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-700">{summary.incorrectCount}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Skipped
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-700">{summary.skippedCount}</span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Time Taken
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">
                {formatTime(summary.timeSpentSeconds)}
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg Pace
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900">{avgSecondsPerQ}s</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Topic Breakdown & Strengths vs Areas to Improve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Strengths Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Strong Competencies</h3>
                <p className="text-xs text-slate-500">Topics where you scored 75% or higher</p>
              </div>
            </div>

            {strengths.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No topics met the 75% strength threshold in this drill. Consistent daily revision will boost this quickly!
              </p>
            ) : (
              <div className="space-y-3">
                {strengths.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t.topicName}</div>
                      <div className="text-[11px] text-emerald-800 font-semibold">
                        {t.correct} of {t.total} answered correctly
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                      {t.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Areas to Improve Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Recommended Focus Areas</h3>
                <p className="text-xs text-slate-500">
                  Topics below 75% accuracy automatically added to your Mistake Vault
                </p>
              </div>
            </div>

            {areasToImprove.length === 0 ? (
              <p className="text-xs text-emerald-700 font-semibold py-4">
                🎉 Perfect score across all topics! You mastered every concept in this session.
              </p>
            ) : (
              <div className="space-y-3">
                {areasToImprove.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t.topicName}</div>
                      <div className="text-[11px] text-rose-700 font-semibold">
                        {t.incorrect} wrong · {t.skipped} skipped
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                        {t.accuracy}%
                      </span>
                      <Link
                        href={`/practice?topic=${encodeURIComponent(t.topicName)}`}
                        className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center"
                      >
                        Drill
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div id="review-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Question Breakdown & Explanations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Review your choices, verified explanations, speed shortcuts, and common pitfalls.
              </p>
            </div>

            {/* Search inside review */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search within review..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "ALL", label: "All Questions", count: questions.length },
              { id: "CORRECT", label: "Correct", count: summary.correctCount },
              { id: "INCORRECT", label: "Incorrect", count: summary.incorrectCount },
              { id: "SKIPPED", label: "Skipped", count: summary.skippedCount },
              { id: "MARKED", label: "Marked for Review", count: markedCount },
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question List */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80">
              <p className="text-sm font-semibold text-slate-600">
                No questions match the selected filter ({activeFilter}).
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((q) => {
                const isCorrect = q.answerStatus === "CORRECT";
                const isIncorrect = q.answerStatus === "INCORRECT";
                const isSkipped = q.answerStatus === "SKIPPED" || q.answerStatus === "UNANSWERED";

                return (
                  <div
                    key={q.sessionQuestionId}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5"
                  >
                    {/* Question Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center text-xs font-black">
                          Q{q.questionOrder}
                        </span>

                        {/* Status Badge */}
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct (+{q.marks})</span>
                          </span>
                        )}

                        {isIncorrect && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Incorrect (-{q.negativeMarks})</span>
                          </span>
                        )}

                        {isSkipped && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Skipped (0)</span>
                          </span>
                        )}

                        {q.markedForReview && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Flag className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Marked for Review</span>
                          </span>
                        )}

                        {q.topic && (
                          <span className="text-xs font-semibold text-slate-500">· {q.topic}</span>
                        )}
                      </div>

                      {/* Right Meta (Time + Bookmark) */}
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{q.timeSpentSeconds}s</span>
                        </span>

                        <button
                          onClick={() => handleToggleBookmark(q.questionId, q.isBookmarked)}
                          disabled={bookmarkingId === q.questionId}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            q.isBookmarked
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                          }`}
                          title={q.isBookmarked ? "Remove Bookmark" : "Save for Revision"}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${q.isBookmarked ? "fill-amber-500 text-amber-500" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </div>

                    {/* Options List */}
                    <div className="space-y-2.5">
                      {q.options.map((opt) => {
                        const isUserChoice = q.selectedOptionKey === opt.optionKey;
                        const isCorrectOption = opt.isCorrect;

                        let style = "bg-white border-slate-200 text-slate-700";
                        let badge = null;

                        if (isCorrectOption) {
                          style = "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                          badge = (
                            <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Correct Answer ✓
                            </span>
                          );
                        } else if (isUserChoice && !isCorrectOption) {
                          style = "bg-rose-50/70 border-rose-500 text-rose-950 font-bold shadow-xs";
                          badge = (
                            <span className="text-[11px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                              Your Answer ✗
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${style}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                {opt.optionKey}
                              </span>
                              <span className="text-xs sm:text-sm leading-relaxed">{opt.optionText}</span>
                            </div>

                            {badge && <div className="shrink-0">{badge}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Verified Explanation Section */}
                    <div className="pt-3 space-y-3">
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                            Detailed Explanation & Logic
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      {/* Concept & Shortcut Highlights if present */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.concept && (
                          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                            <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs mb-1">
                              <Target className="w-3.5 h-3.5 text-teal-700" />
                              <span>Core Concept</span>
                            </div>
                            <p className="text-xs text-teal-950 font-medium leading-relaxed">
                              {q.concept}
                            </p>
                          </div>
                        )}

                        {q.shortcut && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                              <Zap className="w-3.5 h-3.5 text-amber-600" />
                              <span>Speed Shortcut / Pro-Tip</span>
                            </div>
                            <p className="text-xs text-amber-950 font-medium leading-relaxed">
                              {q.shortcut}
                            </p>
                          </div>
                        )}
                      </div>

                      {q.commonMistake && (
                        <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                          <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Common Trap / Pitfall to Avoid</span>
                          </div>
                          <p className="text-xs text-rose-950 font-medium leading-relaxed">
                            {q.commonMistake}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Question Bank</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRetakeSession}
              disabled={retryingSession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Drill</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
