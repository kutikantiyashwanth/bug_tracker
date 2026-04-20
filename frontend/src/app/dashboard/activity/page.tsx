"use client";

import { useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity, GitBranch, Bug, Users, ArrowRight, Plus,
  CheckCircle2, AlertTriangle, UserPlus, MoveRight
} from "lucide-react";

const actionIcons: Record<string, any> = {
  created: Plus, moved: MoveRight, reported: AlertTriangle,
  resolved: CheckCircle2, joined: UserPlus, assigned: ArrowRight,
};

const actionConfig: Record<string, { bg: string; text: string; border: string }> = {
  created:  { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  moved:    { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  reported: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  joined:   { bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-200" },
  assigned: { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
};

const entityBadge: Record<string, string> = {
  task:    "bg-violet-100 text-violet-700 border border-violet-200",
  bug:     "bg-red-100 text-red-700 border border-red-200",
  project: "bg-blue-100 text-blue-700 border border-blue-200",
  member:  "bg-cyan-100 text-cyan-700 border border-cyan-200",
};

export default function ActivityPage() {
  const { activities, activeProjectId, getUserById, fetchActivities } = useStore();

  useEffect(() => {
    if (activeProjectId) fetchActivities(activeProjectId);
  }, [activeProjectId]);

  const projectActivities = useMemo(
    () => activities
      .filter((a) => a.projectId === activeProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activities, activeProjectId]
  );

  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof projectActivities> = {};
    projectActivities.forEach((activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    return groups;
  }, [projectActivities]);

  const statCards = [
    { label: "Total Actions", value: projectActivities.length,                                                                                    icon: Activity,  bg: "bg-violet-100", text: "text-violet-700" },
    { label: "Tasks",         value: projectActivities.filter((a) => a.entityType?.toLowerCase() === "task").length,   icon: GitBranch, bg: "bg-indigo-100", text: "text-indigo-700" },
    { label: "Bugs",          value: projectActivities.filter((a) => a.entityType?.toLowerCase() === "bug").length,    icon: Bug,       bg: "bg-red-100",    text: "text-red-700" },
    { label: "Members",       value: projectActivities.filter((a) => a.entityType?.toLowerCase() === "member").length, icon: Users,     bg: "bg-cyan-100",   text: "text-cyan-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track all actions and changes in your project</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.text)} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <Activity className="h-4 w-4 text-violet-700" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Timeline</h2>
        </div>

        <ScrollArea className="h-[600px]">
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="text-center py-16">
              <Activity className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No activity yet</p>
              <p className="text-xs text-gray-300 mt-1">Actions will appear here as your team works</p>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="mb-8 last:mb-0">
                {/* Date header */}
                <div className="sticky top-0 bg-white z-10 pb-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {date}
                  </span>
                </div>

                <div className="space-y-1 relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-6 bottom-2 w-0.5 bg-gray-100 rounded-full" />

                  {dateActivities.map((activity, i) => {
                    const user = getUserById(activity.userId);
                    const Icon = actionIcons[activity.action] || Activity;
                    const cfg = actionConfig[activity.action] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                    const entityKey = activity.entityType?.toLowerCase() || "";
                    const badgeCls = entityBadge[entityKey] || "bg-gray-100 text-gray-600 border border-gray-200";

                    return (
                      <div key={activity.id}
                        className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors stagger-item relative"
                        style={{ animationDelay: `${i * 30}ms` }}>

                        {/* Action icon */}
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 border", cfg.bg, cfg.text, cfg.border)}>
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-bold text-gray-900">{user?.name || "Unknown"}</span>{" "}
                            <span className="text-gray-600">{activity.details}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-gray-400 font-medium">
                              {formatRelativeTime(activity.createdAt)}
                            </span>
                            {entityKey && (
                              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize", badgeCls)}>
                                {entityKey}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="text-[9px] font-bold"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", color: "white" }}>
                            {user ? getInitials(user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
