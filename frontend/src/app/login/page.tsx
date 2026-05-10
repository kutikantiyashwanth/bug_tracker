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
    label: "Project Lead",
    desc: "Oversee operations, manage team dynamics & full authority",
    icon: Shield,
    gradient: "from-indigo-600 to-indigo-800",
    ring: "ring-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20 hover:border-indigo-500/50",
  },
  {
    id: "developer" as RoleType,
    label: "Team Member",
    desc: "Technical implementation, engineering & feature development",
    icon: Code2,
    gradient: "from-emerald-600 to-teal-600",
    ring: "ring-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/50",
    tag: "Primary role",
  },
  {
    id: "tester" as RoleType,
    label: "QA Analyst",
    desc: "Quality inspection, validation & rigorous bug reporting",
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
    <div className="min-h-screen flex bg-slate-50 font-jakarta">

      {/* ── Left Panel: Visual Hero ── */}
      <div className="hidden lg:flex lg:w-[50%] flex-col relative overflow-hidden bg-white border-r border-slate-200">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000000 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 flex flex-col h-full p-16">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-20 group cursor-default">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
              <Bug className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-slate-900">Bug<span className="text-indigo-600">Tracker</span></p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">V2.4 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 animate-slide-up">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Accelerate Your Workflow</span>
              </div>
              
              <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
                Track issues,<br />
                <span className="text-indigo-600">optimize flow.</span>
              </h1>
              
              <p className="text-lg text-slate-500 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
                The next-generation bug tracking platform built for high-performance student teams and engineering squads.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
                {[
                  { icon: Activity, label: "Real-time Sync", desc: "Instant updates" },
                  { icon: Shield, label: "Role Based", desc: "Secure access" },
                ].map((feature, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-white transition-all shadow-sm">
                    <feature.icon className="h-5 w-5 text-indigo-500 mb-2" />
                    <p className="text-sm font-bold text-slate-900">{feature.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="pt-20 mt-auto flex items-center justify-between border-t border-slate-100 opacity-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 ANTIGRAVITY LABS</p>
            <div className="flex gap-4">
              <GitBranch className="h-4 w-4 text-slate-300" />
              <Shield className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Flow ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        {/* Mobile Gradient Orbs */}
        <div className="lg:hidden absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/5 blur-[80px]" />
        </div>

        <div className="w-full max-w-[440px] space-y-10">
          
          {/* STEP 1: Role Selection */}
          {step === "role" && (
            <div className="animate-slide-up space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-slate-500 font-medium">Select your role to access your personalized workspace.</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)}
                    className="w-full group flex items-center gap-4 p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 text-left">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-500", role.gradient)}>
                      <role.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{role.label}</span>
                        {role.tag && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest bg-indigo-100 text-indigo-600">
                            {role.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{role.desc}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Access</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button onClick={handleDemoLogin} disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all text-sm font-bold text-slate-600 group">
                  {isLoading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                      <span>Continue with Demo Account</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm font-medium text-slate-500">
                New to the platform?{" "}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors underline-offset-4 hover:underline">
                  Join our community
                </Link>
              </p>
            </div>
          )}

          {/* STEP 2: Login Form */}
          {step === "login" && roleInfo && (
            <div className="animate-slide-up space-y-8">
              <button onClick={() => setStep("role")}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors group">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Roles
              </button>

              <div className="space-y-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-2xl", roleInfo.gradient)}>
                  <roleInfo.icon className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sign In</h2>
                  <p className="text-slate-500 font-medium">Authenticating as <span className="text-indigo-600 font-bold">{roleInfo.label}</span></p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Identity</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full pl-12 pr-12 h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-3 animate-shake">
                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="btn-premium w-full h-14 shadow-indigo-500/20 group">
                  {isLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span className="text-base font-bold">Access Dashboard</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-slate-500">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                    Get started today
                  </Link>
                </p>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Developer Preview Credentials</p>
                  <p className="text-xs font-mono text-indigo-600/80 mt-1">admin@test.com / password123</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Invite Code Flow */}
          {step === "invite" && roleInfo && (
            <div className="animate-slide-up space-y-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Authenticated</h2>
                <p className="text-slate-500 font-medium">To finalize your setup, please enter your project access code.</p>
              </div>

              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Workspace Code</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                      <Hash className="h-5 w-5" />
                    </div>
                    <input placeholder="XXXX-XXXX-XXXX" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required
                      className="w-full pl-12 pr-4 h-16 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono text-lg tracking-widest" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-widest">ASK YOUR TEAM LEAD FOR A WORKSPACE KEY</p>
                </div>

                <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
                  className="btn-premium w-full h-16 shadow-indigo-500/20">
                  {joining ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <span className="text-base font-bold uppercase tracking-widest">Enter Workspace</span>
                  )}
                </button>

                <button onClick={() => router.push("/dashboard")}
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">
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
