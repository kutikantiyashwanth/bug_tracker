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
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-10 animate-slide-up max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mission Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Performance <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-8">Analytics</span></h1>
          <p className="text-slate-500 font-medium max-w-xl">
            {activeProject ? (
              <>Synthesizing data for <span className="text-indigo-600 font-black">{activeProject.name}</span>. Deep-dive into velocity metrics and defect density.</>
            ) : (
              "Please select a project from the workspace to initialize intelligence protocols."
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAnalytics} disabled={loading}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-500/30 hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors", loading && "animate-spin")} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Sync Intelligence</span>
          </button>
        </div>
      </div>

      {!data && !loading && (
        <div className="premium-card py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">No Intelligence Data Available</h3>
            <p className="text-slate-500 text-sm max-w-xs">Select an active project to synchronize real-time velocity and defect metrics.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-[2.5rem] bg-slate-100/50 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-10">
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle2, label: "Mission Velocity",
                value: `${data.taskStats.completionRate}%`,
                sub: `${data.taskStats.completed}/${data.taskStats.total} TASKS FINALIZED`,
                iconCls: "bg-emerald-50 text-emerald-600 border-emerald-100", 
                accent: "border-emerald-500/10 hover:border-emerald-500/30",
                trend: data.taskStats.completionRate >= 50 ? "PEAK PERFORMANCE" : "ACCELERATION NEEDED",
                up: data.taskStats.completionRate >= 50,
              },
              {
                icon: Bug, label: "Defect Density",
                value: `${data.bugStats.fixRate}%`,
                sub: `${data.bugStats.resolved + data.bugStats.closed}/${data.bugStats.total} THREATS NEUTRALIZED`,
                iconCls: "bg-rose-50 text-rose-600 border-rose-100", 
                accent: "border-rose-500/10 hover:border-rose-500/30",
                trend: data.bugStats.critical > 0 ? `${data.bugStats.critical} CRITICAL DEFECTS` : "CLEAN STATUS",
                up: data.bugStats.critical === 0,
              },
              {
                icon: Zap, label: "Weekly Momentum",
                value: data.successMetrics.tasksCompletedThisWeek,
                sub: `${data.successMetrics.bugsResolvedThisWeek} BUGS RESOLVED`,
                iconCls: "bg-indigo-50 text-indigo-600 border-indigo-100", 
                accent: "border-indigo-500/10 hover:border-indigo-500/30",
              },
              {
                icon: Activity, label: "System Cycles",
                value: data.successMetrics.totalActivities,
                sub: "TOTAL OPERATIONS LOGGED",
                iconCls: "bg-slate-900 text-white border-slate-800", 
                accent: "border-slate-900/10 hover:border-slate-900/30",
              },
            ].map((card, i) => (
              <div key={i} className={cn("premium-card p-8 group transition-all", card.accent)}>
                <div className="flex items-start justify-between mb-6">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm", card.iconCls)}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  {card.trend && (
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                      card.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {card.trend}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform origin-left">{card.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Productivity Chart ── */}
          <div className="premium-card p-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Velocity Diagnostics</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Operational flow over last 7 sessions</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { color: "#6366f1", label: "TASKS CREATED" },
                  { color: "#10b981", label: "TASKS FINALIZED" },
                  { color: "#f43f5e", label: "BUGS DETECTED" },
                  { color: "#f59e0b", label: "BUGS NEUTRALIZED" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md shadow-sm" style={{ background: l.color }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-4 h-64 px-4">
              {data.weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col gap-4 group">
                  {/* Bars group */}
                  <div className="flex items-end gap-1.5 h-full px-1">
                    <Bar value={day.tasksCreated}  color="#6366f1" max={chartMax} />
                    <Bar value={day.tasksResolved} color="#10b981" max={chartMax} />
                    <Bar value={day.bugsReported}  color="#f43f5e" max={chartMax} />
                    <Bar value={day.bugsResolved}  color="#f59e0b" max={chartMax} />
                  </div>
                  {/* Day label */}
                  <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 transition-all">
                    <p className="text-center text-[10px] font-black text-slate-600 group-hover:text-indigo-600 uppercase tracking-widest">{day.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task breakdown */}
            <div className="premium-card p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Task Lifecycle</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Velocity Distribution</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { label: "FINALIZED",        count: data.taskStats.completed,  color: "#10b981" },
                  { label: "ACTIVE", count: data.taskStats.inProgress, color: "#6366f1" },
                  { label: "VALIDATION",     count: data.taskStats.testing,    color: "#f59e0b" },
                  { label: "PENDING",       count: data.taskStats.todo,       color: "#3b82f6" },
                  { label: "BACKLOG",     count: data.taskStats.backlog,    color: "#94a3b8" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-[10px] font-black tracking-widest text-slate-500">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-50 border border-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${data.taskStats.total > 0 ? (item.count / data.taskStats.total) * 100 : 0}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bug breakdown */}
            <div className="premium-card p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Bug className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Threat Matrix</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Defect Severity Analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "CRITICAL THREATS", count: data.bugStats.critical, color: "#f43f5e" },
                  { label: "MAJOR DEFECTS",    count: data.bugStats.major,    color: "#f97316" },
                  { label: "MINOR ISSUES",    count: data.bugStats.minor,    color: "#3b82f6" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-slate-900">{item.count}</span>
                      <div className="w-20 h-2 rounded-full bg-slate-200/50 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${data.bugStats.total > 0 ? (item.count / data.bugStats.total) * 100 : 0}%`, background: item.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                {[
                  { label: "OPEN",     count: data.bugStats.open,       cls: "bg-rose-50 text-rose-600 border-rose-100" },
                  { label: "PROGRESS", count: data.bugStats.inProgress, cls: "bg-amber-50 text-amber-600 border-amber-100" },
                  { label: "RESOLVED", count: data.bugStats.resolved,   cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                  { label: "CLOSED",   count: data.bugStats.closed,     cls: "bg-slate-100 text-slate-600 border-slate-200" },
                ].map((item) => (
                  <div key={item.label} className={cn("flex flex-col p-4 rounded-2xl border transition-all", item.cls)}>
                    <span className="text-[9px] font-black tracking-widest uppercase opacity-60">{item.label}</span>
                    <span className="text-xl font-black mt-1">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="premium-card p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Timeline Alerts</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Critical Proximity Deadlines</p>
                </div>
              </div>
              {data.upcomingDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-emerald-50/20 rounded-[2.5rem] border border-emerald-100/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">No Critical Deadlines</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.upcomingDeadlines.map((task) => (
                    <div key={task.id} className="group p-5 rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden">
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", 
                        task.daysLeft <= 1 ? "bg-rose-500" : task.daysLeft <= 3 ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{task.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {task.daysLeft <= 1 ? <span className="text-rose-500">DUE IMMINENTLY</span> : <span className="text-indigo-500">{task.daysLeft} DAYS UNTIL EXPIRY</span>}
                          </p>
                        </div>
                        <Badge className={cn("font-black text-[9px] uppercase tracking-widest px-2",
                          task.priority === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-100" : 
                          task.priority === "HIGH" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                          "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Success Metrics ── */}
          <div className="premium-card p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Intelligence Success Matrix</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Key Performance Indicators vs Benchmarks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  label: "VELOCITY TARGET",
                  value: `${data.taskStats.completionRate}%`,
                  target: "BENCHMARK: 80%",
                  met: data.taskStats.completionRate >= 80,
                  icon: CheckCircle2, color: "#10b981",
                },
                {
                  label: "NEUTRALIZATION RATE",
                  value: `${data.bugStats.fixRate}%`,
                  target: "BENCHMARK: 70%",
                  met: data.bugStats.fixRate >= 70,
                  icon: Bug, color: "#f43f5e",
                },
                {
                  label: "WEEKLY THROUGHPUT",
                  value: data.successMetrics.bugsResolvedThisWeek,
                  target: "STATUS: ACTIVE",
                  met: data.successMetrics.bugsResolvedThisWeek > 0,
                  icon: TrendingUp, color: "#6366f1",
                },
                {
                  label: "OPERATIONAL CYCLES",
                  value: data.successMetrics.tasksCompletedThisWeek,
                  target: "STATUS: SYNCHRONIZED",
                  met: data.successMetrics.tasksCompletedThisWeek > 0,
                  icon: Zap, color: "#f59e0b",
                },
              ].map((metric, i) => (
                <div key={i} className={cn("p-8 rounded-[2.5rem] text-center border transition-all hover:scale-105", 
                  metric.met ? "bg-slate-50/50 border-slate-100" : "bg-white border-slate-200"
                )}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                    style={{ background: metric.color + "15", color: metric.color, border: `1px solid ${metric.color}20` }}>
                    <metric.icon className="h-7 w-7" />
                  </div>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{metric.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 text-slate-500">{metric.label}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", metric.met ? "bg-emerald-500" : "bg-rose-500")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", metric.met ? "text-emerald-600" : "text-rose-600")}>
                      {metric.met ? "MET" : "UNDER"}
                    </span>
                  </div>
                  <p className="text-[9px] font-black mt-2 text-slate-400 uppercase tracking-widest">{metric.target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
