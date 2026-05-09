"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, CheckCheck, AlertTriangle, Clock,
  UserPlus, ArrowRight, Bug, CheckCircle2, Inbox,
  RefreshCw, Kanban, Mail,
} from "lucide-react";
import Link from "next/link";

const typeConfig: Record<string, {
  icon: any; label: string; bg: string; text: string; border: string;
}> = {
  task_assigned: {
    icon: Kanban, label: "Task Assigned",
    bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20",
  },
  deadline_reminder: {
    icon: Clock, label: "Deadline Reminder",
    bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20",
  },
  bug_assigned: {
    icon: Bug, label: "Bug Assigned",
    bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20",
  },
  project_invite: {
    icon: UserPlus, label: "Project Invite",
    bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20",
  },
  task_moved: {
    icon: ArrowRight, label: "Task Updated",
    bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20",
  },
  bug_resolved: {
    icon: CheckCircle2, label: "Bug Resolved",
    bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20",
  },
};

const FILTERS = [
  { key: "all",               label: "All",       icon: Bell },
  { key: "task_assigned",     label: "Tasks",     icon: Kanban },
  { key: "bug_assigned",      label: "Bugs",      icon: Bug },
  { key: "deadline_reminder", label: "Deadlines", icon: Clock },
  { key: "project_invite",    label: "Invites",   icon: UserPlus },
];

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, fetchNotifications } = useStore();
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = [...notifications]
    .filter((n) => filter === "all" || n.type === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Group by date label
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((n) => {
    const date = new Date(n.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    const key =
      diffDays === 0 ? "Today" :
      diffDays === 1 ? "Yesterday" :
      date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="space-y-10 animate-slide-up max-w-4xl">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-violet-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Communication Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Intelligence</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            {unreadCount > 0
              ? <><span className="text-violet-400 font-black">{unreadCount} PENDING ALERTS</span> requiring immediate attention.</>
              : "System status nominal. All protocols are synchronized."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-white/10 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4 text-slate-500", loading && "animate-spin")} />
          </button>
          {unreadCount > 0 && (
            <Button variant="premium" size="lg" onClick={markAllNotificationsRead} className="!rounded-2xl">
              <CheckCheck className="h-4 w-4 mr-2" />
              MARK ALL AS READ
            </Button>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { type: "task_assigned",     label: "TASK ALERTS",  icon: Kanban,   bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20" },
          { type: "deadline_reminder", label: "TIMELINES",    icon: Clock,    bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
          { type: "bug_assigned",      label: "DEFECTS",      icon: Bug,      bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20" },
          { type: "project_invite",    label: "INVITATIONS",  icon: UserPlus, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
        ].map((item) => {
          const count  = notifications.filter((n) => n.type === item.type).length;
          const unread = notifications.filter((n) => n.type === item.type && !n.read).length;
          const isActive = filter === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setFilter(isActive ? "all" : item.type)}
              className={cn(
                "p-6 rounded-3xl bg-[#080c1d] border border-white/5 text-left group transition-all",
                isActive ? "border-violet-500/40 ring-4 ring-violet-500/5 bg-violet-500/[0.02]" : "hover:border-violet-500/20"
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-all group-hover:scale-110 shadow-lg", item.bg, item.text, item.border)}>
                <item.icon className="h-6 w-6" />
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? item.text : "text-slate-500")}>{item.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-white">{count}</span>
                {unread > 0 && (
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg", item.bg, item.text)}>
                    {unread} NEW
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {FILTERS.map((f) => {
          const count = f.key === "all"
            ? notifications.filter((n) => !n.read).length
            : notifications.filter((n) => n.type === f.key && !n.read).length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "bg-white/5 border border-white/5 text-slate-500 hover:border-violet-500/30 hover:text-violet-400"
              )}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
              {count > 0 && (
                <span className={cn("px-1.5 py-0.5 rounded-md", isActive ? "bg-white/20 text-white" : "bg-violet-500/10 text-violet-400")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main List ── */}
      <div className="rounded-3xl bg-[#080c1d] border border-white/5 overflow-hidden">
        <ScrollArea className="h-[600px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center">
                <Inbox className="h-10 w-10 text-slate-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Clear Spectrum</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                  {filter === "all"
                    ? "No active intelligence alerts detected in the system."
                    : `No active ${filter.replace("_", " ")} alerts found.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-[#080c1d]/80 backdrop-blur-md z-10 px-8 py-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em]">{date}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {items.map((notification) => {
                      const cfg = typeConfig[notification.type] || {
                        icon: Bell, label: "NOTIFICATION",
                        bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200",
                      };
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={cn(
                            "flex gap-6 px-8 py-8 cursor-pointer group transition-all",
                            !notification.read ? "bg-violet-500/[0.03] hover:bg-violet-500/[0.05]" : "hover:bg-white/[0.02]"
                          )}
                        >
                          {/* Unread dot */}
                          <div className="flex flex-col items-center pt-1 shrink-0">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full transition-all",
                              !notification.read ? "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]" : "bg-transparent"
                            )} />
                          </div>

                          {/* Icon */}
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover:scale-110",
                            cfg.bg, cfg.text, cfg.border
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className={cn("text-[9px] font-black px-2 py-1 rounded-lg border", cfg.bg, cfg.text, cfg.border)}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                </div>
                                <h3 className={cn("text-lg font-bold text-white tracking-tight", !notification.read && "text-violet-100")}>
                                  {notification.title}
                                </h3>
                                <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-2xl">
                                  {notification.message}
                                </p>
                              </div>
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  className="shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/50 hover:bg-white/10 transition-all shadow-lg"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </Link>
                              )}
                            </div>
                            {!notification.read && (
                                <div className="flex items-center gap-2 pt-2">
                                  <div className="w-1 h-1 rounded-full bg-violet-500 animate-pulse" />
                                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Awaiting interaction</span>
                                </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Footer ── */}
      <div className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-violet-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest">External Relay Active</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Redundant email alerts dispatched for high-priority events.</p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-violet-600 hover:text-white transition-all shadow-lg shadow-violet-500/10"
        >
          CONFIGURE RELAY
        </Link>
      </div>

    </div>
  );
}
