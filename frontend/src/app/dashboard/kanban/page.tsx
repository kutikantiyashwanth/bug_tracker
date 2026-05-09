"use client";

import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/lib/store-api";
import { RoleGuard } from "@/components/RoleGuard";
import { can, normalizeRole } from "@/lib/rbac";
import { cn, getInitials, priorityColors, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus, GripVertical, Calendar, User, Tag, MoreHorizontal,
  Trash2, Edit3, Clock, AlertCircle, CheckCircle2, X,
} from "lucide-react";
import type { Task, TaskStatus, Priority } from "@/lib/types";

const columns: { id: TaskStatus; label: string; topColor: string; dotColor: string; bg: string; textColor: string }[] = [
  { id: "backlog",     label: "Backlog",     topColor: "border-t-slate-400",   dotColor: "bg-slate-400",   bg: "bg-slate-50",   textColor: "text-slate-600" },
  { id: "todo",        label: "To Do",       topColor: "border-t-blue-500",    dotColor: "bg-blue-500",    bg: "bg-blue-50",    textColor: "text-blue-700" },
  { id: "in-progress", label: "In Progress", topColor: "border-t-violet-500",  dotColor: "bg-violet-500",  bg: "bg-violet-50",  textColor: "text-violet-700" },
  { id: "testing",     label: "Testing",     topColor: "border-t-amber-500",   dotColor: "bg-amber-500",   bg: "bg-amber-50",   textColor: "text-amber-700" },
  { id: "done",        label: "Done",        topColor: "border-t-emerald-500", dotColor: "bg-emerald-500", bg: "bg-emerald-50", textColor: "text-emerald-700" },
];

