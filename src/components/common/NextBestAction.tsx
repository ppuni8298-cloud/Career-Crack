"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, AlertTriangle, RefreshCw, Compass, Award, ShieldAlert } from "lucide-react";
import { NextBestActionItem } from "@/lib/adaptive-engine";

interface Props {
  initialAction?: NextBestActionItem | null;
  className?: string;
  compact?: boolean;
}

export default function NextBestAction({ initialAction, className = "", compact = false }: Props) {
  const [action, setAction] = useState<NextBestActionItem | null>(initialAction || null);
  const [loading, setLoading] = useState(!initialAction);

  useEffect(() => {
    if (!initialAction) {
      fetch("/api/readiness")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.nextBestAction) {
            setAction(data.nextBestAction);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialAction]);

  if (loading) {
    return (
      <div className={`p-4 rounded-2xl bg-white border border-slate-200 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
      </div>
    );
  }

  if (!action) return null;

  const getPriorityStyle = (type: NextBestActionItem["priorityType"]) => {
    switch (type) {
      case "REPEATED_MISTAKE":
        return {
          badge: "Highest Priority • Recurring Mistake Trap",
          badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
          glow: "from-rose-500/10 via-amber-500/5 to-transparent",
          icon: ShieldAlert,
          iconColor: "text-rose-600",
        };
      case "WEAK_TOPIC":
        return {
          badge: "Priority Action • Vulnerability Repair",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          glow: "from-amber-500/10 via-orange-500/5 to-transparent",
          icon: AlertTriangle,
          iconColor: "text-amber-600",
        };
      case "REVISION_DUE":
        return {
          badge: "Scheduled Review • Spaced Interval Due",
          badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
          glow: "from-teal-500/10 via-emerald-500/5 to-transparent",
          icon: RefreshCw,
          iconColor: "text-teal-600",
        };
      case "FULL_MOCK":
        return {
          badge: "Milestone • Exam Simulation",
          badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
          glow: "from-indigo-500/10 via-purple-500/5 to-transparent",
          icon: Award,
          iconColor: "text-indigo-600",
        };
      default:
        return {
          badge: "Smart Recommendation • Adaptive Crack",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          glow: "from-emerald-500/10 via-teal-500/5 to-transparent",
          icon: Zap,
          iconColor: "text-emerald-600",
        };
    }
  };

  const style = getPriorityStyle(action.priorityType);
  const IconComponent = style.icon;

  if (compact) {
    return (
      <div
        className={`p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Next Best Action
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">{action.title}</h4>
          </div>
        </div>
        <Link
          href={action.actionUrl}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs whitespace-nowrap transition-colors shrink-0"
        >
          <span>{action.buttonLabel.replace(" →", "")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-md p-6 sm:p-7 ${className}`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.glow} pointer-events-none`} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Header pill & metric */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${style.badgeColor}`}
            >
              <IconComponent className="w-3 h-3" />
              <span>{style.badge}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              Proof: {action.metricProof}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
            {action.title}
          </h3>

          <p className="text-xs text-slate-500 font-medium mt-1">{action.subtitle}</p>

          <p className="text-xs text-slate-700 leading-relaxed mt-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <strong>Why this right now?</strong> {action.reason}
          </p>
        </div>

        {/* Action CTA button */}
        <div className="shrink-0 w-full sm:w-auto">
          <Link
            href={action.actionUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            id="next-best-action-btn"
          >
            <span>{action.buttonLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
