"use client";

import { BarChart3, TrendingUp, Zap, Calendar, Award } from "lucide-react";

export default function ProgressOverview() {
  const weekDays = [
    { day: "Mon", hours: 2.5, target: 3 },
    { day: "Tue", hours: 3.2, target: 3 },
    { day: "Wed", hours: 2.8, target: 3 },
    { day: "Thu", hours: 3.5, target: 3 },
    { day: "Fri", hours: 2.0, target: 3 },
    { day: "Sat", hours: 4.0, target: 3 },
    { day: "Sun", hours: 3.0, target: 3 },
  ];

  const maxHours = 5;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Weekly Study Consistency</h3>
            <p className="text-[11px] text-slate-500">21.0 hrs logged this week · Goal: 18 hrs</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span>+16% vs Last Week</span>
        </span>
      </div>

      {/* Bar Chart Representation */}
      <div className="pt-4 pb-2">
        <div className="flex items-end justify-between gap-2 h-36 border-b border-slate-100 pb-2">
          {weekDays.map((d) => {
            const heightPct = Math.round((d.hours / maxHours) * 100);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
                  {d.hours}h
                </div>
                <div className="w-full max-w-[28px] bg-slate-100 rounded-xl h-24 flex items-end overflow-hidden p-0.5">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-lg transition-all duration-500 group-hover:from-emerald-700 group-hover:to-teal-600"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 pt-5 mt-2">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Speed</div>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">42s / Q</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</div>
          <div className="text-sm font-extrabold text-emerald-700 mt-0.5">84.5%</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mock Score</div>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">148 / 200</div>
        </div>
      </div>
    </div>
  );
}
