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
    <div className="space-y-10 animate-slide-up max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-[#0f1729] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">External Sync</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            GitHub <span className="text-white/60 underline decoration-slate-200 underline-offset-8">Intelligence</span>
          </h1>
          <p className="text-white/60 mt-2 font-medium max-w-xl">
            Synchronize your local development environment with global VCS repositories. Map defects and requirements to remote issues and pull requests.
          </p>
        </div>
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:border-white/10 hover:bg-white/5 transition-all shadow-sm">
            <ExternalLink className="h-4 w-4" /> REPOSITORY
          </a>
        )}
      </div>

      {/* Connect Repo */}
      <div className="card-base rounded-2xl p-6">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
          <Github className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">Connection Endpoint</p>
              <h2 className="text-lg font-black tracking-tight">{repoUrl ? "REPOSITORY SYNCHRONIZED" : "INITIALIZE CONNECTION"}</h2>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input value={repoInput} onChange={(e) => setRepoInput(e.target.value)}
              placeholder="https://github.com/owner/repository" 
              className="h-14 bg-white/5 border-white/10 focus:border-indigo-500/50 text-white !rounded-2xl font-mono text-xs" />
            <Button onClick={handleSaveRepo} disabled={!repoInput.trim()} className="h-14 px-8 !rounded-2xl !bg-white/5 !text-slate-950 font-black text-xs uppercase tracking-widest hover:!bg-white/10">
              {repoSaved ? "SAVED" : <><Save className="h-4 w-4 mr-2" /> COMMIT URL</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "TOTAL OBJECTS",   value: allItems.length,                          icon: Github,    bg: "bg-white/5 text-white/65" },
          { label: "ACTIVE ISSUES", value: linkedIssues.length,                      icon: AlertCircle,    bg: "bg-indigo-50 text-violet-400" },
          { label: "PULL REQUESTS",    value: linkedPRs.length,                         icon: GitPullRequest,    bg: "bg-emerald-50 text-emerald-600" },
          { label: "PENDING SYNC",      value: allItems.filter((i) => !i.link).length,   icon: Link2Off,    bg: "bg-rose-50 text-rose-600" },
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

      {/* Tabs + Item List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/6 pb-4">
          <TabsList className="bg-white/5 gap-8 h-auto p-0">
            {[
              { id: "all", label: "ALL ENTITIES", count: allItems.length },
              { id: "issues", label: "TRACKED ISSUES", count: linkedIssues.length },
              { id: "prs", label: "PULL REQUESTS", count: linkedPRs.length },
            ].map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} 
                className="p-0 h-10 bg-white/5 border-b-2 border-transparent data-[state=active]:border-white/10 data-[state=active]:bg-white/5 rounded-none flex items-center gap-2 group">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/65 group-hover:text-white/70 group-data-[state=active]:text-white transition-colors">{tab.label}</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-black text-white/60 group-data-[state=active]:bg-[#0f1729] group-data-[state=active]:text-white transition-all">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4 outline-none">
          {tabItems.length === 0 ? (
            <div className="card-base rounded-2xl p-6">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/6 flex items-center justify-center mx-auto mb-6">
                <Link2Off className="h-10 w-10 text-white/30" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Isolated Environment</h3>
              <p className="text-[10px] font-bold text-white/65 uppercase tracking-widest mt-2 max-w-xs mx-auto">
                No external VCS mappings detected. Initialize synchronization on any project entity.
              </p>
            </div>
          ) : (
            tabItems.map((item) => (
              <div key={item.id} className="card-base rounded-2xl p-6">
                <div className="p-6 sm:p-8 flex items-center gap-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover:scale-110",
                    item.kind === "bug" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-violet-400 border-indigo-100")}>
                    {item.kind === "bug" ? <Bug className="h-6 w-6" /> : <CheckSquare className="h-6 w-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-white tracking-tight truncate group-hover:text-violet-400 transition-colors">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest",
                            item.kind === "bug" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-violet-400 border-indigo-100")}>
                            {item.kind}
                          </span>
                          <span className="text-[10px] font-bold text-white/65 uppercase tracking-tighter">{item.status.replace('-', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.link ? (
                          <div className="flex items-center gap-2">
                            <a href={item.link.url} target="_blank" rel="noopener noreferrer"
                              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                item.link.type === "issue" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20")}>
                              {item.link.type === "issue" ? <Link2 className="h-3.5 w-3.5" /> : <GitPullRequest className="h-3.5 w-3.5" />}
                              #{item.link.number}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                            <button onClick={() => handleOpenLinkForm(item.id, item.link!.type)}
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/6 flex items-center justify-center text-white/65 hover:text-violet-400 hover:border-indigo-200 transition-all">
                              <Save className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleRemoveLink(item.id)}
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/6 flex items-center justify-center text-white/65 hover:text-rose-600 hover:border-rose-200 transition-all">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleOpenLinkForm(item.id, item.kind === "bug" ? "issue" : "pr")}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:border-indigo-600 hover:text-violet-400 transition-all shadow-sm">
                            <Plus className="h-4 w-4" /> ESTABLISH SYNC
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Form */}
                    {linkForm?.itemId === item.id && (
                      <div className="mt-8 p-8 rounded-[2rem] bg-white/5 border border-white/6 animate-slide-up space-y-6">
                        <div className="flex gap-4">
                          {(["issue", "pr"] as const).map((t) => (
                            <button key={t}
                              onClick={() => setLinkForm((f) => f ? { ...f, type: t } : f)}
                              className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 justify-center",
                                linkForm.type === t ? "bg-[#0f1729] text-white shadow-xl" : "bg-white/5 border border-white/10 text-white/60 hover:border-indigo-300")}
                            >
                              {t === "issue" ? <Link2 className="h-4 w-4" /> : <GitPullRequest className="h-4 w-4" />}
                              {t === "issue" ? "ISSUE OBJECT" : "PULL REQUEST"}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Reference Number</Label>
                            <Input value={linkForm.number}
                              onChange={(e) => setLinkForm((f) => f ? { ...f, number: e.target.value } : f)}
                              placeholder="e.g. 1024" className="h-12 !rounded-xl bg-white/5 border-white/10 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/65 ml-1">Override URL (Optional)</Label>
                            <Input value={linkForm.url}
                              onChange={(e) => setLinkForm((f) => f ? { ...f, url: e.target.value } : f)}
                              placeholder="Leave blank for auto-generation" className="h-12 !rounded-xl bg-white/5 border-white/10 font-mono text-xs" />
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                          <button onClick={() => setLinkForm(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-white/70">Discard</button>
                          <Button onClick={handleSaveLink} className="px-8 h-12 !rounded-xl !bg-indigo-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                            CONFIRM SYNC
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
