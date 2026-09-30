"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Zap,
  AlertTriangle,
  Award,
  RotateCcw,
  X,
  Menu,
  Sparkles,
  Target,
} from "lucide-react";

interface OptionItem {
  id: string;
  optionKey: string;
  optionText: string;
  order: number;
  isCorrect?: boolean;
}

interface QuestionItem {
  sessionQuestionId: string;
  questionId: string;
  questionOrder: number;
  selectedOptionKey: string | null;
  answerStatus: string;
  markedForReview: boolean;
  isAnswered: boolean;
  timeSpentSeconds: number;
  questionText: string;
  questionType: string;
  sourceType: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  pyqMetadata?: any;
  tags?: string[];
  options: OptionItem[];
  explanation?: string;
  concept?: string;
  shortcut?: string;
  commonMistake?: string;
}

interface SessionData {
  id: string;
  title: string;
  mode: "LEARNING" | "TEST";
  difficulty: string;
  sourceType: string;
  totalQuestions: number;
  durationSeconds: number | null;
  remainingSeconds: number | null;
  status: string;
  startedAt: string;
  questions: QuestionItem[];
}

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [navigatorDrawerOpen, setNavigatorDrawerOpen] = useState(false);

  // Bookmarks tracked locally for session
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  // Question question timer delta
  const questionStartTimeRef = useRef<number>(Date.now());

  // Load session from server
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/practice/sessions/${sessionId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/practice/session/${sessionId}`);
          return;
        }
        throw new Error("Failed to load practice session");
      }
      const data = await res.json();
      if (data.session) {
        if (data.session.status === "COMPLETED") {
          router.replace(`/practice/session/${sessionId}/results`);
          return;
        }
        setSession(data.session);
        if (data.session.durationSeconds && data.session.remainingSeconds !== null) {
          setSecondsLeft(data.session.remainingSeconds);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load practice session.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Timer countdown
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft !== null && secondsLeft > 0]);

  const currentQ = session?.questions[currentIndex];

  // Record Answer
  const handleSelectOption = async (optionKey: string | null) => {
    if (!currentQ || !session) return;
    // In learning mode, if already answered, don't re-answer
    if (session.mode === "LEARNING" && currentQ.isAnswered && optionKey !== null) {
      return;
    }

    const timeSpentDelta = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    // Optimistic UI update
    setSession((prev) => {
      if (!prev) return prev;
      const updatedQs = [...prev.questions];
      updatedQs[currentIndex] = {
        ...updatedQs[currentIndex],
        selectedOptionKey: optionKey,
        isAnswered: optionKey !== null,
      };
      return { ...prev, questions: updatedQs };
    });

    try {
      const res = await fetch(`/api/practice/sessions/${sessionId}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          optionKey,
          timeSpentDelta,
        }),
      });

      const result = await res.json();
      if (res.ok && session.mode === "LEARNING" && result.isAnswered) {
        // Update with explanation & correctness in learning mode
        setSession((prev) => {
          if (!prev) return prev;
          const updatedQs = [...prev.questions];
          updatedQs[currentIndex] = {
            ...updatedQs[currentIndex],
            answerStatus: result.isCorrect ? "CORRECT" : "INCORRECT",
            explanation: result.explanation,
            concept: result.concept,
            shortcut: result.shortcut,
            commonMistake: result.commonMistake,
            options: updatedQs[currentIndex].options.map((opt) => ({
              ...opt,
              isCorrect: opt.optionKey === result.correctOptionKey,
            })),
          };
          return { ...prev, questions: updatedQs };
        });
      }
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };

  // Toggle Mark for Review
  const handleToggleReview = async () => {
    if (!currentQ || !session) return;
    const newStatus = !currentQ.markedForReview;

    setSession((prev) => {
      if (!prev) return prev;
      const updatedQs = [...prev.questions];
      updatedQs[currentIndex] = {
        ...updatedQs[currentIndex],
        markedForReview: newStatus,
      };
      return { ...prev, questions: updatedQs };
    });

    try {
      await fetch(`/api/practice/sessions/${sessionId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          markedForReview: newStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!currentQ) return;
    const isBookmarked = Boolean(bookmarkedMap[currentQ.questionId]);
    const newState = !isBookmarked;

    setBookmarkedMap((prev) => ({
      ...prev,
      [currentQ.questionId]: newState,
    }));

    try {
      await fetch(`/api/questions/${currentQ.questionId}/bookmark`, {
        method: newState ? "POST" : "DELETE",
      });
    } catch (err) {
      console.error("Failed to bookmark question:", err);
    }
  };

  // Submit Final
  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/practice/sessions/${sessionId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/practice/session/${sessionId}/results`);
      } else {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit session.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to finalize session.");
      setSubmitting(false);
    }
  };

  // Keyboard navigation support: Keys 1-4 for options, left/right arrows for prev/next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused or modal open
      if (showExitModal || showSubmitModal) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (session && currentIndex < session.questions.length - 1) {
          questionStartTimeRef.current = Date.now();
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          questionStartTimeRef.current = Date.now();
          setCurrentIndex((i) => i - 1);
        }
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQ?.options[idx]) {
          handleSelectOption(currentQ.options[idx].optionKey);
        }
      } else if (["a", "b", "c", "d", "A", "B", "C", "D"].includes(e.key)) {
        handleSelectOption(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, session, currentQ, showExitModal, showSubmitModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Practice Engine...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session || !currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            !
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">Unable to Load Session</h3>
          <p className="text-xs text-slate-600 mt-2">{error || "Session not found or unavailable."}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/practice"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Back to Practice Bank
            </Link>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchSession();
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Derived statistics for navigator
  const answeredCount = session.questions.filter((q) => q.isAnswered).length;
  const reviewCount = session.questions.filter((q) => q.markedForReview).length;
  const unansweredCount = session.totalQuestions - answeredCount;

  // Format timer
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimerCritical = secondsLeft !== null && secondsLeft <= 120; // Under 2 mins

  const progressPercent = Math.round(((currentIndex + 1) / session.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col justify-between select-none">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Track */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-2 group cursor-pointer"
                title="Exit Practice"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-sm shadow-xs group-hover:scale-105 transition-transform">
                  🌱
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                    CAREER CRACK
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 truncate max-w-[180px]">
                    {session.title}
                  </span>
                </div>
              </button>

              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border hidden md:inline-flex items-center gap-1 ${
                  session.mode === "LEARNING"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-teal-50 text-teal-800 border-teal-200"
                }`}
              >
                {session.mode === "LEARNING" ? (
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Target className="w-3 h-3 text-teal-600" />
                )}
                <span>{session.mode} MODE</span>
              </span>
            </div>

            {/* Center: Question Counter */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-900">
                Question {currentIndex + 1} of {session.totalQuestions}
              </span>
            </div>

            {/* Right: Timer & Navigator Drawer Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {secondsLeft !== null && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-colors ${
                    isTimerCritical
                      ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                      : "bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isTimerCritical ? "text-rose-600" : "text-slate-500"}`} />
                  <span className="font-mono">{formatTimer(secondsLeft)}</span>
                </div>
              )}

              {/* Navigator drawer trigger button */}
              <button
                type="button"
                onClick={() => setNavigatorDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                title="Question Navigator"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Exit Session Button */}
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-emerald-600 h-1 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* 2. Main Work Area (Question Card & Navigator Grid) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-start gap-8">
        {/* Left Column: Interactive Question Card */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative">
            {/* Top Toolbar on Question: Badges & Review/Bookmark Action */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-400">
                  Q{currentIndex + 1}.
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    currentQ.difficulty === "HARD"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : currentQ.difficulty === "MEDIUM"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {currentQ.difficulty}
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentQ.sourceType}
                </span>
              </div>

              {/* Action Buttons: Mark for Review & Bookmark */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    currentQ.markedForReview
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                  }`}
                  title="Flag for later review"
                >
                  <Flag
                    className={`w-3.5 h-3.5 ${
                      currentQ.markedForReview ? "fill-amber-500 text-amber-500" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {currentQ.markedForReview ? "Marked" : "Review"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    bookmarkedMap[currentQ.questionId]
                      ? "bg-amber-50 text-amber-600 border-amber-300"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50"
                  }`}
                  title="Bookmark Question"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      bookmarkedMap[currentQ.questionId] ? "fill-amber-500 text-amber-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Verified PYQ Indicator Banner */}
            {currentQ.sourceType === "PYQ" && currentQ.pyqMetadata && (
              <div className="mb-4 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 gap-2">
                <div className="flex items-center gap-2 font-bold">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Official PYQ: {currentQ.pyqMetadata.exam} {currentQ.pyqMetadata.examYear}
                    {currentQ.pyqMetadata.stage ? ` · ${currentQ.pyqMetadata.stage}` : ""}
                    {currentQ.pyqMetadata.shift ? ` · ${currentQ.pyqMetadata.shift}` : ""}
                  </span>
                </div>
                {currentQ.pyqMetadata.sourceReference && (
                  <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    {currentQ.pyqMetadata.sourceReference}
                  </span>
                )}
              </div>
            )}

            {/* Question Text */}
            <div className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed whitespace-pre-line mb-6">
              {currentQ.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentQ.selectedOptionKey === opt.optionKey;
                const isLearningMode = session.mode === "LEARNING";
                const isAnswered = currentQ.isAnswered;

                let btnStyle =
                  "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 text-slate-800";
                let keyStyle = "bg-slate-100 text-slate-700 border-slate-200";

                if (isLearningMode && isAnswered) {
                  // Learning mode answer highlights
                  if (opt.isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                    keyStyle = "bg-emerald-600 text-white border-emerald-600";
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through opacity-85";
                    keyStyle = "bg-rose-500 text-white border-rose-500";
                  } else {
                    btnStyle = "border-slate-200 text-slate-400 opacity-60";
                    keyStyle = "bg-slate-100 text-slate-400 border-slate-200";
                  }
                } else if (isSelected) {
                  // Test mode selected option
                  btnStyle = "border-emerald-600 bg-emerald-50/70 text-slate-950 font-bold ring-1 ring-emerald-600";
                  keyStyle = "bg-emerald-600 text-white border-emerald-600";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.optionKey)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 transition-colors ${keyStyle}`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="leading-snug">{opt.optionText}</span>
                    </div>

                    {isLearningMode && isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isLearningMode && isAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear Answer Button in Test Mode */}
            {session.mode === "TEST" && currentQ.isAnswered && (
              <div className="flex justify-end pb-2">
                <button
                  type="button"
                  onClick={() => handleSelectOption(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Selection</span>
                </button>
              </div>
            )}

            {/* Learning Mode: Instant Explanation Card */}
            {session.mode === "LEARNING" && currentQ.isAnswered && (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 text-xs sm:text-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  {currentQ.answerStatus === "CORRECT" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Incorrect Choice. Study the solution below:</span>
                    </>
                  )}
                </div>

                {currentQ.concept && (
                  <div className="p-3 rounded-xl bg-white border border-emerald-100 text-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs mb-0.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Concept Tested</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{currentQ.concept}</p>
                  </div>
                )}

                {currentQ.explanation && (
                  <div className="text-slate-800 leading-relaxed whitespace-pre-line">
                    <span className="font-bold block text-slate-900 mb-1">Detailed Solution:</span>
                    {currentQ.explanation}
                  </div>
                )}

                {currentQ.shortcut && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>Speed Shortcut</span>
                    </div>
                    <p className="text-amber-900 leading-relaxed font-medium">{currentQ.shortcut}</p>
                  </div>
                )}

                {currentQ.commonMistake && (
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs mb-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Common Mistake to Avoid</span>
                    </div>
                    <p className="text-rose-900 leading-relaxed font-medium">{currentQ.commonMistake}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Question Controls Bar */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (currentIndex > 0) {
                  questionStartTimeRef.current = Date.now();
                  setCurrentIndex((i) => i - 1);
                }
              }}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < session.totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    questionStartTimeRef.current = Date.now();
                    setCurrentIndex((i) => i + 1);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm cursor-pointer transition-all"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  <span>Submit Practice</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Palette (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-black text-slate-900 text-sm">Question Palette</span>
              <span className="text-xs font-bold text-emerald-700">
                {answeredCount}/{session.totalQuestions} Answered
              </span>
            </div>

            {/* Question Matrix Grid */}
            <div className="grid grid-cols-5 gap-2">
              {session.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = q.isAnswered;
                const isMarked = q.markedForReview;

                let style =
                  "border-slate-200 text-slate-700 bg-white hover:border-emerald-400";

                if (isMarked) {
                  style = "border-amber-400 bg-amber-50 text-amber-900 font-black ring-1 ring-amber-400";
                } else if (isAnswered) {
                  style = "border-emerald-600 bg-emerald-600 text-white font-bold";
                }

                if (isCurrent) {
                  style += " ring-2 ring-emerald-500 ring-offset-2";
                }

                return (
                  <button
                    key={q.sessionQuestionId}
                    type="button"
                    onClick={() => {
                      questionStartTimeRef.current = Date.now();
                      setCurrentIndex(idx);
                    }}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${style}`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-emerald-600" />
                  <span>Answered</span>
                </div>
                <span className="font-bold text-slate-800">{answeredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-400" />
                  <span>Marked for Review</span>
                </div>
                <span className="font-bold text-slate-800">{reviewCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md border border-slate-200 bg-white" />
                  <span>Unanswered</span>
                </div>
                <span className="font-bold text-slate-800">{unansweredCount}</span>
              </div>
            </div>

            {/* Quick Submit CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
              >
                Submit Practice Test
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* 3. Mobile Question Navigator Drawer */}
      {navigatorDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl p-6 w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="font-black text-slate-900 text-base">Question Navigator</span>
              <button
                type="button"
                onClick={() => setNavigatorDrawerOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-6">
              {session.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = q.isAnswered;
                const isMarked = q.markedForReview;

                let style = "border-slate-200 text-slate-700 bg-white";
                if (isMarked) style = "border-amber-400 bg-amber-50 text-amber-900 font-bold";
                else if (isAnswered) style = "border-emerald-600 bg-emerald-600 text-white font-bold";
                if (isCurrent) style += " ring-2 ring-emerald-500";

                return (
                  <button
                    key={q.sessionQuestionId}
                    type="button"
                    onClick={() => {
                      questionStartTimeRef.current = Date.now();
                      setCurrentIndex(idx);
                      setNavigatorDrawerOpen(false);
                    }}
                    className={`h-11 rounded-xl border text-sm font-bold flex items-center justify-center ${style}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setNavigatorDrawerOpen(false);
                setShowSubmitModal(true);
              }}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-emerald-600 shadow-md"
            >
              Submit Practice Test
            </button>
          </div>
        </div>
      )}

      {/* 4. Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Exit Practice Session?</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If you exit now without submitting, your answers for this session will not count toward your readiness score.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Stay & Practice
              </button>
              <Link
                href="/practice"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-sm inline-block"
              >
                Exit Session
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">
              <Send className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Submit Practice Session?</h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              You have <span className="font-bold text-emerald-700">{answeredCount} answered</span>,{" "}
              <span className="font-bold text-slate-900">{unansweredCount} unanswered</span>, and{" "}
              <span className="font-bold text-amber-700">{reviewCount} marked for review</span>.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold">{session.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered Questions:</span>
                <span className="font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered Questions:</span>
                <span className="font-bold text-rose-600">{unansweredCount}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Calculating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
