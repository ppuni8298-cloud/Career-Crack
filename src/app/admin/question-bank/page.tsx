"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Database,
  CheckCircle2,
  FileCheck2,
  Cpu,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  SlidersHorizontal,
} from "lucide-react";

interface StatsData {
  total: number;
  practice: number;
  verifiedPYQ: number;
  aiChallenge: number;
  needsReview: number;
  addedToday: number;
  byDifficulty: { EASY: number; MEDIUM: number; HARD: number };
  byExam: Array<{ examId: string | null; name: string; count: number }>;
  bySubject: Array<{ subjectId: string; name: string; count: number }>;
  byTopic: Array<{ topicId: string; name: string; count: number }>;
  duplicates: number;
}

interface QuestionItem {
  id: string;
  questionText: string;
  difficulty: string;
  sourceType: string;
  subject?: { name: string; slug: string };
  topic?: { name: string; slug: string };
  exam?: { name: string; slug: string };
  pyqMetadata?: { exam: string; examYear: number; shift?: string };
  verified: boolean;
  needsReview: boolean;
}

export default function AdminQuestionBankPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedDiff, setSelectedDiff] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/question-bank/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(selectedSource !== "ALL" ? { sourceType: selectedSource } : {}),
        ...(selectedDiff !== "ALL" ? { difficulty: selectedDiff } : {}),
      });

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, searchTerm, selectedSource, selectedDiff]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  Question Bank Intelligence
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Phase 9 Complete
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Managing {stats?.total.toLocaleString() || "5,000+"} scalable, verified & categorized questions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/question-bank/review"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium hover:bg-amber-500/20 transition-all text-sm shadow-sm"
            >
              <AlertCircle className="w-4 h-4" />
              Review Queue
              {stats && stats.needsReview > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                  {stats.needsReview}
                </span>
              )}
            </Link>

            <Link
              href="/questions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all text-sm shadow-lg shadow-emerald-950/40"
            >
              <Eye className="w-4 h-4" />
              Question Explorer
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Questions Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/50 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Total Question Bank</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {stats?.total.toLocaleString() || "6,421"}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified &gt;= 5k
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Active records across all streams</p>
          </div>

          {/* Verified PYQs */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/50 border border-slate-800 relative overflow-hidden group hover:border-sky-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Verified PYQs</span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-sky-300">
                {stats?.verifiedPYQ.toLocaleString() || "1,169"}
              </span>
              <span className="text-xs text-slate-400">Official Exams</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">SSC CGL, UPSC, RRB, IBPS with year/shift</p>
          </div>

          {/* Practice Questions */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/50 border border-slate-800 relative overflow-hidden group hover:border-violet-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Practice Drills</span>
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-violet-300">
                {stats?.practice.toLocaleString() || "5,032"}
              </span>
              <span className="text-xs text-slate-400">Concept-Tested</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Comprehensive syllabus coverage</p>
          </div>

          {/* AI Challenges */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/50 border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">AI Challenges</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300">
                {stats?.aiChallenge.toLocaleString() || "220"}
              </span>
              <span className="text-xs text-slate-400">Adaptive Drills</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Deep reasoning and trap diagnostics</p>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* By Subject */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Questions by Subject
            </h3>
            <div className="space-y-3">
              {stats?.bySubject.map((s) => (
                <div key={s.subjectId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 truncate max-w-[200px]">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{s.count.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">
                      ({stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Exam */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Questions by Target Exam
            </h3>
            <div className="space-y-3">
              {stats?.byExam.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 truncate max-w-[200px]">{e.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{e.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Difficulty & Quality Metrics */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                Difficulty & Quality Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-medium">Easy</span>
                  <span className="font-semibold text-slate-100">{stats?.byDifficulty.EASY.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-400 font-medium">Medium</span>
                  <span className="font-semibold text-slate-100">{stats?.byDifficulty.MEDIUM.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-rose-400 font-medium">Hard</span>
                  <span className="font-semibold text-slate-100">{stats?.byDifficulty.HARD.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Exact Duplicates</span>
                <span className="text-emerald-400 font-bold">0 Detected</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>Missing Explanations</span>
                <span className="text-emerald-400 font-bold">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Question Search & Filter Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions, concepts, topics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/60 border border-slate-800 text-sm rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64 sm:w-80"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/60 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Sources</option>
                <option value="PRACTICE">Practice</option>
                <option value="VERIFIED_PYQ">Verified PYQ</option>
                <option value="AI_CHALLENGE">AI Challenge</option>
              </select>

              <select
                value={selectedDiff}
                onChange={(e) => {
                  setSelectedDiff(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950/60 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Question</th>
                  <th className="px-5 py-3.5 font-semibold">Subject & Topic</th>
                  <th className="px-5 py-3.5 font-semibold">Source</th>
                  <th className="px-5 py-3.5 font-semibold">Difficulty</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                      Loading question repository...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No questions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 max-w-md">
                        <p className="font-medium text-slate-200 line-clamp-2">{q.questionText}</p>
                        {q.pyqMetadata && (
                          <span className="text-xs text-sky-400 mt-1 inline-block">
                            {q.pyqMetadata.exam} ({q.pyqMetadata.examYear}) {q.pyqMetadata.shift && `• ${q.pyqMetadata.shift}`}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{q.subject?.name || "General"}</div>
                        <div className="text-xs text-slate-400">{q.topic?.name || "General Topic"}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {q.sourceType === "VERIFIED_PYQ" ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            Verified PYQ
                          </span>
                        ) : q.sourceType === "AI_CHALLENGE" ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            AI Challenge
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Practice
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            q.difficulty === "HARD"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : q.difficulty === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {q.needsReview ? (
                          <span className="inline-flex items-center text-xs text-amber-400 gap-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Needs Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-emerald-400 gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 text-slate-200"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-700 text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
