"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Trophy,
  Award,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Calendar,
  BookOpen,
  Compass,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  BarChart2,
  Medal,
  Star,
  ExternalLink,
} from "lucide-react";

interface UserProfileData {
  user: {
    name: string;
    email: string;
    joinedAt: string;
  };
  profile: {
    targetExam: string;
    dailyStudyHours: string;
    readinessScore: number;
    streakDays: number;
    longestStreak: number;
    targetExamDate: string | null;
    lastActiveDate: string | null;
  } | null;
  xpLevel: {
    totalXP: number;
    level: number;
    title: string;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    xpToNextLevel: number;
    progressPct: number;
  };
  personalRecords: Record<string, { value: number; achievedAt: string }>;
  achievements: Array<{
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    tier: string;
    criteriaType: string;
    criteriaValue: number;
    xpReward: number;
    isUnlocked: boolean;
    earnedAt: string | null;
  }>;
  unlockedCount: number;
  stats: {
    totalSessions: number;
    totalQuestions: number;
    totalMocks: number;
  };
  charts: {
    xpHistory: Array<{ date: string; xp: number; dayLabel: string }>;
    accuracyTrend: Array<{ sessionId: string; accuracy: number; date: string; questions: number }>;
    mockHistory: Array<{ attemptId: string; accuracy: number; score: number; date: string }>;
  };
}

