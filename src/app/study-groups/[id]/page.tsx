"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Users,
  Trophy,
  Target,
  Plus,
  ArrowLeft,
  Crown,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2,
  RefreshCw,
} from "lucide-react";

interface Member {
  userId: string;
  name: string;
  role: string;
  level: number;
  totalXP: number;
  title: string;
  streakDays: number;
  readinessScore: number;
  isCurrentUser: boolean;
}

interface Goal {
  id: string;
  title: string;
  targetCount: number;
  subject: string | null;
  dueDate: string | null;
  isCompleted: boolean;
}

interface GroupDetail {
  id: string;
  name: string;
  code: string;
  description: string | null;
  targetExam: string;
  ownerId: string;
  memberCount: number;
  isMember: boolean;
  members: Member[];
  goals: Goal[];
}

export default function StudyGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Goal Form
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState(25);
  const [goalSubject, setGoalSubject] = useState("Quantitative Aptitude");
  const [goalDueDate, setGoalDueDate] = useState("");
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/study-groups/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      }
    } catch (e) {
      console.error("Failed to load group details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const copyCode = () => {
    if (group?.code) {
      navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleJoinDirect = async () => {
    if (!group?.code) return;
    try {
      const res = await fetch("/api/study-groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: group.code }),
      });
      if (res.ok) {
        fetchGroupDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      setGoalSubmitting(true);
      const res = await fetch(`/api/study-groups/${id}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle.trim(),
          targetCount: Number(goalTarget),
          subject: goalSubject,
          dueDate: goalDueDate || null,
        }),
      });

      if (res.ok) {
        setShowGoalModal(false);
        setGoalTitle("");
        fetchGroupDetails();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGoalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading study group hub...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32 text-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Study Group Not Found</h2>
            <Link
              href="/study-groups"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Back to Study Groups
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/study-groups"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Study Groups
          </Link>
        </div>

        {/* Group Header Hero */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {group.targetExam}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {group.memberCount} active member{group.memberCount !== 1 ? "s" : ""}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {group.name}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                {group.description || "Shared preparation space for consistent practice, topic mastery, and mock tests."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Copy Invite Code Card */}
              <button
                onClick={copyCode}
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 hover:bg-slate-100 transition-all text-xs font-semibold"
                title="Click to copy invite code"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Invite Code: <strong className="tracking-wider text-slate-900">{group.code}</strong></span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>

              {!group.isMember && (
                <button
                  onClick={handleJoinDirect}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Join This Group
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Leaderboard & Study Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member Leaderboard */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Group Member Leaderboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Ranked by total XP earned across practice drills & mock tests</p>
              </div>
            </div>

            <div className="space-y-3">
              {group.members.map((mem, idx) => (
                <div
                  key={mem.userId}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    mem.isCurrentUser
                      ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
                      : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700"
                          : idx === 2
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {idx === 0 ? <Crown className="w-4 h-4 text-amber-600" /> : `#${idx + 1}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {mem.name} {mem.isCurrentUser && <span className="text-xs text-emerald-600 font-semibold">(You)</span>}
                        </span>
                        {mem.role === "OWNER" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Level {mem.level} • {mem.title}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Flame className="w-3 h-3" /> {mem.streakDays}d Streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-700">
                      {mem.totalXP.toLocaleString()} XP
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Readiness: {mem.readinessScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Study Targets & Goals */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Shared Goals
                </h3>

                {group.isMember && (
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Set Goal
                  </button>
                )}
              </div>

              {group.goals.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200/60">
                  <Target className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No active goals yet.</p>
                  {group.isMember && (
                    <button
                      onClick={() => setShowGoalModal(true)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm"
                    >
                      Create First Goal
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {group.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{goal.title}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {goal.targetCount} Qs
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-2">
                        <span>{goal.subject || "General"}</span>
                        {goal.dueDate && <span>Due: {goal.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                href="/practice"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Practice For Group Goals
              </Link>
            </div>
          </div>
        </div>

        {/* Set Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Set Group Study Goal</h3>
              <p className="text-xs text-slate-500 mb-4">
                Define a challenge for all members in this study circle.
              </p>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master 30 Profit & Loss Questions"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Question Count</label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={goalSubject}
                      onChange={(e) => setGoalSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={goalSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {goalSubmitting ? "Setting..." : "Set Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
