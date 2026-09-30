"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  BookmarkCheck,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface RevisionItem {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  reason: string;
  intervalDays: number;
  nextReviewDate: string;
  lastPracticedAt: string | null;
  status: "PENDING" | "SNOOZED" | "MASTERED";
  accuracy: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  unresolvedMistakesCount: number;
  isOverdue: boolean;
}

interface RevisionQueueData {
  dueToday: RevisionItem[];
  upcoming: RevisionItem[];
  mastered: RevisionItem[];
  totalActive: number;
}

export default function RevisionPage() {
  const [data, setData] = useState<RevisionQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"due" | "upcoming" | "mastered">("due");
  const [syncing, setSyncing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [snoozeMenuOpenId, setSnoozeMenuOpenId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/revision");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load revision queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC" }),
      });
      if (res.ok) {
        const result = await res.json();
        showToast(result.message || "Synced revision schedule!");
        await fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSnooze = async (id: string, days: number) => {
    try {
      setActionLoadingId(id);
      setSnoozeMenuOpenId(null);
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SNOOZE", id, days }),
      });
      if (res.ok) {
        showToast(`Topic snoozed for ${days} days.`);
        await fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMaster = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MASTER", id }),
      });
      if (res.ok) {
        showToast("Marked topic as mastered. It will resurface if accuracy drops.");
        await fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList =
    activeTab === "due"
      ? data?.dueToday || []
      : activeTab === "upcoming"
      ? data?.upcoming || []
      : data?.mastered || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-white">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border border-emerald-400/30 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/20 p-8 sm:p-10 mb-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 tracking-wide uppercase">
                <BrainCircuit className="w-3.5 h-3.5" />
                Spaced Repetition & Retention Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Intelligent Revision Center
              </h1>
              <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
                Counter Ebbinghaus&apos;s forgetting curve. Career Crack dynamically recalculates your review schedule based on recent mistake clusters, declining topic accuracy, and dormancy intervals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin text-emerald-400" : ""}`} />
                {syncing ? "Syncing..." : "Sync Activity"}
              </button>

              {data && data.dueToday.length > 0 && (
                <Link
                  href="/crack-mode"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Review All Due in Crack Mode
                </Link>
              )}
            </div>
          </div>

          {/* Retention Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Due for Review</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{data?.dueToday.length ?? 0}</span>
                <span className="text-xs text-slate-400">topics</span>
              </div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Upcoming Schedule</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-400">{data?.upcoming.length ?? 0}</span>
                <span className="text-xs text-slate-400">scheduled</span>
              </div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Retention Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {data && (data.totalActive + data.mastered.length) > 0
                    ? Math.round((data.mastered.length / (data.totalActive + data.mastered.length)) * 100)
                    : 0}%
                </span>
                <span className="text-xs text-slate-400">retained</span>
              </div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Mastered Topics</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{data?.mastered.length ?? 0}</span>
                <span className="text-xs text-slate-400">topics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("due")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "due"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Due Today ({data?.dueToday.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "upcoming"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming Scheduled ({data?.upcoming.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("mastered")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "mastered"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              Mastered ({data?.mastered.length ?? 0})
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Intervals: 1d &rarr; 3d &rarr; 7d &rarr; 14d &rarr; 30d
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Evaluating retention curves and scheduling...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === "due"
                ? "All caught up! Zero topics due."
                : activeTab === "upcoming"
                ? "No upcoming revision sessions queued."
                : "No mastered topics yet."}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {activeTab === "due"
                ? "Your memory retention is optimal. Continue practicing in Crack Mode or take a full-length mock to generate new spaced intervals."
                : activeTab === "upcoming"
                ? "Topics will appear here once practiced and scheduled across spaced intervals."
                : "Maintain accuracy above 85% with zero unresolved mistakes to cement topics into Mastered status."}
            </p>
            <Link
              href="/crack-mode"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
            >
              Start Adaptive Drill <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentList.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-sm"
              >
                <div>
                  {/* Subject and Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5 truncate max-w-[160px]">
                      {item.subjectName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.priority === "HIGH" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider">
                          High Priority
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[10px] font-mono">
                        {item.intervalDays}d cycle
                      </span>
                    </div>
                  </div>

                  {/* Topic Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition mb-2">
                    {item.topicName}
                  </h3>

                  {/* Reason box */}
                  <p className="text-xs text-slate-300 bg-black/40 border border-white/5 rounded-xl p-3 mb-4 leading-relaxed">
                    <span className="text-slate-400 font-semibold block mb-0.5">Trigger Reason:</span>
                    {item.reason}
                  </p>

                  {/* Accuracy & Mistakes Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[11px]">Accuracy</span>
                      <span className={`text-base font-bold ${item.accuracy >= 75 ? "text-emerald-400" : item.accuracy >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {item.accuracy}%
                      </span>
                    </div>

                    <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[11px]">Unresolved Mistakes</span>
                      <span className={`text-base font-bold ${item.unresolvedMistakesCount > 0 ? "text-red-400" : "text-slate-300"}`}>
                        {item.unresolvedMistakesCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-5">
                    <span>Due: <strong className="text-slate-200">{item.nextReviewDate}</strong></span>
                    {item.lastPracticedAt && (
                      <span>Last: {new Date(item.lastPracticedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/crack-mode?topicId=${item.topicId}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Practice Drill
                    </Link>

                    {item.unresolvedMistakesCount > 0 && (
                      <Link
                        href={`/mistakes?topicId=${item.topicId}`}
                        className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition"
                        title="Review mistake vault for this topic"
                      >
                        Mistakes ({item.unresolvedMistakesCount})
                      </Link>
                    )}
                  </div>

                  <div className="relative flex items-center justify-between gap-2 pt-1">
                    {/* Snooze Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setSnoozeMenuOpenId(snoozeMenuOpenId === item.id ? null : item.id)}
                        disabled={actionLoadingId === item.id}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white/5 transition"
                      >
                        <Clock className="w-3 h-3" />
                        Snooze...
                      </button>

                      {snoozeMenuOpenId === item.id && (
                        <div className="absolute left-0 bottom-full mb-1 z-20 w-36 bg-slate-800 border border-white/10 rounded-xl shadow-xl p-1.5 backdrop-blur-md flex flex-col gap-1 text-xs">
                          <button
                            onClick={() => handleSnooze(item.id, 1)}
                            className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-left text-slate-300 transition"
                          >
                            +1 Day
                          </button>
                          <button
                            onClick={() => handleSnooze(item.id, 3)}
                            className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-left text-slate-300 transition"
                          >
                            +3 Days
                          </button>
                          <button
                            onClick={() => handleSnooze(item.id, 7)}
                            className="px-2 py-1.5 rounded-lg hover:bg-white/10 text-left text-slate-300 transition"
                          >
                            +7 Days
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Master Action */}
                    {item.status !== "MASTERED" && (
                      <button
                        onClick={() => handleMaster(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-emerald-500/10 transition"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Mastered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
