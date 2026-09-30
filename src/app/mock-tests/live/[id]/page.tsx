"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Maximize2,
  Minimize2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  RotateCcw,
  Send,
  User,
  ShieldAlert,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface Option {
  id: string;
  key: string;
  text: string;
  imageUrl?: string;
}

interface Question {
  id: string;
  mockQuestionId: string;
  sectionId: string;
  questionOrder: number;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  options: Option[];
  selectedOptionKey: string | null;
  markedForReview: boolean;
  isVisited: boolean;
  timeSpentSeconds: number;
}

interface Section {
  id: string;
  title: string;
  sectionOrder: number;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationSeconds?: number;
  subject?: {
    id: string;
    name: string;
    icon?: string;
  };
}

interface AttemptData {
  id: string;
  status: string;
  startedAt: string;
  durationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  currentSectionId: string | null;
  mockTest: {
    id: string;
    title: string;
    slug: string;
    navigationRule: string;
    totalQuestions: number;
    totalMarks: number;
    negativeMarks: number;
    exam: {
      id: string;
      name: string;
      category: string;
      organization?: string;
      logo?: string;
    };
    sections: Section[];
  };
  questions: Question[];
}

export default function LiveExamSimulatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showTabWarningModal, setShowTabWarningModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING">("SAVED");

  // Keep a ref to answers state to avoid stale closure in timer intervals
  const questionsRef = useRef<Question[]>([]);

  useEffect(() => {
    fetchAttempt();
  }, [id]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mock-tests/attempts/${id}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        router.push("/mock-tests");
        return;
      }

      const data = await res.json();
      const att: AttemptData = data.attempt;

      if (att.status === "COMPLETED") {
        router.push(`/mock-tests/attempts/${id}/results`);
        return;
      }

      setAttempt(att);
      questionsRef.current = att.questions;
      setRemainingTime(att.remainingSeconds);

      const firstSecId = att.mockTest.sections[0]?.id || "";
      setActiveSectionId(att.currentSectionId || firstSecId);

      // Mark the very first question as visited
      if (att.questions.length > 0) {
        markQuestionVisited(0, att.questions);
      }
    } catch (err) {
      console.error("Error loading test attempt:", err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!attempt || attempt.status === "COMPLETED" || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, remainingTime]);

  // Anti-cheat tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showSubmitModal) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          setShowTabWarningModal(true);
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [showSubmitModal]);

  const markQuestionVisited = async (index: number, qList?: Question[]) => {
    const list = qList || attempt?.questions;
    if (!list || !list[index]) return;

    const target = list[index];
    if (!target.isVisited) {
      target.isVisited = true;
      setAttempt((prev) => {
        if (!prev) return null;
        const updated = [...prev.questions];
        updated[index] = { ...target, isVisited: true };
        questionsRef.current = updated;
        return { ...prev, questions: updated };
      });

      // Background persist visit
      try {
        await fetch(`/api/mock-tests/attempts/${id}/answer`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: target.id,
            isVisited: true,
          }),
        });
      } catch (e) {
        // Silent fail on background visit update
      }
    }
  };

  const handleSelectOption = async (optionKey: string) => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    const newKey = currentQ.selectedOptionKey === optionKey ? null : optionKey;

    setSaveStatus("SAVING");

    // Optimistic UI update
    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQ,
      selectedOptionKey: newKey,
      isVisited: true,
    };
    questionsRef.current = updatedQuestions;
    setAttempt({ ...attempt, questions: updatedQuestions });

    try {
      const res = await fetch(`/api/mock-tests/attempts/${id}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedOptionKey: newKey,
          isVisited: true,
          timeSpentIncrement: 5,
        }),
      });
      if (res.ok) {
        setSaveStatus("SAVED");
      }
    } catch (err) {
      console.error("Save answer error:", err);
      setSaveStatus("SAVED");
    }
  };

  const handleClearResponse = async () => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    if (!currentQ.selectedOptionKey) return;

    setSaveStatus("SAVING");
    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQ,
      selectedOptionKey: null,
    };
    questionsRef.current = updatedQuestions;
    setAttempt({ ...attempt, questions: updatedQuestions });

    try {
      await fetch(`/api/mock-tests/attempts/${id}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedOptionKey: null,
        }),
      });
      setSaveStatus("SAVED");
    } catch (err) {
      console.error("Clear response error:", err);
      setSaveStatus("SAVED");
    }
  };

  const handleToggleReview = async () => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    const nextReviewState = !currentQ.markedForReview;

    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQ,
      markedForReview: nextReviewState,
      isVisited: true,
    };
    questionsRef.current = updatedQuestions;
    setAttempt({ ...attempt, questions: updatedQuestions });

    try {
      await fetch(`/api/mock-tests/attempts/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          markedForReview: nextReviewState,
        }),
      });
    } catch (err) {
      console.error("Toggle review error:", err);
    }
  };

  const handleSaveAndNext = () => {
    if (!attempt) return;
    if (currentIndex < attempt.questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      markQuestionVisited(nextIdx);
      // Auto-switch active section tab if next question belongs to different section
      const nextQ = attempt.questions[nextIdx];
      if (nextQ && nextQ.sectionId !== activeSectionId) {
        setActiveSectionId(nextQ.sectionId);
      }
    }
  };

  const handleMarkReviewAndNext = async () => {
    await handleToggleReview();
    handleSaveAndNext();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      markQuestionVisited(prevIdx);
      const prevQ = attempt?.questions[prevIdx];
      if (prevQ && prevQ.sectionId !== activeSectionId) {
        setActiveSectionId(prevQ.sectionId);
      }
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (!attempt || index < 0 || index >= attempt.questions.length) return;
    setCurrentIndex(index);
    markQuestionVisited(index);
    const targetQ = attempt.questions[index];
    if (targetQ && targetQ.sectionId !== activeSectionId) {
      setActiveSectionId(targetQ.sectionId);
    }
    setIsSidebarOpen(false); // Mobile drawer close
  };

  const handleSwitchSection = (sectionId: string) => {
    if (!attempt) return;
    setActiveSectionId(sectionId);
    // Find first question of this section
    const targetIdx = attempt.questions.findIndex((q) => q.sectionId === sectionId);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      markQuestionVisited(targetIdx);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      // Collect latest map of answers
      const answersMap: Record<string, string> = {};
      for (const q of questionsRef.current) {
        if (q.selectedOptionKey) {
          answersMap[q.id] = q.selectedOptionKey;
        }
      }

      const res = await fetch(`/api/mock-tests/attempts/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersMap,
          timeSpentSeconds: attempt ? attempt.durationSeconds - remainingTime : 0,
        }),
      });

      if (res.ok) {
        router.push(`/mock-tests/attempts/${id}/results`);
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error during submission. Retrying...");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("⏰ Time is up! Your mock test responses are being submitted automatically.");
    handleFinalSubmit();
  };

  // Format remaining seconds into HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing Secure Exam Environment...
        </p>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentIndex];
  const activeSection = attempt.mockTest.sections.find((s) => s.id === activeSectionId) || attempt.mockTest.sections[0];
  const sectionQuestions = attempt.questions.filter((q) => q.sectionId === activeSectionId);

  // Palette status calculations
  const answeredCount = attempt.questions.filter((q) => q.selectedOptionKey && !q.markedForReview).length;
  const answeredAndReviewCount = attempt.questions.filter((q) => q.selectedOptionKey && q.markedForReview).length;
  const reviewOnlyCount = attempt.questions.filter((q) => !q.selectedOptionKey && q.markedForReview).length;
  const notAnsweredCount = attempt.questions.filter((q) => q.isVisited && !q.selectedOptionKey && !q.markedForReview).length;
  const notVisitedCount = attempt.questions.filter((q) => !q.isVisited).length;

  const isLowTime = remainingTime < 300; // < 5 mins
  const isCriticalTime = remainingTime < 60; // < 1 min

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col select-none antialiased">
      {/* Top Proctored Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {attempt.mockTest.exam.logo || "🎓"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                {attempt.mockTest.exam.name}
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400">
                • {attempt.mockTest.title}
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span>Marking: +{currentQuestion?.marks} / -{currentQuestion?.negativeMarks}</span>
              <span className="hidden md:inline text-slate-500">|</span>
              <span className="hidden md:inline text-slate-400">
                Status: {saveStatus === "SAVING" ? "Syncing..." : "● Saved"}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Countdown Timer & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Real-time Timer Box */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border text-sm sm:text-base font-mono font-black transition-all ${
              isCriticalTime
                ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-bounce"
                : isLowTime
                ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                : "bg-slate-800 border-slate-700 text-emerald-400"
            }`}
          >
            <Clock className={`w-4 h-4 ${isCriticalTime ? "text-rose-400" : isLowTime ? "text-amber-400" : "text-emerald-400"}`} />
            <span>{formatTime(remainingTime)}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden sm:flex items-center justify-center"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Question Palette Drawer Toggle (Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 lg:hidden"
            title="Question Palette"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Section Tabs Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Sections:
          </span>
          {attempt.mockTest.sections.map((sec) => {
            const isActive = sec.id === activeSectionId;
            const secQuestions = attempt.questions.filter((q) => q.sectionId === sec.id);
            const secAnswered = secQuestions.filter((q) => q.selectedOptionKey).length;

            return (
              <button
                key={sec.id}
                onClick={() => handleSwitchSection(sec.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{sec.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {secAnswered}/{sec.questionCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Proctored Simulation</span>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Question & Response Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Question Info Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  Question {currentIndex + 1} of {attempt.questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  [{activeSection?.title}]
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Correct: +{currentQuestion.marks}
                </span>
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  Negative: -{currentQuestion.negativeMarks}
                </span>
              </div>
            </div>

            {/* Question Statement Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                {currentQuestion.text}
              </p>

              {/* Options List */}
              <div className="mt-8 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.selectedOptionKey === option.key;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                          : "bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-slate-300 text-slate-600 group-hover:border-slate-400"
                        }`}
                      >
                        {option.key}
                      </div>

                      <div className="flex-1 pt-0.5 text-sm sm:text-base font-normal text-slate-800">
                        {option.text}
                      </div>

                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer Row */}
          <div className="max-w-4xl mx-auto w-full pt-6 border-t border-slate-200 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Actions: Review & Clear */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkReviewAndNext}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 ${
                    currentQuestion.markedForReview
                      ? "bg-purple-100 border-purple-300 text-purple-900"
                      : "bg-white border-slate-300 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Mark for Review & Next</span>
                </button>

                <button
                  onClick={handleClearResponse}
                  disabled={!currentQuestion.selectedOptionKey}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Response</span>
                </button>
              </div>

              {/* Right Actions: Prev / Save & Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleSaveAndNext}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.01] flex items-center gap-1.5"
                >
                  <span>{currentIndex === attempt.questions.length - 1 ? "Save" : "Save & Next"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right: Question Palette Sidebar (Responsive) */}
        <aside
          className={`w-80 lg:w-96 bg-white border-l border-slate-200/80 p-5 flex flex-col justify-between fixed lg:static right-0 top-14 bottom-0 z-30 transition-transform duration-300 shadow-xl lg:shadow-none overflow-y-auto ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-5">
            {/* Candidate Header / Mobile Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Candidate Session</span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {id.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Palette Status Legend Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {answeredCount}
                </div>
                <span className="text-[11px] font-semibold text-emerald-950">Answered</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                <div className="w-6 h-6 rounded bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {notAnsweredCount}
                </div>
                <span className="text-[11px] font-semibold text-rose-950">Not Answered</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 border border-slate-200">
                <div className="w-6 h-6 rounded bg-slate-300 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {notVisitedCount}
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Not Visited</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/70 border border-purple-100">
                <div className="w-6 h-6 rounded bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {reviewOnlyCount}
                </div>
                <span className="text-[11px] font-semibold text-purple-950">Marked Review</span>
              </div>

              <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                <div className="relative w-6 h-6 rounded bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  {answeredAndReviewCount}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-950">
                  Answered & Marked for Review
                </span>
              </div>
            </div>

            {/* Questions Palette Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {activeSection?.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {sectionQuestions.length} Questions
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-1 max-h-[340px] overflow-y-auto p-1">
                {sectionQuestions.map((q) => {
                  const globalIdx = attempt.questions.findIndex((item) => item.id === q.id);
                  const isCurrent = globalIdx === currentIndex;

                  // Determine color class
                  let colorClass = "bg-slate-200 text-slate-700 hover:bg-slate-300"; // Not visited
                  let hasReviewDot = false;

                  if (q.selectedOptionKey && q.markedForReview) {
                    colorClass = "bg-purple-600 text-white";
                    hasReviewDot = true;
                  } else if (q.markedForReview) {
                    colorClass = "bg-purple-600 text-white";
                  } else if (q.selectedOptionKey) {
                    colorClass = "bg-emerald-600 text-white";
                  } else if (q.isVisited) {
                    colorClass = "bg-rose-500 text-white";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(globalIdx)}
                      className={`relative h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${colorClass} ${
                        isCurrent
                          ? "ring-4 ring-slate-900 ring-offset-2 scale-105 shadow-md"
                          : "shadow-2xs hover:scale-105"
                      }`}
                    >
                      {globalIdx + 1}
                      {hasReviewDot && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Bottom Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Entire Exam</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 text-center mb-1">
              Confirm Examination Submission
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-6">
              You are about to finalize your test. Review your overall attempt summary before final submission:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center mb-6 text-xs">
              <div className="p-2">
                <span className="text-slate-400 block font-medium">Answered</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {answeredCount + answeredAndReviewCount}
                </span>
              </div>
              <div className="p-2">
                <span className="text-slate-400 block font-medium">Unanswered</span>
                <span className="text-base font-extrabold text-rose-600">
                  {notAnsweredCount + notVisitedCount}
                </span>
              </div>
              <div className="p-2">
                <span className="text-slate-400 block font-medium">Review</span>
                <span className="text-base font-extrabold text-purple-600">
                  {reviewOnlyCount}
                </span>
              </div>
              <div className="p-2">
                <span className="text-slate-400 block font-medium">Total</span>
                <span className="text-base font-extrabold text-slate-900">
                  {attempt.questions.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>Grading Responses...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Yes, Submit Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Warning Modal */}
      {showTabWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-500 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-rose-950 mb-1">
              Warning: Tab Switch Detected!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              You left the exam window. This simulation tracks focus loss as part of anti-cheat regulations.
            </p>

            <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-6">
              Total Warnings: {tabSwitchWarnings} / 3
            </div>

            <button
              onClick={() => setShowTabWarningModal(false)}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold shadow-md transition-colors"
            >
              I Understand & Return to Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
