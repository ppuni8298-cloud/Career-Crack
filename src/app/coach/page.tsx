"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Brain,
  Send,
  Zap,
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  HelpCircle,
  Flame,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

interface DailyBlock {
  id: string;
  title: string;
  subject: string;
  topicSlug?: string;
  duration: string;
  durationMinutes: number;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
  type: string;
  why: string;
  actionText: string;
  actionHref: string;
  readinessGain: string;
}

interface WeaknessInsight {
  topicId: string;
  topicName: string;
  subjectName: string;
  slug: string;
  accuracy: number;
  questionsAttempted: number;
  mistakesCount: number;
  errorPattern: string;
  errorPatternLabel: string;
  explanation: string;
  recommendation: string;
  drillHref: string;
  actionText: string;
}

interface ChatMessage {
  id?: string;
  role: "USER" | "COACH";
  content: string;
  suggestedActions?: Array<{ label: string; href: string }>;
  createdAt?: string;
}

export default function AICoachPage() {
  const router = useRouter();

  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const [taskSyncedSuccess, setTaskSyncedSuccess] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingDrill, setGeneratingDrill] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBriefing();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/coach/briefing");
      if (res.status === 401) {
        router.push("/login?redirect=/coach");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error("Failed to load AI briefing:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch("/api/ai/coach/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role as "USER" | "COACH",
            content: m.content,
            suggestedActions: m.context ? JSON.parse(m.context) : undefined,
            createdAt: m.createdAt,
          }));
          setMessages(formatted);
        } else {
          // Default welcoming message from CrackCoach AI
          setMessages([
            {
              role: "COACH",
              content: `### 👋 Welcome to Your AI Study Command Center!

I am **CrackCoach AI**, your personalized exam mentor. I continuously analyze your practice attempts, mock test scores, and mistake vault to build the fastest path to exam readiness.

Ask me anything, or tap one of the suggested prompts below to get started!`,
              suggestedActions: [
                { label: "What should I study today?", href: "#daily-plan" },
                { label: "Analyze my weak spots", href: "#weaknesses" },
                { label: "Review Mistake Vault", href: "/mistakes" },
              ],
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || sendingMessage) return;

    setInputMessage("");
    setSendingMessage(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      role: "USER",
      content: textToSend.trim(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/ai/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: data.messageId,
            role: "COACH",
            content: data.reply,
            suggestedActions: data.suggestedActions,
            createdAt: data.createdAt,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "COACH",
            content: "Sorry, I had trouble processing your request. Please try again.",
          },
        ]);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "COACH",
          content: "Network error communicating with CrackCoach. Please check your connection.",
        },
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSyncToDashboardTasks = async () => {
    try {
      setSyncingTasks(true);
      const res = await fetch("/api/ai/coach/sync-tasks", { method: "POST" });
      if (res.ok) {
        setTaskSyncedSuccess(true);
        setTimeout(() => setTaskSyncedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Sync tasks error:", err);
    } finally {
      setSyncingTasks(false);
    }
  };

  const handleStartTargetedDrill = async (topicSlug?: string, type: string = "AUTO") => {
    try {
      setGeneratingDrill(true);
      const res = await fetch("/api/ai/coach/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicSlug, type, count: 10 }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/practice/session/${data.sessionId}`);
      } else {
        router.push("/practice");
      }
    } catch (err) {
      console.error("Generate drill error:", err);
      router.push("/practice");
    } finally {
      setGeneratingDrill(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto animate-pulse">
              <Brain className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Synthesizing Your AI Study Plan...</h2>
            <p className="text-slate-500 text-sm max-w-md">
              Analyzing your practice accuracy, mock test scores, mistake notebook, and retention decay metrics.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { profile, dailyPlan, weaknesses, nextBestAction, retentionDecay, readinessTrajectory } = briefing || {};

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        {/* =========================================================================
            1. HERO COMMAND HEADER: CrackCoach AI Persona & Readiness Trajectory
        ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Persona & Welcome */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
                AI Study Coach & Preparation Engine
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Good day, {profile?.userName || "Aspirant"}. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                  Here is your personalized roadmap for {profile?.targetExam || "your Target Exam"}.
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                CrackCoach continuously calculates your readiness score across <strong>{profile?.totalQuestionsAttempted || 0} questions</strong>, 
                detecting exactly where marks are leaking and what action will yield the highest return today.
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Daily Budget: <strong>{profile?.dailyStudyHours || "2-4 hrs"}</strong>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Streak: <strong>{profile?.streakDays || 1} Days</strong>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200 font-medium">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Overall Accuracy: <strong>{profile?.overallAccuracy || 0}%</strong>
                </div>
                {profile?.unresolvedMistakesCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-400/30 text-xs text-rose-300 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <strong>{profile.unresolvedMistakesCount}</strong> Mistakes in Vault
                  </div>
                )}
              </div>
            </div>

            {/* Right: Readiness Gauge & Trajectory Forecast */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 text-center space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Readiness Index</div>
              
              <div className="relative inline-flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-8 border-emerald-500/30 border-t-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-3xl font-black text-white">{readinessTrajectory?.current ?? 35}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100 PTS</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Projected on Test Day:</span>
                  <span className="text-emerald-400 font-bold">{readinessTrajectory?.projected ?? 65}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${readinessTrajectory?.projected ?? 65}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  {readinessTrajectory?.status === "EXAM_READY"
                    ? "🌟 High Readiness: Keep revising to maintain peak speed."
                    : readinessTrajectory?.status === "ON_TRACK"
                    ? "📈 On Track: Completing today's plan will boost +4 readiness."
                    : "⚡ Needs Focus: Remediate weak areas to cross the cut-off threshold."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. HERO ACTION: What Should I Do Next? (Single Highest Leverage Action)
        ========================================================================= */}
        {nextBestAction && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-500 to-teal-600" />
            
            <div className="space-y-1.5 pl-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase">
                  {nextBestAction.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{nextBestAction.estimatedMinutes} mins
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {nextBestAction.readinessGain}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {nextBestAction.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {nextBestAction.reason}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => {
                  if (nextBestAction.actionHref.startsWith("/practice?topic=")) {
                    const slug = nextBestAction.actionHref.split("=")[1];
                    handleStartTargetedDrill(slug);
                  } else {
                    router.push(nextBestAction.actionHref);
                  }
                }}
                disabled={generatingDrill}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {generatingDrill ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Preparing Drill...
                  </>
                ) : (
                  <>
                    {nextBestAction.actionText} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            3. MAIN TWO-COLUMN WORKSPACE:
               Left: What & Why to Study Today + What Am I Weak At
               Right: Interactive CrackCoach AI Chat Assistant
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7/12: Core Plans & Diagnostics */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* 3A. WHAT SHOULD I STUDY TODAY & WHY? */}
            <section id="daily-plan" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <Brain className="w-4 h-4 text-emerald-600" />
                    Personalized Preparation Matrix
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    What Should I Study Today & Why?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Synthesized from your syllabus weights, active streak, and error logs.
                  </p>
                </div>

                <button
                  onClick={handleSyncToDashboardTasks}
                  disabled={syncingTasks || taskSyncedSuccess}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    taskSyncedSuccess
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  {syncingTasks ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
                    </>
                  ) : taskSyncedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Synced to Tasks!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Sync to Dashboard Tasks
                    </>
                  )}
                </button>
              </div>

              {/* Study Blocks List */}
              <div className="space-y-4">
                {dailyPlan && dailyPlan.length > 0 ? (
                  dailyPlan.map((block: DailyBlock, idx: number) => (
                    <div
                      key={block.id || idx}
                      className="group p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {block.subject}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              block.priority === "HIGH"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : block.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {block.priority} Priority
                          </span>
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {block.duration}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {block.title}
                        </h4>
                        <div className="mt-2 text-xs sm:text-sm text-slate-600 bg-white group-hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">Why:</span>
                          <span>{block.why}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> {block.readinessGain}
                        </span>

                        <button
                          onClick={() => {
                            if (block.topicSlug) {
                              handleStartTargetedDrill(block.topicSlug);
                            } else {
                              router.push(block.actionHref);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-0.5 transition-all cursor-pointer"
                        >
                          {block.actionText} <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No daily tasks scheduled. Generate one with your coach.</p>
                )}
              </div>
            </section>

            {/* 3B. WHAT AM I WEAK AT? (Diagnostic Weakness Matrix & Decay Alerts) */}
            <section id="weaknesses" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Diagnostic Performance Analysis
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  What Am I Weak At?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Root-cause breakdown of calculation traps, conceptual doubt areas, and memory decay.
                </p>
              </div>

              {weaknesses && weaknesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weaknesses.map((w: WeaknessInsight, i: number) => (
                    <div
                      key={w.topicId || i}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {w.subjectName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              w.errorPattern === "CALCULATION_TRAP"
                                ? "bg-amber-100 text-amber-800"
                                : w.errorPattern === "MEMORY_DECAY"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {w.errorPatternLabel}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900">
                          {w.topicName}
                        </h4>

                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 py-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Accuracy:</span>
                            <span className={w.accuracy < 60 ? "text-rose-600" : "text-amber-600"}>
                              {w.accuracy}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Mistakes:</span>
                            <span className="text-rose-600">{w.mistakesCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Attempted:</span>
                            <span>{w.questionsAttempted} Qs</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {w.explanation}
                        </p>

                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                          💡 <strong>Advice:</strong> {w.recommendation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleStartTargetedDrill(w.slug)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Start 10-Q Targeted Drill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">No High-Risk Weak Spots Detected!</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Your accuracy across practiced topics is solid. Maintain momentum by trying higher difficulty tiers or a full-length proctored mock test.
                  </p>
                </div>
              )}

              {/* Retention Decay Warning Section */}
              {retentionDecay && retentionDecay.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Spaced Repetition & Retention Alerts ({retentionDecay.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Topics you practiced over 5 days ago. Reviewing now cements long-term memory before the exam.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {retentionDecay.map((d: any, idx: number) => (
                      <button
                        key={d.id || idx}
                        onClick={() => handleStartTargetedDrill(d.slug)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-colors cursor-pointer"
                      >
                        <span>{d.name}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-200 text-[10px] text-purple-800">
                          {d.lastPracticedDaysAgo}d ago
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT 5/12: Interactive CrackCoach AI Chat Assistant */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col h-[700px]">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                      CrackCoach AI
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      Live Grounded in Your DB Stats
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                    {profile?.targetExam?.split(" ")[0] || "Exam"}
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAF8]">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === "USER" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.role === "USER"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none prose prose-sm prose-emerald max-w-none"
                      }`}
                    >
                      {msg.role === "COACH" ? (
                        <div
                          className="space-y-2 whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/^### (.*$)/gim, '<h4 class="font-extrabold text-slate-900 text-sm mt-1">$1</h4>')
                              .replace(/^#### (.*$)/gim, '<h5 class="font-bold text-slate-800 text-xs mt-1">$1</h5>')
                              .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
                              .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
                              .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
                              .replace(/^> (.*$)/gim, '<div class="border-l-2 border-emerald-500 pl-2 text-slate-600 italic my-1">$1</div>'),
                          }}
                        />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                    {/* Suggested Action Chips (if any) */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => {
                              if (action.href.startsWith("#")) {
                                const el = document.querySelector(action.href);
                                el?.scrollIntoView({ behavior: "smooth" });
                              } else if (action.href.startsWith("/practice?topic=")) {
                                const slug = action.href.split("=")[1];
                                handleStartTargetedDrill(slug);
                              } else {
                                router.push(action.href);
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-emerald-800 transition-colors shadow-xs cursor-pointer"
                          >
                            👉 {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {sendingMessage && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-500 text-xs w-fit">
                    <Brain className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Analyzing your performance data...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
                <button
                  onClick={() => handleSendMessage("What should I focus on for Quant today?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-medium text-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                >
                  ⚡ Quant Focus
                </button>
                <button
                  onClick={() => handleSendMessage("Analyze my recent mistakes and traps")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-medium text-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                >
                  🔍 Analyze Mistakes
                </button>
                <button
                  onClick={() => handleSendMessage("Give me a 30-day exam strategy")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-medium text-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                >
                  📅 30-Day Strategy
                </button>
                <button
                  onClick={() => handleSendMessage("How can I improve calculation speed in reasoning?")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-medium text-slate-700 whitespace-nowrap cursor-pointer transition-colors"
                >
                  ⏱️ Speed Tips
                </button>
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask CrackCoach AI about topics, strategy..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendingMessage}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
