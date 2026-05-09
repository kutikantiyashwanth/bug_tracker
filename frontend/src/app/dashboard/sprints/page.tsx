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
    <div className="space-y-10 animate-slide-up max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-violet-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">Velocity Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Sprint <span className="text-violet-600 underline decoration-violet-200 underline-offset-8">Orchestration</span>
          </h1>
          <p className="text-white/60 mt-2 font-medium max-w-xl">
            Coordinate high-velocity development cycles. Define goals, allocate resources, and monitor operational throughput.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} variant="glow" className="shadow-violet-500/20">
          <Plus className="h-5 w-5 mr-2" /> NEW CYCLE
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "TOTAL CYCLES",     value: stats.total,     icon: Zap,    bg: "bg-[#0f1729] text-white", border: "border-white/10" },
          { label: "ACTIVE RUNS",    value: stats.active,    icon: Play,    bg: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { label: "PLANNING PHASE",   value: stats.planned,   icon: Clock,    bg: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "ARCHIVED", value: stats.completed, icon: CheckCircle2, bg: "bg-indigo-50 text-violet-400", border: "border-indigo-100" },
        ].map((s) => (
          <div key={s.label} className="card-base rounded-2xl p-6">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110", s.bg)}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/65">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sprint List */}
      {sprints.length === 0 ? (
        <div className="card-base rounded-2xl p-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/6 flex items-center justify-center mx-auto mb-6">
            <Zap className="h-10 w-10 text-white/30" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Static Pipeline</h3>
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-widest mt-2 max-w-xs mx-auto">
            No development cycles detected. Initialize a new sprint to begin velocity tracking.
          </p>
          <Button onClick={() => setShowCreate(true)} variant="glow" className="mt-8 !rounded-2xl">
            INITIALIZE SPRINT
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint, i) => {
            const cfg = statusConfig[sprint.status];
            const StatusIcon = cfg.icon;
            const sprintTasks = projectTasks.filter((t) => sprint.taskIds.includes(t.id));
            const doneTasks = sprintTasks.filter((t) => t.status === "done");
            const progress = sprintTasks.length > 0 ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0;
            const isExpanded = expandedId === sprint.id;

            return (
              <div key={sprint.id} className="card-base rounded-2xl p-6">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black text-white tracking-tight group-hover:text-violet-600 transition-colors">{sprint.name}</h3>
                        <span className={cn("text-[9px] font-black px-3 py-1 rounded-lg flex items-center gap-2 uppercase tracking-widest border", 
                          sprint.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          sprint.status === 'completed' ? 'bg-indigo-50 text-violet-400 border-indigo-100' : 'bg-white/5 text-white/65 border-white/6')}>
                          <StatusIcon className="h-3 w-3" />
                          {sprint.status}
                        </span>
                      </div>
                      
                      {sprint.goal && (
                        <div className="flex items-center gap-3">
                          <Target className="h-4 w-4 text-violet-500" />
                          <p className="text-sm font-medium text-white/70">{sprint.goal}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/65" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/65">
                            {sprint.startDate ? formatDate(sprint.startDate) : 'TBD'} — {sprint.endDate ? formatDate(sprint.endDate) : 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-white/65" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/65">{sprintTasks.length} OBJECTS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {sprint.status === "planned" && (
                        <Button onClick={() => handleStatusChange(sprint.id, "active")} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white !rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6">
                          START CYCLE
                        </Button>
                      )}
                      {sprint.status === "active" && (
                        <Button onClick={() => handleStatusChange(sprint.id, "completed")} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white !rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6">
                          CLOSE CYCLE
                        </Button>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : sprint.id)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/6 flex items-center justify-center text-white/65 hover:text-white transition-all">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                      <button onClick={() => handleDelete(sprint.id)}
                        className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {sprintTasks.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">Throughput Velocity</span>
                        <span className="text-sm font-black text-white">{progress}%</span>
                      </div>
                      <div className="h-3 bg-white/8 rounded-full overflow-hidden p-0.5">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${progress}%`, background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-50 p-8 bg-white/5/50 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/65 mb-6">Assigned work items</h4>
                    {sprintTasks.length === 0 ? (
                      <p className="text-xs font-bold text-white/65 uppercase tracking-widest text-center py-4">Backlog empty</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sprintTasks.map((task) => (
                          <div key={task.id} className="bg-white/5 p-4 rounded-2xl border border-white/6 flex items-center gap-4 shadow-sm">
                            <div className={cn("w-2 h-2 rounded-full shrink-0",
                              task.status === "done" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                              task.status === "in-progress" ? "bg-violet-500" :
                              task.status === "testing" ? "bg-amber-500" : "bg-white/10"
                            )} />
                            <span className={cn("text-xs font-bold flex-1 truncate",
                              task.status === "done" ? "text-white/65 line-through" : "text-white"
                            )}>{task.title}</span>
                            <span className="text-[9px] font-black text-white/65 uppercase tracking-widest">{task.status}</span>
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
        <DialogContent className="sm:max-w-[550px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#080b14] p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Zap className="h-8 w-8 text-violet-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Cycle Setup</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">Define parameters for the next development iteration.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Cycle Designation *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Iteration 04 — Core Infrastructure" className="h-14 !rounded-2xl bg-white/5 border-white/10 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Strategic Goal</Label>
              <Textarea value={formGoal} onChange={(e) => setFormGoal(e.target.value)}
                placeholder="What is the primary objective of this cycle?" rows={3} className="!rounded-2xl bg-white/5 border-white/10 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Commencement</Label>
                <Input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="h-12 !rounded-xl bg-white/5 border-white/10 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Termination</Label>
                <Input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="h-12 !rounded-xl bg-white/5 border-white/10 font-bold" />
              </div>
            </div>
            
            {projectTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Object Allocation</Label>
                  <span className="text-[10px] font-black text-violet-600 uppercase bg-violet-50 px-2 py-1 rounded-lg">{formTaskIds.length} SELECTED</span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                  {projectTasks.map((task) => (
                    <label key={task.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/6 hover:bg-white/5 hover:border-violet-200 hover:shadow-sm cursor-pointer transition-all group">
                      <input type="checkbox"
                        checked={formTaskIds.includes(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="w-5 h-5 rounded-lg border-slate-300 text-violet-600 focus:ring-violet-500/20" />
                      <span className="text-xs font-bold text-white flex-1 truncate">{task.title}</span>
                      <span className="text-[9px] font-black text-white/65 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{task.priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-white/5 flex items-center justify-between border-t border-white/10">
            <button onClick={() => setShowCreate(false)} className="text-xs font-black uppercase tracking-widest text-white/65 hover:text-white/70 transition-colors">Discard</button>
            <Button onClick={handleCreate} disabled={!formName.trim()} variant="glow" className="!h-14 !px-10 shadow-indigo-500/20">
              <Plus className="h-5 w-5 mr-2" /> INITIALIZE CYCLE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
