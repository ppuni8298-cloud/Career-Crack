"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Flame,
  LogOut,
  User,
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  Zap,
  Compass,
  BookOpen,
  Award,
  Trophy,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [xpData, setXpData] = useState<{ totalXP: number; level: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/xp")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.level) {
          setXpData({ totalXP: data.totalXP, level: data.level });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navTabs = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Roadmap", href: "/roadmap", icon: Compass, highlight: true, badge: "Phase 8" },
    { label: "Readiness", href: "/readiness", icon: TrendingUp, highlight: true },
    { label: "Crack Mode", href: "/crack-mode", icon: Zap, highlight: true, badge: "Adaptive" },
    { label: "Revision", href: "/revision", icon: Sparkles, badge: "Spaced" },
    { label: "Exam Intel", href: "/exam-intelligence", icon: BookOpen },
    { label: "Placements", href: "/placements", icon: Award, highlight: true },
    { label: "AI Study Coach", href: "/coach", icon: Sparkles, highlight: true, badge: "AI ✦" },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy, badge: "Top 20" },
    { label: "Bookmarks", href: "/bookmarks", icon: BookmarkCheck },
    { label: "Mistake Vault", href: "/mistakes", icon: AlertTriangle, badge: "Review" },
    { label: "Mock Tests", href: "/mock-tests", icon: Award },
    { label: "Practice Bank", href: "/practice", icon: Compass },
    { label: "Exams", href: "/exams", icon: BookOpen },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex flex-col">
      {/* Top Dashboard Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg shadow-sm shadow-emerald-500/20">
                  🌱
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    CAREER CRACK
                  </span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-600">
                    Aspirant Workspace
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: User pill and Logout */}
            <div className="flex items-center gap-3">
              {xpData && (
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                  title="View Profile and XP"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lv.{xpData.level} • {xpData.totalXP} XP</span>
                </Link>
              )}

              <Link
                href="/daily-crack"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Daily Streak Active</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2.5 pl-2 group"
                title="View Aspirant Profile"
                id="dashboard-profile-link"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700 hidden md:inline transition-colors">
                  {user?.name || "Aspirant"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log out"
                id="dashboard-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Workspace Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-100 text-xs">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : tab.highlight
                      ? "bg-amber-50 text-amber-900 hover:bg-amber-100/70 border border-amber-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : tab.highlight ? "text-amber-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
