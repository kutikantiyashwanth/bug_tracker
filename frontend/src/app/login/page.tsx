"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { Input } from "@/components/ui/input";
import {
  Bug, ArrowRight, Eye, EyeOff, Mail, Lock,
  AlertCircle, WifiOff, Shield, Code2, TestTube2,
  ChevronLeft, Hash, CheckCircle2, Sparkles, Zap,
  Activity, GitBranch, AlertTriangle, TrendingUp,
  Circle, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "admin" | "developer" | "tester";
type Step = "role" | "login" | "invite";

const ROLES = [
  {
    id: "admin" as RoleType,
    label: "Admin / Team Lead",
    desc: "Create projects, manage team & full access",
    icon: Shield,
    gradient: "from-violet-600 to-purple-700",
    ring: "ring-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20 hover:border-violet-500/50",
  },
  {
    id: "developer" as RoleType,
    label: "Developer",
    desc: "Join via invite code, build & fix bugs",
    icon: Code2,
    gradient: "from-blue-600 to-cyan-600",
    ring: "ring-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/50",
    tag: "Most common",
  },
  {
    id: "tester" as RoleType,
    label: "QA Tester",
    desc: "Join via invite code, test & report bugs",
    icon: TestTube2,
    gradient: "from-amber-500 to-orange-600",
    ring: "ring-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/50",
  },
];

// Fake bug stats for the visual panel
const STATS = [
  { label: "Critical", count: 3, color: "#f43f5e", pct: 15 },
  { label: "Major", count: 12, color: "#f97316", pct: 45 },
  { label: "Minor", count: 8, color: "#3b82f6", pct: 30 },
  { label: "Resolved", count: 24, color: "#10b981", pct: 80 },
];

const RECENT = [
  { title: "Login button unresponsive on Safari", sev: "critical", time: "2m ago" },
  { title: "Chat messages duplicated on reconnect", sev: "major", time: "15m ago" },
  { title: "Profile image pixelated on upload", sev: "minor", time: "1h ago" },
  { title: "Missing validation on email field", sev: "resolved", time: "2h ago" },
];

const SEV_COLOR: Record<string, string> = {
  critical: "bg-rose-500",
  major: "bg-orange-400",
  minor: "bg-blue-400",
  resolved: "bg-emerald-400",
};

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
        setErrorType("network"); setError("Cannot connect to server. Make sure the backend is running.");
      } else {
        setErrorType("credentials"); setError("Wrong email or password. Please try again.");
      }
    }
  };

  const handleJoinProject = async () => {
    if (!inviteCode.trim()) { setError("Please enter an invite code."); setErrorType("invite"); return; }
    setError(""); setJoining(true);
    try {
      const ok = await joinProject(inviteCode.trim());
      if (ok) router.push("/dashboard");
      else { setErrorType("invite"); setError("Invalid invite code. Ask your team lead for the correct code."); }
    } catch { setErrorType("invite"); setError("Failed to join project. Please try again."); }
    finally { setJoining(false); }
  };

  const handleDemoLogin = async () => {
    setError("");
    try { await login("admin@test.com", "password123"); router.push("/dashboard"); }
    catch { setErrorType("network"); setError("Cannot connect to server."); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0f" }}>

      {/* ══ LEFT PANEL — Dark Bug Tracker Dashboard Preview ══ */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d0d1a 0%, #0a0a14 60%, #0d0a1a 100%)" }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-[-100px] right-[-50px] w-[300px] h-[300px] rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />

        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">BugTracker</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/40 text-[10px]">Live · All systems operational</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <Activity className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-violet-300 text-xs font-semibold">Real-time Bug Tracking Platform</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Track. Fix.<br />
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Ship faster.
              </span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              The complete bug tracking and project management platform built for student teams and hackathons.
            </p>
          </div>

          {/* Bug severity chart */}
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-violet-400" />
                <span className="text-white/70 text-xs font-semibold">Bug Overview</span>
              </div>
              <span className="text-white/30 text-[10px]">Last 7 days</span>
            </div>
            <div className="space-y-3">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span style={{ color: s.color }} className="font-semibold">{s.label}</span>
                    <span className="text-white/40">{s.count} bugs</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent bugs */}
          <div className="rounded-2xl p-5 flex-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-white/70 text-xs font-semibold">Recent Reports</span>
            </div>
            <div className="space-y-3">
              {RECENT.map((bug, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", SEV_COLOR[bug.sev])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs truncate">{bug.title}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{bug.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-[10px] mt-6">© 2026 Student Bug Tracker · Built for teams</p>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Auth Form ══ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: "#0f0f1a" }}>
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BugTracker</span>
          </div>

          {/* ── STEP 1: Role Selection ── */}
          {step === "role" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
                <p className="text-white/40 text-sm mt-1">Select your role to continue</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((role, i) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left",
                      "hover:scale-[1.01]", role.border
                    )}
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", role.gradient)}>
                      <role.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{role.label}</span>
                        {role.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>{role.tag}</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{role.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-white/30" style={{ background: "#0f0f1a" }}>or quick access</span>
                </div>
              </div>

              <button onClick={handleDemoLogin} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                {isLoading
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                  : <Sparkles className="h-4 w-4 text-amber-400" />
                }
                Try Demo Account
              </button>

              <p className="text-center text-sm text-white/30">
                No account?{" "}
                <Link href="/register" className="font-bold transition-colors" style={{ color: "#a78bfa" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}>
                  Create Account →
                </Link>
              </p>

              <p className="text-center text-xs text-white/20">Demo: admin@test.com / password123</p>
            </div>
          )}

          {/* ── STEP 2: Login Form ── */}
          {step === "login" && roleInfo && (
            <div className="space-y-5 animate-fade-in">
              <button onClick={() => { setStep("role"); setError(""); }}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors group mb-2">
                <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to roles
              </button>

              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br", roleInfo.gradient)}>
                  <roleInfo.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Sign in</h2>
                  <p className="text-xs text-white/40">as {roleInfo.label}</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <input type="text" className="hidden" autoComplete="off" readOnly />
                <input type="password" className="hidden" autoComplete="new-password" readOnly />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <input type="email" placeholder="you@company.com" value={email}
                      autoComplete="username"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 h-12 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••••"
                      autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-11 h-12 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={cn("flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 animate-fade-in",
                    errorType === "network"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  )}>
                    {errorType === "network" ? <WifiOff className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                    <span>{error}</span>
                  </div>
                )}

                {/* Developer/Tester info */}
                {selectedRole !== "admin" && (
                  <div className="rounded-xl px-4 py-3"
                    style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <p className="text-xs font-semibold text-blue-400 mb-1">
                      {selectedRole === "developer" ? "👨‍💻 Developer Account" : "🧪 Tester Account"}
                    </p>
                    <p className="text-xs text-blue-300/60">
                      After signing in, you'll need an <strong className="text-blue-300/80">invite code</strong> from your Admin to join a project.
                    </p>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90 hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                  {isLoading
                    ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <>{selectedRole === "admin" ? "Sign in to Dashboard" : "Sign in"} <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-white/30">
                No account?{" "}
                <Link href="/register" className="font-bold" style={{ color: "#a78bfa" }}>Create one free →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 3: Invite Code ── */}
          {step === "invite" && roleInfo && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Signed in successfully!</p>
                  <p className="text-xs text-emerald-400/60 mt-0.5">Now join your project to get started</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br", roleInfo.gradient)}>
                  <roleInfo.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Join a Project</h2>
                  <p className="text-xs text-white/40">Enter the invite code from your team lead</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Project Invite Code</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                  <input placeholder="xxxxxxxx-xxxx-xxxx-xxxx" value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setError(""); }}
                    autoFocus
                    className="w-full pl-10 h-12 rounded-xl font-mono text-sm text-white placeholder:text-white/20 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
                <p className="text-xs text-white/25">Ask your Admin / Team Lead for the invite code</p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                {joining
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <>Join Project & Open Dashboard <ArrowRight className="h-4 w-4" /></>
                }
              </button>

              <button onClick={() => router.push("/dashboard")}
                className="w-full text-sm text-white/25 hover:text-white/50 transition-colors py-1">
                Skip for now — I'll join later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
