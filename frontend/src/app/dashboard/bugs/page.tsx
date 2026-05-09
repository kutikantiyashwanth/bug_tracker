"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store-api";
import { can, normalizeRole } from "@/lib/rbac";
import { cn, formatRelativeTime, getInitials, severityColors } from "@/lib/utils";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, AlertTriangle, Search, Bug, CheckCircle2,
  Clock, ArrowUpCircle, Trash2, Send, MessageSquare, Sparkles, Cpu, RefreshCw,
} from "lucide-react";
import type { Bug as BugType, Severity, BugStatus } from "@/lib/types";

export default function BugsPage() {
  const { bugs, activeProjectId, createBug, updateBug, deleteBug, getUserById, currentUser, projects } = useStore();
  const userRole = normalizeRole(currentUser?.role || "developer");
  const permissions = can(userRole);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState<BugType | null>(null);

  // Load comments when bug detail opens
  useEffect(() => {
    if (showDetailDialog?.id) {
      loadComments(showDetailDialog.id);
    }
  }, [showDetailDialog?.id]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Form
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSteps, setFormSteps] = useState("");
  const [formSeverity, setFormSeverity] = useState<Severity>("major");
  const [formAssignee, setFormAssignee] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{ severity: Severity; reason: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // ── AI Bug Prioritization ──
  const analyzeWithAI = async () => {
    if (!formTitle.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await api.post("/ai/analyze-bug", {
        title: formTitle,
        description: formDesc,
        stepsToReproduce: formSteps,
      });
      setAiSuggestion(res.data.data);
      if (res.data.data?.severity) setFormSeverity(res.data.data.severity);
    } catch {
      // Fallback: local keyword analysis
      const text = `${formTitle} ${formDesc}`.toLowerCase();
      let severity: Severity = "minor";
      let reason = "Based on keyword analysis";
      if (text.match(/crash|down|broken|not working|cannot|unable|blocked|critical|urgent|production|data loss/)) {
        severity = "critical"; reason = "Keywords suggest a critical blocking issue";
      } else if (text.match(/error|fail|wrong|incorrect|missing|broken|bug|issue|problem/)) {
        severity = "major"; reason = "Keywords suggest a significant issue";
      } else {
        severity = "minor"; reason = "Appears to be a minor cosmetic or low-impact issue";
      }
      setAiSuggestion({ severity, reason });
      setFormSeverity(severity);
    } finally {
      setAiLoading(false);
    }
  };
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;
  const projectMembers = useMemo(
    () => activeProject?.members.map((m) => getUserById(m.userId)).filter(Boolean) || [],
    [activeProject, getUserById]
  );

  const projectBugs = useMemo(
    () => bugs
      .filter((b) => b.projectId === activeProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bugs, activeProjectId]
  );

  const filteredBugs = useMemo(() => {
    return projectBugs.filter((bug) => {
      const matchesSearch = !searchQuery ||
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = filterSeverity === "all" || bug.severity === filterSeverity;
      const matchesStatus = filterStatus === "all" || bug.status === filterStatus;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "open" && (bug.status === "open" || bug.status === "in-progress")) ||
        (activeTab === "resolved" && (bug.status === "resolved" || bug.status === "closed"));
      return matchesSearch && matchesSeverity && matchesStatus && matchesTab;
    });
  }, [projectBugs, searchQuery, filterSeverity, filterStatus, activeTab]);

  const stats = useMemo(() => ({
    total: projectBugs.length,
    open: projectBugs.filter((b) => b.status === "open").length,
    inProgress: projectBugs.filter((b) => b.status === "in-progress").length,
    resolved: projectBugs.filter((b) => b.status === "resolved" || b.status === "closed").length,
    critical: projectBugs.filter((b) => b.severity === "critical" && b.status !== "resolved" && b.status !== "closed").length,
  }), [projectBugs]);

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormSteps("");
    setFormSeverity("major");
    setFormAssignee("");
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setAiSuggestion(null);
  };

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleCreateBug = async () => {
    if (!formTitle.trim() || !currentUser || !activeProjectId) return;
    setCreating(true);
    setCreateError("");
    try {
      const screenshotUrl = screenshotPreview || undefined;
      await createBug({
        projectId: activeProjectId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        stepsToReproduce: formSteps.trim(),
        severity: formSeverity,
        status: "open",
        assigneeId: formAssignee || undefined,
        reportedBy: currentUser.id,
        screenshotUrl,
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (err: any) {
      setCreateError(err?.response?.data?.error || err?.message || "Failed to create bug. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStatusChange = (bugId: string, status: BugStatus) => {
    updateBug(bugId, { status });
  };

  // Load comments when bug detail opens
  const loadComments = async (bugId: string) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/bugs/${bugId}/comments`);
      setComments(res.data.data || []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Send a comment
  const handleSendComment = async (bugId: string) => {
    if (!commentText.trim() || !currentUser) return;
    setSendingComment(true);
    try {
      const res = await api.post(`/bugs/${bugId}/comments`, { content: commentText.trim() });
      setComments((prev) => [...prev, res.data.data]);
      setCommentText("");
    } catch (e) {
      console.error("Failed to send comment", e);
    } finally {
      setSendingComment(false);
    }
  };

  // Mark bug as resolved and notify admin/reporter
  const handleMarkResolved = async (bug: BugType) => {
    await updateBug(bug.id, { status: "resolved" });
    setShowDetailDialog({ ...bug, status: "resolved" });
    // Post a comment automatically
    if (currentUser) {
      try {
        const res = await api.post(`/bugs/${bug.id}/comments`, {
          content: `✅ I have fixed this bug. Please review and close it.`,
        });
        setComments((prev) => [...prev, res.data.data]);
        // Refresh activities
        if (activeProjectId) {
          const { fetchActivities } = useStore.getState();
          fetchActivities(activeProjectId);
        }
      } catch {}
    }
  };

  const severityIcon = (severity: Severity) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "major": return <ArrowUpCircle className="h-4 w-4 text-orange-600" />;
      default: return <Bug className="h-4 w-4 text-blue-600" />;
    }
  };

  const statusIcon = (status: BugStatus) => {
    switch (status) {
      case "open": return <div className="w-2 h-2 rounded-full bg-red-500" />;
      case "in-progress": return <Clock className="h-3.5 w-3.5 text-amber-600" />;
      case "resolved": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case "closed": return <CheckCircle2 className="h-3.5 w-3.5 text-white/65" />;
    }
  };

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">Quality Assurance</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Bug <span className="text-rose-500 underline decoration-rose-500/20 underline-offset-8">Intelligence</span></h1>
          <p className="text-white/70 mt-2 font-medium max-w-xl">
            Monitor, prioritize, and resolve technical debt with AI-assisted severity analysis and team collaboration.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="glow" onClick={() => { resetForm(); setCreateError(""); setShowCreateDialog(true); }} className="shadow-rose-500/20 !bg-rose-600 hover:!bg-rose-700">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-bold">Report New Bug</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Issues", value: stats.open + stats.inProgress, color: "text-rose-400", bg: "bg-rose-500/15 border border-rose-500/20", icon: Bug },
          { label: "In Development", value: stats.inProgress, color: "text-amber-400", bg: "bg-amber-500/15 border border-amber-500/20", icon: Clock },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-400", bg: "bg-emerald-500/15 border border-emerald-500/20", icon: CheckCircle2 },
          { label: "Critical Priority", value: stats.critical, color: "text-rose-400", bg: "bg-rose-500/15 border border-rose-500/20", icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="card-base rounded-2xl p-6">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
              <stat.icon className="h-16 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-black text-white/65 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Navigation */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2 rounded-3xl bg-white/8/50 border border-white/10/60">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/65" />
            <Input
              placeholder="Search reports by title, description or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-transparent focus:border-indigo-500/30 rounded-2xl shadow-sm text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40 h-12 rounded-2xl border-transparent bg-white/5 shadow-sm font-bold text-xs">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-12 rounded-2xl border-transparent bg-white/5 shadow-sm font-bold text-xs">
                <SelectValue placeholder="Lifecycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">Fixing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white/5 gap-8 p-0 h-auto mb-8">
            {[
              { id: "all", label: "All Reports", count: projectBugs.length },
              { id: "open", label: "Active Issues", count: stats.open + stats.inProgress },
              { id: "resolved", label: "Resolved", count: stats.resolved },
            ].map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} 
                className="p-0 h-10 bg-white/5 border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-white/5 rounded-none flex items-center gap-2 group">
                <span className="text-sm font-black uppercase tracking-widest text-white/65 group-hover:text-white/70 group-data-[state=active]:text-violet-400 transition-colors">{tab.label}</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/8 text-[10px] font-black text-white/70 group-data-[state=active]:bg-indigo-50 group-data-[state=active]:text-violet-400 transition-all">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 outline-none">
            {filteredBugs.length === 0 ? (
              <div className="card-base rounded-2xl p-6">
                <div className="w-20 h-20 rounded-3xl bg-white/4 flex items-center justify-center mb-6">
                  <Bug className="h-10 w-10 text-white/30" />
                </div>
                <h3 className="text-xl font-bold text-white">No bugs found</h3>
                <p className="text-white/70 mt-2 font-medium">Try adjusting your filters or report a new issue.</p>
                <Button variant="outline" className="mt-6 rounded-2xl" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                  Create Bug Report
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBugs.map((bug, i) => {
                  const reporter = getUserById(bug.reportedBy);
                  const assignee = bug.assigneeId ? getUserById(bug.assigneeId) : null;
                  return (
                    <div
                      key={bug.id}
                      className="card-base rounded-2xl p-6"
                      onClick={() => setShowDetailDialog(bug)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center p-6 gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn("w-2 h-2 rounded-full", 
                              bug.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 
                              bug.severity === 'major' ? 'bg-amber-500' : 'bg-blue-500'
                            )} />
                            <h3 className="text-lg font-bold text-white truncate tracking-tight group-hover:text-violet-400 transition-colors">{bug.title}</h3>
                          </div>
                          
                          <p className="text-sm text-white/70 line-clamp-2 leading-relaxed mb-6">
                            {bug.description || "No detailed description provided for this report."}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/65">
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/4 border border-white/8">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px] bg-indigo-500 text-white">{reporter ? getInitials(reporter.name) : "?"}</AvatarFallback>
                              </Avatar>
                              <span className="text-white/70">{reporter?.name || "Anonymous"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatRelativeTime(bug.createdAt)}</span>
                            </div>
                            {assignee && (
                              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-violet-400">
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                                <span>Assigned to {assignee.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 lg:pl-6 lg:border-l border-white/8 shrink-0">
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", 
                              bug.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 
                              bug.severity === 'major' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                            )}>
                              {bug.severity}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs font-bold text-white/65">
                              {statusIcon(bug.status)}
                              <span className="capitalize">{bug.status.replace('-', ' ')}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/4 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                            <Plus className="h-5 w-5 text-white/60 group-hover:text-violet-400 rotate-45" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Bug Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); setCreateError(""); } }}>
        <DialogContent className="sm:max-w-[650px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-[#080b14] p-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Report Bug</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">AI-powered defect analysis and reporting tool.</DialogDescription>
            </div>
          </div>
          
          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Report Headline</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Memory leak on dashboard chart interaction" 
                  className="h-14 rounded-2xl bg-white/4 border-white/10 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
              </div>

              {/* AI Section */}
              <div className="card-base rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">Bug Intelligence</p>
                      <p className="text-[10px] font-bold text-violet-400 uppercase">Automated Prioritization</p>
                    </div>
                  </div>
                  <button type="button" onClick={analyzeWithAI} disabled={!formTitle.trim() || aiLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-indigo-200 text-violet-400 text-xs font-black hover:bg-indigo-50 transition-all shadow-sm">
                    {aiLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? "ANALYZING..." : "ANALYZE NOW"}
                  </button>
                </div>

                {aiSuggestion ? (
                  <div className="space-y-4 animate-slide-up">
                    <p className="text-xs font-medium text-white/70 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white/80">
                      {aiSuggestion.reason}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Suggested Severity", value: aiSuggestion.severity.toUpperCase(), color: "text-rose-600" },
                        { label: "Est. Resolution", value: (aiSuggestion as any).estimatedTime || "2-4 hours", color: "text-violet-400" },
                        { label: "Confidence", value: (aiSuggestion as any).confidence || "High", color: "text-emerald-600" },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/8 text-center">
                          <p className="text-[8px] font-black uppercase text-white/65 mb-1">{item.label}</p>
                          <p className={cn("text-[10px] font-black", item.color)}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[10px] font-bold text-white/65">ENTER A TITLE TO UNLOCK AI INSIGHTS</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Impact Description</Label>
                <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Explain the business impact..." rows={4} 
                  className="rounded-2xl bg-white/4 border-white/10 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-medium text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Reproduction Path</Label>
                <Textarea value={formSteps} onChange={(e) => setFormSteps(e.target.value)} placeholder="1. Open app&#10;2. Click btn..." rows={4} 
                  className="rounded-2xl bg-white/4 border-white/10 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-mono text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Severity Level</Label>
                <Select value={formSeverity} onValueChange={(v) => setFormSeverity(v as Severity)}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/4 border-white/10 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor - Cosmetic</SelectItem>
                    <SelectItem value="major">Major - Functional</SelectItem>
                    <SelectItem value="critical">Critical - Blocking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Assign Resolver</Label>
                <Select value={formAssignee} onValueChange={setFormAssignee}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white/4 border-white/10 font-bold text-xs"><SelectValue placeholder="Automatic Allocation" /></SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((user) => user && (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 ml-1">Visual Evidence</Label>
              <label className="group block border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:border-indigo-500/40 hover:bg-indigo-50/30 transition-all cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                {screenshotPreview ? (
                  <div className="relative inline-block">
                    <img src={screenshotPreview} alt="Preview" className="max-h-40 rounded-2xl shadow-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-black">CHANGE IMAGE</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/8 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-white/65" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Upload Screenshot</p>
                      <p className="text-xs text-white/65 font-medium">Attach visual context for faster resolution</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="p-10 bg-white/4 flex items-center justify-between border-t border-white/10">
            <button onClick={() => setShowCreateDialog(false)} className="text-xs font-black uppercase tracking-widest text-white/65 hover:text-white/70 transition-colors">Discard</button>
            <div className="flex items-center gap-4">
              {createError && <p className="text-xs font-bold text-rose-500">{createError}</p>}
              <Button variant="glow" onClick={handleCreateBug} disabled={!formTitle.trim() || creating} className="!h-14 !px-8 shadow-indigo-500/20">
                {creating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /><span>SUBMIT REPORT</span></>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bug Detail Dialog */}
      <Dialog open={!!showDetailDialog} onOpenChange={(open) => {
        if (!open) { setShowDetailDialog(null); setComments([]); setCommentText(""); }
      }}>
        <DialogContent className="sm:max-w-[750px] !rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {showDetailDialog && (() => {
            const bug = showDetailDialog;
            const reporter = getUserById(bug.reportedBy);
            const assignee = bug.assigneeId ? getUserById(bug.assigneeId) : null;
            const isAssignedToMe = bug.assigneeId === currentUser?.id;
            return (
              <div className="flex flex-col h-[90vh]">
                <div className="bg-[#080b14] p-10 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", 
                        bug.severity === 'critical' ? 'bg-rose-500 text-white' : 
                        bug.severity === 'major' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                      )}>
                        {bug.severity}
                      </Badge>
                      <span className="text-white/65 font-black text-xs tracking-widest">#{bug.id.substring(0, 8)}</span>
                    </div>
                    <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight">{bug.title}</DialogTitle>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white/10">
                          <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-black">{reporter ? getInitials(reporter.name) : "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Reporter</p>
                          <p className="text-xs font-bold text-white/80">{reporter?.name || "Anonymous"}</p>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10")}>
                          {statusIcon(bug.status)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Status</p>
                          <p className="text-xs font-bold text-white/80 capitalize">{bug.status.replace('-', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailDialog(null)} className="p-2 rounded-2xl bg-white/5 text-white/65 hover:text-white transition-colors">
                    <Trash2 className="h-6 w-6 rotate-45" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-4">Functional Impact</h4>
                        <p className="text-sm text-white/70 font-medium leading-relaxed">{bug.description || "No context provided."}</p>
                      </div>

                      {bug.stepsToReproduce && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-4">Reproduction Steps</h4>
                          <div className="bg-white/4 rounded-[1.5rem] p-6 border border-white/8 font-mono text-xs text-white/70 leading-relaxed">
                            {bug.stepsToReproduce}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      {bug.screenshotUrl && (
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-4">Evidence</h4>
                          <div className="group relative overflow-hidden rounded-[2rem] border border-white/8 shadow-xl">
                            <img src={bug.screenshotUrl} alt="BugEvidence" className="w-full object-cover" />
                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}

                      <div className="card-base rounded-2xl p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-4">Resolution Ownership</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-white/10 text-white/70 font-black text-xs">{assignee ? getInitials(assignee.name) : "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-white">{assignee?.name || "Unassigned"}</p>
                              <p className="text-[10px] font-bold text-white/65">LEAD RESOLVER</p>
                            </div>
                          </div>
                          {!assignee && permissions.changeBugStatus && (
                            <Button size="sm" variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Assign Now</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Chat/Comments ── */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">Collaboration Feed</h4>
                      <span className="px-2 py-0.5 rounded-lg bg-white/8 text-[10px] font-black text-white/70">{comments.length} MESSAGES</span>
                    </div>

                    <div className="space-y-4">
                      {loadingComments ? (
                        <div className="flex justify-center py-10"><RefreshCw className="h-6 w-6 animate-spin text-white/30" /></div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/8 rounded-[2rem]">
                          <MessageSquare className="h-8 w-8 text-white/30 mx-auto mb-3" />
                          <p className="text-xs font-bold text-white/65 uppercase tracking-widest">No activity yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((c) => {
                            const author = getUserById(c.userId) || c.user;
                            const isMe = c.userId === currentUser?.id;
                            return (
                              <div key={c.id} className={cn("flex gap-4 group", isMe && "flex-row-reverse")}>
                                <Avatar className="h-8 w-8 mt-1">
                                  <AvatarFallback className="text-[10px] font-black bg-indigo-500 text-white">{author ? getInitials(author.name) : "?"}</AvatarFallback>
                                </Avatar>
                                <div className={cn("max-w-[80%] space-y-1", isMe && "text-right")}>
                                  <p className="text-[10px] font-black text-white/65 uppercase tracking-widest">{isMe ? "You" : (author?.name || "Member")}</p>
                                  <div className={cn("px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm", 
                                    isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/5 border border-white/8 text-white/70 rounded-tl-none")}>
                                    {c.content}
                                  </div>
                                  <p className="text-[8px] font-black text-white/60 uppercase tracking-tighter">{formatRelativeTime(c.createdAt)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="relative group pt-4">
                      <div className="absolute right-3 top-[calc(1rem+12px)] flex items-center gap-2">
                        <button onClick={() => handleSendComment(bug.id)} disabled={!commentText.trim() || sendingComment}
                          className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform disabled:opacity-40">
                          {sendingComment ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </div>
                      <Input placeholder="Sync with your team..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendComment(bug.id)}
                        className="h-16 pl-6 pr-16 rounded-[1.5rem] bg-white/4 border-white/10 focus:border-indigo-500/30 font-medium" />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white/4 border-t border-white/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    {permissions.deleteBug && (
                      <button onClick={() => { deleteBug(bug.id); setShowDetailDialog(null); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors text-[10px] font-black uppercase tracking-widest border border-rose-100">
                        <Trash2 className="h-3.5 w-3.5" />
                        Permanently Delete
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isAssignedToMe && bug.status !== "resolved" && (
                      <Button onClick={() => handleMarkResolved(bug)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-emerald-500/20">
                        Confirm Resolution
                      </Button>
                    )}

                    {permissions.changeBugStatus && (
                      <Select value={bug.status} onValueChange={(v) => { handleStatusChange(bug.id, v as BugStatus); setShowDetailDialog({ ...bug, status: v as BugStatus }); }}>
                        <SelectTrigger className="w-40 h-12 rounded-xl border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
