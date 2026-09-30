"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Zap,
  Target,
  Layers,
  HelpCircle,
  AlertCircle,
  Play,
  Flame,
  Award,
} from "lucide-react";

interface ExamOption {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface SubjectOption {
  id: string;
  name: string;
  slug: string;
}

interface TopicOption {
  id: string;
  name: string;
  slug: string;
}

interface PracticeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExamId?: string;
  defaultSubjectId?: string;
  defaultTopicId?: string;
  isAuthenticated: boolean;
}

export default function PracticeSetupModal({
  isOpen,
  onClose,
  defaultExamId = "ALL",
  defaultSubjectId = "ALL",
  defaultTopicId = "ALL",
  isAuthenticated,
}: PracticeSetupModalProps) {
  const router = useRouter();

  // Configuration state
  const [examId, setExamId] = useState(defaultExamId);
  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [topicId, setTopicId] = useState(defaultTopicId);
  const [difficulty, setDifficulty] = useState<string>("MIXED");
  const [sourceType, setSourceType] = useState<string>("ALL");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<"TEST" | "LEARNING">("LEARNING");
  const [timerOption, setTimerOption] = useState<string>("AUTO"); // "NO_TIMER", "10", "20", "30", "AUTO"

  // Catalogs
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load catalogs on mount
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => d?.exams && setExams(d.exams))
      .catch(() => {});

    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => d?.subjects && setSubjects(d.subjects))
      .catch(() => {});
  }, [isOpen]);

  // When subject changes, fetch topics
  useEffect(() => {
    if (!subjectId || subjectId === "ALL") {
      setTopics([]);
      setTopicId("ALL");
      return;
    }

    const selectedSub = subjects.find((s) => s.id === subjectId);
    if (!selectedSub) return;

    fetch(`/api/subjects/${selectedSub.slug}/topics`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.topics) {
          setTopics(d.topics);
        } else {
          setTopics([]);
        }
      })
      .catch(() => setTopics([]));
  }, [subjectId, subjects]);

  // Dynamic preview count of available questions matching criteria
  useEffect(() => {
    if (!isOpen) return;

    setLoadingCount(true);
    const params = new URLSearchParams();
    if (examId && examId !== "ALL") params.set("exam", examId);
    if (subjectId && subjectId !== "ALL") {
      const sub = subjects.find((s) => s.id === subjectId);
      if (sub) params.set("subject", sub.slug);
    }
    if (topicId && topicId !== "ALL") {
      const top = topics.find((t) => t.id === topicId);
      if (top) params.set("topic", top.slug);
    }
    if (difficulty && difficulty !== "MIXED") params.set("difficulty", difficulty);
    if (sourceType && sourceType !== "ALL") params.set("sourceType", sourceType);

    params.set("limit", "1");

    fetch(`/api/questions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.pagination) {
          setAvailableCount(d.pagination.total);
        } else {
          setAvailableCount(0);
        }
      })
      .catch(() => setAvailableCount(null))
      .finally(() => setLoadingCount(false));
  }, [isOpen, examId, subjectId, topicId, difficulty, sourceType, subjects, topics]);

  const handleStartSession = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/practice");
      return;
    }

    setSubmitting(true);
    setError(null);

    let durationMinutes: number | null | string = null;
    if (timerOption === "10") durationMinutes = 10;
    else if (timerOption === "20") durationMinutes = 20;
    else if (timerOption === "30") durationMinutes = 30;
    else if (timerOption === "AUTO") durationMinutes = "AUTO";

    try {
      const res = await fetch("/api/practice/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: examId !== "ALL" ? examId : undefined,
          subjectId: subjectId !== "ALL" ? subjectId : undefined,
          topicId: topicId !== "ALL" ? topicId : undefined,
          difficulty,
          sourceType,
          totalQuestions: questionCount,
          durationMinutes,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create practice session.");
      }

      onClose();
      router.push(`/practice/session/${data.sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to initialize practice session.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
              🌱
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Configure Practice Session
              </h3>
              <p className="text-xs text-slate-500">
                Tailor questions, difficulty, timer, and mode.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Practice Mode Selector */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Practice Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("LEARNING")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "LEARNING"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-emerald-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Learning Mode</span>
                </span>
                {mode === "LEARNING" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Immediate answers, concept insights, and shortcuts after each question.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("TEST")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "TEST"
                  ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-emerald-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-600" />
                  <span>Test Mode</span>
                </span>
                {mode === "TEST" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Real exam condition. Skip, mark for review, full answers revealed at completion.
              </p>
            </button>
          </div>
        </div>

        {/* Exam & Subject Configuration */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Exam
            </label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Selector (if subject selected) */}
        {subjectId !== "ALL" && topics.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Topics in Subject</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Question Count & Difficulty */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Number of Questions
            </label>
            <div className="flex items-center gap-1.5">
              {[5, 10, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    questionCount === num
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Difficulty
            </label>
            <div className="flex items-center gap-1.5">
              {["MIXED", "EASY", "MEDIUM", "HARD"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    difficulty === diff
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {diff === "MIXED" ? "Mix" : diff.charAt(0) + diff.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Source & Timer */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Source
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { id: "ALL", label: "All" },
                { id: "PRACTICE", label: "Practice" },
                { id: "PYQ", label: "PYQs" },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSourceType(src.id)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    sourceType === src.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Timer
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { id: "AUTO", label: "Auto (1m/Q)" },
                { id: "10", label: "10m" },
                { id: "20", label: "20m" },
                { id: "NO_TIMER", label: "Untimed" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimerOption(t.id)}
                  className={`flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    timerOption === t.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>
              {loadingCount
                ? "Checking database..."
                : availableCount !== null
                ? `${availableCount} matching questions available in database`
                : "Checking availability..."}
            </span>
          </span>
          {availableCount !== null && availableCount < questionCount && availableCount > 0 && (
            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              Will use {availableCount} Qs
            </span>
          )}
        </div>

        {/* Submit Action */}
        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={handleStartSession}
            disabled={submitting || availableCount === 0}
            className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {submitting ? "Initializing Session..." : "Start Practice Session"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
