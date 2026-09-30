"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  Clock,
  Layers,
  Lightbulb,
} from "lucide-react";

interface QuestionOption {
  id: string;
  optionKey: string;
  optionText: string;
}

interface AdaptiveQuestion {
  id: string;
  questionOrder: number;
  questionText: string;
  difficulty: string;
  subject: { name: string; icon: string | null };
  topic: { name: string; slug: string };
  options: QuestionOption[];
  whyThisQuestion: string;
  pyqMetadata?: { exam: string; examYear: number } | null;
}

interface SessionResult {
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  xpAwarded: number;
  totalXP: number;
  level: number;
}

function CrackModeContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || undefined;
  const initialCount = parseInt(searchParams.get("count") || "10", 10);

  // Setup state
  const [selectedCount, setSelectedCount] = useState<number>(initialCount);
  const [selectedMode, setSelectedMode] = useState<"QUICK" | "BALANCED" | "CHALLENGE">("BALANCED");
  const [sessionActive, setSessionActive] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Result state
  const [result, setResult] = useState<SessionResult | null>(null);
  const [topicBreakdown, setTopicBreakdown] = useState<any[]>([]);
  const [reviewList, setReviewList] = useState<any[]>([]);
  const [nextAction, setNextAction] = useState<string>("");

  const startAdaptiveSession = async () => {
    try {
      setLoading(true);
      const url = `/api/crack-mode?count=${selectedCount}&mode=${selectedMode}${
        initialTopic ? `&topicId=${initialTopic}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/crack-mode";
          return;
        }
        throw new Error("Failed to load adaptive questions");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswers({});
      setResult(null);
      setSessionActive(true);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Start adaptive session error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitSession = async () => {
    try {
      setSubmitting(true);
      const timeSpentSeconds = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      const res = await fetch("/api/crack-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeSpentSeconds,
          mode: selectedMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit adaptive session");
      const data = await res.json();

      setResult(data.result);
      setTopicBreakdown(data.topicBreakdown || []);
      setReviewList(data.review || []);
      setNextAction(data.nextAction || "");
      setSessionActive(false);
    } catch (err) {
      console.error("Submit session error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ ? !!answers[currentQ.id] : false;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Setup Configuration View */}
        {!sessionActive && !result && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>AI-Driven Adaptive Learning Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Adaptive Crack Mode
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The system dynamically curates questions based on your unresolved mistakes, weak topics, spaced
                retention deadlines, and previous question exposures.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Question count selection */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Select Question Volume
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSelectedCount(count)}
                      className={`p-4 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                        selectedCount === count
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block text-xl">{count}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Questions</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Mode Selection */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Select Drill Calibration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { mode: "QUICK", title: "Quick Solve", desc: "Rapid concept checks to maintain momentum." },
                    { mode: "BALANCED", title: "Balanced", desc: "Optimal blend of weak areas, mistakes, and PYQs." },
                    { mode: "CHALLENGE", title: "Challenge", desc: "Advanced difficulty questions to push accuracy." },
                  ].map((m) => (
                    <button
                      key={m.mode}
                      onClick={() => setSelectedMode(m.mode as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedMode === m.mode
                          ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-black text-sm text-slate-900 mb-1">{m.title}</span>
                      <span className="block text-xs text-slate-500 leading-snug">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startAdaptiveSession}
                disabled={loading}
                id="launch-crack-mode-btn"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{loading ? "Selecting Questions via Adaptive Engine..." : "Generate & Start Adaptive Drill →"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Quiz View */}
        {sessionActive && currentQ && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Progress Top Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">
                Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {questions.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase text-[10px] font-extrabold">
                {selectedMode} Mode
              </span>
              <span className="text-slate-400">
                Answered: {Object.keys(answers).length}/{questions.length}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
              {/* Question metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    {currentQ.subject?.name}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                    {currentQ.topic?.name}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {currentQ.difficulty}
                  </span>
                </div>
                {currentQ.pyqMetadata && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    PYQ {currentQ.pyqMetadata.examYear}
                  </span>
                )}
              </div>

              {/* "Why this question?" Explanation Card (Feature 3 Requirement) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-amber-900 text-[11px] uppercase tracking-wider mb-0.5">
                    Why this question?
                  </strong>
                  <p className="leading-relaxed">{currentQ.whyThisQuestion}</p>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </div>

              {/* MCQ Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.optionKey;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.optionKey)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-950 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="flex-1 leading-snug">{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  ← Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleSubmitSession}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Analyzing Session..." : "Submit Drill →"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Next Question →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Hero Result Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
                🏆
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Adaptive Drill Completed!</h2>
              <p className="text-xs text-slate-300">
                Telemetry updated: questions answered recorded in exposure registry and Mistake Vault.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2 text-xs">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Accuracy</span>
                  <strong className="text-xl font-black text-emerald-400">{result.accuracy}%</strong>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Score</span>
                  <strong className="text-xl font-black text-white">
                    {result.correctCount}/{result.totalQuestions}
                  </strong>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">XP Earned</span>
                  <strong className="text-xl font-black text-amber-400">+{result.xpAwarded} XP</strong>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Time Spent</span>
                  <strong className="text-xl font-black text-teal-300">{result.timeSpentSeconds}s</strong>
                </div>
              </div>
            </div>

            {/* Next Action Callout (Feature 4 Requirement) */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-black uppercase tracking-wider text-emerald-900 mb-0.5">
                  Adaptive Engine Next Action
                </strong>
                <p className="text-xs text-emerald-800 leading-relaxed">{nextAction}</p>
              </div>
            </div>

            {/* Topic Breakdown */}
            {topicBreakdown.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Topic Mastery Impact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topicBreakdown.map((tb, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">{tb.topicName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold">{tb.accuracy}% Acc</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            tb.status === "IMPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tb.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Question Review */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Question Review & Speed Shortcuts
              </h3>
              {reviewList.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border text-xs space-y-3 ${
                    r.isCorrect ? "bg-white border-slate-200" : "bg-rose-50/40 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-500">
                      Q{idx + 1} • {r.topicName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        r.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.isCorrect ? "Correct" : "Mistake Logged"}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900">{r.questionText}</p>

                  <div className="flex items-center gap-4 text-[11px]">
                    <span>
                      Your answer: <strong>{r.selectedKey || "Skipped"}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Correct: {r.correctKey}
                    </span>
                  </div>

                  {r.explanation && (
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                      <strong>Explanation:</strong> {r.explanation}
                    </div>
                  )}

                  {r.shortcut && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Speed Shortcut:</strong> {r.shortcut}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setResult(null);
                  startAdaptiveSession();
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
              >
                Start Another Adaptive Drill →
              </button>
              <Link
                href="/roadmap"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors"
              >
                Return to Roadmap
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CrackModePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <CrackModeContent />
    </Suspense>
  );
}
