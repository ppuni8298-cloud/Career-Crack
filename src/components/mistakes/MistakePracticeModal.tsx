"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Play, Target, Sparkles, BookOpen, AlertCircle, Layers } from "lucide-react";

interface MistakePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTopics: Array<{ id: string; name: string; count: number }>;
  totalMistakes: number;
  unresolvedCount: number;
}

export default function MistakePracticeModal({
  isOpen,
  onClose,
  availableTopics,
  totalMistakes,
  unresolvedCount,
}: MistakePracticeModalProps) {
  const router = useRouter();

  const [onlyUnresolved, setOnlyUnresolved] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("ALL");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<"LEARNING" | "TEST">("LEARNING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetPoolCount = onlyUnresolved ? unresolvedCount : totalMistakes;

  const handleStartDrill = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mistakes/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          onlyUnresolved,
          topicId: selectedTopicId !== "ALL" ? selectedTopicId : undefined,
          questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize mistake drill.");
      }

      onClose();
      router.push(`/practice/session/${data.sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to launch practice session.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-100">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Practice My Mistakes
              </h3>
              <p className="text-xs text-slate-500">
                Targeted revision from your recorded mistake vault.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Scope Toggle */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Mistake Pool
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOnlyUnresolved(true)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                onlyUnresolved
                  ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="font-extrabold text-xs text-slate-900">Unresolved Only</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{unresolvedCount} questions</div>
            </button>

            <button
              type="button"
              onClick={() => setOnlyUnresolved(false)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                !onlyUnresolved
                  ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="font-extrabold text-xs text-slate-900">All Mistakes</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{totalMistakes} questions</div>
            </button>
          </div>
        </div>

        {/* Practice Mode */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Practice Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("LEARNING")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "LEARNING"
                  ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Learning Mode</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Instant solutions & shortcuts</p>
            </button>

            <button
              type="button"
              onClick={() => setMode("TEST")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                mode === "TEST"
                  ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-teal-600" />
                <span>Test Mode</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Timed test conditions</p>
            </button>
          </div>
        </div>

        {/* Topic Filter */}
        {availableTopics.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic Filter (Optional)
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Mistake Topics ({targetPoolCount} Qs)</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.count} mistakes)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Question Count */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Number of Questions
          </label>
          <div className="flex items-center gap-2">
            {[5, 10, 20].map((num) => (
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
                {num} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>{targetPoolCount} matching mistakes in vault</span>
          </span>
          {targetPoolCount < questionCount && targetPoolCount > 0 && (
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              Will use {targetPoolCount} Qs
            </span>
          )}
        </div>

        {/* Action button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleStartDrill}
            disabled={loading || targetPoolCount === 0}
            className="w-full py-3 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? "Starting Drill..." : "Start Mistake Practice"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
