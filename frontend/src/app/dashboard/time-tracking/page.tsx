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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Track time spent on tasks and bugs</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTimer ? "destructive" : "default"}
            size="sm"
            onClick={handleStartTimer}
          >
            {activeTimer ? (
              <>
                <Square className="h-4 w-4 mr-1" /> Stop Timer
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" /> Start Timer
              </>
            )}
          </Button>
          <Button variant="glow" size="sm" onClick={() => setShowLogDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Log Time
          </Button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="bg-violet-50 rounded-2xl border border-violet-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Timer className="h-6 w-6 text-violet-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-600">Timer Running</p>
                <p className="text-2xl font-black font-mono text-violet-900">{formatTime(timerSeconds)}</p>
              </div>
            </div>
            <Button variant="destructive" onClick={stopTimer}>
              <Square className="h-4 w-4 mr-1" /> Stop & Save
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Time",  value: formatMinutes(stats.total),    icon: Clock,       bg: "bg-cyan-100",    text: "text-cyan-700" },
          { label: "Your Time",   value: formatMinutes(stats.user),     icon: Users,       bg: "bg-violet-100",  text: "text-violet-700" },
          { label: "Billable",    value: formatMinutes(stats.billable), icon: DollarSign,  bg: "bg-emerald-100", text: "text-emerald-700" },
          { label: "Entries",     value: stats.entries,                 icon: Calendar,    bg: "bg-amber-100",   text: "text-amber-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.text)} />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-violet-700" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Recent Time Entries</h2>
        </div>
          {projectTimeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No time entries yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowLogDialog(true)}>
                Log your first entry
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projectTimeEntries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 20)
                .map((entry, i) => {
                  const user = getUserById(entry.userId);
                  const task = entry.taskId && Array.isArray(tasks) ? tasks.find((t) => t.id === entry.taskId) : null;
                  const bug = entry.bugId && Array.isArray(bugs) ? bugs.find((b) => b.id === entry.bugId) : null;
                  const totalMinutes = entry.hours * 60 + entry.minutes;
                  return (
                    <div key={entry.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors stagger-item"
                      style={{ animationDelay: `${i * 30}ms` }}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-[10px] font-bold"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", color: "white" }}>
                          {user ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{user?.name || "Unknown"}</p>
                          {entry.billable && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                              Billable
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {entry.description || "No description"}
                          {task && <span className="text-violet-600"> · {task.title}</span>}
                          {bug && <span className="text-red-600"> · {bug.title}</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black font-mono text-gray-900">{formatMinutes(totalMinutes)}</p>
                        <p className="text-[10px] text-gray-400">{formatRelativeTime(entry.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

      {/* Log Time Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-600" />
              Log Time
            </DialogTitle>
            <DialogDescription>Record time spent on a task or bug</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as "task" | "bug")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{formType === "task" ? "Task" : "Bug"} (Optional)</Label>
                <Select value={formEntityId} onValueChange={setFormEntityId}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {formType === "task"
                      ? projectTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))
                      : projectBugs.map((bug) => (
                          <SelectItem key={bug.id} value={bug.id}>
                            {bug.title}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                checked={formBillable}
                onChange={(e) => setFormBillable(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="billable" className="cursor-pointer">
                Mark as billable
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={handleLogTime}
              disabled={parseInt(formHours) === 0 && parseInt(formMinutes) === 0}
            >
              <Plus className="h-4 w-4 mr-1" /> Log Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

