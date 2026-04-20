"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-api";
import { cn, formatDate } from "@/lib/utils";
import { Clock, X, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DeadlineTask {
  id: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  priority: string;
}

export function DeadlineAlert() {
  const { tasks, activeProjectId } = useStore();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deadlines, setDeadlines] = useState<DeadlineTask[]>([]);

  useEffect(() => {
    if (dismissed) return;

    // Find tasks due within 3 days
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const urgent = (Array.isArray(tasks) ? tasks : [])
      .filter((t) =>
        t.projectId === activeProjectId &&
        t.dueDate &&
        t.status !== "done" &&
        new Date(t.dueDate) > now &&
        new Date(t.dueDate) <= in3Days
      )
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate!,
        daysLeft: Math.ceil((new Date(t.dueDate!).getTime() - now.getTime()) / 86400000),
        priority: t.priority,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);

    if (urgent.length > 0) {
      setDeadlines(urgent);
      // Show after 2 seconds
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, activeProjectId, dismissed]);

  // Auto-hide after 8 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible || deadlines.length === 0) return null;

  const mostUrgent = deadlines[0];
  const isToday = mostUrgent.daysLeft <= 1;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[200] w-[360px] rounded-2xl shadow-xl overflow-hidden",
        "animate-slide-up"
      )}
      style={{
        background: isToday
          ? "linear-gradient(135deg, #fef2f2, #fff7ed)"
          : "linear-gradient(135deg, #fffbeb, #fef3c7)",
        border: isToday ? "1px solid #fca5a5" : "1px solid #fcd34d",
        boxShadow: isToday
          ? "0 20px 60px rgba(239,68,68,0.2), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 20px 60px rgba(245,158,11,0.2), 0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {/* Progress bar (auto-dismiss timer) */}
      <div className="h-1 w-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            background: isToday ? "#ef4444" : "#f59e0b",
            animation: "progress-shrink 8s linear forwards",
          }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              isToday ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
              {isToday
                ? <AlertTriangle className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                : <Clock className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              }
            </div>
            <div>
              <p className={cn("text-sm font-bold", isToday ? "text-red-800" : "text-amber-800")}>
                {isToday ? "🚨 Deadline Tomorrow!" : "⏰ Upcoming Deadlines"}
              </p>
              <p className={cn("text-[10px]", isToday ? "text-red-600" : "text-amber-600")}>
                {deadlines.length} task{deadlines.length !== 1 ? "s" : ""} due soon
              </p>
            </div>
          </div>
          <button
            onClick={() => { setVisible(false); setDismissed(true); }}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isToday ? "text-red-400 hover:bg-red-100" : "text-amber-400 hover:bg-amber-100"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {deadlines.map((task) => (
            <div key={task.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl",
                isToday ? "bg-red-50/80" : "bg-amber-50/80"
              )}>
              <div className={cn(
                "w-1.5 h-8 rounded-full shrink-0",
                task.daysLeft <= 1 ? "bg-red-500" : task.daysLeft <= 2 ? "bg-orange-500" : "bg-amber-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold truncate", isToday ? "text-red-900" : "text-amber-900")}>
                  {task.title}
                </p>
                <p className={cn("text-[10px]", isToday ? "text-red-600" : "text-amber-600")}>
                  {task.daysLeft <= 1 ? "Due tomorrow" : `Due in ${task.daysLeft} days`} · {formatDate(task.dueDate)}
                </p>
              </div>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize shrink-0",
                task.priority === "critical" ? "bg-red-200 text-red-700" :
                task.priority === "high"     ? "bg-orange-200 text-orange-700" :
                                               "bg-amber-200 text-amber-700"
              )}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>

        {/* Action */}
        <Link
          href="/dashboard/kanban"
          onClick={() => setVisible(false)}
          className={cn(
            "flex items-center justify-center gap-1.5 mt-3 py-2 rounded-xl text-xs font-bold transition-all",
            isToday
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-amber-500 text-white hover:bg-amber-600"
          )}
          style={{ boxShadow: isToday ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(245,158,11,0.3)" }}
        >
          View Tasks on Kanban
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
