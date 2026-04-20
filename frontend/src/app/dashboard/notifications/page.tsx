"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, CheckCheck, AlertTriangle, Clock,
  UserPlus, ArrowRight, Bug, CheckCircle2, Inbox,
  Filter, RefreshCw, Kanban, Mail,
} from "lucide-react";
import Link from "next/link";

// ── Notification type config ──
const typeConfig: Record<string, {
  icon: any; label: string; bg: string; text: string; border: string; description: string;
}> = {
  task_assigned: {
    icon: Kanban, label: "Task Assigned",
    bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200",
    description: "A task has been assigned to you",
  },
  deadline_reminder: {
    icon: Clock, label: "Deadline Reminder",
    bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200",
    description: "A task deadline is approaching",
  },
  bug_assigned: {
    icon: Bug, label: "Bug Assigned",
    bg: "bg-red-100", text: "text-red-700", border: "border-red-200",
    description: "A bug has been assigned to you",
  },
  project_invite: {
    icon: UserPlus, label: "Project Invite",
    bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200",
    description: "You've been invited to a project",
  },
  task_moved: {
    icon: ArrowRight, label: "Task Updated",
    bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200",
    description: "A task status has changed",
  },
  bug_resolved: {
    icon: CheckCircle2, label: "Bug Resolved",
    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200",
    description: "A bug has been resolved",
  },
};

const FILTERS = [
  { key: "all",              label: "All",             icon: Bell },
  { key: "task_assigned",    label: "Tasks",           icon: Kanban },
  { key: "bug_assigned",     label: "Bugs",            icon: Bug },
  { key: "deadline_reminder",label: "Deadlines",       icon: Clock },
  { key: "project_invite",   label: "Invites",         icon: UserPlus },
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

  // Auto-refresh every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = [...notifications]
    .filter((n) => filter === "all" || n.type === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadFiltered = filtered.filter((n) => !n.read).length;

  // Group by date
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((n) => {
    const date = new Date(n.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    const key = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between stagger-item">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? <><span className="font-semibold text-purple-700">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}</>
              : "You're all caught up! 🎉"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-smooth">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}
              className="text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-smooth">
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* ── Notification type summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-item">
        {[
          { type: "task_assigned",     label: "Task Alerts",    icon: Kanban,    bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
          { type: "deadline_reminder", label: "Deadlines",      icon: Clock,     bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
          { type: "bug_assigned",      label: "Bug Alerts",     icon: Bug,       bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200" },
          { type: "project_invite",    label: "Invites",        icon: UserPlus,  bg: "bg-cyan-100",   text: "text-cyan-700",   border: "border-cyan-200" },
        ].map((item) => {
          const count = notifications.filter((n) => n.type === item.type).length;
          const unread = notifications.filter((n) => n.type === item.type && !n.read).length;
          return (
            <button key={item.type}
              onClick={() => setFilter(filter === item.type ? "all" : item.type)}
              className={cn(
                "card-base card-lift p-3 rounded-2xl text-left transition-smooth",
                filter === item.type ? `${item.bg} border-2 ${item.border}` : "hover:border-gray-200"
              )}>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", item.bg, item.text)}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className={cn("text-xs font-bold", filter === item.type ? item.text : "text-gray-700")}>{item.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400">{count} total</span>
                {unread > 0 && (
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", item.bg, item.text)}>
                    {unread} new
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 stagger-item">
        {FILTERS.map((f) => {
          const count = f.key === "all"
            ? notifications.filter((n) => !n.read).length
            : notifications.filter((n) => n.type === f.key && !n.read).length;
          return (
            <button key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-smooth",
                filter === f.key
                  ? "text-white shadow-sm"
                  : "text-gray-500 bg-white border border-gray-200 hover:border-purple-200 hover:text-purple-600"
              )}
              style={filter === f.key ? { background: "linear-gradient(135deg, #6d28d9, #2563eb)" } : {}}>
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
              {count > 0 && (
                <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-full",
                  filter === f.key ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notification list ── */}
      <div className="card-base rounded-2xl overflow-hidden stagger-item">
        <ScrollArea className="h-[520px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">
                {filter === "all" ? "You're all caught up!" : `No ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{date}</span>
                  </div>

                  {items.map((notification, i) => {
                    const cfg = typeConfig[notification.type] || {
                      icon: Bell, label: "Notification",
                      bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200",
                      description: "",
                    };
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={cn(
                          "flex gap-4 px-4 py-3.5 cursor-pointer transition-smooth border-b border-gray-50 last:border-0",
                          !notification.read ? "bg-purple-50/40 hover:bg-purple-50/60" : "hover:bg-gray-50"
                        )}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {/* Unread indicator */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            !notification.read ? "bg-purple-600 animate-pulse" : "bg-transparent"
                          )} />
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          cfg.bg, cfg.text, cfg.border
                        )}>
                          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", cfg.bg, cfg.text, cfg.border)}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className={cn("text-sm text-gray-900 leading-snug", !notification.read && "font-semibold")}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-400">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View →
                              </Link>
                            )}
                            {!notification.read && (
                              <span className="text-[10px] text-gray-400 ml-auto">Click to mark read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Email notification info ── */}
      <div className="card-base rounded-2xl p-4 flex items-center gap-3 stagger-item"
        style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.04), rgba(37,99,235,0.04))", border: "1px solid rgba(109,40,217,0.1)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 text-purple-700 shrink-0">
          <Mail className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Email Notifications</p>
          <p className="text-xs text-gray-500 mt-0.5">
            All alerts are also sent to your registered email address automatically.
            Configure preferences in <Link href="/dashboard/settings" className="text-purple-600 hover:underline font-medium">Settings</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
