"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-api";
import { RoleGuard } from "@/components/RoleGuard";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Plus, FolderOpen, Users, CheckCircle2, Bug, Calendar,
  Copy, Check, ArrowRight, ExternalLink
} from "lucide-react";

export default function ProjectsPage() {
  const { projects, activeProjectId, setActiveProject, createProject, joinProject, tasks, bugs, getUserById, currentUser } = useStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isAdmin = (currentUser?.role as string)?.toLowerCase() === "admin";

  const handleCreate = () => {
    if (!formName.trim()) return;
    createProject(formName.trim(), formDesc.trim());
    setShowCreateDialog(false);
    setFormName("");
    setFormDesc("");
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setJoinError("");
    try {
      const success = await joinProject(inviteCode.trim());
      if (success) {
        setShowJoinDialog(false);
        setInviteCode("");
      } else {
        setJoinError("Invalid invite code. Please check and try again.");
      }
    } catch (error) {
      setJoinError("Failed to join project. Please try again.");
    }
  };

  const handleCopy = (inviteCode: string, projectId: string) => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Enterprise Workspaces</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Your <span className="text-indigo-300 underline decoration-indigo-500/20 underline-offset-8">Projects</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl">
            Select a workspace to view detailed analytics, track team progress, and manage technical debt.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowJoinDialog(true)} className="rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
            <Users className="h-4 w-4 mr-2" />
            Join Project
          </Button>
          {isAdmin && (
            <Button variant="premium" onClick={() => setShowCreateDialog(true)} className="shadow-indigo-500/20">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="premium-card flex flex-col items-center justify-center py-32 border-dashed">
          <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100 shadow-inner">
            <FolderOpen className="h-10 w-10 text-indigo-400" />
          </div>
          {isAdmin ? (
            <div className="text-center max-w-sm">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Active Workspaces</h3>
              <p className="text-slate-500 mt-2 font-medium mb-10">
                You haven't initialized any projects yet. Create a workspace to start tracking bugs with your team.
              </p>
              <Button variant="premium" onClick={() => setShowCreateDialog(true)} className="h-14 px-8">
                <Plus className="h-5 w-5 mr-2" /> Create First Project
              </Button>
            </div>
          ) : (
            <div className="text-center max-w-sm">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Join a Workspace</h3>
              <p className="text-slate-500 mt-2 font-medium mb-10">
                You're not a member of any project. Use an invite code from your administrator to get started.
              </p>
              <Button variant="premium" onClick={() => setShowJoinDialog(true)} className="h-14 px-8">
                <Users className="h-5 w-5 mr-2" /> Enter Invite Code
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(projects) && projects.map((project, i) => {
          const projectTasks = Array.isArray(tasks) ? tasks.filter((t) => t.projectId === project.id) : [];
          const projectBugs = Array.isArray(bugs) ? bugs.filter((b) => b.projectId === project.id) : [];
          const completedTasks = projectTasks.filter((t) => t.status === "done").length;
          const completionRate = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
          const isActive = project.id === activeProjectId;

          return (
            <div
              key={project.id}
              className={cn(
                "premium-card group cursor-pointer transition-all duration-500 relative",
                isActive ? "border-indigo-500/40 ring-4 ring-indigo-500/5 bg-gradient-to-br from-indigo-50/50 to-white" : "hover:border-indigo-500/20"
              )}
              onClick={() => setActiveProject(project.id)}
            >
              <div className="flex flex-col h-full space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110 shadow-lg", 
                      isActive ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-slate-100 text-slate-400")}>
                      {project.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Project Workspace</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed flex-1">
                  {project.description || "No project description provided. This workspace is being used for active bug tracking and sprint management."}
                </p>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
                  {[
                    { label: "TASKS", value: projectTasks.length, icon: CheckCircle2 },
                    { label: "BUGS", value: projectBugs.length, icon: Bug },
                    { label: "TEAM", value: project.members.length, icon: Users },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{stat.value}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint Velocity</span>
                    <span className="text-xs font-black text-indigo-300">{completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((member) => {
                      const user = getUserById(member.userId);
                      return (
                        <Avatar key={member.userId} className="h-8 w-8 ring-2 ring-white transition-transform hover:-translate-y-1">
                          <AvatarFallback className="text-[8px] font-black bg-slate-200 text-slate-600">
                            {user ? getInitials(user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {project.members.length > 4 && (
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 ring-2 ring-white">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(project.inviteCode, project.id); }}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-300 uppercase tracking-widest transition-all p-2 rounded-xl hover:bg-indigo-50"
                    >
                      {copiedId === project.id ? (
                        <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy Key</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="!rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-950 p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Plus className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">New Workspace</DialogTitle>
              <DialogDescription className="text-white/40 font-medium">Initialize a high-performance project tracker.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. NextGen Dashboard" 
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Workspace Objective</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Briefly describe the goals of this workspace..." rows={4}
                className="rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-medium" />
            </div>
          </div>

          <div className="p-10 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button onClick={() => setShowCreateDialog(false)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
            <Button variant="premium" onClick={handleCreate} disabled={!formName.trim()} className="!h-14 !px-8 shadow-indigo-500/20">
              <Plus className="h-5 w-5 mr-2" /> CREATE WORKSPACE
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Project Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="!rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-950 p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Access Key</DialogTitle>
              <DialogDescription className="text-white/40 font-medium">Join an existing workspace using a secure code.</DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-6">
            <div className="space-y-2 text-center">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workspace Invitation Code</Label>
              <Input 
                value={inviteCode} 
                onChange={(e) => { setInviteCode(e.target.value); setJoinError(""); }} 
                placeholder="XXXX-XXXX-XXXX-XXXX" 
                className="h-20 text-center text-2xl font-mono tracking-widest rounded-3xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 uppercase"
                maxLength={36}
              />
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-4">CHECK WITH YOUR ADMINISTRATOR FOR THE KEY</p>
            </div>
            {joinError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-xs font-bold text-rose-300">{joinError}</p>
              </div>
            )}
          </div>

          <div className="p-10 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button onClick={() => { setShowJoinDialog(false); setInviteCode(""); setJoinError(""); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Back</button>
            <Button variant="premium" onClick={handleJoin} disabled={!inviteCode.trim()} className="!h-14 !px-8 shadow-indigo-500/20">
              <ArrowRight className="h-5 w-5 mr-2" /> JOIN WORKSPACE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

