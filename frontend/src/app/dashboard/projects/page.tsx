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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your projects and teams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoinDialog(true)}>
            <Users className="h-4 w-4 mr-1" /> Join Project
          </Button>
          {isAdmin && (
            <Button variant="glow" size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="card-base">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 border border-violet-200 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            {isAdmin ? (
              <>
                <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  Get started by creating your first project. Share the invite code with your team.
                </p>
                <Button variant="glow" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Project
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">Join a Project</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  You haven't joined any projects yet. Ask your Admin or Team Lead for an invite code.
                </p>
                <Button variant="glow" onClick={() => setShowJoinDialog(true)}>
                  <Users className="h-4 w-4 mr-2" /> Join a Project
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(projects) && projects.map((project, i) => {
          const projectTasks = Array.isArray(tasks) ? tasks.filter((t) => t.projectId === project.id) : [];
          const projectBugs = Array.isArray(bugs) ? bugs.filter((b) => b.projectId === project.id) : [];
          const completedTasks = projectTasks.filter((t) => t.status === "done").length;
          const completionRate = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
          const isActive = project.id === activeProjectId;
          const owner = getUserById(project.ownerId);

          return (
            <Card
              key={project.id}
              className={cn(
                "card-base card-lift transition-all duration-300 stagger-item cursor-pointer group",
                isActive && "ring-1 ring-violet-300 border-violet-200"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => setActiveProject(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-primary text-sm font-bold">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {project.name}
                        {isActive && <Badge variant="default" className="text-[9px] h-4">Active</Badge>}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5 line-clamp-1">{project.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold">{projectTasks.length}</p>
                    <p className="text-[10px] text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold">{projectBugs.length}</p>
                    <p className="text-[10px] text-gray-500">Bugs</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold">{project.members.length}</p>
                    <p className="text-[10px] text-gray-500">Members</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-1.5" />
                </div>

                {/* Members & Invite */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((member) => {
                      const user = getUserById(member.userId);
                      return (
                        <Avatar key={member.userId} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="text-[8px]">{user ? getInitials(user.name) : "?"}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                    {project.members.length > 4 && (
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-[10px] font-medium border-2 border-card">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(project.inviteCode, project.id); }}
                      className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                    >
                      {copiedId === project.id ? (
                        <><Check className="h-3 w-3 text-emerald-400" /> Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy Invite Code</>
                      )}
                    </button>
                  )}                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Start a new project and invite your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="My Awesome Project" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What's this project about?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="glow" onClick={handleCreate} disabled={!formName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Project Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Project</DialogTitle>
            <DialogDescription>Enter the invite code shared by your team lead to join an existing project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Invite Code *</Label>
              <Input 
                value={inviteCode} 
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setJoinError("");
                }} 
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                className="font-mono"
                maxLength={36}
              />
              <p className="text-xs text-gray-500">
                Ask your team lead for the project invite code
              </p>
            </div>
            {joinError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {joinError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowJoinDialog(false);
              setInviteCode("");
              setJoinError("");
            }}>Cancel</Button>
            <Button variant="glow" onClick={handleJoin} disabled={!inviteCode.trim()}>
              <Users className="h-4 w-4 mr-1" /> Join Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

