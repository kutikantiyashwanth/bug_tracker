"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import {
  Bug, ArrowRight, Eye, EyeOff, Mail, Lock,
  AlertCircle, WifiOff, Shield, Code2, TestTube2,
  ChevronLeft, Hash, CheckCircle2, Zap, Activity,
  TrendingUp, Users, GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "admin" | "developer" | "tester";
type Step = "role" | "login" | "invite";

const ROLES = [
  {
    id: "admin" as RoleType,
    label: "Admin",
    desc: "Full access & team management",
    icon: Shield,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
  },
  {
    id: "developer" as RoleType,
    label: "Developer",
    desc: "Build features & fix bugs",
    icon: Code2,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.3)",
    tag: "Most common",
  },
  {
    id: "tester" as RoleType,
    label: "QA Tester",
    desc: "Test & report issues",
    icon: TestTube2,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
];

const STATS = [
  { icon: Bug, label: "Bugs Tracked", value: "2.4K+", color: "#f43f5e" },
  { icon: CheckCircle2, label: "Resolved", value: "98%", color: "#10b981" },
  { icon: Users, label: "Teams", value: "500+", color: "#8b5cf6" },
  { icon: TrendingUp, label: "Uptime", value: "99.9%", color: "#06b6d4" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, joinProject, isLoading } = useStore();

  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"credentials" | "network" | "invite" | "general">("general");
  const [joining, setJoining] = useState(false);

  const roleInfo = ROLES.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setError("");
    setStep("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    try {
      await login(email, password);
      if (selectedRole === "admin") {
        router.push("/dashboard");
      } else {
        let attempts = 0;
        while (attempts < 6) {
          await new Promise((r) => setTimeout(r, 500));
          const state = useStore.getState();
          if (state.projects !== undefined) {
            if (state.projects.length > 0) { router.push("/dashboard"); return; }
            break;
          }
          attempts++;
        }
        const state = useStore.getState();
        if (state.projects?.length > 0) router.push("/dashboard");
        else setStep("invite");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (!window.navigator.onLine || msg.includes("connect") || msg.includes("network")) {
        setErrorType("network"); setError("Cannot connect to server.");
      } else {
        setErrorType("credentials"); setError("Invalid email or password.");
      }
    }
  };

  const handleJoinProject = async () => {
    if (!inviteCode.trim()) { setError("Please enter an invite code."); setErrorType("invite"); return; }
    setError(""); setJoining(true);
    try {
      const ok = await joinProject(inviteCode.trim());
      if (ok) router.push("/dashboard");
      else { setErrorType("invite"); setError("Invalid invite code. Ask your team lead."); }
    } catch { setErrorType("invite"); setError("Failed to join. Please try again."); }
    finally { setJoining(false); }
  };

  const handleDemoLogin = async () => {
    setError("");
    try { await login("admin@test.com", "password123"); router.push("/dashboard"); }
    catch { setErrorType("network"); setError("Cannot connect to server."); }
  };

  const inputCls = "w-full h-12 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all px-4";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="min-h-screen flex" style={{ background: "#050810" }}>

      {/* ══ LEFT — Premium showcase ══ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 60%), radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 60%), #050810"
        }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">Bug<span style={{ color: "#8b5cf6" }}>Tracker</span></p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <Zap className="h-3.5 w-3.5" style={{ color: "#8b5cf6" }} />
              <span className="text-xs font-semibold" style={{ color: "#c4b5fd" }}>Professional Bug Tracking Platform</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Ship software<br />
              <span style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                without bugs.
              </span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Track, assign, and resolve bugs in real-time. Built for student teams and professional developers.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-12">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}20` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-black text-white">{s.value}</p>
                  <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3 flex-1">
            {[
              { icon: Bug, text: "AI-powered bug severity analysis", color: "#f43f5e" },
              { icon: GitBranch, text: "Kanban board with real-time sync", color: "#8b5cf6" },
              { icon: Activity, text: "Live notifications & email alerts", color: "#06b6d4" },
              { icon: TrendingUp, text: "Analytics & productivity charts", color: "#10b981" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${f.color}20` }}>
                  <f.icon className="h-3.5 w-3.5" style={{ color: f.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>© 2026 BugTracker · Built for teams</p>
        </div>
      </div>

      {/* ══ RIGHT — Auth form ══ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#080b14" }}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BugTracker</span>
          </div>

          {/* ── STEP 1: Role ── */}
          {step === "role" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">Welcome back</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Select your role to continue</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = role.bg; e.currentTarget.style.borderColor = role.border; e.currentTarget.style.boxShadow = `0 0 20px ${role.glow}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: role.bg, border: `1px solid ${role.border}` }}>
                      <role.icon className="h-5 w-5" style={{ color: role.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{role.label}</span>
                        {role.tag && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(6,182,212,0.2)", color: "#67e8f9" }}>{role.tag}</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{role.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} /></div>
                <div className="relative flex justify-center"><span className="px-3 text-xs" style={{ background: "#080b14", color: "rgba(255,255,255,0.3)" }}>or</span></div>
              </div>

              <button onClick={handleDemoLogin} disabled={isLoading}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                {isLoading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : "✨"}
                Try Demo Account
              </button>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                No account? <Link href="/register" className="font-bold" style={{ color: "#a78bfa" }}>Create one →</Link>
              </p>
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>admin@test.com / password123</p>
            </div>
          )}

          {/* ── STEP 2: Login ── */}
          {step === "login" && roleInfo && (
            <div className="space-y-5 animate-fade-in">
              <button onClick={() => { setStep("role"); setError(""); }}
                className="flex items-center gap-1.5 text-xs mb-2 transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: roleInfo.bg, border: `1px solid ${roleInfo.border}` }}>
                  <roleInfo.icon className="h-5 w-5" style={{ color: roleInfo.color }} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Sign in</h2>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>as {roleInfo.label}</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className={cn(inputCls, "pl-10")} style={inputStyle}
                      onFocus={(e) => e.currentTarget.style.borderColor = `${roleInfo.color}80`}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className={cn(inputCls, "pl-10 pr-11")} style={inputStyle}
                      onFocus={(e) => e.currentTarget.style.borderColor = `${roleInfo.color}80`}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 animate-fade-in"
                    style={{ background: errorType === "network" ? "rgba(245,158,11,0.1)" : "rgba(244,63,94,0.1)", border: `1px solid ${errorType === "network" ? "rgba(245,158,11,0.2)" : "rgba(244,63,94,0.2)"}`, color: errorType === "network" ? "#fcd34d" : "#fda4af" }}>
                    {errorType === "network" ? <WifiOff className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                    <span>{error}</span>
                  </div>
                )}

                {selectedRole !== "admin" && (
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <p className="text-xs font-semibold" style={{ color: "#67e8f9" }}>After signing in, you'll need an invite code from your Admin to join a project.</p>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}cc)`, boxShadow: `0 8px 32px ${roleInfo.glow}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  {isLoading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                No account? <Link href="/register" className="font-bold" style={{ color: "#a78bfa" }}>Create one →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 3: Invite ── */}
          {step === "invite" && roleInfo && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Signed in!</p>
                  <p className="text-xs" style={{ color: "rgba(52,211,153,0.7)" }}>Now join your project</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Join a Project</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Enter the invite code from your Admin</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Invite Code</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                  <input placeholder="xxxxxxxx-xxxx-xxxx-xxxx" value={inviteCode} onChange={(e) => { setInviteCode(e.target.value); setError(""); }} autoFocus
                    className={cn(inputCls, "pl-10 font-mono")} style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#fda4af" }}>
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 8px 32px rgba(139,92,246,0.3)" }}>
                {joining ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Join Project <ArrowRight className="h-4 w-4" /></>}
              </button>

              <button onClick={() => router.push("/dashboard")} className="w-full text-sm py-1 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
