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
  Clock, ArrowUpCircle, Trash2, Send, MessageSquare, Sparkles, Cpu,
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

  const handleCreateBug = () => {
    if (!formTitle.trim() || !currentUser || !activeProjectId) return;
    // Convert screenshot to base64 data URL if present
    const screenshotUrl = screenshotPreview || undefined;
    createBug({
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
      case "closed": return <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 page-title">Bug Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage reported issues</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => { resetForm(); setShowCreateDialog(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> Report Bug
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", value: stats.open, color: "text-red-600", bg: "bg-red-100" },
          { label: "In Progress", value: stats.inProgress, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Critical", value: stats.critical, color: "text-red-600", bg: "bg-red-100" },
        ].map((stat) => (
          <Card key={stat.label} className="card-base">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <span className={cn("text-lg font-bold", stat.color)}>{stat.value}</span>
              </div>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 filters-row">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="flex-1 sm:w-[140px] sm:flex-none">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 sm:w-[140px] sm:flex-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({projectBugs.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({stats.open + stats.inProgress})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredBugs.length === 0 ? (
            <Card className="card-base">
              <CardContent className="p-12 text-center">
                <Bug className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bugs found</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                  Report a bug
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBugs.map((bug, i) => {
              const reporter = getUserById(bug.reportedBy);
              const assignee = bug.assigneeId ? getUserById(bug.assigneeId) : null;
              return (
                <Card
                  key={bug.id}
                  className="card-base hover:border-gray-200 transition-all duration-200 stagger-item cursor-pointer"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setShowDetailDialog(bug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0">{severityIcon(bug.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{bug.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{bug.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={cn("text-[10px]", severityColors[bug.severity])}>
                              {bug.severity}
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              {statusIcon(bug.status)}
                              <span className="text-xs text-gray-500 capitalize">{bug.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[7px]">{reporter ? getInitials(reporter.name) : "?"}</AvatarFallback>
                            </Avatar>
                            <span>{reporter?.name}</span>
                          </div>
                          <span>·</span>
                          <span>{formatRelativeTime(bug.createdAt)}</span>
                          {assignee && (
                            <>
                              <span>·</span>
                              <span className="text-violet-600">→ {assignee.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Create Bug Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Report a Bug
            </DialogTitle>
            <DialogDescription>Provide details about the issue you found.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Brief description of the bug..." />
            </div>

            {/* AI Prioritization */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={analyzeWithAI} disabled={!formTitle.trim() || aiLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}>
                  {aiLoading
                    ? <div className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <Cpu className="h-3.5 w-3.5" />
                  }
                  {aiLoading ? "Analyzing..." : "🤖 AI Analyze Severity"}
                </button>
                {aiSuggestion && (
                  <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                    aiSuggestion.severity === "critical" ? "bg-red-100 text-red-700 border-red-200" :
                    aiSuggestion.severity === "major"    ? "bg-orange-100 text-orange-700 border-orange-200" :
                                                           "bg-blue-100 text-blue-700 border-blue-200"
                  )}>
                    <Sparkles className="h-3 w-3" />
                    {aiSuggestion.severity.toUpperCase()}
                  </span>
                )}
              </div>
              {aiSuggestion && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-violet-800">AI Analysis Result</p>
                      <p className="text-xs text-violet-600 mt-0.5">{aiSuggestion.reason}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-violet-200">
                    <div className="text-center">
                      <p className="text-[10px] text-violet-500 font-medium">Severity</p>
                      <p className="text-xs font-black text-violet-800 capitalize">{aiSuggestion.severity}</p>
                    </div>
                    <div className="text-center border-x border-violet-200">
                      <p className="text-[10px] text-violet-500 font-medium">Est. Time</p>
                      <p className="text-xs font-black text-violet-800">{(aiSuggestion as any).estimatedTime || "—"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-violet-500 font-medium">Confidence</p>
                      <p className="text-xs font-black text-violet-800">{(aiSuggestion as any).confidence || "—"}</p>
                    </div>
                  </div>
                  {(aiSuggestion as any).suggestedTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-violet-200">
                      {(aiSuggestion as any).suggestedTags.slice(0, 5).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What happened? What was expected?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Steps to Reproduce</Label>
              <Textarea
                value={formSteps}
                onChange={(e) => setFormSteps(e.target.value)}
                placeholder={"1. Go to page...\n2. Click on...\n3. Observe..."}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select value={formSeverity} onValueChange={(v) => setFormSeverity(v as Severity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Developer</Label>
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
            <div className="space-y-2">
              <Label>Screenshot (optional)</Label>
              <label className="block border border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-violet-600/50 transition-colors cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                {screenshotPreview ? (
                  <div className="space-y-2">
                    <img src={screenshotPreview} alt="Screenshot preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                    <p className="text-xs text-gray-500">{screenshotFile?.name} · Click to change</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Click or drag to upload screenshot</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleCreateBug} disabled={!formTitle.trim()}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Submit Bug Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bug Detail Dialog */}
      <Dialog open={!!showDetailDialog} onOpenChange={(open) => {
        if (!open) { setShowDetailDialog(null); setComments([]); setCommentText(""); }
      }}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          {showDetailDialog && (() => {
            const bug = showDetailDialog;
            const reporter = getUserById(bug.reportedBy);
            const assignee = bug.assigneeId ? getUserById(bug.assigneeId) : null;
            const isAssignedToMe = bug.assigneeId === currentUser?.id;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {severityIcon(bug.severity)}
                    <Badge className={cn("text-[10px]", severityColors[bug.severity])}>{bug.severity}</Badge>
                    <Badge variant="outline" className={cn("text-[10px] capitalize",
                      bug.status === "resolved" ? "border-emerald-300 text-emerald-600" :
                      bug.status === "in-progress" ? "border-amber-300 text-amber-600" :
                      "border-red-300 text-red-600"
                    )}>{bug.status}</Badge>
                  </div>
                  <DialogTitle className="text-lg">{bug.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-sm text-gray-900">{bug.description || "No description provided."}</p>
                  </div>

                  {/* Steps */}
                  {bug.stepsToReproduce && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Steps to Reproduce</h4>
                      <pre className="text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-800">
                        {bug.stepsToReproduce}
                      </pre>
                    </div>
                  )}

                  {/* Screenshot */}
                  {bug.screenshotUrl && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Screenshot</h4>
                      <img src={bug.screenshotUrl} alt="Bug screenshot" className="rounded-lg border border-gray-200 max-h-48 object-contain" />
                    </div>
                  )}

                  {/* Reporter / Assignee */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Reported By</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px]">{reporter ? getInitials(reporter.name) : "?"}</AvatarFallback>
                        </Avatar>
                        <span>{reporter?.name}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Assigned To</h4>
                      <div className="flex items-center gap-2">
                        {assignee ? (
                          <>
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px]">{getInitials(assignee.name)}</AvatarFallback>
                            </Avatar>
                            <span>{assignee.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Comments / Communication ── */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Comments ({comments.length})
                    </h4>

                    {/* Comment list */}
                    <ScrollArea className="max-h-48 mb-3">
                      {loadingComments ? (
                        <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
                      ) : comments.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      ) : (
                        <div className="space-y-3 pr-2">
                          {comments.map((c) => {
                            const author = getUserById(c.userId) || c.user;
                            const isMe = c.userId === currentUser?.id;
                            return (
                              <div key={c.id} className={cn("flex gap-2.5", isMe && "flex-row-reverse")}>
                                <Avatar className="h-6 w-6 shrink-0">
                                  <AvatarFallback className="text-[9px] bg-purple-100 text-purple-700">
                                    {author ? getInitials(author.name) : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "max-w-[75%] rounded-xl px-3 py-2 text-xs",
                                  isMe
                                    ? "bg-violet-100 text-violet-800 rounded-tr-none"
                                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                                )}>
                                  <p className={cn("font-semibold text-[10px] mb-0.5", isMe ? "text-violet-600 text-right" : "text-gray-500")}>
                                    {isMe ? "You" : (author?.name || "Unknown")}
                                  </p>
                                  <p className="leading-relaxed">{c.content}</p>
                                  <p className={cn("text-[10px] mt-1 opacity-60", isMe && "text-right")}>
                                    {formatRelativeTime(c.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Comment input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendComment(bug.id))}
                        className="text-sm h-9"
                      />
                      <button
                        onClick={() => handleSendComment(bug.id)}
                        disabled={!commentText.trim() || sendingComment}
                        className="px-3 py-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 disabled:opacity-40 transition-colors"
                      >
                        {sendingComment
                          ? <div className="h-4 w-4 rounded-full border-2 border-violet-400/40 border-t-violet-600 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <DialogFooter className="flex-row gap-2 flex-wrap">
                  {/* Developer: Mark as resolved */}
                  {isAssignedToMe && bug.status !== "resolved" && bug.status !== "closed" && (
                    <button
                      onClick={() => handleMarkResolved(bug)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Resolved
                    </button>
                  )}

                  {/* Admin: change status */}
                  {permissions.changeBugStatus && (
                    <Select
                      value={bug.status}
                      onValueChange={(v) => {
                        handleStatusChange(bug.id, v as BugStatus);
                        setShowDetailDialog({ ...bug, status: v as BugStatus });
                      }}
                    >
                      <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Admin: delete */}
                  {permissions.deleteBug && (
                    <button
                      onClick={() => { deleteBug(bug.id); setShowDetailDialog(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
