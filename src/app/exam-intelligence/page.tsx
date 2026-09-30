"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import NextBestAction from "@/components/common/NextBestAction";
import {
  Compass,
  BookOpen,
  Award,
  Target,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";

interface SubjectDetail {
  subjectId: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
  topicCount: number;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  unresolvedMistakes: number;
  coveragePct: number;
  performanceStatus: "STRONG" | "DEVELOPING" | "NEEDS_IMPROVEMENT" | "NOT_STARTED";
  topics: Array<{
    id: string;
    name: string;
    slug: string;
    totalQuestions: number;
    hasAttempted: boolean;
  }>;
}

interface ExamIntelligenceResponse {
  exams: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    totalQuestions: number;
    totalMocks: number;
  }>;
  selectedExam: {
    id: string;
    name: string;
    slug: string;
    category: string;
    organization: string;
    description: string;
    totalQuestionsAvailable: number;
    totalMocksAvailable: number;
    totalAttemptedInExam: number;
    overallExamAccuracy: number;
    subjects: SubjectDetail[];
  } | null;
  message?: string;
}

function ExamIntelligenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examSlug = searchParams.get("exam");

  const [data, setData] = useState<ExamIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const fetchExamIntelligence = useCallback(async (slug?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = slug ? `/api/exam-intelligence?exam=${slug}` : "/api/exam-intelligence";
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/exam-intelligence";
          return;
        }
        throw new Error("Failed to load exam intelligence");
      }
      const json = await res.json();
      setData(json);
      if (json.selectedExam?.subjects?.length > 0 && !expandedSubjectId) {
        setExpandedSubjectId(json.selectedExam.subjects[0].subjectId);
      }
    } catch (err: any) {
      console.error("Exam intelligence fetch error:", err);
      setError(err.message || "Failed to load exam intelligence");
    } finally {
      setLoading(false);
    }
  }, [expandedSubjectId]);

  useEffect(() => {
    fetchExamIntelligence(examSlug || undefined);
  }, [examSlug, fetchExamIntelligence]);

  const handleSelectExam = (slug: string) => {
    router.push(`/exam-intelligence?exam=${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200/80 rounded-3xl" />
            <div className="h-44 bg-slate-200/60 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-slate-200/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data || !data.selectedExam) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-3">
              🏛️
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Exam Configured</h2>
            <p className="text-xs text-slate-500 mb-6">
              {data?.message || "Select or enroll in an exam curriculum to inspect exam intelligence."}
            </p>
            <Link
              href="/exams"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Browse Exams Catalog →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { exams, selectedExam } = data;

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Exam Intelligence Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                Exam Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Understand your exam. Understand your preparation. Know what to work on next.
              </p>
            </div>

            {/* Target Exam Switcher Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <label htmlFor="exam-selector" className="text-xs font-bold text-slate-300 whitespace-nowrap">
                Selected Exam:
              </label>
              <select
                id="exam-selector"
                value={selectedExam.slug}
                onChange={(e) => handleSelectExam(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.slug} className="text-slate-900 bg-white">
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Summary Strip */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Exam Name</span>
              <strong className="text-white text-sm font-extrabold">{selectedExam.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Conducting Body</span>
              <strong className="text-emerald-300 text-sm font-extrabold">{selectedExam.organization}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Questions in Bank</span>
              <strong className="text-white text-sm font-extrabold">
                {selectedExam.totalQuestionsAvailable} Questions
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Full Mocks Ready</span>
              <strong className="text-amber-300 text-sm font-extrabold">
                {selectedExam.totalMocksAvailable} Simulation Tests
              </strong>
            </div>
          </div>
        </section>

        {/* Global Next Best Action */}
        <NextBestAction />

        {/* Exam Structure & Subject Breakdown */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Curriculum Structure & Subject Performance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real performance telemetry across verified syllabus subjects
              </p>
            </div>
            <Link
              href={`/crack-mode?examId=${selectedExam.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Adaptive Drill this Exam</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {selectedExam.subjects.map((sub) => {
              const isExpanded = expandedSubjectId === sub.subjectId;
              const statusColor =
                sub.performanceStatus === "STRONG"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : sub.performanceStatus === "DEVELOPING"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : sub.performanceStatus === "NEEDS_IMPROVEMENT"
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-slate-50 text-slate-600 border-slate-200";

              return (
                <div
                  key={sub.subjectId}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Subject Card Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                        {sub.icon || "📚"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-extrabold text-slate-900">{sub.name}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {sub.performanceStatus.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {sub.topicCount} Topics • Category: {sub.category}
                        </p>
                      </div>
                    </div>

                    {/* Performance metrics pill group */}
                    <div className="grid grid-cols-4 gap-3 text-center text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Coverage</span>
                        <strong className="text-slate-900 font-black">{sub.coveragePct}%</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Attempted</span>
                        <strong className="text-slate-900 font-black">{sub.questionsAttempted}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Accuracy</span>
                        <strong className={`font-black ${sub.accuracy >= 75 ? "text-emerald-700" : "text-amber-700"}`}>
                          {sub.accuracy}%
                        </strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Mistakes</span>
                        <strong className="text-rose-700 font-black">{sub.unresolvedMistakes}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Topic list toggle */}
                  <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setExpandedSubjectId(isExpanded ? null : sub.subjectId)}
                      className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Syllabus Topics" : `View ${sub.topicCount} Syllabus Topics`}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>

                    <Link
                      href={`/practice?subject=${sub.slug}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Practice {sub.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Expanded Topics List */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {sub.topics.map((t) => (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  t.hasAttempted ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                              <span className="font-semibold text-slate-800 truncate">{t.name}</span>
                            </div>
                            <Link
                              href={`/practice?topic=${t.slug}`}
                              className="text-[11px] font-bold text-emerald-600 hover:underline shrink-0 ml-2"
                            >
                              Practice →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ExamIntelligencePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <ExamIntelligenceContent />
    </Suspense>
  );
}
