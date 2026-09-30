"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Circle, Clock, Check, Sparkles, BookOpen, Flame } from "lucide-react";

interface DailyTask {
  id: string;
  title: string;
  subject: string;
  duration: string;
  isCompleted: boolean;
}

interface TodaysCrackPlanProps {
  tasks: DailyTask[];
  onTaskToggled?: (taskId: string, newCompleted: boolean) => void;
}

export default function TodaysCrackPlan({ tasks: initialTasks, onTaskToggled }: TodaysCrackPlanProps) {
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleToggle = async (task: DailyTask) => {
    const nextState = !task.isCompleted;
    setUpdatingId(task.id);

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isCompleted: nextState } : t))
    );

    if (onTaskToggled) {
      onTaskToggled(task.id, nextState);
    }

    // Trigger celebration if marking complete
    if (nextState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10B981", "#059669", "#F59E0B"],
      });
    }

    try {
      await fetch("/api/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, isCompleted: nextState }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Today&apos;s Crack Plan</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tailored daily milestones based on your target syllabus.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">
              {completedCount} of {tasks.length} Completed
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">{progressPct}% Done</div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (progressPct / 100) * 125.6}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-500"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-800">
              {progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task)}
            className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer select-none ${
              task.isCompleted
                ? "bg-slate-50/80 border-slate-200/80 text-slate-400"
                : "bg-white hover:bg-emerald-50/30 border-slate-200/90 hover:border-emerald-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* Checkbox */}
              <button
                type="button"
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  task.isCompleted
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-slate-300 hover:border-emerald-500 bg-white"
                }`}
              >
                {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <div>
                <span
                  className={`text-sm font-bold block ${
                    task.isCompleted ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[11px] font-medium text-emerald-700">
                  {task.subject}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completed All Banner */}
      {completedCount === tasks.length && tasks.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 animate-in fade-in duration-300">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
          <div className="text-xs font-bold">
            All milestones cracked for today! Your streak is secured. High yield review unlocked.
          </div>
        </div>
      )}
    </div>
  );
}
