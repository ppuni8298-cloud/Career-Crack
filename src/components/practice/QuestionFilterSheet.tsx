"use client";

import { useEffect, useState } from "react";
import { Filter, X, RotateCcw, Check } from "lucide-react";

export interface FilterState {
  exam: string;
  subject: string;
  topic: string;
  difficulty: string;
  sourceType: string;
  bookmarked: boolean;
  search: string;
}

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

interface QuestionFilterSheetProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isAuthenticated: boolean;
}

export default function QuestionFilterSheet({
  filters,
  onChange,
  isOpenMobile,
  onCloseMobile,
  isAuthenticated,
}: QuestionFilterSheetProps) {
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Load available exams and subjects on mount
  useEffect(() => {
    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data?.exams) setExams(data.exams);
      })
      .catch(() => {});

    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data?.subjects) setSubjects(data.subjects);
      })
      .catch(() => {});
  }, []);

  // When subject filter changes, fetch relevant topics
  useEffect(() => {
    if (!filters.subject || filters.subject === "ALL") {
      setTopics([]);
      return;
    }

    setLoadingTopics(true);
    fetch(`/api/subjects/${filters.subject}/topics`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.topics) {
          setTopics(data.topics);
        } else {
          setTopics([]);
        }
      })
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, [filters.subject]);

  const handleUpdate = (partial: Partial<FilterState>) => {
    onChange({
      ...filters,
      ...partial,
      // If subject changed, reset topic
      ...(partial.subject !== undefined && { topic: "ALL" }),
    });
  };

  const handleReset = () => {
    onChange({
      exam: "ALL",
      subject: "ALL",
      topic: "ALL",
      difficulty: "ALL",
      sourceType: "ALL",
      bookmarked: false,
      search: "",
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Practice Bank</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Target Exam Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Target Exam
        </label>
        <select
          value={filters.exam}
          onChange={(e) => handleUpdate({ exam: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
        >
          <option value="ALL">All Exams</option>
          {exams.map((ex) => (
            <option key={ex.slug} value={ex.slug}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Subject
        </label>
        <select
          value={filters.subject}
          onChange={(e) => handleUpdate({ subject: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.slug} value={sub.slug}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Topic Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Topic
        </label>
        <select
          value={filters.topic}
          onChange={(e) => handleUpdate({ topic: e.target.value })}
          disabled={filters.subject === "ALL" || loadingTopics}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
        >
          <option value="ALL">
            {filters.subject === "ALL" ? "Select a subject first" : "All Topics"}
          </option>
          {topics.map((top) => (
            <option key={top.slug} value={top.slug}>
              {top.name}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Difficulty
        </label>
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => handleUpdate({ difficulty: diff })}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                filters.difficulty === diff
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {diff === "ALL" ? "All" : diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Source Type Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Question Source
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          {[
            { key: "ALL", label: "All" },
            { key: "PRACTICE", label: "Practice" },
            { key: "PYQ", label: "PYQ" },
          ].map((src) => (
            <button
              key={src.key}
              type="button"
              onClick={() => handleUpdate({ sourceType: src.key })}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                filters.sourceType === src.key
                  ? "bg-white text-slate-900 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarked Filter Toggle */}
      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Bookmarked Questions
            </span>
            <span className="text-[11px] text-slate-500">
              Only show questions you saved
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleUpdate({ bookmarked: !filters.bookmarked })}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              filters.bookmarked
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-slate-300 text-transparent hover:border-emerald-400"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm sticky top-24">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-900 text-lg">Filters</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
