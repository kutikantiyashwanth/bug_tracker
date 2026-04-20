"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-api";
import { analyticsApi } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import {
  TrendingUp, Bug, CheckCircle2, Clock, Target,
  BarChart3, Activity, AlertTriangle, Zap, RefreshCw,
  ArrowUpRight, ArrowDownRight, Calendar,
} from "lucide-react";

interface AnalyticsData {
  taskStats: {
    total: number; completed: number; inProgress: number;
    testing: number; todo: number; backlog: number; completionRate: number;
  };
  bugStats: {
    total: number; open: number; inProgress: number; resolved: number;
    closed: number; critical: number; major: number; minor: number; fixRate: number;
  };
  weeklyData: Array<{
    label: string; tasksCreated: number; tasksResolved: number;
    bugsReported: number; bugsResolved: number;
  }>;
  upcomingDeadlines: Array<{
    id: string; title: string; dueDate: string;
    daysLeft: number; priority: string; status: string;
  }>;
  successMetrics: {
    bugsResolvedThisWeek: number;
    tasksCompletedThisWeek: number;
    totalActivities: number;
  };
}

export default function AnalyticsPage() {
  const { activeProjectId, projects } = useStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;

  const fetchAnalytics = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const res = await analyticsApi.get(activeProjectId);
      setData(res.data.data);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [activeProjectId]);

  // Chart max value for scaling
  const chartMax = data ? Math.max(...data.weeklyData.map((d) =>
    Math.max(d.tasksCreated, d.tasksResolved, d.bugsReported, d.bugsResolved, 1)
  ), 1) : 1;

  const Bar = ({ value, color, max }: { value: number; color: string; max: number }) => (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[9px] font-bold" style={{ color }}>{value || ""}</span>
      <div className="w-full rounded-t-sm transition-all duration-700 min-h-[2px]"
        style={{ height: `${Math.max((value / max) * 80, value > 0 ? 4 : 2)}px`, background: color, opacity: value > 0 ? 1 : 0.2 }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between stagger-item">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm mt-1 text-gray-500">
            {activeProject ? <>Project: <span className="text-gray-700 font-medium">{activeProject.name}</span></> : "Select a project"}
          </p>
        </div>
        <button onClick={fetchAnalytics} disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.2)", color: "#6d28d9" }}>
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {!data && !loading && (
        <div className="card-base rounded-2xl p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3" style={{ color: "rgba(109,40,217,0.4)" }} />
          <p className="text-gray-500">Select a project to view analytics</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: CheckCircle2, label: "Task Completion",
                value: `${data.taskStats.completionRate}%`,
                sub: `${data.taskStats.completed}/${data.taskStats.total} tasks done`,
                iconCls: "icon-emerald w-10 h-10", accent: "stat-emerald",
                trend: data.taskStats.completionRate >= 50 ? "On track" : "Behind",
                up: data.taskStats.completionRate >= 50,
              },
              {
                icon: Bug, label: "Bug Fix Rate",
                value: `${data.bugStats.fixRate}%`,
                sub: `${data.bugStats.resolved + data.bugStats.closed}/${data.bugStats.total} fixed`,
                iconCls: "icon-rose w-10 h-10", accent: "stat-rose",
                trend: data.bugStats.critical > 0 ? `${data.bugStats.critical} critical` : "No critical",
                up: data.bugStats.critical === 0,
              },
              {
                icon: Zap, label: "This Week",
                value: data.successMetrics.tasksCompletedThisWeek,
                sub: `${data.successMetrics.bugsResolvedThisWeek} bugs resolved`,
                iconCls: "icon-violet w-10 h-10", accent: "stat-violet",
              },
              {
                icon: Activity, label: "Total Activity",
                value: data.successMetrics.totalActivities,
                sub: "actions logged",
                iconCls: "icon-cyan w-10 h-10", accent: "stat-cyan",
              },
            ].map((card, i) => (
              <div key={i}
                className={cn("stagger-item card-base card-lift p-5 rounded-2xl", card.accent)}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className={card.iconCls}><card.icon className="h-5 w-5" /></div>
                  {card.trend && (
                    <span className={cn("flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
                      card.up ? "pill-emerald" : "pill-rose"
                    )}>
                      {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {card.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                <p className="text-xs font-semibold mt-0.5 text-gray-500">{card.label}</p>
                <p className="text-[10px] mt-1 text-gray-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Productivity Chart ── */}
          <div className="stagger-item card-base rounded-2xl p-6" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl icon-violet flex items-center justify-center">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800">Weekly Productivity</h3>
                  <p className="text-[10px] text-gray-500">Tasks &amp; bugs over the last 7 days</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px]">
                {[
                  { color: "#7c3aed", label: "Tasks Created" },
                  { color: "#10b981", label: "Tasks Done" },
                  { color: "#f43f5e", label: "Bugs Reported" },
                  { color: "#f59e0b", label: "Bugs Fixed" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                    <span className="text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-3 h-32">
              {data.weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  {/* Bars group */}
                  <div className="flex items-end gap-0.5 h-24">
                    <Bar value={day.tasksCreated}  color="#7c3aed" max={chartMax} />
                    <Bar value={day.tasksResolved} color="#10b981" max={chartMax} />
                    <Bar value={day.bugsReported}  color="#f43f5e" max={chartMax} />
                    <Bar value={day.bugsResolved}  color="#f59e0b" max={chartMax} />
                  </div>
                  {/* Day label */}
                  <p className="text-center text-[10px] font-semibold text-gray-500">{day.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Task vs Bug breakdown + Deadlines ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Task breakdown */}
            <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "240ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl icon-violet flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-gray-800">Tasks Breakdown</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Done",        count: data.taskStats.completed,  color: "#10b981" },
                  { label: "In Progress", count: data.taskStats.inProgress, color: "#7c3aed" },
                  { label: "Testing",     count: data.taskStats.testing,    color: "#f59e0b" },
                  { label: "To Do",       count: data.taskStats.todo,       color: "#3b82f6" },
                  { label: "Backlog",     count: data.taskStats.backlog,    color: "#64748b" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-800">{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${data.taskStats.total > 0 ? (item.count / data.taskStats.total) * 100 : 0}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bug breakdown */}
            <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "280ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl icon-rose flex items-center justify-center">
                  <Bug className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-gray-800">Bugs Breakdown</h3>
              </div>

              {/* Severity */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-violet-600">By Severity</p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Critical", count: data.bugStats.critical, color: "#f43f5e" },
                  { label: "Major",    count: data.bugStats.major,    color: "#f97316" },
                  { label: "Minor",    count: data.bugStats.minor,    color: "#3b82f6" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-xs flex-1 text-gray-600">{item.label}</span>
                    <span className="text-xs font-bold text-gray-800">{item.count}</span>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${data.bugStats.total > 0 ? (item.count / data.bugStats.total) * 100 : 0}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-violet-600">By Status</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Open",     count: data.bugStats.open,       cls: "pill-rose" },
                  { label: "Progress", count: data.bugStats.inProgress, cls: "pill-amber" },
                  { label: "Resolved", count: data.bugStats.resolved,   cls: "pill-emerald" },
                  { label: "Closed",   count: data.bugStats.closed,     cls: "pill-gray" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-600">{item.label}</span>
                    <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full", item.cls)}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "320ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl icon-amber flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-gray-800">Upcoming Deadlines</h3>
              </div>
              {data.upcomingDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "rgba(16,185,129,0.5)" }} />
                  <p className="text-xs text-gray-500">No deadlines in next 7 days</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.upcomingDeadlines.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-1 h-8 rounded-full shrink-0"
                        style={{ background: task.daysLeft <= 1 ? "#f43f5e" : task.daysLeft <= 3 ? "#f59e0b" : "#10b981" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
                        <p className="text-[10px] text-gray-500">
                          {task.daysLeft <= 1 ? "Due tomorrow" : `${task.daysLeft}d left`}
                        </p>
                      </div>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        task.daysLeft <= 1 ? "pill-rose" : task.daysLeft <= 3 ? "pill-amber" : "pill-emerald"
                      )}>
                        {task.priority.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Success Metrics ── */}
          <div className="stagger-item card-base rounded-2xl p-6" style={{ animationDelay: "360ms" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl icon-cyan flex items-center justify-center">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-800">Success Metrics</h3>
                <p className="text-[10px] text-gray-500">Key performance indicators for your project</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Task Completion Rate",
                  value: `${data.taskStats.completionRate}%`,
                  target: "Target: 80%",
                  met: data.taskStats.completionRate >= 80,
                  icon: CheckCircle2, color: "#10b981",
                },
                {
                  label: "Bug Fix Rate",
                  value: `${data.bugStats.fixRate}%`,
                  target: "Target: 70%",
                  met: data.bugStats.fixRate >= 70,
                  icon: Bug, color: "#f43f5e",
                },
                {
                  label: "Bugs Resolved / Week",
                  value: data.successMetrics.bugsResolvedThisWeek,
                  target: "This week",
                  met: data.successMetrics.bugsResolvedThisWeek > 0,
                  icon: TrendingUp, color: "#7c3aed",
                },
                {
                  label: "Tasks Active / Week",
                  value: data.successMetrics.tasksCompletedThisWeek,
                  target: "This week",
                  met: data.successMetrics.tasksCompletedThisWeek > 0,
                  icon: Zap, color: "#f59e0b",
                },
              ].map((metric, i) => (
                <div key={i} className="p-4 rounded-2xl text-center bg-gray-50 border"
                  style={{ borderColor: metric.met ? metric.color + "40" : "#e5e7eb" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: metric.color + "15", color: metric.color, border: `1px solid ${metric.color}30` }}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{metric.value}</p>
                  <p className="text-xs font-semibold mt-1 text-gray-600">{metric.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: metric.met ? "#10b981" : "#f43f5e" }} />
                    <span className="text-[10px]" style={{ color: metric.met ? "#059669" : "#e11d48" }}>
                      {metric.met ? "✓ Met" : "Below target"}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 text-gray-400">{metric.target}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
