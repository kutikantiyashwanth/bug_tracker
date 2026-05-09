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
  const [formSeconds, setFormSeconds] = useState("0");
  const [formDescription, setFormDescription] = useState("");
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

  const formatPreciseTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const totalProjectSeconds = getProjectTime();
  const totalUserSeconds = currentUser ? getUserTime(currentUser.id) : 0;

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
    const seconds = parseInt(formSeconds) || 0;
    if (hours === 0 && minutes === 0 && seconds === 0) return;

    logTime({
      projectId: activeProjectId,
      taskId: formType === "task" && formEntityId ? formEntityId : undefined,
      bugId: formType === "bug" && formEntityId ? formEntityId : undefined,
      userId: currentUser.id,
      hours,
      minutes,
      seconds,
      description: formDescription,
      billable: false,
      date: new Date().toISOString().split("T")[0],
    });

    setShowLogDialog(false);
    setFormHours("0");
    setFormMinutes("0");
    setFormSeconds("0");
    setFormDescription("");
    setFormEntityId("");
  };

  const stats = useMemo(() => ({
    total: totalProjectSeconds,
    user: totalUserSeconds,
    entries: projectTimeEntries.length,
  }), [totalProjectSeconds, totalUserSeconds, projectTimeEntries.length]);

  return (
    <div className="space-y-10 animate-slide-up max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Current Project</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {activeProject?.name || "Global"} <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-8">Tracker</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            Monitoring temporal execution for <span className="font-bold text-slate-900">{activeProject?.name}</span>. Precise chronometry for resource auditing.
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
          <Button variant="outline" size="lg" onClick={() => setShowLogDialog(true)} className="!rounded-2xl border-slate-200">
            <Plus className="h-5 w-5 mr-2" /> LOG SESSION
          </Button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="premium-card p-10 bg-slate-900 border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
            <Clock className="h-32 w-32 text-white" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                <Timer className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Operational Cycle Active</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "PROJECT TOTAL",  value: formatPreciseTime(stats.total),    icon: Clock,       bg: "bg-slate-900 text-white", border: "border-slate-800" },
          { label: "YOUR FOCUS",     value: formatPreciseTime(stats.user),     icon: Users,       bg: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" },
          { label: "AUDIT ENTRIES",  value: stats.entries,                    icon: Calendar,    bg: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        ].map((stat) => (
          <div key={stat.label} className="premium-card p-8 flex flex-col items-center text-center group hover:scale-105 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-sm transition-all group-hover:rotate-12", stat.bg, stat.border)}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Entries */}
      <div className="premium-card p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Temporal Audit Feed</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Resource Consumption Logs</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Project: {activeProject?.name}</span>
          </div>
        </div>

        <div className="space-y-4">
          {projectTimeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Clock className="h-10 w-10 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">No Temporal Records</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Initialize a session or log time to generate audit entries</p>
              </div>
              <Button variant="premium" onClick={() => setShowLogDialog(true)} className="!rounded-2xl h-12">
                LOG FIRST ENTRY
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {projectTimeEntries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 20)
                .map((entry, i) => {
                  const user = getUserById(entry.userId);
                  const task = entry.taskId && Array.isArray(tasks) ? tasks.find((t) => t.id === entry.taskId) : null;
                  const bug = entry.bugId && Array.isArray(bugs) ? bugs.find((b) => b.id === entry.bugId) : null;
                  const totalSeconds = (entry.hours * 3600) + (entry.minutes * 60) + (entry.seconds || 0);
                  
                  return (
                    <div key={entry.id} className="group py-6 flex items-center gap-6 hover:bg-slate-50/50 transition-all px-4 rounded-[1.5rem]">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0">
                        <AvatarFallback className="text-xs font-black bg-slate-900 text-white">
                          {user ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user?.name || "System Actor"}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-xs font-medium text-slate-500">{entry.description || "Routine maintenance and project development operations."}</p>
                          {(task || bug) && (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", task ? "text-indigo-500" : "text-rose-500")}>
                                {task ? `TASK: ${task.title}` : `BUG: ${bug?.title}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-2xl font-black font-mono text-slate-900 tracking-tight">{formatPreciseTime(totalSeconds)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatRelativeTime(entry.createdAt)}</p>
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
          <div className="bg-slate-950 p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Log Time Session</DialogTitle>
              <DialogDescription className="text-white/40 font-medium">Inject temporal data into the <span className="text-white font-bold">{activeProject?.name}</span> audit feed.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hours</Label>
                <Input type="number" min="0" value={formHours} onChange={(e) => setFormHours(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 font-black text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Minutes</Label>
                <Input type="number" min="0" max="59" value={formMinutes} onChange={(e) => setFormMinutes(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 font-black text-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Seconds</Label>
                <Input type="number" min="0" max="59" value={formSeconds} onChange={(e) => setFormSeconds(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 font-black text-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Engagement Details</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe the operational activity..." rows={3}
                className="rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Entity Categorization</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as "task" | "bug")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Requirement Fix</SelectItem>
                    <SelectItem value="bug">Defect Resolution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Object</Label>
                <Select value={formEntityId} onValueChange={setFormEntityId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue placeholder="System Default" /></SelectTrigger>
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
          </div>

          <div className="p-10 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button onClick={() => setShowLogDialog(false)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
            <Button variant="premium" onClick={handleLogTime} disabled={parseInt(formHours) === 0 && parseInt(formMinutes) === 0 && parseInt(formSeconds) === 0} className="!h-14 !px-10 shadow-indigo-500/20">
              <Plus className="h-5 w-5 mr-2" /> INJECT RECORD
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

