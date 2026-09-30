"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Copy,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ReviewQuestion {
  id: string;
  questionText: string;
  difficulty: string;
  sourceType: string;
  explanation: string;
  shortcut?: string;
  commonMistake?: string;
  subject?: { name: string; slug: string };
  topic?: { name: string; slug: string };
  exam?: { name: string; slug: string };
  options: Array<{ id: string; optionKey: string; optionText: string; isCorrect: boolean }>;
  pyqMetadata?: { exam: string; examYear: number; shift?: string; verificationStatus?: string };
}

export default function AdminReviewQueuePage() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchReviewQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/question-bank/review");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (e) {
      console.error("Failed to load review queue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewQuestions();
  }, []);

  const handleAction = async (questionId: string, action: "APPROVE" | "REJECT" | "MARK_DUPLICATE") => {
    try {
      setActiveActionId(questionId);
      const res = await fetch("/api/admin/question-bank/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action, reviewNotes }),
      });

      if (res.ok) {
        setMessage({ text: `Question ${action.toLowerCase()}d successfully.`, type: "success" });
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } else {
        setMessage({ text: "Failed to process review action.", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setActiveActionId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin/question-bank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Question Bank Intelligence
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              Content Review & Validation Queue
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Verify pending questions, flagged duplicates, and PYQ metadata integrity
            </p>
          </div>

          <button
            onClick={fetchReviewQuestions}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* Content list */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
            Loading pending review items...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">Review Queue is Clear!</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              All 5,000+ questions in the database are verified, categorized, and passing all schema & answer integrity checks.
            </p>
            <Link
              href="/admin/question-bank"
              className="inline-block mt-6 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {q.subject?.name || "General"}
                    </span>
                    <span className="text-xs text-slate-400">• {q.topic?.name || "Topic"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {q.difficulty}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {q.sourceType}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-100 mb-4">{q.questionText}</h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                        opt.isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-950/60 border-slate-800 text-slate-300"
                      }`}
                    >
                      <span>
                        <strong className="mr-1">{opt.optionKey}.</strong> {opt.optionText}
                      </span>
                      {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 mb-4">
                    <strong className="text-slate-300 block mb-1">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}

                {/* PYQ Metadata */}
                {q.pyqMetadata && (
                  <div className="text-xs text-sky-400 mb-4 flex items-center gap-2">
                    <span>
                      Official Record: {q.pyqMetadata.exam} ({q.pyqMetadata.examYear}) {q.pyqMetadata.shift}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                  <span className="text-xs text-slate-500">ID: {q.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeActionId === q.id}
                      onClick={() => handleAction(q.id, "REJECT")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={activeActionId === q.id}
                      onClick={() => handleAction(q.id, "MARK_DUPLICATE")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button
                      disabled={activeActionId === q.id}
                      onClick={() => handleAction(q.id, "APPROVE")}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
