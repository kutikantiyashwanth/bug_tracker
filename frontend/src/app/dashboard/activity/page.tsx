"use client";

import { useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-10 animate-slide-up max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-1 bg-indigo-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">Project Operations</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Activity <span className="text-violet-400 underline decoration-indigo-500/20 underline-offset-8">Audit</span></h1>
        <p className="text-white/60 mt-2 font-medium max-w-xl">
          Real-time surveillance of all project operations, modifications, and system events across the workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-base rounded-2xl p-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", 
              stat.label === "Total Actions" ? "bg-[#0f1729] text-white" :
              stat.label === "Tasks" ? "bg-indigo-50 text-violet-400 border-indigo-100" :
              stat.label === "Bugs" ? "bg-rose-50 text-rose-600 border-rose-100" :
              "bg-emerald-50 text-emerald-600 border-emerald-100"
            )}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/65">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="card-base rounded-2xl p-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/6 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white/65" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Operational Timeline</h2>
              <p className="text-[10px] font-bold text-white/65 uppercase">Chronological System Events</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/6">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live Monitoring Active</span>
          </div>
        </div>

        <ScrollArea className="h-[700px] pr-6">
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/6 flex items-center justify-center">
                <Activity className="h-10 w-10 text-white/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white uppercase tracking-widest">No Operational History</p>
                <p className="text-[10px] text-white/65 font-bold uppercase">Actions will materialize as protocols are executed</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="mb-12 last:mb-0">
                {/* Date header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 mb-6 border-b border-slate-50">
                  <span className="text-xs font-black text-violet-400 uppercase tracking-[0.2em]">
                    {date}
                  </span>
                </div>

                <div className="space-y-4 relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-8 bottom-0 w-px bg-white/8" />

                  {dateActivities.map((activity, i) => {
                    const user = getUserById(activity.userId);
                    const Icon = actionIcons[activity.action] || Activity;
                    const entityKey = activity.entityType?.toLowerCase() || "";
                    
                    return (
                      <div key={activity.id} className="flex gap-6 group">
                        {/* Action icon bubble */}
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 border transition-all shadow-sm group-hover:scale-110", 
                          activity.action === "resolved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          activity.action === "reported" ? "bg-rose-50 text-rose-600 border-rose-100" :
                          activity.action === "joined" ? "bg-indigo-50 text-violet-400 border-indigo-100" :
                          "bg-white/5 text-white/70 border-white/6"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8 group-last:pb-0">
                          <div className="p-6 rounded-[2rem] bg-white/5/50 border border-transparent group-hover:border-white/6 group-hover:bg-white/5 group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all flex items-start justify-between gap-6">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-white/70 leading-relaxed">
                                <span className="font-black text-white uppercase tracking-tight mr-1">{user?.name || "System Actor"}</span>{" "}
                                {activity.details}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-white/65 uppercase tracking-widest">
                                  {formatRelativeTime(activity.createdAt)}
                                </span>
                                {entityKey && (
                                  <Badge className={cn("text-[9px] font-black uppercase tracking-widest",
                                    entityKey === "task" ? "bg-indigo-50 text-violet-400 border-indigo-100" :
                                    entityKey === "bug" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-white/8 text-white/70 border-white/10"
                                  )}>
                                    {entityKey}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                              <AvatarFallback className="text-[10px] font-black bg-[#0f1729] text-white">
                                {user ? getInitials(user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
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
