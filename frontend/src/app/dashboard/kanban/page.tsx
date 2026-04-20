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
  Trash2, Edit3, Clock, AlertCircle
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
      dueDate: formDueDate || undefined,
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
    setFormDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
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
      dueDate: formDueDate || undefined,
      tags: formTags ? formTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    setEditTask(null);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

    const priorityConfig: Record<string, { label: string; cls: string }> = {
      critical: { label: "Critical", cls: "bg-red-100 text-red-700 border border-red-200" },
      high:     { label: "High",     cls: "bg-orange-100 text-orange-700 border border-orange-200" },
      medium:   { label: "Medium",   cls: "bg-amber-100 text-amber-700 border border-amber-200" },
      low:      { label: "Low",      cls: "bg-slate-100 text-slate-600 border border-slate-200" },
    };
    const pc = priorityConfig[task.priority] || priorityConfig.medium;

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(task.id)}
        onDragEnd={() => { setDraggedTask(null); setDragOverColumn(null); }}
        className={cn(
          "group relative rounded-xl bg-white border border-gray-200 p-3.5 cursor-grab active:cursor-grabbing transition-smooth",
          "hover:border-violet-300 hover:shadow-md hover-glow",
          draggedTask === task.id && "opacity-50 rotate-1 shadow-2xl"
        )}
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", willChange: "transform" }}
      >
        {/* Menu */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowEditMenu(showEditMenu === task.id ? null : task.id); }}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {showEditMenu === task.id && (
              <div className="absolute right-0 top-7 w-36 py-1 rounded-xl border border-gray-100 bg-white shadow-lg z-10 animate-scale-in">
                <button
                  onClick={() => openEditDialog(task)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => { deleteTask(task.id); setShowEditMenu(null); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Priority & Tags */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", pc.cls)}>
            {pc.label}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-gray-900 leading-snug pr-6">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[8px] font-bold"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)", color: "white" }}>
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-gray-500 font-medium">{assignee.name.split(" ")[0]}</span>
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-300" />
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
              isOverdue
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500"
            )}>
              {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={["admin", "developer"]}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">{projectTasks.length} tasks across {columns.length} columns</p>
        </div>
        {permissions.createTask && (
          <Button variant="glow" size="sm" onClick={() => openCreateDialog("todo")}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {columns.map((column) => {
          const colTasks = getColumnTasks(column.id);
          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.id)}
              className={cn(
                "flex flex-col rounded-2xl border-t-[3px] min-h-[400px] transition-all duration-200",
                column.topColor, column.bg,
                "border border-gray-200",
                dragOverColumn === column.id && "kanban-column-over ring-2 ring-violet-300"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
                  <h3 className={cn("text-sm font-bold", column.textColor)}>{column.label}</h3>
                  <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full", column.textColor, "bg-white/70")}>
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openCreateDialog(column.id)}
                  className={cn("p-1 rounded-lg hover:bg-white/80 transition-colors", column.textColor)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[600px]">
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl bg-white/40">
                    <p className="text-xs text-gray-400 font-medium">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a task to the {columns.find((c) => c.id === createInColumn)?.label} column.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Task title..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Describe the task..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={formAssignee} onValueChange={setFormAssignee}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((user) => user && (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="frontend, api..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="glow" onClick={handleCreateTask} disabled={!formTitle.trim()}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={formAssignee} onValueChange={setFormAssignee}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((user) => user && (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>Cancel</Button>
            <Button variant="glow" onClick={handleEditTask} disabled={!formTitle.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
