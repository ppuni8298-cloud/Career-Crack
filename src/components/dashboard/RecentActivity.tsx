"use client";

import { History, CheckCircle2, Clock, Award, Sparkles } from "lucide-react";

interface StudyLogItem {
  id: string;
  action: string;
  score?: string | null;
  durationMinutes: number;
  createdAt: string;
}

interface RecentActivityProps {
  logs: StudyLogItem[];
}

export default function RecentActivity({ logs }: RecentActivityProps) {
  // Format relative time helper
  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Recent Activity</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Live Study Log</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No activity logged yet today. Complete your first crack plan task!
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {log.action}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {getRelativeTime(log.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-1 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{log.durationMinutes} mins</span>
                  </span>

                  {log.score && (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {log.score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
