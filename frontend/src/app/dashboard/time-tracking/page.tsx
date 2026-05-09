"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Clock, Play, Square, Plus, Timer, TrendingUp, Users, Calendar,
  DollarSign, CheckCircle2, AlertCircle
} from "lucide-react";

export default function TimeTrackingPage() {
  const {
    timeEntries,
    activeTimer,
    startTimer,
    stopTimer,
    logTime,
    tasks,
    bugs,
    activeProjectId,
    currentUser,
    getUserById,
    getTaskTime,
    getBugTime,
    getUserTime,
    getProjectTime,
    projects,
  } = useStore();

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [formHours, setFormHours] = useState("0");
  const [formMinutes, setFormMinutes] = useState("0");
  const [formDescription, setFormDescription] = useState("");
  const [formBillable, setFormBillable] = useState(false);
  const [formType, setFormType] = useState<"task" | "bug">("task");
  const [formEntityId, setFormEntityId] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);

  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;
  const projectTasks = Array.isArray(tasks) ? tasks.filter((t) => t.projectId === activeProjectId) : [];
  const projectBugs = Array.isArray(bugs) ? bugs.filter((b) => b.projectId === activeProjectId) : [];
  const projectTimeEntries = Array.isArray(timeEntries) ? timeEntries.filter((e) => e.projectId === activeProjectId) : [];

  // Timer effect
  useEffect(() => {
    if (!activeTimer) {
      setTimerSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const startTime = new Date(activeTimer.startTime);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setTimerSeconds(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const totalProjectTime = getProjectTime();
  const totalUserTime = currentUser ? getUserTime(currentUser.id) : 0;
  const billableTime = projectTimeEntries
    .filter((e) => e.billable)
    .reduce((total, e) => total + e.hours * 60 + e.minutes, 0);

  const handleStartTimer = () => {
    if (activeTimer) {
      stopTimer();
    } else {
      startTimer(undefined, undefined, "Working on project");
    }
  };

  const handleLogTime = () => {
    if (!currentUser || !activeProjectId) return;
    const hours = parseInt(formHours) || 0;
    const minutes = parseInt(formMinutes) || 0;
    if (hours === 0 && minutes === 0) return;

    logTime({
      projectId: activeProjectId,
      taskId: formType === "task" && formEntityId ? formEntityId : undefined,
      bugId: formType === "bug" && formEntityId ? formEntityId : undefined,
      userId: currentUser.id,
      hours,
      minutes,
      description: formDescription,
      billable: formBillable,
      date: new Date().toISOString().split("T")[0],
    });

    setShowLogDialog(false);
    setFormHours("0");
    setFormMinutes("0");
    setFormDescription("");
    setFormBillable(false);
    setFormEntityId("");
  };

  const stats = useMemo(() => ({
    total: totalProjectTime,
    user: totalUserTime,
    billable: billableTime,
    entries: projectTimeEntries.length,
  }), [totalProjectTime, totalUserTime, billableTime, projectTimeEntries.length]);

  return (
    <div className="space-y-10 animate-slide-up max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Resource Utilization</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Time <span className="text-violet-400 underline decoration-indigo-500/20 underline-offset-8">Intelligence</span></h1>
          <p className="text-white/60 mt-2 font-medium max-w-xl">
            Precision chronometry for project execution. Monitor velocity and resource allocation with granular temporal audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={activeTimer ? "destructive" : "premium"}
            size="lg"
            onClick={handleStartTimer}
            className={cn("!rounded-2xl shadow-lg", activeTimer ? "shadow-rose-500/20" : "shadow-indigo-500/20")}
          >
            {activeTimer ? (
              <>
                <Square className="h-5 w-5 mr-2" /> STOP CHRONOMETER
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" /> START CHRONOMETER
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={() => setShowLogDialog(true)} className="!rounded-2xl border-white/10">
            <Plus className="h-5 w-5 mr-2" /> LOG SESSION
          </Button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="card-base rounded-2xl p-8 relative overflow-hidden group" style={{ background: "#0f1729", border: "1px solid rgba(99,102,241,0.3)" }}>
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
            <Clock className="h-32 w-32 text-white" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                <Timer className="h-10 w-10 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Operational Cycle Active</p>
                <p className="text-6xl font-black font-mono text-white tracking-tighter tabular-nums">{formatTime(timerSeconds)}</p>
              </div>
            </div>
            <Button variant="destructive" size="lg" onClick={stopTimer} className="h-16 px-10 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-900/50">
              <Square className="h-5 w-5 mr-3" /> NEUTRALIZE & COMMIT
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "PROJECT TOTAL",  value: formatMinutes(stats.total),    icon: Clock,       bg: "bg-[#0f1729] text-white", border: "border-white/10" },
          { label: "INDIVIDUAL FOCUS",   value: formatMinutes(stats.user),     icon: Users,       bg: "bg-violet-500/15 text-violet-400", border: "border-violet-500/20" },
          { label: "BILLABLE OUTPUT",    value: formatMinutes(stats.billable), icon: DollarSign,  bg: "bg-emerald-500/15 text-emerald-400", border: "border-emerald-500/20" },
          { label: "AUDIT ENTRIES",     value: stats.entries,                 icon: Calendar,    bg: "bg-amber-500/15 text-amber-600", border: "border-amber-500/20" },
        ].map((stat) => (
          <div key={stat.label} className="card-base rounded-2xl p-6 flex flex-col items-center text-center group hover:scale-105 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-sm transition-all group-hover:rotate-12", stat.bg, stat.border)}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Entries */}
      <div className="card-base rounded-2xl p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5/5 border border-white/6 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white/50" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Temporal Audit Feed</h2>
              <p className="text-[10px] font-bold text-white/50 uppercase">Verifiable Resource Consumption Logs</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Global Sync Active</span>
          </div>
        </div>

        <div className="space-y-4">
          {projectTimeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5/5 border border-white/6 flex items-center justify-center">
                <Clock className="h-10 w-10 text-white/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white uppercase tracking-widest">No Temporal Records</p>
                <p className="text-[10px] text-white/50 font-bold uppercase">Initialize a session or log time to generate audit entries</p>
              </div>
              <Button variant="glow" onClick={() => setShowLogDialog(true)} className="!rounded-2xl h-12">
                LOG FIRST ENTRY
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {projectTimeEntries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 20)
                .map((entry, i) => {
                  const user = getUserById(entry.userId);
                  const task = entry.taskId && Array.isArray(tasks) ? tasks.find((t) => t.id === entry.taskId) : null;
                  const bug = entry.bugId && Array.isArray(bugs) ? bugs.find((b) => b.id === entry.bugId) : null;
                  const totalMinutes = entry.hours * 60 + entry.minutes;
                  
                  return (
                    <div key={entry.id} className="group py-6 flex items-center gap-6 hover:bg-white/8/5/5/50 transition-all px-4 rounded-[1.5rem]">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                        <AvatarFallback className="text-xs font-black bg-[#0f1729] text-white">
                          {user ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-white uppercase tracking-tight">{user?.name || "System Actor"}</p>
                          {entry.billable && (
                            <span className="text-[8px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-widest">
                              BILLABLE
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-xs font-medium text-white/60">{entry.description || "Routine maintenance and project development operations."}</p>
                          {(task || bug) && (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", task ? "text-violet-400" : "text-rose-400")}>
                                {task ? `TASK: ${task.title}` : `BUG: ${bug?.title}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-2xl font-black font-mono text-white tracking-tight">{formatMinutes(totalMinutes)}</p>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{formatRelativeTime(entry.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Log Time Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[550px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#080b14] p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Clock className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Manual Log</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">Inject temporal data into the system audit feed.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Hours</Label>
                <Input type="number" min="0" value={formHours} onChange={(e) => setFormHours(e.target.value)} 
                  className="h-14 rounded-2xl bg-white/5/5 border-white/10 focus:border-indigo-500/30 font-black text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Minutes</Label>
                <Input type="number" min="0" max="59" value={formMinutes} onChange={(e) => setFormMinutes(e.target.value)} 
                  className="h-14 rounded-2xl bg-white/5/5 border-white/10 focus:border-indigo-500/30 font-black text-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Engagement Details</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe the operational activity..." rows={3}
                className="rounded-2xl bg-white/5/5 border-white/10 focus:border-indigo-500/30 font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Entity Categorization</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as "task" | "bug")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/5/5 border-white/10 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Requirement Fix</SelectItem>
                    <SelectItem value="bug">Defect Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">Target Object</Label>
                <Select value={formEntityId} onValueChange={setFormEntityId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/5/5 border-white/10 font-bold text-xs"><SelectValue placeholder="System Default" /></SelectTrigger>
                  <SelectContent>
                    {formType === "task"
                      ? projectTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                        ))
                      : projectBugs.map((bug) => (
                          <SelectItem key={bug.id} value={bug.id}>{bug.title}</SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-center gap-4 p-4 rounded-2xl bg-white/5/5 border border-white/10 cursor-pointer hover:bg-white/8/5 hover:border-violet-500/30 transition-all group">
              <input type="checkbox" checked={formBillable} onChange={(e) => setFormBillable(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-violet-400 focus:ring-indigo-500/20" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-white">Billable Output</p>
                <p className="text-[10px] font-bold text-white/50 uppercase">Associate this temporal session with project budget cycles.</p>
              </div>
            </label>
          </div>

          <div className="p-10 bg-white/5/5 flex items-center justify-between border-t border-white/10">
            <button onClick={() => setShowLogDialog(false)} className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors">Discard</button>
            <Button variant="glow" onClick={handleLogTime} disabled={parseInt(formHours) === 0 && parseInt(formMinutes) === 0} className="!h-14 !px-10 shadow-indigo-500/20">
              <Plus className="h-5 w-5 mr-2" /> INJECT RECORD
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

