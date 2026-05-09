"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Clock, Play, Square, Plus, Timer, Users, Calendar,
  Bug, CheckCircle2, Zap, BarChart3,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────
function fmtClock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function fmtDuration(totalSeconds: number) {
  if (totalSeconds === 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TimeTrackingPage() {
  const {
    timeEntries, activeTimer, startTimer, stopTimer, logTime,
    tasks, bugs, activeProjectId, currentUser,
    getUserById, getUserTime, getProjectTime, projects,
  } = useStore();

  // ── dialog state ──
  const [showLog, setShowLog]           = useState(false);
  const [formHours, setFormHours]       = useState("0");
  const [formMins, setFormMins]         = useState("0");
  const [formSecs, setFormSecs]         = useState("0");
  const [formDesc, setFormDesc]         = useState("");
  const [formType, setFormType]         = useState<"task" | "bug" | "general">("general");
  const [formEntityId, setFormEntityId] = useState("");

  // ── live timer tick ──
  const [timerSecs, setTimerSecs] = useState(0);
  useEffect(() => {
    if (!activeTimer) { setTimerSecs(0); return; }
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000);
      setTimerSecs(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  // ── derived data ──
  const activeProject   = Array.isArray(projects)     ? projects.find((p) => p.id === activeProjectId)                    : undefined;
  const projectTasks    = Array.isArray(tasks)         ? tasks.filter((t) => t.projectId === activeProjectId)              : [];
  const projectBugs     = Array.isArray(bugs)          ? bugs.filter((b)  => b.projectId === activeProjectId)              : [];
  const projectEntries  = Array.isArray(timeEntries)   ? timeEntries.filter((e) => e.projectId === activeProjectId)        : [];

  const totalProjectSecs = getProjectTime();
  const totalUserSecs    = currentUser ? getUserTime(currentUser.id) : 0;

  // ── per-task / per-bug breakdown ──
  const taskBreakdown = useMemo(() =>
    projectTasks.map((t) => {
      const secs = projectEntries
        .filter((e) => e.taskId === t.id)
        .reduce((sum, e) => sum + e.hours * 3600 + e.minutes * 60 + (e.seconds || 0), 0);
      return { ...t, secs };
    }).filter((t) => t.secs > 0).sort((a, b) => b.secs - a.secs),
    [projectTasks, projectEntries]
  );

  const bugBreakdown = useMemo(() =>
    projectBugs.map((b) => {
      const secs = projectEntries
        .filter((e) => e.bugId === b.id)
        .reduce((sum, e) => sum + e.hours * 3600 + e.minutes * 60 + (e.seconds || 0), 0);
      return { ...b, secs };
    }).filter((b) => b.secs > 0).sort((a, b) => b.secs - a.secs),
    [projectBugs, projectEntries]
  );

  // ── handlers ──
  const handleToggleTimer = () => {
    if (activeTimer) stopTimer();
    else startTimer(undefined, undefined, `Working on ${activeProject?.name || "project"}`);
  };

  const handleLogTime = () => {
    if (!currentUser || !activeProjectId) return;
    const h = Math.max(0, parseInt(formHours) || 0);
    const m = Math.max(0, parseInt(formMins)  || 0);
    const s = Math.max(0, parseInt(formSecs)  || 0);
    if (h === 0 && m === 0 && s === 0) return;

    logTime({
      projectId:   activeProjectId,
      taskId:      formType === "task" && formEntityId ? formEntityId : undefined,
      bugId:       formType === "bug"  && formEntityId ? formEntityId : undefined,
      userId:      currentUser.id,
      hours: h, minutes: m, seconds: s,
      description: formDesc || (formType === "general" ? "General project work" : ""),
      billable:    false,
      date:        new Date().toISOString().split("T")[0],
    });

    setShowLog(false);
    setFormHours("0"); setFormMins("0"); setFormSecs("0");
    setFormDesc(""); setFormEntityId(""); setFormType("general");
  };

  const logValid = (parseInt(formHours) || 0) + (parseInt(formMins) || 0) + (parseInt(formSecs) || 0) > 0;

  return (
    <div className="space-y-8 animate-slide-up max-w-5xl">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {activeProject?.name || "All Projects"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Time <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-8">Tracking</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm">
            Track time spent on tasks and bugs in <span className="font-bold text-slate-900">{activeProject?.name || "your project"}</span>.
            Start the timer or log time manually.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggleTimer}
            size="lg"
            className={cn(
              "!rounded-2xl shadow-lg font-bold",
              activeTimer
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
            )}
          >
            {activeTimer
              ? <><Square className="h-4 w-4 mr-2" /> Stop Timer</>
              : <><Play  className="h-4 w-4 mr-2" /> Start Timer</>
            }
          </Button>
          <Button variant="outline" size="lg" onClick={() => setShowLog(true)} className="!rounded-2xl border-slate-200 font-bold">
            <Plus className="h-4 w-4 mr-2" /> Log Session
          </Button>
        </div>
      </div>

      {/* ── Live Timer ── */}
      {activeTimer && (
        <div className="rounded-3xl bg-slate-900 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <Clock className="absolute right-8 top-4 h-40 w-40 text-white" />
          </div>
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Timer className="h-8 w-8 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Timer Running</p>
              {/* HH:MM:SS — all three segments always visible */}
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <span className="text-5xl font-black text-white">{String(Math.floor(timerSecs / 3600)).padStart(2, "0")}</span>
                <span className="text-3xl font-black text-white/40 mb-1">:</span>
                <span className="text-5xl font-black text-white">{String(Math.floor((timerSecs % 3600) / 60)).padStart(2, "0")}</span>
                <span className="text-3xl font-black text-white/40 mb-1">:</span>
                <span className="text-5xl font-black text-indigo-300">{String(timerSecs % 60).padStart(2, "0")}</span>
              </div>
              <p className="text-xs text-white/30 mt-1">
                Started {new Date(activeTimer.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {activeTimer.description ? ` · ${activeTimer.description}` : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={stopTimer}
            className="z-10 h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-xl shadow-rose-900/40"
          >
            <Square className="h-4 w-4 mr-2" /> Stop & Save
          </Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Project Total",  value: fmtDuration(totalProjectSecs), icon: BarChart3, color: "bg-slate-900 text-white border-slate-800" },
          { label: "Your Time",      value: fmtDuration(totalUserSecs),    icon: Users,     color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
          { label: "Log Entries",    value: projectEntries.length,         icon: Calendar,  color: "bg-amber-50 text-amber-600 border-amber-100" },
        ].map((s) => (
          <div key={s.label} className="premium-card p-6 flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0", s.color)}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Breakdown: Tasks & Bugs ── */}
      {(taskBreakdown.length > 0 || bugBreakdown.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tasks */}
          {taskBreakdown.length > 0 && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Time by Task</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Kanban tasks in {activeProject?.name}</p>
                </div>
              </div>
              <div className="space-y-3">
                {taskBreakdown.slice(0, 6).map((t) => {
                  const pct = totalProjectSecs > 0 ? Math.round((t.secs / totalProjectSecs) * 100) : 0;
                  return (
                    <div key={t.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[65%]">{t.title}</span>
                        <span className="text-xs font-black text-indigo-600 shrink-0">{fmtDuration(t.secs)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bugs */}
          {bugBreakdown.length > 0 && (
            <div className="premium-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Bug className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Time by Bug</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bug fixes in {activeProject?.name}</p>
                </div>
              </div>
              <div className="space-y-3">
                {bugBreakdown.slice(0, 6).map((b) => {
                  const pct = totalProjectSecs > 0 ? Math.round((b.secs / totalProjectSecs) * 100) : 0;
                  return (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[65%]">{b.title}</span>
                        <span className="text-xs font-black text-rose-600 shrink-0">{fmtDuration(b.secs)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Session Log ── */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Session Log</h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                All time entries for {activeProject?.name || "this project"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowLog(true)} className="rounded-xl border-slate-200 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Log Time
          </Button>
        </div>

        {projectEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Clock className="h-8 w-8 text-slate-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No sessions logged yet</p>
              <p className="text-xs text-slate-400 mt-1">Start the timer or log time manually to track your work</p>
            </div>
            <Button onClick={() => setShowLog(true)} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-2">
              <Plus className="h-4 w-4 mr-2" /> Log First Session
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {[...projectEntries]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 25)
              .map((entry) => {
                const user  = getUserById(entry.userId);
                const task  = entry.taskId ? projectTasks.find((t) => t.id === entry.taskId) : null;
                const bug   = entry.bugId  ? projectBugs.find((b)  => b.id === entry.bugId)  : null;
                const secs  = entry.hours * 3600 + entry.minutes * 60 + (entry.seconds || 0);

                return (
                  <div key={entry.id} className="flex items-center gap-5 px-8 py-5 hover:bg-slate-50/60 transition-colors group">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                      <AvatarFallback className="text-xs font-black bg-slate-800 text-white">
                        {user ? getInitials(user.name) : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{user?.name || "Unknown"}</span>
                        {task && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <CheckCircle2 className="h-3 w-3" /> {task.title}
                          </span>
                        )}
                        {bug && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            <Bug className="h-3 w-3" /> {bug.title}
                          </span>
                        )}
                        {!task && !bug && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            <Zap className="h-3 w-3" /> General
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {entry.description || "No description"}
                        <span className="text-slate-300 mx-2">·</span>
                        {fmtDate(entry.date || entry.createdAt)}
                      </p>
                    </div>

                    {/* Duration — HH:MM:SS always shown */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-0.5 font-mono tabular-nums justify-end">
                        <span className="text-lg font-black text-slate-900">{String(entry.hours).padStart(2, "0")}</span>
                        <span className="text-slate-300 font-bold">:</span>
                        <span className="text-lg font-black text-slate-900">{String(entry.minutes).padStart(2, "0")}</span>
                        <span className="text-slate-300 font-bold">:</span>
                        <span className="text-lg font-black text-indigo-500">{String(entry.seconds || 0).padStart(2, "0")}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatRelativeTime(entry.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Log Session Dialog ── */}
      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent className="sm:max-w-[520px] !rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">

          {/* Header */}
          <div className="bg-slate-950 px-8 py-7 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Clock className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">Log Session</DialogTitle>
              <DialogDescription className="text-white/40 text-sm font-medium mt-0.5">
                Add time to <span className="text-white font-bold">{activeProject?.name || "your project"}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="px-8 py-7 space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar">

            {/* Duration — HH MM SS */}
            <div>
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                Duration
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hours",   val: formHours, set: setFormHours, max: undefined },
                  { label: "Minutes", val: formMins,  set: setFormMins,  max: 59 },
                  { label: "Seconds", val: formSecs,  set: setFormSecs,  max: 59 },
                ].map(({ label, val, set, max }) => (
                  <div key={label} className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</Label>
                    <Input
                      type="number" min="0" max={max}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-xl text-center"
                    />
                  </div>
                ))}
              </div>
              {/* Preview */}
              {logValid && (
                <p className="text-xs text-indigo-600 font-bold mt-2 text-center">
                  = {fmtDuration(
                    (parseInt(formHours) || 0) * 3600 +
                    (parseInt(formMins)  || 0) * 60   +
                    (parseInt(formSecs)  || 0)
                  )}
                </p>
              )}
            </div>

            {/* What were you working on */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                What were you working on?
              </Label>
              <Select value={formType} onValueChange={(v) => { setFormType(v as any); setFormEntityId(""); }}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-semibold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-slate-400" />
                      <span>General project work</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="task">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      <span>A specific task</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-rose-500" />
                      <span>A bug fix</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task / Bug picker */}
            {formType === "task" && projectTasks.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Select Task
                </Label>
                <Select value={formEntityId} onValueChange={setFormEntityId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-semibold text-sm">
                    <SelectValue placeholder="Choose a task from the Kanban board…" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            t.status === "done"        ? "bg-emerald-500" :
                            t.status === "in-progress" ? "bg-violet-500"  :
                            t.status === "testing"     ? "bg-amber-500"   :
                            t.status === "todo"        ? "bg-blue-500"    : "bg-slate-400"
                          )} />
                          <span className="truncate">{t.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 capitalize">{t.status}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formType === "bug" && projectBugs.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Select Bug
                </Label>
                <Select value={formEntityId} onValueChange={setFormEntityId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-semibold text-sm">
                    <SelectValue placeholder="Choose a bug from the bug tracker…" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectBugs.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            b.severity === "critical" ? "bg-rose-500"   :
                            b.severity === "major"    ? "bg-orange-500" : "bg-blue-400"
                          )} />
                          <span className="truncate">{b.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 capitalize">{b.severity}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Notes <span className="text-slate-300 normal-case font-medium">(optional)</span>
              </Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder={
                  formType === "task"    ? "e.g. Implemented the login form validation…" :
                  formType === "bug"     ? "e.g. Debugged the null pointer in auth middleware…" :
                  "e.g. Code review, team meeting, documentation…"
                }
                rows={3}
                className="rounded-2xl bg-slate-50 border-slate-200 font-medium text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setShowLog(false)}
              className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleLogTime}
              disabled={!logValid}
              className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-40"
            >
              <Plus className="h-4 w-4 mr-2" /> Save Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