export default function KanbanPage() {
  const { tasks, activeProjectId, createTask, moveTask, updateTask, deleteTask, getUserById, users, currentUser, projects } = useStore();
  const userRole = normalizeRole(currentUser?.role || "developer");
  const permissions = can(userRole);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createInColumn, setCreateInColumn] = useState<TaskStatus>("todo");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showEditMenu, setShowEditMenu] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formAssignee, setFormAssignee] = useState<string>("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formTags, setFormTags] = useState("");

  const projectTasks = useMemo(
    () => Array.isArray(tasks) ? tasks.filter((t) => t.projectId === activeProjectId) : [],
    [tasks, activeProjectId]
  );

  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;
  const projectMembers = useMemo(
    () => activeProject?.members.map((m) => getUserById(m.userId)).filter(Boolean) || [],
    [activeProject, getUserById]
  );

  const getColumnTasks = useCallback(
    (status: TaskStatus) =>
      projectTasks
        .filter((t) => t.status === status)
        .sort((a, b) => {
          const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return pOrder[a.priority] - pOrder[b.priority];
        }),
    [projectTasks]
  );

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const openCreateDialog = (status: TaskStatus) => {
    setCreateInColumn(status);
    setFormTitle("");
    setFormDesc("");
    setFormPriority("medium");
    setFormAssignee("");
    setFormDueDate("");
    setFormTags("");
    setShowCreateDialog(true);
  };

  const handleCreateTask = () => {
    if (!formTitle.trim() || !currentUser || !activeProjectId) return;
    createTask({
      projectId: activeProjectId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      status: createInColumn,
      priority: formPriority,
      assigneeId: formAssignee || undefined,
      createdBy: currentUser.id,
      dueDate: formDueDate ? new Date(formDueDate).toISOString() : undefined,
      tags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    setShowCreateDialog(false);
  };

  const openEditDialog = (task: Task) => {
    setEditTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormAssignee(task.assigneeId || "");
    setFormDueDate(task.dueDate ? task.dueDate.slice(0, 16) : "");
    setFormTags(task.tags?.join(", ") || "");
    setShowEditMenu(null);
  };

  const handleEditTask = () => {
    if (!editTask || !formTitle.trim()) return;
    updateTask(editTask.id, {
      title: formTitle.trim(),
      description: formDesc.trim(),
      priority: formPriority,
      assigneeId: formAssignee || undefined,
      dueDate: formDueDate ? new Date(formDueDate).toISOString() : undefined,
      tags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    setEditTask(null);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

    const priorityConfig: Record<string, { label: string; cls: string; dot: string }> = {
      critical: { label: "CRITICAL", cls: "text-rose-600 bg-rose-50", dot: "bg-rose-500" },
      high:     { label: "HIGH",     cls: "text-orange-600 bg-orange-50", dot: "bg-orange-500" },
      medium:   { label: "MEDIUM",   cls: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
      low:      { label: "LOW",      cls: "text-slate-500 bg-slate-50", dot: "bg-slate-400" },
    };
    const pc = priorityConfig[task.priority] || priorityConfig.medium;

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(task.id)}
        onDragEnd={() => { setDraggedTask(null); setDragOverColumn(null); }}
        className={cn(
          "group relative rounded-[1.5rem] bg-white border border-slate-200/60 p-5 cursor-grab active:cursor-grabbing transition-all duration-300",
          "hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1",
          draggedTask === task.id && "opacity-50 rotate-2 scale-95 shadow-2xl"
        )}
      >
        {/* Menu */}
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowEditMenu(showEditMenu === task.id ? null : task.id); }}
              className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </button>
            {showEditMenu === task.id && (
              <div className="absolute right-0 top-10 w-48 py-2 rounded-2xl border border-slate-100 bg-white shadow-2xl z-20 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => openEditDialog(task)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Task
                </button>
                <button
                  onClick={() => { deleteTask(task.id); setShowEditMenu(null); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Priority & Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest", pc.cls)}>
            <div className={cn("w-1 h-1 rounded-full animate-pulse", pc.dot)} />
            {pc.label}
          </div>
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-white">
                  <AvatarFallback className="text-[8px] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{assignee.name.split(" ")[0]}</span>
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                <User className="h-3 w-3 text-slate-300" />
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
              isOverdue
                ? "bg-rose-50 text-rose-600"
                : "bg-slate-50 text-slate-400"
            )}>
              {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {new Date(task.dueDate).toLocaleString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={["admin", "developer"]}>
    <div className="space-y-10 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-violet-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Flow Orchestration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Project <span className="text-violet-600 underline decoration-violet-500/20 underline-offset-8">Kanban</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            Visualize your team's workflow and manage task velocity through interactive column orchestration.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {permissions.createTask && (
            <Button variant="premium" onClick={() => openCreateDialog("todo")} className="shadow-violet-500/20">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm font-bold">Initiate Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar snap-x">
        {columns.map((column) => {
          const colTasks = getColumnTasks(column.id);
          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
              className={cn(
                "flex-shrink-0 w-80 flex flex-col rounded-[2rem] bg-slate-100/40 border border-slate-200/60 p-4 transition-all duration-300 snap-start",
                dragOverColumn === column.id && "bg-violet-50/50 border-violet-300/50 ring-4 ring-violet-500/5"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-6 rounded-full", column.dotColor.replace('bg-', 'bg-'))} />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{column.label}</h3>
                    <p className="text-[10px] font-bold text-slate-400">{colTasks.length} ITEMS</p>
                  </div>
                </div>
                <button
                  onClick={() => openCreateDialog(column.id)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-4 min-h-[400px]">
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-white/40">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Awaiting Flow</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[550px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-950 p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Plus className="h-8 w-8 text-violet-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">New Task</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">Define a new work item in the {columns.find((c) => c.id === createInColumn)?.label} column.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Headline</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Implement OIDC authentication flow" 
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Requirement Details</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Provide context and requirements..." rows={4}
                className="rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Business Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Maintenance</SelectItem>
                    <SelectItem value="medium">Medium - Functional</SelectItem>
                    <SelectItem value="high">High - Feature</SelectItem>
                    <SelectItem value="critical">Critical - Systemic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Owner Assignment</Label>
                <Select value={formAssignee} onValueChange={setFormAssignee}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((user) => user && (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Timeline Deadline</Label>
                <Input type="datetime-local" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} 
                  className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Categorization Tags</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="Separate with commas" 
                  className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs" />
              </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button onClick={() => setShowCreateDialog(false)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
            <Button variant="premium" onClick={handleCreateTask} disabled={!formTitle.trim()} className="!h-14 !px-8 shadow-indigo-500/20">
              <Plus className="h-5 w-5 mr-2" /> INITIATE TASK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-[550px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-950 p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Edit3 className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Modify Task</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">Update the parameters of this existing work item.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Headline</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} 
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Requirement Details</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={4}
                className="rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Business Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Owner Assignment</Label>
                <Select value={formAssignee} onValueChange={setFormAssignee}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((user) => user && (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Timeline Deadline</Label>
                <Input type="datetime-local" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} 
                  className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Categorization Tags</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} 
                  className="h-12 rounded-2xl bg-slate-50 border-slate-200 font-bold text-xs" />
              </div>
            </div>
          </div>

          <div className="p-10 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button onClick={() => setEditTask(null)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <Button variant="premium" onClick={handleEditTask} disabled={!formTitle.trim()} className="!h-14 !px-8 shadow-indigo-500/20">
              <CheckCircle2 className="h-5 w-5 mr-2" /> SAVE MODIFICATIONS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
