

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
    setRepoUrl(url);
    setRepoInput(url);
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
    setLinkForm({
      itemId,
      type:   existing?.type   ?? defaultType,
      number: existing?.number ?? "",
      url:    existing?.url    ?? "",
    });
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
  const tabItems     = activeTab === "issues" ? linkedIssues : activeTab === "prs" ? linkedPRs : allItems;

  // ── No project selected ──
  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Github className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Project Selected</h2>
        <p className="text-sm text-slate-500">Select a project from the sidebar to manage GitHub links.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up max-w-4xl">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-slate-900 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {activeProject?.name}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Github className="h-8 w-8" />
            GitHub Integration
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm">
            Link your tasks and bugs to GitHub issues and pull requests.
            Paste your repo URL below, then attach issue/PR numbers to any item.
          </p>
        </div>
        {repoUrl && (
          <a
            href={repoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold hover:border-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ExternalLink className="h-4 w-4" /> Open Repository
          </a>
        )}
      </div>

      {/* ── Connect Repository ── */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
          <Github className="h-36 w-36 text-slate-900" />
        </div>
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Repository URL</p>
              <h2 className="text-base font-black text-slate-900">
                {repoUrl ? "Repository connected ✓" : "Connect your GitHub repository"}
              </h2>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRepo()}
              placeholder="https://github.com/your-username/your-repo"
              className="github-url-input"
            />
            <button
              onClick={handleSaveRepo}
              disabled={!repoInput.trim()}
              className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-colors shrink-0 disabled:opacity-40 flex items-center gap-2"
            >
              {repoSaved
                ? <><Check className="h-4 w-4 text-emerald-400" /> Saved</>
                : <><Save className="h-4 w-4" /> Save URL</>
              }
            </button>
          </div>

          {repoUrl && (
            <p className="text-xs text-slate-500 font-medium">
              Connected: <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline break-all">{repoUrl}</a>
            </p>
          )}
          {!repoUrl && (
            <p className="text-xs text-slate-400">
              e.g. <span className="font-mono text-slate-600">https://github.com/username/repo-name</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items",    value: allItems.length,                        icon: Github,        color: "bg-slate-100 text-slate-600" },
          { label: "Linked Issues",  value: linkedIssues.length,                    icon: AlertCircle,   color: "bg-indigo-50 text-indigo-600" },
          { label: "Pull Requests",  value: linkedPRs.length,                       icon: GitPullRequest,color: "bg-emerald-50 text-emerald-600" },
          { label: "Not Linked",     value: allItems.filter((i) => !i.link).length, icon: Link2Off,      color: "bg-rose-50 text-rose-600" },
        ].map((s) => (
          <div key={s.label} className="premium-card p-5 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Item List ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent gap-1 h-auto p-0 border-b border-slate-100 w-full justify-start rounded-none pb-0">
          {[
            { id: "all",    label: "All Items",      count: allItems.length },
            { id: "issues", label: "Issues",         count: linkedIssues.length },
            { id: "prs",    label: "Pull Requests",  count: linkedPRs.length },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id} value={tab.id}
              className="px-4 pb-3 h-auto bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent rounded-none flex items-center gap-2"
            >
              <span className="text-sm font-bold text-slate-500 data-[state=active]:text-slate-900">{tab.label}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
              )}>{tab.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 outline-none mt-0">
          {tabItems.length === 0 ? (
            <div className="premium-card p-16 text-center border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Link2Off className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No items here</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                {activeTab === "all"
                  ? "Create tasks or report bugs first, then link them to GitHub issues or PRs."
                  : `No ${activeTab === "issues" ? "GitHub issues" : "pull requests"} linked yet.`}
              </p>
            </div>
          ) : (
            tabItems.map((item) => (
              <div key={item.id} className="premium-card !p-0 overflow-hidden">
                <div className="p-5 sm:p-6 flex items-start gap-4">

                  {/* Icon */}
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
                    item.kind === "bug"
                      ? "bg-rose-50 text-rose-600 border-rose-100"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  )}>
                    {item.kind === "bug" ? <Bug className="h-5 w-5" /> : <CheckSquare className="h-5 w-5" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                            item.kind === "bug"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          )}>
                            {item.kind}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium capitalize">
                            {item.status.replace("-", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.link ? (
                          <>
                            <a
                              href={item.link.url} target="_blank" rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                item.link.type === "issue"
                                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              )}
                            >
                              {item.link.type === "issue"
                                ? <AlertCircle className="h-3.5 w-3.5" />
                                : <GitPullRequest className="h-3.5 w-3.5" />
                              }
                              #{item.link.number}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <button
                              onClick={() => handleOpenLinkForm(item.id, item.link!.type)}
                              title="Edit link"
                              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveLink(item.id)}
                              title="Remove link"
                              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenLinkForm(item.id, item.kind === "bug" ? "issue" : "pr")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" /> Link to GitHub
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline link form */}
                    {linkForm?.itemId === item.id && (
                      <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-slide-up">
                        <p className="text-xs font-bold text-slate-700">
                          Link <span className="text-indigo-600">{item.title}</span> to a GitHub issue or PR
                        </p>

                        {/* Issue / PR toggle */}
                        <div className="flex gap-2">
                          {(["issue", "pr"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setLinkForm((f) => f ? { ...f, type: t } : f)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold flex-1 justify-center transition-all border",
                                linkForm.type === t
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                              )}
                            >
                              {t === "issue"
                                ? <><AlertCircle className="h-3.5 w-3.5" /> Issue</>
                                : <><GitPullRequest className="h-3.5 w-3.5" /> Pull Request</>
                              }
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {linkForm.type === "issue" ? "Issue" : "PR"} Number
                            </Label>
                            <Input
                              value={linkForm.number}
                              onChange={(e) => setLinkForm((f) => f ? { ...f, number: e.target.value } : f)}
                              placeholder="e.g. 42"
                              className="h-11 rounded-xl bg-white border-slate-200 font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Custom URL <span className="text-slate-300 normal-case font-normal">(optional)</span>
                            </Label>
                            <Input
                              value={linkForm.url}
                              onChange={(e) => setLinkForm((f) => f ? { ...f, url: e.target.value } : f)}
                              placeholder={repoUrl ? "Auto-generated from repo URL" : "https://github.com/..."}
                              className="h-11 rounded-xl bg-white border-slate-200 font-mono text-xs"
                            />
                          </div>
                        </div>

                        {repoUrl && linkForm.number && !linkForm.url && (
                          <p className="text-[11px] text-slate-500">
                            Will link to:{" "}
                            <span className="font-mono text-indigo-600">
                              {buildUrl(repoUrl, linkForm.type, linkForm.number)}
                            </span>
                          </p>
                        )}

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setLinkForm(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <Button
                            onClick={handleSaveLink}
                            disabled={!linkForm.number.trim() && !linkForm.url.trim()}
                            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                          >
                            <Link2 className="h-3.5 w-3.5 mr-1.5" /> Save Link
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
