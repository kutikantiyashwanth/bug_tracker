"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import {
  Bug, ArrowRight, Eye, EyeOff, Mail, Lock,
  AlertCircle, Shield, Code2, TestTube2,
  ChevronLeft, Hash, CheckCircle2, Sparkles, Zap,
  Activity, GitBranch, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "admin" | "developer" | "tester";
type Step = "role" | "login" | "invite";

const ROLES = [
  {
    id: "admin" as RoleType,
    label: "Project Lead",
    desc: "Oversee operations, manage team dynamics & full authority",
    icon: Shield,
    gradient: "from-purple-600 to-purple-800",
    glowColor: "rgba(139,92,246,0.35)",
    borderHover: "hover:border-purple-500/60",
    borderActive: "border-purple-500/60",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    iconBg: "from-purple-600 to-purple-800",
  },
  {
    id: "developer" as RoleType,
    label: "Team Member",
    desc: "Technical implementation, engineering & feature development",
    icon: Code2,
    gradient: "from-cyan-600 to-cyan-800",
    glowColor: "rgba(6,182,212,0.35)",
    borderHover: "hover:border-cyan-500/60",
    borderActive: "border-cyan-500/60",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    iconBg: "from-cyan-600 to-cyan-800",
    tag: "Primary role",
  },
  {
    id: "tester" as RoleType,
    label: "QA Analyst",
    desc: "Quality inspection, validation & rigorous bug reporting",
    icon: TestTube2,
    gradient: "from-amber-500 to-amber-700",
    glowColor: "rgba(245,158,11,0.35)",
    borderHover: "hover:border-amber-500/60",
    borderActive: "border-amber-500/60",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    iconBg: "from-amber-500 to-amber-700",
  },
];

