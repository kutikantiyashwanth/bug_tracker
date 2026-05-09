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
    bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200",
  },
  deadline_reminder: {
    icon: Clock, label: "Deadline Reminder",
    bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200",
  },
  bug_assigned: {
    icon: Bug, label: "Bug Assigned",
    bg: "bg-red-100", text: "text-red-700", border: "border-red-200",
  },
  project_invite: {
    icon: UserPlus, label: "Project Invite",
    bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200",
  },
  task_moved: {
    icon: ArrowRight, label: "Task Updated",
    bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200",
  },
  bug_resolved: {
    icon: CheckCircle2, label: "Bug Resolved",
    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200",
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

      {/* ΓöÇΓöÇ Header ΓöÇΓöÇ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Communication Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            System <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-8">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            {unreadCount > 0
              ? <><span className="text-indigo-600 font-black">{unreadCount} PENDING ALERTS</span> requiring immediate attention.</>
              : "System status nominal. All protocols are synchronized."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-500/30 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
          </button>
          {unreadCount > 0 && (
            <Button variant="premium" size="lg" onClick={markAllNotificationsRead} className="!rounded-2xl">
              <CheckCheck className="h-4 w-4 mr-2" />
              MARK ALL AS READ
            </Button>
          )}
        </div>
      </div>

      {/* ΓöÇΓöÇ Summary Cards ΓöÇΓöÇ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { type: "task_assigned",     label: "TASK ALERTS",  icon: Kanban,   bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-100" },
          { type: "deadline_reminder", label: "TIMELINES",    icon: Clock,    bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100" },
          { type: "bug_assigned",      label: "DEFECTS",      icon: Bug,      bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100" },
          { type: "project_invite",    label: "INVITATIONS",  icon: UserPlus, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
        ].map((item) => {
          const count  = notifications.filter((n) => n.type === item.type).length;
          const unread = notifications.filter((n) => n.type === item.type && !n.read).length;
          const isActive = filter === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setFilter(isActive ? "all" : item.type)}
              className={cn(
                "premium-card p-6 text-left group transition-all",
                isActive ? "ring-2 ring-indigo-500/20 bg-indigo-50/30 border-indigo-200" : "hover:border-slate-300"
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-sm transition-all group-hover:scale-110", item.bg, item.text, item.border)}>
                <item.icon className="h-6 w-6" />
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? item.text : "text-slate-400")}>{item.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-slate-900">{count}</span>
                {unread > 0 && (
                  <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-lg", item.bg, item.text)}>
                    {unread} NEW
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ΓöÇΓöÇ Filter Tabs ΓöÇΓöÇ */}
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
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
              )}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
              {count > 0 && (
                <span className={cn("px-1.5 py-0.5 rounded-md", isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ΓöÇΓöÇ Main List ΓöÇΓöÇ */}
      <div className="premium-card overflow-hidden">
        <ScrollArea className="h-[600px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Inbox className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Clear Spectrum</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                  {filter === "all"
                    ? "No active intelligence alerts detected in the system."
                    : `No active ${filter.replace("_", " ")} alerts found.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-4 border-b border-slate-50">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{date}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
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
                            !notification.read ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-slate-50/50"
                          )}
                        >
                          {/* Unread dot */}
                          <div className="flex flex-col items-center pt-1 shrink-0">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full transition-all",
                              !notification.read ? "bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]" : "bg-transparent"
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
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                </div>
                                <h3 className={cn("text-lg font-black text-slate-900 tracking-tight", !notification.read && "text-indigo-900")}>
                                  {notification.title}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">
                                  {notification.message}
                                </p>
                              </div>
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  className="shrink-0 p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </Link>
                              )}
                            </div>
                            {!notification.read && (
                              <div className="flex items-center gap-2 pt-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-600" />
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Awaiting interaction</span>
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

      {/* ΓöÇΓöÇ Footer ΓöÇΓöÇ */}
      <div className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest">External Relay Active</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Redundant email alerts dispatched for high-priority events.</p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all"
        >
          CONFIGURE RELAY
        </Link>
      </div>

    </div>
  );
}
