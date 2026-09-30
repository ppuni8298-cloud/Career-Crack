"use client";

import { useEffect, useState } from "react";
import GoalBanner from "@/components/dashboard/GoalBanner";
import ReadinessScore from "@/components/dashboard/ReadinessScore";
import TodaysCrackPlan from "@/components/dashboard/TodaysCrackPlan";
import RecommendedAction from "@/components/dashboard/RecommendedAction";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import PerformanceSummary from "@/components/dashboard/PerformanceSummary";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import MockTestBanner from "@/components/dashboard/MockTestBanner";
import AICoachWidget from "@/components/dashboard/AICoachWidget";
import NextBestAction from "@/components/common/NextBestAction";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = () => {
    fetch("/api/dashboard")
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load dashboard data");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskToggled = (taskId: string, newCompleted: boolean) => {
    if (data?.profile) {
      const delta = newCompleted ? 2 : -2;
      setData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          readinessScore: Math.min(100, Math.max(0, (prev.profile.readinessScore || 35) + delta)),
        },
      }));
    }
  };

  const handleActionCompleted = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200/70 rounded-3xl" />
        <div className="h-32 bg-slate-200/70 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-72 bg-slate-200/70 rounded-3xl" />
            <div className="h-64 bg-slate-200/70 rounded-3xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-80 bg-slate-200/70 rounded-3xl" />
            <div className="h-64 bg-slate-200/70 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-rose-200 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold mb-4">
          !
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Failed to load study plan</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-sm">
          {error || "An unexpected error occurred while loading your personalized dashboard."}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchDashboardData();
          }}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, profile, parsedSubjects, tasks, studyLogs, performanceSummary, continueLearning } = data;

  return (
    <div className="space-y-6">
      {/* 1. Selected Goal Banner */}
      <GoalBanner profile={profile} userName={user?.name || "Aspirant"} />

      {/* 1.1 Phase 8 Adaptive Next Best Action */}
      <NextBestAction />

      {/* 1.2. AI Coach Personalized Preparation Widget */}
      <AICoachWidget />

      {/* 1.5. Full-Length Mock Test Engine Banner */}
      <MockTestBanner />

      {/* 2. Real Performance Summary (Phase 4 Live Metrics) */}
      {performanceSummary && (
        <PerformanceSummary summary={performanceSummary} />
      )}

      {/* 3. Recommended Next Action */}
      <RecommendedAction
        examName={profile?.targetExam || "Target Exam"}
        onCompleted={handleActionCompleted}
      />

      {/* 4. Continue Learning Shortcuts */}
      {continueLearning && (
        <ContinueLearning continueData={continueLearning} />
      )}

      {/* 5. Main Dashboard 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Crack Plan & Consistency Overview */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <TodaysCrackPlan tasks={tasks || []} onTaskToggled={handleTaskToggled} />
          <ProgressOverview />
        </div>

        {/* Right Column: Readiness Score Gauge & Recent Activity Log */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <ReadinessScore
            score={profile?.readinessScore || 35}
            subjects={parsedSubjects || []}
          />
          <RecentActivity logs={studyLogs || []} />
        </div>
      </div>
    </div>
  );
}