export default function ProfilePage() {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/profile/advanced");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/profile";
          return;
        }
        throw new Error("Failed to load profile data");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Profile load error:", err);
      setError(err.message || "Something went wrong loading your profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSyncXP = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await fetch("/api/xp/sync");
      const json = await res.json();
      if (res.ok) {
        setSyncMessage(
          json.transactionsCreated > 0
            ? `Synced! +${json.totalAwarded} XP awarded from your past activities.`
            : "All XP is already up to date!"
        );
        fetchProfile();
      } else {
        setSyncMessage("Sync completed.");
      }
    } catch {
      setSyncMessage("XP sync failed. Please try again.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const categories = ["ALL", "PRACTICE", "ACCURACY", "STREAK", "MOCK", "XP", "MISTAKES"];

  const filteredAchievements = data?.achievements.filter((a) => {
    if (selectedCategory === "ALL") return true;
    return a.category.toUpperCase() === selectedCategory;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-44 bg-slate-200/80 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200/70 rounded-2xl" />
              ))}
            </div>
            <div className="h-72 bg-slate-200/60 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load profile</h2>
            <p className="text-sm text-slate-600 mb-6">{error || "Please try logging in again."}</p>
            <button
              onClick={fetchProfile}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, profile, xpLevel, personalRecords, stats, charts } = data;
  const maxXPInChart = Math.max(...charts.xpHistory.map((d) => d.xp), 50);

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Sync Toast Notification */}
        {syncMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Hero Aspirant Header & Level Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* User Identity */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs">
                  Lv.{xpLevel.level}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white" id="profile-user-name">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    {profile?.targetExam || "Aspirant"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mb-2">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>
                    Member since {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-emerald-200 backdrop-blur-xs">
                    Title: <strong className="text-white">{xpLevel.title}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Sync XP & Quick Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncXP}
                disabled={syncing}
                id="sync-xp-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs backdrop-blur-md border border-white/15 transition-all cursor-pointer disabled:opacity-50"
                title="Recalculate XP from all past tests, sessions, and streaks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
                <span>{syncing ? "Syncing XP..." : "Sync XP History"}</span>
              </button>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all"
                id="view-leaderboard-btn"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold mb-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Level {xpLevel.level} • {xpLevel.title}
                </span>
              </div>
              <div className="text-slate-300">
                <strong className="text-white font-black">{xpLevel.totalXP.toLocaleString()} XP</strong> total
                {xpLevel.level < 25 && (
                  <span className="text-slate-400 ml-1">
                    ({xpLevel.xpToNextLevel.toLocaleString()} XP to Level {xpLevel.level + 1})
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all duration-700 shadow-sm shadow-emerald-400/50"
                style={{ width: `${Math.max(4, xpLevel.progressPct)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-1.5">
              <span>{xpLevel.xpForCurrentLevel} XP</span>
              <span className="text-emerald-300">{xpLevel.progressPct}% towards next rank</span>
              <span>{xpLevel.xpForNextLevel} XP</span>
            </div>
          </div>
        </section>

        {/* Key Career Metrics Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Exam Readiness</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {profile?.readinessScore ?? 35}%
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">Calculated preparation index</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Streak</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {profile?.streakDays ?? 1} <span className="text-sm font-semibold text-slate-500">days</span>
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                Longest: {profile?.longestStreak ?? 1} days 🔥
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Drills Done</span>
              <Compass className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalSessions}</span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                {stats.totalQuestions} questions attempted
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Full Mocks</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalMocks}</span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">Exam simulation tests</span>
            </div>
          </div>
        </section>

        {/* Personal Records Trophy Shelf */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                <span>Personal Best Records</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Your peak performance milestones on Career Crack</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Record 1 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-emerald-100/30 border border-emerald-200/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                🎯
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Best Drill Accuracy</span>
                <div className="text-xl font-black text-slate-900">
                  {personalRecords["BEST_ACCURACY"] ? `${Math.round(personalRecords["BEST_ACCURACY"].value)}%` : "N/A"}
                </div>
                <span className="text-[10px] text-slate-500">Min. 5 questions</span>
              </div>
            </div>

            {/* Record 2 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-indigo-100/30 border border-indigo-200/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
                🏆
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Best Mock Accuracy</span>
                <div className="text-xl font-black text-slate-900">
                  {personalRecords["BEST_MOCK_SCORE"] ? `${Math.round(personalRecords["BEST_MOCK_SCORE"].value)}%` : "N/A"}
                </div>
                <span className="text-[10px] text-slate-500">Exam simulation</span>
              </div>
            </div>

            {/* Record 3 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-amber-100/30 border border-amber-200/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl shadow-xs">
                🔥
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Longest Streak</span>
                <div className="text-xl font-black text-slate-900">
                  {personalRecords["LONGEST_STREAK"] ? `${personalRecords["LONGEST_STREAK"].value} Days` : `${profile?.longestStreak || 1} Days`}
                </div>
                <span className="text-[10px] text-slate-500">Continuous study</span>
              </div>
            </div>

            {/* Record 4 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-purple-100/30 border border-purple-200/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-xs">
                ⚡
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">Max XP in 1 Day</span>
                <div className="text-xl font-black text-slate-900">
                  {personalRecords["MAX_XP_DAY"] ? `${personalRecords["MAX_XP_DAY"].value} XP` : "N/A"}
                </div>
                <span className="text-[10px] text-slate-500">Daily personal record</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 30-Day XP Activity Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-600" />
                  <span>30-Day XP Growth Activity</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Last 30 Days
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Daily experience points earned from drills, mocks, and challenges</p>

              {/* Bar Chart Visualization */}
              <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {charts.xpHistory.map((d, idx) => {
                  const heightPct = d.xp > 0 ? Math.min(100, Math.max(12, Math.round((d.xp / maxXPInChart) * 100))) : 4;
                  return (
                    <div key={idx} className="flex-1 min-w-[8px] flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                        {d.dayLabel}: <strong>{d.xp} XP</strong>
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          d.xp > 0
                            ? "bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300"
                            : "bg-slate-100"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Total in window:</span>
              <strong className="text-slate-900 font-extrabold">
                {charts.xpHistory.reduce((sum, d) => sum + d.xp, 0).toLocaleString()} XP
              </strong>
            </div>
          </div>

          {/* Accuracy Trend Across Practice Sessions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <span>Recent Practice Accuracy Trend</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Last 14 Drills
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">Chronological accuracy trajectory across completed practice sessions</p>

              {charts.accuracyTrend.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Compass className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No completed practice sessions yet.</span>
                  <Link href="/practice" className="mt-2 text-emerald-600 font-bold hover:underline">
                    Start a Practice Drill →
                  </Link>
                </div>
              ) : (
                <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                  {charts.accuracyTrend.map((s, idx) => {
                    const isHigh = s.accuracy >= 75;
                    const isMed = s.accuracy >= 50 && s.accuracy < 75;
                    return (
                      <div key={idx} className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                          {s.accuracy}% ({s.questions} Qs)
                        </div>
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isHigh
                              ? "bg-emerald-500 group-hover:bg-emerald-400"
                              : isMed
                              ? "bg-amber-500 group-hover:bg-amber-400"
                              : "bg-rose-400 group-hover:bg-rose-300"
                          }`}
                          style={{ height: `${Math.max(8, s.accuracy)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2">
                <span>Older drills</span>
                <span>Latest drill</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Benchmark target:</span>
              <strong className="text-emerald-700 font-bold">75%+ for Tier-1 exam selection</strong>
            </div>
          </div>
        </section>

        {/* Trophy Room & Achievement Badges Showcase */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Career Crack Trophy Room</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unlocked {data.unlockedCount} of {data.achievements.length} badges
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.isUnlocked;
              const tierColor =
                ach.tier === "GOLD"
                  ? "border-amber-300 bg-amber-50/40 text-amber-800"
                  : ach.tier === "SILVER"
                  ? "border-slate-300 bg-slate-50/80 text-slate-700"
                  : "border-orange-200 bg-orange-50/30 text-orange-800";

              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-white border-slate-200 shadow-xs hover:border-emerald-300"
                      : "bg-slate-50/70 border-slate-200/60 opacity-65"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${
                        isUnlocked ? "bg-amber-100 border border-amber-200" : "bg-slate-200 grayscale"
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${tierColor}`}>
                          {ach.tier}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          +{ach.xpReward} XP
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{ach.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ach.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {isUnlocked ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked{" "}
                        {ach.earnedAt ? new Date(ach.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                        🔒 Target: {ach.criteriaValue}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase text-slate-400">{ach.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Launchpad to Other Modules */}
        <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-emerald-700/10">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight mb-1">Ready for your next learning breakthrough?</h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              Solve today's Daily Crack 10 challenge, clear unresolved questions from your Mistake Vault, or practice PYQs to
              level up!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/daily-crack"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-colors"
            >
              Daily Crack 10 ⚡
            </Link>
            <Link
              href="/mistakes"
              className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-400/30 transition-colors"
            >
              Mistake Vault
            </Link>
            <Link
              href="/mock-tests"
              className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-400/30 transition-colors"
            >
              Mock Tests 🏆
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
