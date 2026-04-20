"use client";

import { useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  CheckCircle2, Bug, Users, Zap, ArrowUpRight, ArrowDownRight,
  BarChart3, Calendar, Activity, AlertTriangle, TrendingUp, Clock,
  RefreshCw, Target, Award, Flame,
} from "lucide-react";

export default function DashboardPage() {
  const { tasks, bugs, activities, activeProjectId, projects, getUserById, currentUser,
    fetchTasks, fetchBugs, fetchActivities } = useStore();

  useEffect(() => {
    if (activeProjectId) {
      fetchTasks(activeProjectId);
      fetchBugs(activeProjectId);
      fetchActivities(activeProjectId);
    }
  }, [activeProjectId]);

  const projectTasks = useMemo(() => (Array.isArray(tasks) ? tasks.filter((t) => t.projectId === activeProjectId) : []), [tasks, activeProjectId]);
  const projectBugs  = useMemo(() => (Array.isArray(bugs)  ? bugs.filter((b)  => b.projectId === activeProjectId) : []), [bugs, activeProjectId]);
  const projectActivities = useMemo(() =>
    activities.filter((a) => a.projectId === activeProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    [activities, activeProjectId]
  );
  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;

  const stats = useMemo(() => {
    const completed    = projectTasks.filter((t) => t.status === "done").length;
    const total        = projectTasks.length;
    const openBugs     = projectBugs.filter((b) => b.status === "open" || b.status === "in-progress").length;
    const resolvedBugs = projectBugs.filter((b) => b.status === "resolved" || b.status === "closed").length;
    const inProgress   = projectTasks.filter((t) => t.status === "in-progress").length;
    const testing      = projectTasks.filter((t) => t.status === "testing").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const bugFixRate     = (openBugs + resolvedBugs) > 0 ? Math.round((resolvedBugs / (openBugs + resolvedBugs)) * 100) : 0;
    const upcomingDeadlines = projectTasks
      .filter((t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4);
    return { completed, total, openBugs, resolvedBugs, inProgress, testing, completionRate, bugFixRate, upcomingDeadlines, members: activeProject?.members?.length || 0 };
  }, [projectTasks, projectBugs, activeProject]);

  const tasksByStatus = [
    { label: "Backlog",     color: "#94a3b8", count: projectTasks.filter((t) => t.status === "backlog").length },
    { label: "To Do",       color: "#3b82f6", count: projectTasks.filter((t) => t.status === "todo").length },
    { label: "In Progress", color: "#6c5ce7", count: projectTasks.filter((t) => t.status === "in-progress").length },
    { label: "Testing",     color: "#f59e0b", count: projectTasks.filter((t) => t.status === "testing").length },
    { label: "Done",        color: "#10b981", count: projectTasks.filter((t) => t.status === "done").length },
  ];

  // ── Productivity chart — last 7 days activity ──
  const productivityData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((day) => {
      const dayStr = day.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(day); dayStart.setHours(0,0,0,0);
      const dayEnd   = new Date(day); dayEnd.setHours(23,59,59,999);
      const tasksCreated  = projectTasks.filter((t) => new Date(t.createdAt) >= dayStart && new Date(t.createdAt) <= dayEnd).length;
      const tasksDone     = projectTasks.filter((t) => t.status === "done" && new Date(t.updatedAt) >= dayStart && new Date(t.updatedAt) <= dayEnd).length;
      const bugsReported  = projectBugs.filter((b) => new Date(b.createdAt) >= dayStart && new Date(b.createdAt) <= dayEnd).length;
      const bugsResolved  = projectBugs.filter((b) => (b.status === "resolved" || b.status === "closed") && new Date(b.updatedAt) >= dayStart && new Date(b.updatedAt) <= dayEnd).length;
      return { day: dayStr, tasksCreated, tasksDone, bugsReported, bugsResolved };
    });
  }, [projectTasks, projectBugs]);

  // ── Bug severity breakdown for pie chart ──
  const bugSeverityData = useMemo(() => [
    { name: "Critical", value: projectBugs.filter((b) => b.severity === "critical").length, color: "#f43f5e" },
    { name: "Major",    value: projectBugs.filter((b) => b.severity === "major").length,    color: "#f97316" },
    { name: "Minor",    value: projectBugs.filter((b) => b.severity === "minor").length,    color: "#3b82f6" },
  ].filter((d) => d.value > 0), [projectBugs]);

  // ── Success metrics ──
  const metrics = useMemo(() => {
    const resolvedThisWeek = projectBugs.filter((b) => {
      const d = new Date(b.updatedAt);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return (b.status === "resolved" || b.status === "closed") && d >= weekAgo;
    }).length;
    const tasksThisWeek = projectTasks.filter((t) => {
      const d = new Date(t.updatedAt);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return t.status === "done" && d >= weekAgo;
    }).length;
    const overdueCount = projectTasks.filter((t) =>
      t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date()
    ).length;
    return { resolvedThisWeek, tasksThisWeek, overdueCount };
  }, [projectTasks, projectBugs]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      icon: CheckCircle2, label: "Tasks Completed", value: `${stats.completed}/${stats.total}`,
      sub: `${stats.completionRate}% complete`, trend: "+12%", up: true,
      iconClass: "icon-emerald w-10 h-10", accent: "stat-emerald",
    },
    {
      icon: Bug, label: "Open Bugs", value: stats.openBugs,
      sub: `${stats.resolvedBugs} resolved`, trend: stats.openBugs > 3 ? "High" : "Low", up: stats.openBugs <= 3,
      iconClass: "icon-rose w-10 h-10", accent: "stat-rose",
    },
    {
      icon: Zap, label: "In Progress", value: stats.inProgress,
      sub: `${stats.testing} in testing`,
      iconClass: "icon-violet w-10 h-10", accent: "stat-violet",
    },
    {
      icon: Users, label: "Team Members", value: stats.members,
      sub: "active now",
      iconClass: "icon-cyan w-10 h-10", accent: "stat-cyan",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="stagger-item flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 page-title">
            {greeting},{" "}
            <span className="text-gradient">{currentUser?.name?.split(" ")[0] || "there"}</span>
            {" "}👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {activeProject
              ? <>Here's what's happening on <span className="font-semibold text-gray-700">{activeProject.name}</span></>
              : "Select or create a project to get started"}
          </p>
        </div>
        <button
          onClick={() => { if (activeProjectId) { fetchTasks(activeProjectId); fetchBugs(activeProjectId); fetchActivities(activeProjectId); }}}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-smooth border border-transparent hover:border-purple-100 self-start gpu">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stat-grid">
        {statCards.map((card, i) => (
          <div key={i}
            className={cn("stagger-item card-base card-lift card-shine hover-glow p-5 rounded-2xl", card.accent)}
            style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 animate-pop-in", card.iconClass)} style={{ animationDelay: `${i * 60 + 150}ms` }}>
                <card.icon className="h-5 w-5" />
              </div>
              {card.trend && (
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
                  card.up ? "pill-emerald" : "pill-rose"
                )}>
                  {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-gray-900 animate-count-up">{card.value}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "#374151" }}>{card.label}</p>
            {card.sub && <p className="text-xs mt-1 text-gray-400">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Progress + Distribution + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Progress */}
        <div className="stagger-item card-base rounded-2xl p-5 space-y-5" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-purple">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-800">Progress Overview</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Task Completion</span>
                <span className="font-bold text-gray-800">{stats.completionRate}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-purple" style={{ width: `${stats.completionRate}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>{stats.completed} done</span><span>{stats.total - stats.completed} left</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Bug Fix Rate</span>
                <span className="font-bold text-gray-800">{stats.bugFixRate}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-blue" style={{ width: `${stats.bugFixRate}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>{stats.resolvedBugs} fixed</span><span>{stats.openBugs} open</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(109,40,217,0.08)", border: "1px solid rgba(109,40,217,0.1)" }}>
                <p className="text-xl font-black text-purple-700">{stats.inProgress}</p>
                <p className="text-[10px] font-bold mt-0.5 text-purple-500">In Progress</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.1)" }}>
                <p className="text-xl font-black text-amber-600">{stats.testing}</p>
                <p className="text-[10px] font-bold mt-0.5 text-amber-500">Testing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-blue">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-800">Task Distribution</h3>
          </div>
          <div className="space-y-3">
            {tasksByStatus.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-800">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total tasks</span>
            <span className="text-sm font-bold text-gray-800">{stats.total}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "280ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-teal">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-800">Recent Activity</h3>
          </div>
          <ScrollArea className="h-[220px]">
            {projectActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Activity className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectActivities.map((a) => {
                  const user = getUserById(a.userId);
                  return (
                    <div key={a.id} className="flex gap-3 group">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[9px] font-bold"
                          style={{ background: "linear-gradient(135deg, #6c5ce7, #2dd4bf)", color: "white" }}>
                          {user ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold text-gray-800">{user?.name || "Someone"}</span>{" "}
                          <span className="text-gray-400">{a.details}</span>
                        </p>
                        <p className="text-[10px] mt-0.5 text-gray-400">{formatRelativeTime(a.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* ── Deadlines + Bugs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Upcoming Deadlines */}
        <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "320ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-amber">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-gray-800">Upcoming Deadlines</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">{stats.upcomingDeadlines.length} tasks</span>
          </div>

          {stats.upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-600">All clear!</p>
              <p className="text-xs text-gray-400 mt-0.5">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.upcomingDeadlines.map((task) => {
                const daysLeft = Math.ceil((new Date(task.dueDate!).getTime() - Date.now()) / 86400000);
                const urgency = daysLeft <= 2 ? { color: "#f43f5e", bg: "pill-rose",    text: "", label: "Urgent" }
                              : daysLeft <= 5 ? { color: "#f59e0b", bg: "pill-amber",   text: "", label: "Soon" }
                              : { color: "#10b981", bg: "pill-emerald", text: "", label: "On track" };
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                    style={{ background: "#f8f9fc" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f8f9fc")}>
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: urgency.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9ca3af" }}>
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(task.dueDate!)} · {daysLeft}d left
                      </p>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", urgency.bg, urgency.text)}>
                      {urgency.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bugs */}
        <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "360ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-rose">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-gray-800">Recent Bugs</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">{projectBugs.length} total</span>
          </div>

          {projectBugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Bug className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No bugs yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Great work keeping things clean!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projectBugs.slice(0, 4).map((bug) => {
                const reporter = getUserById(bug.reportedBy);
                const severityConfig = {
                  critical: { dot: "bg-red-500", badge: "bg-red-100 text-red-600" },
                  major:    { dot: "bg-orange-400", badge: "bg-orange-100 text-orange-600" },
                  minor:    { dot: "bg-sky-400", badge: "bg-sky-100 text-sky-600" },
                }[bug.severity] || { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" };
                const statusConfig = {
                  "open":        "pill-rose",
                  "in-progress": "pill-amber",
                  "resolved":    "pill-emerald",
                  "closed":      "pill-gray",
                }[bug.status] || "pill-gray";
                return (
                  <div key={bug.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: "#f8f9fc" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f8f9fc")}>
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-0.5", severityConfig.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{bug.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#9ca3af" }}>
                        {reporter?.name || "Unknown"} · {formatRelativeTime(bug.createdAt)}
                      </p>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", statusConfig)}>
                      {bug.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* ── Analytics: Productivity Chart + Bug Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Productivity Chart — 7 day area chart */}
        <div className="stagger-item card-base rounded-2xl p-5 lg:col-span-2" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-violet">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-800">Productivity Chart</h3>
                <p className="text-[10px]" style={{ color: "#9ca3af" }}>Last 7 days activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px]" style={{ color: "#6b7280" }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Tasks Done</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Bugs Fixed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={productivityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBugs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
              <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "rgba(8,11,26,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }}
                cursor={{ stroke: "rgba(124,58,237,0.3)" }}
              />
              <Area type="monotone" dataKey="tasksDone" name="Tasks Done" stroke="#7c3aed" strokeWidth={2} fill="url(#gradTasks)" dot={{ fill: "#7c3aed", r: 3 }} />
              <Area type="monotone" dataKey="bugsResolved" name="Bugs Fixed" stroke="#10b981" strokeWidth={2} fill="url(#gradBugs)" dot={{ fill: "#10b981", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bug Severity Pie */}
        <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "440ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-rose">
              <Bug className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Bug Severity</h3>
              <p className="text-[10px]" style={{ color: "#9ca3af" }}>Breakdown by type</p>
            </div>
          </div>
          {bugSeverityData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Bug className="h-10 w-10 mb-2 text-gray-200" />
              <p className="text-xs text-gray-400">No bugs yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={bugSeverityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {bugSeverityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(8,11,26,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {bugSeverityData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span style={{ color: "#4b5563" }}>{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Success Metrics ── */}
      <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "480ms" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-amber">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800">Success Metrics</h3>
            <p className="text-[10px]" style={{ color: "#9ca3af" }}>Weekly performance indicators</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle2, label: "Tasks Done This Week", value: metrics.tasksThisWeek, color: "icon-emerald", neon: "text-emerald-700", sub: "completed" },
            { icon: Bug,          label: "Bugs Fixed This Week", value: metrics.resolvedThisWeek, color: "icon-violet", neon: "text-purple-700", sub: "resolved" },
            { icon: Flame,        label: "Overdue Tasks",        value: metrics.overdueCount, color: "icon-rose", neon: "text-rose-600", sub: "need attention" },
            { icon: Target,       label: "Completion Rate",      value: `${stats.completionRate}%`, color: "icon-blue", neon: "text-blue-700", sub: "of all tasks" },
          ].map((m, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className={cn("w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center", m.color)}>
                <m.icon className="h-5 w-5" />
              </div>
              <p className={cn("text-2xl font-black", m.neon)}>{m.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1">{m.label}</p>
              <p className="text-[10px] mt-0.5 text-gray-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tasks vs Bugs Bar Chart ── */}
      <div className="stagger-item card-base rounded-2xl p-5" style={{ animationDelay: "520ms" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center icon-cyan">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">Tasks vs Bugs — Daily</h3>
              <p className="text-[10px]" style={{ color: "#9ca3af" }}>Created vs resolved per day</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: "#6b7280" }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Tasks Created</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Bugs Reported</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={productivityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "rgba(8,11,26,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "#e2e8f0", fontSize: 12 }} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
            <Bar dataKey="tasksCreated" name="Tasks Created" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={24} />
            <Bar dataKey="bugsReported" name="Bugs Reported" fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

