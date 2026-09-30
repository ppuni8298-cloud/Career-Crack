"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Zap,
  Award,
  Compass,
  RefreshCw,
  User,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalXP: number;
  level: number;
  levelTitle: string;
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  totalParticipants: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "TOP_LEVELS">("ALL");

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/leaderboard");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/leaderboard";
          return;
        }
        throw new Error("Failed to fetch leaderboard");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Leaderboard fetch error:", err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const currentUser = data?.entries.find((e) => e.isCurrentUser);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-slate-200/80 rounded-3xl" />
            <div className="h-64 bg-slate-200/60 rounded-3xl" />
            <div className="h-80 bg-slate-200/50 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const entries = data?.entries || [];
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const displayedEntries =
    filterTab === "TOP_LEVELS"
      ? [...entries].sort((a, b) => b.level - a.level || b.totalXP - a.totalXP)
      : entries;

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Official Aspirant Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Community Leaderboard
          </h1>
          <p className="text-sm text-slate-600">
            Compete, practice consistently, and climb the ranks! Experience points (XP) are awarded for practice drills,
            full-length mock tests, daily challenges, and streak milestones.
          </p>
        </section>

        {/* Current User Highlight Banner */}
        {data && (
          <section className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                  {currentUser ? currentUser.displayName.charAt(0) : "★"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Your Current Standing</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {data.currentUserRank ? `Rank #${data.currentUserRank}` : "Unranked (Start Practicing)"}{" "}
                    <span className="text-slate-400 text-sm font-normal">
                      out of {data.totalParticipants} aspirants
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {currentUser
                      ? `${currentUser.displayName} • Level ${currentUser.level} (${currentUser.levelTitle}) • ${currentUser.totalXP.toLocaleString()} XP`
                      : "Complete your first drill or mock test to earn XP and enter the leaderboard!"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Earn More XP</span>
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Podium for Top 3 Aspirants */}
        {entries.length >= 3 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-8">
              Top 3 Aspirants • Hall of Fame
            </h2>

            <div className="flex flex-col md:flex-row items-end justify-center gap-4 sm:gap-6 pt-6">
              {/* 2nd Place (Silver) */}
              {top2 && (
                <div className="order-2 md:order-1 flex-1 max-w-xs w-full flex flex-col items-center">
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-800 font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white">
                      {top2.displayName.charAt(0)}
                    </div>
                    <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-sm">
                      🥈
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm text-center">{top2.displayName}</h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Lv.{top2.level} • {top2.levelTitle}
                  </span>
                  <div className="mt-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
                    {top2.totalXP.toLocaleString()} XP
                  </div>

                  {/* Podium Base */}
                  <div className="w-full mt-4 h-24 rounded-2xl bg-gradient-to-t from-slate-200 to-slate-100 border border-slate-300 flex items-center justify-center">
                    <span className="text-2xl font-black text-slate-400">#2</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Gold) - Taller */}
              {top1 && (
                <div className="order-1 md:order-2 flex-1 max-w-xs w-full flex flex-col items-center -mt-6">
                  <Crown className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce mb-1" />
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl border-4 border-amber-200">
                      {top1.displayName.charAt(0)}
                    </div>
                    <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                      🥇
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 text-base text-center">{top1.displayName}</h4>
                  <span className="text-xs font-bold text-amber-700">
                    Lv.{top1.level} • {top1.levelTitle}
                  </span>
                  <div className="mt-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs border border-amber-200 shadow-xs">
                    {top1.totalXP.toLocaleString()} XP
                  </div>

                  {/* Podium Base */}
                  <div className="w-full mt-4 h-36 rounded-2xl bg-gradient-to-t from-amber-200 to-amber-100 border border-amber-300 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-amber-600">#1</span>
                    <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">Champion</span>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {top3 && (
                <div className="order-3 md:order-3 flex-1 max-w-xs w-full flex flex-col items-center">
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-200 to-amber-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md border-2 border-white">
                      {top3.displayName.charAt(0)}
                    </div>
                    <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-orange-300 text-orange-950 font-black text-xs flex items-center justify-center shadow-sm">
                      🥉
                    </div>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm text-center">{top3.displayName}</h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Lv.{top3.level} • {top3.levelTitle}
                  </span>
                  <div className="mt-2 px-3 py-1 rounded-full bg-orange-50 text-orange-900 font-black text-xs border border-orange-200">
                    {top3.totalXP.toLocaleString()} XP
                  </div>

                  {/* Podium Base */}
                  <div className="w-full mt-4 h-20 rounded-2xl bg-gradient-to-t from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center">
                    <span className="text-2xl font-black text-orange-400">#3</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Detailed Leaderboard Table */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Top 20 Rankings</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Privacy-friendly verified public leaderboard</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab("ALL")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  filterTab === "ALL" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All-Time XP
              </button>
              <button
                onClick={() => setFilterTab("TOP_LEVELS")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  filterTab === "TOP_LEVELS"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Highest Levels
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Aspirant</th>
                  <th className="py-3 px-4">Level & Title</th>
                  <th className="py-3 px-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedEntries.map((entry) => {
                  const isCurrent = entry.isCurrentUser;
                  const isTop3 = entry.rank <= 3;

                  return (
                    <tr
                      key={entry.rank}
                      className={`transition-colors ${
                        isCurrent
                          ? "bg-emerald-50/70 font-bold text-slate-900"
                          : "hover:bg-slate-50/80 text-slate-700"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-black">
                        {entry.rank === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                            🥇
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">
                            🥈
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400">#{entry.rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
                              isCurrent
                                ? "bg-emerald-600"
                                : isTop3
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          >
                            {entry.displayName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{entry.displayName}</span>
                            {isCurrent && (
                              <span className="ml-2 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          <strong>Lv.{entry.level}</strong>
                          <span className="text-slate-400">•</span>
                          <span>{entry.levelTitle}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {entry.totalXP.toLocaleString()} XP
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Motivational Callout */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight mb-1">Want to climb to the Top 3?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Consistent daily practice gives multiplier streak bonuses: 3-day (+25 XP), 7-day (+75 XP), and 30-day (+200 XP).
              Solve tests and resolve mistakes to rank up!
            </p>
          </div>
          <Link
            href="/practice"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
          >
            Start Practicing Now →
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
