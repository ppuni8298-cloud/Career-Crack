"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Users,
  Plus,
  KeyRound,
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";

interface StudyGroupItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  targetExam: string;
  role?: string;
  memberCount: number;
  activeGoalsCount: number;
}

export default function StudyGroupsPage() {
  const [myGroups, setMyGroups] = useState<StudyGroupItem[]>([]);
  const [exploreGroups, setExploreGroups] = useState<StudyGroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupExam, setNewGroupExam] = useState("SSC CGL");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/study-groups");
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.myGroups || []);
        setExploreGroups(data.exploreGroups || []);
      }
    } catch (e) {
      console.error("Failed to load study groups", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      setJoinError("");
      const res = await fetch("/api/study-groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setJoinCode("");
        fetchGroups();
      } else {
        setJoinError(data.error || "Failed to join group");
      }
    } catch (err) {
      setJoinError("Network error. Please try again.");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setCreateLoading(true);
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          targetExam: newGroupExam,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Hero */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white mb-8 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
                <Users className="w-3.5 h-3.5" /> Peer Accountability & Shared Prep
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Collaborative Study Groups
              </h1>
              <p className="text-sm sm:text-base text-slate-200 mt-2 leading-relaxed">
                Study together, track weekly question targets, compare progress on group leaderboards, and crack your exams with peer momentum.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" /> Create Study Group
              </button>
            </div>
          </div>
        </div>

        {/* Join by Code Bar */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-8 shadow-sm">
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Have an invite code?</h3>
                <p className="text-xs text-slate-500">Enter a 6-character code to join your friends' group</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="e.g. CRK9A2"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="bg-slate-50 border border-slate-300 uppercase tracking-widest font-bold text-center text-sm rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 w-36"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Join Group
              </button>
            </div>
          </form>
          {joinError && <p className="text-xs text-rose-600 mt-2 font-medium">{joinError}</p>}
        </div>

        {/* My Groups Section */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            My Active Groups ({myGroups.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading your study circles...
            </div>
          ) : myGroups.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">You haven't joined any groups yet</h3>
              <p className="text-xs text-slate-500 mt-1">Create a group or explore existing study circles below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myGroups.map((g) => (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {g.targetExam}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Code: {g.code}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{g.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                      {g.description || "Active community solving daily practice goals."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{g.memberCount} Members • {g.activeGoalsCount} Goals</span>
                    <Link
                      href={`/study-groups/${g.id}`}
                      className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      Open Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explore Public Study Circles */}
        {exploreGroups.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Discover Study Circles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {exploreGroups.map((g) => (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        {g.targetExam}
                      </span>
                      <span className="text-xs text-slate-500">{g.memberCount} Members</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{g.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                      {g.description || "Aspirant group preparing with structured targets."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-400">Code: {g.code}</span>
                    <Link
                      href={`/study-groups/${g.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all"
                    >
                      View & Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Create a Study Group</h3>
              <p className="text-xs text-slate-500 mb-6">
                You'll receive a 6-character code to invite your study partners.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSC CGL 2026 Achievers"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Exam / Goal</label>
                  <select
                    value={newGroupExam}
                    onChange={(e) => setNewGroupExam(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="UPSC Civil Services">UPSC Civil Services</option>
                    <option value="RRB NTPC">RRB NTPC</option>
                    <option value="IBPS PO">IBPS PO</option>
                    <option value="Technical Placement & DSA">Technical Placement & DSA</option>
                    <option value="Campus Recruitment">Campus Recruitment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Group targets, meeting schedule, or goals..."
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    {createLoading ? "Creating..." : "Create Group"}
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
