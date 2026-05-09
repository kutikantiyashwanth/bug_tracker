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
  RefreshCw, Target, Award, Flame, Plus,
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
    <div className="space-y-10 animate-slide-up">

      {/* ── Header / Greeting ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Dashboard Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {greeting},{" "}
            <span className="text-gradient">{currentUser?.name?.split(" ")[0] || "there"}</span>
            {" "}✨
          </h1>
          <p className="text-white/60 mt-2 font-medium max-w-xl leading-relaxed">
            {activeProject
              ? <>You're viewing metrics for <span className="text-violet-400 font-bold">{activeProject.name}</span>. Here's what needs your attention today.</>
              : "Select a project from the sidebar to view detailed analytics and manage your team."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (activeProjectId) { fetchTasks(activeProjectId); fetchBugs(activeProjectId); fetchActivities(activeProjectId); }}}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#c4b5fd"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-all duration-500" />
            <span className="text-sm font-bold">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i}
            className="card-base rounded-2xl p-6 group relative overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
              <card.icon className="h-24 w-24" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", card.iconClass)}>
                  <card.icon className="h-6 w-6" />
                </div>
                {card.trend && (
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase",
                    card.up ? "bg-emerald-100 text-emerald-400" : "bg-rose-100 text-rose-600"
                  )}>
                    {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.trend}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
                <p className="text-xs font-bold text-white/45 uppercase tracking-widest">{card.label}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/45">{card.sub}</span>
                <ArrowUpRight className="h-3 w-3 text-white/35 group-hover:text-violet-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Dashboard Sections ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Productivity Analytics */}
        <div className="xl:col-span-2 space-y-8">
          <div className="card-base rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/8 flex items-center justify-between bg-white/5/4/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
                  <p className="text-xs font-medium text-white/45 uppercase tracking-tighter">Velocity & Bug Resolution over 7 days</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Tasks</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Bugs</div>
              </div>
            </div>
            
            <div className="p-8">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradBugs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="tasksDone" name="Tasks" stroke="#6366f1" strokeWidth={4} fill="url(#gradTasks)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="bugsResolved" name="Bugs" stroke="#10b981" strokeWidth={4} fill="url(#gradBugs)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task Distribution */}
            <div className="card-base rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Task Flow</h3>
              </div>
              
              <div className="space-y-6">
                {tasksByStatus.map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-white/55 group-hover:text-white transition-colors uppercase tracking-widest">{item.label}</span>
                      <span className="text-white">{item.count}</span>
                    </div>
                    <div className="h-2.5 bg-white/5/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs font-bold text-white/45 uppercase">Total Workforce</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white">{stats.total}</span>
                  <span className="text-[10px] font-bold text-white/45">TASKS</span>
                </div>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="card-base rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Success Rate</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Efficiency", value: `${stats.completionRate}%`, sub: "Task Completion", color: "text-violet-400", bg: "bg-violet-500/15" },
                  { label: "Stability", value: `${stats.bugFixRate}%`, sub: "Bug Resolution", color: "text-emerald-400", bg: "bg-emerald-500/15" },
                ].map((m, i) => (
                  <div key={i} className={cn("p-6 rounded-2xl flex flex-col items-center justify-center text-center", m.bg)}>
                    <p className={cn("text-3xl font-black mb-1", m.color)}>{m.value}</p>
                    <p className="text-[10px] font-black text-white/45 uppercase tracking-widest">{m.label}</p>
                    <p className="text-[9px] font-medium text-white/45 mt-1">{m.sub}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5/4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shadow-sm">
                      <Target className="h-4 w-4 text-white/45" />
                    </div>
                    <span className="text-xs font-bold text-white/70">Active Sprint Progress</span>
                  </div>
                  <span className="text-sm font-black text-white">74%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          
          {/* Recent Activity Feed */}
          <div className="card-base rounded-2xl p-6 flex flex-col h-[500px]">
            <div className="flex items-center gap-4 mb-8 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Team Pulse</h3>
            </div>
            
            <ScrollArea className="flex-1 -mx-2 px-2">
              {projectActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Activity className="h-12 w-12 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No pulse detected</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projectActivities.map((a, i) => {
                    const user = getUserById(a.userId);
                    return (
                      <div key={a.id} className="flex gap-4 group relative">
                        {i !== projectActivities.length - 1 && (
                          <div className="absolute left-4 top-10 bottom-0 w-[2px] bg-white/5/8" />
                        )}
                        <Avatar className="h-9 w-9 shrink-0 ring-4 ring-white shadow-sm z-10">
                          <AvatarFallback className="text-[10px] font-black bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            {user ? getInitials(user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pt-1">
                          <p className="text-xs leading-relaxed text-white/70">
                            <span className="font-bold text-white">{user?.name || "Member"}</span>{" "}
                            {a.details}
                          </p>
                          <p className="text-[10px] font-bold text-white/45 mt-1 uppercase tracking-tighter">{formatRelativeTime(a.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            
            <button className="mt-6 w-full py-3 rounded-xl bg-white/5/4 text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:bg-white/5/8 hover:text-white transition-all shrink-0">
              View Full History
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card-base rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Timeline</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5/8 flex items-center justify-center text-[10px] font-black text-white/70">
                {stats.upcomingDeadlines.length}
              </div>
            </div>

            <div className="space-y-3">
              {stats.upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-white/45 uppercase">Nothing scheduled</p>
                </div>
              ) : (
                stats.upcomingDeadlines.map((task) => {
                  const daysLeft = Math.ceil((new Date(task.dueDate!).getTime() - Date.now()) / 86400000);
                  const isUrgent = daysLeft <= 2;
                  return (
                    <div key={task.id} className="group p-4 rounded-2xl bg-white/5/4 hover:bg-white/5 border border-transparent hover:border-white/8 hover:shadow-sm transition-all flex items-center gap-4">
                      <div className={cn("w-1.5 h-10 rounded-full", isUrgent ? "bg-rose-500 shadow-lg shadow-rose-500/20" : "bg-indigo-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate tracking-tight">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-white/45" />
                          <span className="text-[10px] font-bold text-white/45 uppercase tracking-tighter">{formatDate(task.dueDate!)} · {daysLeft}d remaining</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

