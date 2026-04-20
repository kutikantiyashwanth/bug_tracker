"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bug, ArrowRight, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, Plus, Sparkles,
  Shield, Code2, TestTube2, Zap, Star,
} from "lucide-react";
import type { Role } from "@/lib/types";

const ROLE_OPTIONS = [
  { value: "admin",     label: "Admin",     icon: Shield,    bg: "bg-violet-100", text: "text-violet-600", active: "border-violet-400 bg-violet-50" },
  { value: "developer", label: "Developer", icon: Code2,     bg: "bg-blue-100",   text: "text-blue-600",   active: "border-blue-400 bg-blue-50" },
  { value: "tester",    label: "Tester",    icon: TestTube2, bg: "bg-amber-100",  text: "text-amber-600",  active: "border-amber-400 bg-amber-50" },
];

const SKILL_SUGGESTIONS = ["React", "Node.js", "TypeScript", "Python", "Testing", "UI/UX", "DevOps", "SQL", "Git", "Java", "Flutter", "AWS"];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useStore();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<Role>("developer");
  const [skills,   setSkills]   = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [step,     setStep]     = useState<1 | 2>(1);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwBar = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"];
  const pwLabel = ["", "Too short", "Good", "Strong ✓"];

  const addSkill = (s: string) => {
    const t = s.trim();
    if (t && !skills.includes(t) && skills.length < 8) setSkills([...skills, t]);
    setNewSkill("");
  };

  const validateStep1 = () => {
    if (!name.trim() || name.trim().length < 2) { setError("Enter your full name (min 2 characters)"); return false; }
    if (name.includes("@")) { setError("Name should be your name, not your email"); return false; }
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address"); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleNext = () => { setError(""); if (validateStep1()) setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password, role, skills);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#ffffff" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-blue-700 to-indigo-800" />
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-25 animate-float-slow"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float"
            style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)", animationDelay: "1.5s" }} />
          <div className="absolute top-[30%] left-[20%] w-[250px] h-[250px] rounded-full opacity-15 animate-float-slow"
            style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)", animationDelay: "0.8s" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

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
                <span className="text-white/40 text-[10px]">Join 1,000+ student teams</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-medium">Free for student teams</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Join your team.<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #2563eb, #6d28d9)" }}>
                Start tracking.
              </span>
            </h1>
            <p className="text-white/50 mt-4 text-base leading-relaxed max-w-sm">
              Create your account in seconds and start collaborating on bugs, tasks, and projects with your team.
            </p>
          </div>

          {/* Step progress */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Setup Progress</p>
            <div className="space-y-3">
              {[
                { n: "01", label: "Basic Information",   done: step > 1 },
                { n: "02", label: "Role & Skills",        done: false },
                { n: "03", label: "Join or Create Project", done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                    s.done ? "bg-emerald-500 text-white" :
                    (step === 1 && i === 0) || (step === 2 && i === 1) ? "bg-white text-purple-700" :
                    "bg-white/10 text-white/30"
                  )}>
                    {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <span className={cn("text-sm transition-colors",
                    s.done ? "text-emerald-400 font-medium" :
                    (step === 1 && i === 0) || (step === 2 && i === 1) ? "text-white font-semibold" :
                    "text-white/30"
                  )}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real features list */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Everything included</p>
            <div className="space-y-2">
              {[
                { icon: Bug,          label: "Bug Tracking & Reporting",   color: "from-rose-500 to-red-600" },
                { icon: Zap,          label: "Kanban Board with Drag & Drop", color: "from-violet-500 to-purple-600" },
                { icon: Shield,       label: "Role-Based Access Control",  color: "from-blue-500 to-indigo-600" },
                { icon: CheckCircle2, label: "Real-time Notifications",    color: "from-teal-500 to-cyan-600" },
                { icon: Star,         label: "Activity Log & Analytics",   color: "from-amber-500 to-orange-500" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 stagger-item"
                  style={{ animationDelay: `${300 + i * 70}ms` }}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br", f.color)}>
                    <f.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-white/70 text-xs font-medium">{f.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-white/25 text-xs">© 2026 Student Bug Tracker · Built for teams</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Register Form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[400px] py-4">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6d28d9, #2563eb)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">BugTracker</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: step === 1 ? "50%" : "100%", background: "linear-gradient(90deg, #6d28d9, #2563eb)" }} />
            </div>
            <span className="text-xs text-gray-400 shrink-0 font-medium">Step {step} / 2</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create account</h2>
                <p className="text-gray-400 text-sm mt-1">Fill in your basic details</p>
              </div>

              {/* Prevent autofill */}
              <input type="text" className="hidden" autoComplete="off" readOnly />
              <input type="password" className="hidden" autoComplete="new-password" readOnly />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input type={showPw ? "text" : "password"} placeholder="Min 6 characters"
                      autoComplete="new-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-11 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:bg-white transition-all" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3].map((i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300",
                            i <= pwStrength ? pwBar[pwStrength] : "bg-gray-200"
                          )} />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-bold",
                        pwStrength === 1 ? "text-red-500" : pwStrength === 2 ? "text-amber-500" : "text-emerald-500"
                      )}>{pwLabel[pwStrength]}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border bg-red-50 border-red-200 text-red-600 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button onClick={handleNext}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(108,92,231,0.35)" }}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Sign in →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-scale-in space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your role & skills</h2>
                <p className="text-gray-400 text-sm mt-1">Help your team know what you do</p>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value as Role)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-center transition-all duration-200",
                        role === r.value ? r.active + " shadow-sm" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      )}>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", r.bg, r.text)}>
                        <r.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                      </div>
                      <span className={cn("text-[11px] font-bold",
                        role === r.value ? r.text : "text-gray-500"
                      )}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  Skills <span className="text-gray-300 normal-case font-normal">(optional)</span>
                </label>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                        {s}
                        <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="hover:text-red-500 transition-colors ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input placeholder="Add a skill and press Enter"
                    value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                    className="h-10 bg-gray-50 border-gray-200 rounded-xl text-sm flex-1 focus:border-purple-400 focus:bg-white" />
                  <button type="button" onClick={() => addSkill(newSkill)}
                    className="px-3 h-10 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors font-bold text-sm">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2 py-0.5 rounded-full border border-gray-200 text-xs text-gray-400 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border bg-red-50 border-red-200 text-red-600 animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(""); }}
                  className="h-12 px-5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(108,92,231,0.35)" }}>
                  {isLoading
                    ? <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <><CheckCircle2 className="h-4 w-4" /> Create Account</>
                  }
                </button>
              </div>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-purple-600 hover:text-purple-700 transition-colors">Sign in →</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

