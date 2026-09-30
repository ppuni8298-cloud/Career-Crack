"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import NextBestAction from "@/components/common/NextBestAction";
import {
  Map,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Compass,
  Briefcase,
  Award,
  Zap,
} from "lucide-react";
import { RoadmapStage } from "@/app/api/roadmap/route";

function RoadmapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") === "PLACEMENT" ? "PLACEMENT" : "GOVERNMENT";

  const [track, setTrack] = useState<"GOVERNMENT" | "PLACEMENT">(initialTrack);
  const [stages, setStages] = useState<RoadmapStage[]>([]);
  const [currentActiveStage, setCurrentActiveStage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = useCallback(async (selectedTrack: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roadmap?track=${selectedTrack}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/roadmap";
          return;
        }
        throw new Error("Failed to load roadmap");
      }
      const data = await res.json();
      setStages(data.stages || []);
      setCurrentActiveStage(data.currentActiveStage || "");
    } catch (err) {
      console.error("Roadmap fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap(track);
  }, [track, fetchRoadmap]);

  const handleTrackChange = (newTrack: "GOVERNMENT" | "PLACEMENT") => {
    setTrack(newTrack);
    router.push(`/roadmap?track=${newTrack}`);
  };

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
                <Map className="w-3.5 h-3.5" />
                <span>Personalized Career Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                Preparation Roadmap
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                A structured, data-grounded pathway from your baseline diagnostics to full exam readiness. Your current
                position is computed from actual activity.
              </p>
            </div>

            {/* Track Switcher */}
            <div className="bg-white/10 p-1.5 rounded-2xl border border-white/15 flex items-center gap-1.5 backdrop-blur-md">
              <button
                onClick={() => handleTrackChange("GOVERNMENT")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                  track === "GOVERNMENT"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Government Exams</span>
              </button>
              <button
                onClick={() => handleTrackChange("PLACEMENT")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                  track === "PLACEMENT"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Campus & Tech Placements</span>
              </button>
            </div>
          </div>
        </section>

        {/* Global Next Best Action */}
        <NextBestAction />

        {/* Interactive Roadmap Timeline */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {track === "GOVERNMENT" ? "Government Examination Sequence" : "Placement Preparation Sequence"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current recommended stage: <strong className="text-emerald-700">{currentActiveStage}</strong>
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Needs Revision
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-4 h-4 text-slate-300" /> Locked
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-emerald-100/80 ml-4 sm:ml-6">
              {stages.map((stage) => {
                const isCompleted = stage.state === "COMPLETED";
                const isActive = stage.state === "ACTIVE";
                const isNeedsRevision = stage.state === "NEEDS_REVISION";
                const isLocked = stage.state === "LOCKED";

                return (
                  <div key={stage.id} className="relative group">
                    {/* Node Dot on Timeline */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[43px] top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-white text-emerald-700 border-2 border-emerald-600 ring-4 ring-emerald-100"
                          : isNeedsRevision
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-500 border border-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3" />
                      ) : isNeedsRevision ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        stage.order
                      )}
                    </div>

                    {/* Stage Card */}
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-emerald-50/40 border-emerald-300 shadow-md ring-1 ring-emerald-400/30"
                          : isNeedsRevision
                          ? "bg-amber-50/30 border-amber-300 shadow-xs"
                          : isCompleted
                          ? "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                          : "bg-slate-50/70 border-slate-200/50 opacity-60"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-extrabold text-slate-900">{stage.title}</h3>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : isActive
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : isNeedsRevision
                                  ? "bg-amber-100 text-amber-900 border-amber-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {stage.state.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">{stage.subtitle}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{stage.description}</p>
                        </div>

                        {/* Action CTA */}
                        {!isLocked && (
                          <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                            <Link
                              href={stage.actionUrl}
                              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap ${
                                isActive
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
                                  : isNeedsRevision
                                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                              }`}
                            >
                              <span>{stage.actionLabel}</span>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Evidence & Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500">
                          <strong>Recorded Evidence:</strong> {stage.evidence}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : isNeedsRevision
                                  ? "bg-amber-500"
                                  : "bg-emerald-600"
                              }`}
                              style={{ width: `${stage.progressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{stage.progressPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}
