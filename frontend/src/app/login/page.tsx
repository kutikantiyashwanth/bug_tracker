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
    color: "violet",
    border: "hover:border-violet-300",
    activeBg: "bg-violet-50 border-violet-300",
    iconBg: "bg-violet-100 text-violet-600",
  },
  {
    id: "developer" as RoleType,
    label: "Developer",
    desc: "Join via invite code, build & fix bugs",
    icon: Code2,
    color: "blue",
    border: "hover:border-blue-300",
    activeBg: "bg-blue-50 border-blue-300",
    iconBg: "bg-blue-100 text-blue-600",
    tag: "Most common",
  },
  {
    id: "tester" as RoleType,
    label: "QA Tester",
    desc: "Join via invite code, test & report bugs",
    icon: TestTube2,
    color: "amber",
    border: "hover:border-amber-300",
    activeBg: "bg-amber-50 border-amber-300",
    iconBg: "bg-amber-100 text-amber-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, joinProject, isLoading } = useStore();

  const [step,         setStep]         = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode,   setInviteCode]   = useState("");
  const [error,        setError]        = useState("");
  const [errorType,    setErrorType]    = useState<"credentials"|"network"|"invite"|"general">("general");
  const [joining,      setJoining]      = useState(false);

  const roleInfo = ROLES.find((r) => r.id === selectedRole);

  const handleRoleSelect = (role: RoleType) => { setSelectedRole(role); setError(""); setStep("login"); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); setErrorType("general"); return; }
    if (!password.trim()) { setError("Please enter your password."); setErrorType("general"); return; }
    try {
      await login(email, password);
      if (selectedRole === "admin") {
        router.push("/dashboard");
      } else {
        await new Promise((r) => setTimeout(r, 800));
        const state = useStore.getState();
        if (state.projects?.length > 0) router.push("/dashboard");
        else setStep("invite");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (!window.navigator.onLine || msg.includes("connect") || msg.includes("network")) {
        setErrorType("network"); setError("Cannot connect to server. Make sure the backend is running.");
      } else {
        setErrorType("credentials"); setError("Wrong email or password. Please check and try again.");
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
    catch { setErrorType("network"); setError("Cannot connect to server. Make sure the backend is running."); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#ffffff" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL — Animated Feature Showcase
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-blue-700 to-indigo-800" />
          {/* Animated orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30 animate-float-slow"
            style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", animationDelay: "2s" }} />
          <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full opacity-15 animate-float-slow"
            style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)", animationDelay: "1s" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* Noise */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in-down">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)" }}>
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">BugTracker</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/60 text-[10px]">v1.0 · All systems operational</span>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-white/80 text-xs font-medium">Student Bug Tracker Platform</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Track bugs.<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #e8e3f1ff, #ebeef2ff)" }}>
                Ship faster.
              </span>
            </h1>
            <p className="text-white/70 mt-4 text-base leading-relaxed max-w-sm">
              The complete project management platform built for student teams, hackathons, and open-source projects.
            </p>
          </div>

          {/* Feature showcase — real features */}
          <div className="mt-12 flex-1 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">What you get</p>
            <div className="space-y-3">
              {[
                { icon: Bug,         label: "Bug Tracking",          desc: "Report, assign & resolve bugs fast",    color: "from-rose-500 to-red-600" },
                { icon: Zap,         label: "Kanban Board",           desc: "Drag & drop task management",           color: "from-violet-500 to-purple-600" },
                { icon: Shield,      label: "Role-Based Access",      desc: "Admin, Developer & Tester roles",       color: "from-blue-500 to-indigo-600" },
                { icon: CheckCircle2,label: "Real-time Notifications", desc: "In-app & email alerts instantly",       color: "from-teal-500 to-cyan-600" },
                { icon: Sparkles,    label: "Activity Log",           desc: "Full audit trail of all actions",       color: "from-amber-500 to-orange-500" },
              ].map((f, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm stagger-item"
                  style={{ animationDelay: `${300 + i * 80}ms` }}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br", f.color)}>
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.label}</p>
                    <p className="text-white/60 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/25 text-xs">© 2026 Student Bug Tracker · Built for teams</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Auth Form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">BugTracker</span>
          </div>

          {/* ── STEP 1: Role Selection ── */}
          {step === "role" && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h2>
                <p className="text-gray-400 text-sm mt-1">Select your role to continue</p>
              </div>

              <div className="space-y-2.5">
                {ROLES.map((role, i) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "w-full group flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all duration-200",
                      "border-gray-100 hover:shadow-md hover:-translate-y-0.5",
                      role.border, "stagger-item"
                    )}
                    style={{ animationDelay: `${i * 70}ms` }}>
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", role.iconBg)}>
                      <role.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{role.label}</span>
                        {role.tag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">{role.tag}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{role.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or quick access</span></div>
              </div>

              <button onClick={handleDemoLogin} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all hover:shadow-sm disabled:opacity-50">
                {isLoading
                  ? <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                  : <Sparkles className="h-4 w-4 text-amber-500" />
                }
                Try Demo Account
              </button>

              <p className="text-center text-sm text-gray-400">
                No account?{" "}
                <Link href="/register" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Create Account →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Login Form ── */}
          {step === "login" && roleInfo && (
            <div className="animate-scale-in space-y-5">
              <button onClick={() => { setStep("role"); setError(""); }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors group mb-1">
                <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to roles
              </button>

              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", roleInfo.iconBg)}>
                  <roleInfo.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Sign in</h2>
                  <p className="text-xs text-gray-400">as {roleInfo.label}</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <input type="text" className="hidden" autoComplete="off" readOnly />
                <input type="password" className="hidden" autoComplete="new-password" readOnly />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input type="email" placeholder="you@company.com" value={email}
                      autoComplete="username"
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:bg-white transition-all" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••••"
                      autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-11 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:bg-white transition-all" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={cn("flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border animate-fade-in",
                    errorType === "network" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-600"
                  )}>
                    {errorType === "network" ? <WifiOff className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(108,92,231,0.35)" }}>
                  {isLoading
                    ? <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <>{selectedRole === "admin" ? "Sign in to Dashboard" : "Sign in & Enter Invite Code"} <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-gray-400">
                No account?{" "}
                <Link href="/register" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Create one free →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 3: Invite Code ── */}
          {step === "invite" && roleInfo && (
            <div className="animate-scale-in space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Signed in successfully!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Now join your project to get started</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", roleInfo.iconBg)}>
                  <roleInfo.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Join a Project</h2>
                  <p className="text-xs text-gray-400">Enter the invite code from your team lead</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Project Invite Code</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx" value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setError(""); }}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl font-mono text-sm focus:border-purple-400 focus:bg-white transition-all"
                    autoFocus />
                </div>
                <p className="text-xs text-gray-400">Ask your Admin / Team Lead for the invite code</p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border bg-red-50 border-red-200 text-red-600 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(108,92,231,0.35)" }}>
                {joining
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  : <>Join Project & Open Dashboard <ArrowRight className="h-4 w-4" /></>
                }
              </button>

              <button onClick={() => router.push("/dashboard")}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                Skip for now — I'll join later
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-300 mt-8">Demo: admin@test.com / password123</p>
        </div>
      </div>
    </div>
  );
}

