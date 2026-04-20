"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store-api";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Github, ExternalLink, Link2, Link2Off, GitPullRequest,
  Bug, CheckSquare, Plus, X, Save, AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────────────
interface GitHubLink { type: "issue" | "pr"; url: string; number: string; }
type GitHubLinks = Record<string, GitHubLink>;
interface LinkFormState { itemId: string; type: "issue" | "pr"; number: string; url: string; }

// ── Helpers ────────────────────────────────────────────────────────────────
function loadLinks(projectId: string): GitHubLinks {
  try { return JSON.parse(localStorage.getItem(`github_links_${projectId}`) || "{}"); } catch { return {}; }
}
function saveLinks(projectId: string, links: GitHubLinks) {
  localStorage.setItem(`github_links_${projectId}`, JSON.stringify(links));
}
function loadRepoUrl(projectId: string): string {
  return localStorage.getItem(`github_repo_${projectId}`) || "";
}
function saveRepoUrl(projectId: string, url: string) {
  localStorage.setItem(`github_repo_${projectId}`, url);
}
function buildUrl(repoUrl: string, type: "issue" | "pr", number: string): string {
  const base = repoUrl.replace(/\/$/, "");
  return type === "issue" ? `${base}/issues/${number}` : `${base}/pull/${number}`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function GitHubPage() {
  const { activeProjectId, projects, tasks, bugs } = useStore();

  const activeProject = useMemo(
    () => (Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined),
    [projects, activeProjectId]
  );
  const projectTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks.filter((t) => t.projectId === activeProjectId) : []),
    [tasks, activeProjectId]
  );
  const projectBugs = useMemo(
    () => (Array.isArray(bugs) ? bugs.filter((b) => b.projectId === activeProjectId) : []),
    [bugs, activeProjectId]
  );

  const [repoUrl, setRepoUrl]     = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [repoSaved, setRepoSaved] = useState(false);
  const [links, setLinks]         = useState<GitHubLinks>({});
  const [activeTab, setActiveTab] = useState("all");
  const [linkForm, setLinkForm]   = useState<LinkFormState | null>(null);

  useEffect(() => {
    if (!activeProjectId) return;
    const url = loadRepoUrl(activeProjectId);
    setRepoUrl(url); setRepoInput(url);
    setLinks(loadLinks(activeProjectId));
  }, [activeProjectId]);

  const handleSaveRepo = () => {
    if (!activeProjectId) return;
    const trimmed = repoInput.trim();
    saveRepoUrl(activeProjectId, trimmed);
    setRepoUrl(trimmed);
    setRepoSaved(true);
    setTimeout(() => setRepoSaved(false), 2000);
  };

  const handleOpenLinkForm = (itemId: string, defaultType: "issue" | "pr") => {
    const existing = links[itemId];
    setLinkForm({ itemId, type: existing?.type ?? defaultType, number: existing?.number ?? "", url: existing?.url ?? "" });
  };

  const handleSaveLink = () => {
    if (!linkForm || !activeProjectId) return;
    const { itemId, type, number, url } = linkForm;
    if (!number.trim() && !url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl && repoUrl && number.trim()) finalUrl = buildUrl(repoUrl, type, number.trim());
    const updated: GitHubLinks = { ...links, [itemId]: { type, number: number.trim(), url: finalUrl } };
    setLinks(updated);
    saveLinks(activeProjectId, updated);
    setLinkForm(null);
  };

  const handleRemoveLink = (itemId: string) => {
    if (!activeProjectId) return;
    const updated = { ...links };
    delete updated[itemId];
    setLinks(updated);
    saveLinks(activeProjectId, updated);
  };

  type ItemEntry = { id: string; title: string; kind: "task" | "bug"; status: string; link: GitHubLink | undefined; };
  const allItems: ItemEntry[] = [
    ...projectTasks.map((t) => ({ id: t.id, title: t.title, kind: "task" as const, status: t.status, link: links[t.id] })),
    ...projectBugs.map((b)  => ({ id: b.id, title: b.title, kind: "bug"  as const, status: b.status, link: links[b.id] })),
  ];
  const linkedIssues = allItems.filter((i) => i.link?.type === "issue");
  const linkedPRs    = allItems.filter((i) => i.link?.type === "pr");
  const tabItems = activeTab === "issues" ? linkedIssues : activeTab === "prs" ? linkedPRs : allItems;

  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl icon-purple flex items-center justify-center">
          <Github className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center">No Project Selected</h2>
        <p className="text-sm text-gray-500 text-center">Select a project from the sidebar to manage GitHub links.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 github-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 page-title">
            <Github className="h-6 w-6 text-gray-700" />
            GitHub Integration
          </h1>
          <p className="text-sm text-gray-500 mt-1">Link bugs and tasks to GitHub issues and pull requests</p>
        </div>
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full sm:w-auto"
            style={{ background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.2)", color: "#7c3aed" }}>
            <ExternalLink className="h-3.5 w-3.5" /> View Repo
          </a>
        )}
      </div>

      {/* ── Connect Repo ── */}
      <Card className="card-base">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 icon-purple rounded-xl flex items-center justify-center shrink-0">
              <Github className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-900">Connect Repository</h2>
              <p className="text-xs text-gray-500 truncate">
                {repoUrl ? `Connected: ${repoUrl}` : "Enter your GitHub repository URL"}
              </p>
            </div>
            {repoUrl && (
              <span className="pill-emerald shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Connected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Input value={repoInput} onChange={(e) => setRepoInput(e.target.value)}
              placeholder="https://github.com/owner/repo" className="flex-1 min-w-0" />
            <Button onClick={handleSaveRepo} disabled={!repoInput.trim()} className="shrink-0"
              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)", color: "white" }}>
              {repoSaved ? "Saved!" : <><Save className="h-4 w-4 mr-1 hidden sm:inline" /> Save</>}
            </Button>
          </div>
          {!repoUrl && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Issue/PR URLs will be auto-generated once a repo is connected.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stat-grid">
        {[
          { label: "Total Items",   value: allItems.length,                          color: "text-gray-700",    bg: "bg-gray-100" },
          { label: "Linked Issues", value: linkedIssues.length,                      color: "text-violet-700",  bg: "bg-violet-100" },
          { label: "Linked PRs",    value: linkedPRs.length,                         color: "text-blue-700",    bg: "bg-blue-100" },
          { label: "Unlinked",      value: allItems.filter((i) => !i.link).length,   color: "text-gray-500",    bg: "bg-gray-100" },
        ].map((s) => (
          <Card key={s.label} className="card-base">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                <span className={cn("text-base font-bold", s.color)}>{s.value}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs + Item List ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none">All ({allItems.length})</TabsTrigger>
          <TabsTrigger value="issues" className="flex-1 sm:flex-none">Issues ({linkedIssues.length})</TabsTrigger>
          <TabsTrigger value="prs" className="flex-1 sm:flex-none">PRs ({linkedPRs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-2">
          {tabItems.length === 0 ? (
            <Card className="card-base">
              <CardContent className="p-10 sm:p-12 text-center">
                <div className="w-14 h-14 icon-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Link2Off className="h-7 w-7" />
                </div>
                <p className="text-gray-700 font-semibold">
                  {activeTab === "all" ? "No bugs or tasks yet" : `No ${activeTab === "issues" ? "linked issues" : "linked PRs"} yet`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {activeTab === "all" ? "Create bugs or tasks in your project first." : "Click \"Link to GitHub\" on any item to get started."}
                </p>
              </CardContent>
            </Card>
          ) : (
            tabItems.map((item, i) => (
              <Card key={item.id} className="card-base stagger-item" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      item.kind === "bug" ? "icon-rose" : "icon-violet")}>
                      {item.kind === "bug" ? <Bug className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="pill-gray text-[10px] capitalize">{item.kind}</span>
                            <span className="text-[10px] text-gray-400 capitalize">{item.status}</span>
                          </div>
                        </div>
                        {item.link ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <a href={item.link.url} target="_blank" rel="noopener noreferrer"
                              className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80",
                                item.link.type === "issue" ? "pill-purple" : "pill-blue")}>
                              {item.link.type === "issue" ? <Link2 className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />}
                              {item.link.type === "issue" ? "Issue" : "PR"} #{item.link.number}
                              <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                            </a>
                            <button onClick={() => handleOpenLinkForm(item.id, item.link!.type)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all" title="Edit">
                              <Link2 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleRemoveLink(item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Remove">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleOpenLinkForm(item.id, item.kind === "bug" ? "issue" : "pr")}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 w-full sm:w-auto justify-center sm:justify-start"
                            style={{ background: "rgba(109,40,217,0.06)", border: "1px solid rgba(109,40,217,0.2)", color: "#7c3aed" }}>
                            <Plus className="h-3 w-3" /> Link to GitHub
                          </button>
                        )}
                      </div>

                      {/* Inline link form */}
                      {linkForm?.itemId === item.id && (
                        <div className="mt-3 p-3 rounded-xl space-y-3 animate-fade-in"
                          style={{ background: "rgba(109,40,217,0.04)", border: "1px solid rgba(109,40,217,0.15)" }}>
                          <div className="flex gap-2">
                            {(["issue", "pr"] as const).map((t) => (
                              <button key={t}
                                onClick={() => setLinkForm((f) => f ? { ...f, type: t } : f)}
                                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 justify-center",
                                  linkForm.type === t ? "text-white" : "text-gray-500 bg-white border border-gray-200 hover:border-violet-300")}
                                style={linkForm.type === t ? { background: "linear-gradient(135deg, #6d28d9, #2563eb)" } : {}}>
                                {t === "issue" ? <Link2 className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />}
                                {t === "issue" ? "Issue" : "Pull Request"}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Number *</Label>
                              <Input value={linkForm.number}
                                onChange={(e) => setLinkForm((f) => f ? { ...f, number: e.target.value } : f)}
                                placeholder="e.g. 42" className="h-8 text-xs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">URL (optional)</Label>
                              <Input value={linkForm.url}
                                onChange={(e) => setLinkForm((f) => f ? { ...f, url: e.target.value } : f)}
                                placeholder={repoUrl ? "Auto-generated" : "https://github.com/..."} className="h-8 text-xs" />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setLinkForm(null)}>Cancel</Button>
                            <Button size="sm" className="h-7 text-xs"
                              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)", color: "white" }}
                              onClick={handleSaveLink} disabled={!linkForm.number.trim() && !linkForm.url.trim()}>
                              <Save className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