const STATS = [
  { label: "Bugs Tracked", value: "2,847", icon: Bug, color: "#8b5cf6", change: "+12%" },
  { label: "Resolved", value: "2,391", icon: CheckCircle2, color: "#06b6d4", change: "+8%" },
  { label: "Active Teams", value: "143", icon: Activity, color: "#f59e0b", change: "+5%" },
  { label: "Velocity", value: "94%", icon: TrendingUp, color: "#10b981", change: "+3%" },
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
        setError("Cannot connect to server. Make sure the backend is running.");
      } else {
        setError("Wrong email or password. Please try again.");
      }
    }
  };

  const handleJoinProject = async () => {
    if (!inviteCode.trim()) { setError("Please enter an invite code."); return; }
    setError(""); setJoining(true);
    try {
      const ok = await joinProject(inviteCode.trim());
      if (ok) router.push("/dashboard");
      else setError("Invalid invite code. Ask your team lead for the correct code.");
    } catch { setError("Failed to join project. Please try again."); }
    finally { setJoining(false); }
  };

  const handleDemoLogin = async () => {
    setError("");
    try { await login("admin@test.com", "password123"); router.push("/dashboard"); }
    catch { setError("Cannot connect to server."); }
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#050810" }}>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col relative overflow-hidden" style={{ background: "#070b18" }}>
        {/* Mesh gradient background */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.14) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)"
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
        {/* Glow orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float-slow"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 animate-float"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)", animationDelay: "2s" }} />

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in-down">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">Bug<span style={{ color: "#8b5cf6" }}>Tracker</span></span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">V2.4 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 mb-6">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Accelerate Your Workflow</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Track issues,<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                optimize flow.
              </span>
            </h1>
            <p className="text-white/40 mt-4 text-base leading-relaxed max-w-sm">
              The next-generation bug tracking platform built for high-performance student teams and engineering squads.
            </p>
          </div>

          {/* Stats grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {STATS.map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl border border-white/8 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                  <span className="text-[10px] font-bold text-emerald-400">{stat.change}</span>
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="space-y-2.5">
              {[
                { icon: Activity, label: "Real-time Sync", desc: "Instant updates across all team members" },
                { icon: Shield, label: "Role-Based Access", desc: "Secure, granular permission control" },
                { icon: GitBranch, label: "Sprint Management", desc: "Kanban boards with drag & drop" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-white/6"
                  style={{ background: "rgba(255,255,255,0.025)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <f.icon className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{f.label}</p>
                    <p className="text-white/35 text-[10px]">{f.desc}</p>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/8">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">© 2026 Student Bug Tracker · Built for teams</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative overflow-y-auto" style={{ background: "#080b14" }}>
        {/* Mobile gradient orbs */}
        <div className="lg:hidden absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-64 h-64 blur-[80px]" style={{ background: "rgba(139,92,246,0.08)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 blur-[80px]" style={{ background: "rgba(6,182,212,0.08)" }} />
        </div>

        <div className="w-full max-w-[440px] space-y-8">

          {/* STEP 1: Role Selection */}
          {step === "role" && (
            <div className="animate-slide-up space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight">Welcome back</h2>
                <p className="text-white/40 font-medium">Select your role to access your personalized workspace.</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "w-full group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left",
                      "border-white/8 hover:border-white/20"
                    )}
                    style={{ background: "rgba(255,255,255,0.025)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${role.glowColor}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300", role.iconBg)}>
                      <role.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-base font-bold text-white group-hover:transition-colors", role.text && `group-hover:${role.text}`)}>{role.label}</span>
                        {role.tag && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest"
                            style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}>
                            {role.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-medium mt-1 leading-relaxed">{role.desc}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Quick Access</span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>

                <button onClick={handleDemoLogin} disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-white/8 hover:border-white/20 transition-all text-sm font-bold text-white/60 hover:text-white/80 group"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  {isLoading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                      <span>Continue with Demo Account</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-2xl border border-rose-500/20 flex gap-3 animate-fade-in"
                  style={{ background: "rgba(244,63,94,0.08)" }}>
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <p className="text-xs font-bold text-rose-400 leading-relaxed">{error}</p>
                </div>
              )}

              <p className="text-center text-sm font-medium text-white/25">
                New to the platform?{" "}
                <Link href="/register" className="font-bold transition-colors hover:underline underline-offset-4" style={{ color: "#8b5cf6" }}>
                  Join our community
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2: Login Form */}
          {step === "login" && roleInfo && (
            <div className="animate-slide-up space-y-8">
              <button onClick={() => setStep("role")}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Roles
              </button>

              <div className="space-y-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-2xl", roleInfo.iconBg)}>
                  <roleInfo.icon className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-white tracking-tight">Sign In</h2>
                  <p className="text-white/40 font-medium">
                    Authenticating as <span className={cn("font-bold", roleInfo.text)}>{roleInfo.label}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Email Identity</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-purple-400 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full pl-12 pr-4 h-14 rounded-2xl text-white placeholder:text-white/20 outline-none transition-all font-medium"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Secure Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-purple-400 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full pl-12 pr-12 h-14 rounded-2xl text-white placeholder:text-white/20 outline-none transition-all font-medium"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl border border-rose-500/20 flex gap-3 animate-fade-in"
                    style={{ background: "rgba(244,63,94,0.08)" }}>
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <p className="text-xs font-bold text-rose-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all group"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                    boxShadow: "0 8px 32px rgba(139,92,246,0.3)",
                  }}>
                  {isLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-white/25">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-white/50 hover:text-white font-bold transition-colors">
                    Get started today
                  </Link>
                </p>
                <div className="p-4 rounded-2xl border border-white/8" style={{ background: "rgba(255,255,255,0.025)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Developer Preview Credentials</p>
                  <p className="text-xs font-mono mt-1" style={{ color: "rgba(139,92,246,0.8)" }}>admin@test.com / password123</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Invite Code */}
          {step === "invite" && roleInfo && (
            <div className="animate-slide-up space-y-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center border border-emerald-500/20"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">Authenticated</h2>
                <p className="text-white/40 font-medium">To finalize your setup, please enter your project access code.</p>
              </div>

              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Project Workspace Code</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-purple-400 transition-colors">
                      <Hash className="h-5 w-5" />
                    </div>
                    <input placeholder="XXXX-XXXX-XXXX" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full pl-12 pr-4 h-16 rounded-2xl text-white placeholder:text-white/20 outline-none transition-all font-mono text-lg tracking-widest"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(139,92,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-white/20 text-center uppercase tracking-widest">ASK YOUR TEAM LEAD FOR A WORKSPACE KEY</p>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl border border-rose-500/20 flex gap-3 animate-fade-in"
                    style={{ background: "rgba(244,63,94,0.08)" }}>
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <p className="text-xs font-bold text-rose-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
                  className="w-full h-16 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                    boxShadow: "0 8px 32px rgba(139,92,246,0.3)",
                  }}>
                  {joining ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <span className="uppercase tracking-widest">Enter Workspace</span>
                  )}
                </button>

                <button onClick={() => router.push("/dashboard")}
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors">
                  Setup Workspace Later
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
