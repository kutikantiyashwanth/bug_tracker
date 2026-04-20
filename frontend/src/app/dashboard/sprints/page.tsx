"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap, Plus, Calendar, Target, CheckCircle2, Clock,
  Play, Square, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed";
  taskIds: string[];
  velocity: number;
  createdAt: string;
}

function loadSprints(projectId: string): Sprint[] {
  try { return JSON.parse(localStorage.getItem(`sprints_${projectId}`) || "[]"); } catch { return []; }
}
function saveSprints(projectId: string, sprints: Sprint[]) {
  localStorage.setItem(`sprints_${projectId}`, JSON.stringify(sprints));
}

export default function SprintsPage() {
  const { activeProjectId, projects, tasks } = useStore();

  const activeProject = useMemo(
    () => (Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined),
    [projects, activeProjectId]
  );
  const projectTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks.filter((t) => t.projectId === activeProjectId) : []),
    [tasks, activeProjectId]
  );

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formTaskIds, setFormTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (activeProjectId) setSprints(loadSprints(activeProjectId));
  }, [activeProjectId]);

  const handleCreate = () => {
    if (!formName.trim() || !activeProjectId) return;
    const newSprint: Sprint = {
      id: crypto.randomUUID(),
      name: formName.trim(),
      goal: formGoal.trim(),
      startDate: formStart,
      endDate: formEnd,
      status: "planned",
      taskIds: formTaskIds,
      velocity: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...sprints, newSprint];
    setSprints(updated);
    saveSprints(activeProjectId, updated);
    setShowCreate(false);
    setFormName(""); setFormGoal(""); setFormStart(""); setFormEnd(""); setFormTaskIds([]);
  };

  const handleStatusChange = (id: string, status: Sprint["status"]) => {
    if (!activeProjectId) return;
    const updated = sprints.map((s) => s.id === id ? { ...s, status } : s);
    setSprints(updated);
    saveSprints(activeProjectId, updated);
  };

  const handleDelete = (id: string) => {
    if (!activeProjectId) return;
    const updated = sprints.filter((s) => s.id !== id);
    setSprints(updated);
    saveSprints(activeProjectId, updated);
  };

  const toggleTask = (taskId: string) => {
    setFormTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const statusConfig = {
    planned:   { label: "Planned",   cls: "pill-gray",    icon: Clock },
    active:    { label: "Active",    cls: "pill-emerald", icon: Play },
    completed: { label: "Completed", cls: "pill-blue",    icon: CheckCircle2 },
  };

  const stats = {
    total:     sprints.length,
    active:    sprints.filter((s) => s.status === "active").length,
    completed: sprints.filter((s) => s.status === "completed").length,
    planned:   sprints.filter((s) => s.status === "planned").length,
  };

  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl icon-violet flex items-center justify-center">
          <Zap className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Project Selected</h2>
        <p className="text-sm text-gray-500">Select a project from the sidebar to manage sprints.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sprint-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight page-title flex items-center gap-2">
            <Zap className="h-6 w-6 text-violet-600" />
            Sprint Planning
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeProject?.name} · {sprints.length} sprint{sprints.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto"
          style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)", color: "white" }}>
          <Plus className="h-4 w-4 mr-1.5" /> New Sprint
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,     color: "text-gray-700",   bg: "bg-gray-100" },
          { label: "Active",    value: stats.active,    color: "text-emerald-700", bg: "bg-emerald-100" },
          { label: "Planned",   value: stats.planned,   color: "text-amber-700",  bg: "bg-amber-100" },
          { label: "Completed", value: stats.completed, color: "text-blue-700",   bg: "bg-blue-100" },
        ].map((s) => (
          <div key={s.label} className="card-base rounded-2xl p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg font-black", s.bg, s.color)}>
              {s.value}
            </div>
            <span className="text-sm text-gray-500 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Sprint List */}
      {sprints.length === 0 ? (
        <div className="card-base rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl icon-violet flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">No sprints yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Create your first sprint to start planning</p>
          <Button onClick={() => setShowCreate(true)}
            style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)", color: "white" }}>
            <Plus className="h-4 w-4 mr-1.5" /> Create Sprint
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sprints.map((sprint, i) => {
            const cfg = statusConfig[sprint.status];
            const StatusIcon = cfg.icon;
            const sprintTasks = projectTasks.filter((t) => sprint.taskIds.includes(t.id));
            const doneTasks = sprintTasks.filter((t) => t.status === "done");
            const progress = sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0;
            const isExpanded = expandedId === sprint.id;

            return (
              <div key={sprint.id} className="card-base rounded-2xl overflow-hidden stagger-item"
                style={{ animationDelay: `${i * 60}ms` }}>
                {/* Sprint header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{sprint.name}</h3>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", cfg.cls)}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      {sprint.goal && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                          {sprint.goal}
                        </p>
                      )}
                      {(sprint.startDate || sprint.endDate) && (
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {sprint.startDate && formatDate(sprint.startDate)}
                          {sprint.startDate && sprint.endDate && " → "}
                          {sprint.endDate && formatDate(sprint.endDate)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {sprint.status === "planned" && (
                        <button onClick={() => handleStatusChange(sprint.id, "active")}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                          <Play className="h-3 w-3" /> Start
                        </button>
                      )}
                      {sprint.status === "active" && (
                        <button onClick={() => handleStatusChange(sprint.id, "completed")}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                          <Square className="h-3 w-3" /> Complete
                        </button>
                      )}
                      <button onClick={() => handleDelete(sprint.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : sprint.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {sprintTasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{doneTasks.length}/{sprintTasks.length} tasks done</span>
                        <span className="font-bold text-gray-700">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: "linear-gradient(135deg, #6d28d9, #2563eb)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded tasks */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 sm:px-5 py-3 bg-gray-50">
                    {sprintTasks.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2 text-center">No tasks in this sprint</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sprintTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2.5 py-1">
                            <div className={cn("w-2 h-2 rounded-full shrink-0",
                              task.status === "done" ? "bg-emerald-500" :
                              task.status === "in-progress" ? "bg-violet-500" :
                              task.status === "testing" ? "bg-amber-500" : "bg-gray-300"
                            )} />
                            <span className={cn("text-sm flex-1 truncate",
                              task.status === "done" ? "line-through text-gray-400" : "text-gray-700"
                            )}>{task.title}</span>
                            <span className="text-[10px] text-gray-400 capitalize shrink-0">{task.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Sprint Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-600" /> Create Sprint
            </DialogTitle>
            <DialogDescription>Plan a new sprint for your project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Sprint Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Sprint 1 — Auth & Dashboard" />
            </div>
            <div className="space-y-2">
              <Label>Sprint Goal</Label>
              <Textarea value={formGoal} onChange={(e) => setFormGoal(e.target.value)}
                placeholder="What do you want to achieve in this sprint?" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
              </div>
            </div>
            {projectTasks.length > 0 && (
              <div className="space-y-2">
                <Label>Add Tasks ({formTaskIds.length} selected)</Label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2">
                  {projectTasks.map((task) => (
                    <label key={task.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox"
                        checked={formTaskIds.includes(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300 accent-violet-600" />
                      <span className="text-sm text-gray-700 truncate">{task.title}</span>
                      <span className="text-[10px] text-gray-400 capitalize ml-auto shrink-0">{task.priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formName.trim()}
              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)", color: "white" }}>
              <Plus className="h-4 w-4 mr-1" /> Create Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
