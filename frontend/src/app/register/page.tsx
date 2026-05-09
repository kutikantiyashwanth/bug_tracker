"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bug, ArrowRight, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, Plus,
  Shield, Code2, TestTube2, Zap, Star,
} from "lucide-react";
import type { Role } from "@/lib/types";

const SKILL_SUGGESTIONS = ["React", "Node.js", "TypeScript", "Python", "Testing", "UI/UX", "DevOps", "SQL", "Git", "Java", "Flutter", "AWS"];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useStore();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const role: Role               = "developer";
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
      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/projects");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // Shared input style helpers
  const inputBase = "w-full rounded-xl text-white placeholder:text-white/25 outline-none transition-all font-medium";
  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
  };
  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(139,92,246,0.5)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
  };
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#050810" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden" style={{ background: "#070b18" }}>
        {/* Mesh gradient */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 25% 25%, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(6,182,212,0.14) 0%, transparent 55%)"
        }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
        {/* Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 animate-float-slow"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-15 animate-float"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)", animationDelay: "1.5s" }} />

        <div className="relative z-10 flex flex-col h-full p-12">

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
              Join your team.<br />
              <span className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                Start tracking.
              </span>
            </h1>
            <p className="text-white/40 mt-4 text-base leading-relaxed max-w-sm">
              The next-generation bug tracking platform built for high-performance student teams and engineering squads.
            </p>
          </div>

          {/* Step progress */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Setup Progress</p>
            <div className="space-y-3">
              {[
                { n: "01", label: "Basic Information",      done: step > 1 },
                { n: "02", label: "Skills",                  done: false },
                { n: "03", label: "Join or Create Project",  done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                    s.done
                      ? "bg-emerald-500 text-white"
                      : (step === 1 && i === 0) || (step === 2 && i === 1)
                        ? "text-white"
                        : "text-white/30"
                  )}
                  style={
                    s.done ? {} :
                    (step === 1 && i === 0) || (step === 2 && i === 1)
                      ? { background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }
                      : { background: "rgba(255,255,255,0.08)" }
                  }>
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

          {/* Features list */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Everything included</p>
            <div className="space-y-2">
              {[
                { icon: Bug,          label: "Bug Tracking & Reporting",      color: "from-rose-500 to-red-600" },
                { icon: Zap,          label: "Kanban Board with Drag & Drop", color: "from-violet-500 to-purple-600" },
                { icon: Shield,       label: "Role-Based Access Control",     color: "from-blue-500 to-indigo-600" },
                { icon: CheckCircle2, label: "Real-time Notifications",       color: "from-teal-500 to-cyan-600" },
                { icon: Star,         label: "Activity Log & Analytics",      color: "from-amber-500 to-orange-500" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/6"
                  style={{ background: "rgba(255,255,255,0.025)", animationDelay: `${300 + i * 70}ms` }}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br", f.color)}>
                    <f.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-white/70 text-xs font-medium">{f.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/8">
            <p className="text-white/20 text-xs">© 2026 Student Bug Tracker · Built for teams</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Register Form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto" style={{ background: "#080b14" }}>
        <div className="w-full max-w-[400px] py-4">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BugTracker</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: step === 1 ? "50%" : "100%",
                  background: "linear-gradient(90deg, #8b5cf6, #06b6d4)"
                }} />
            </div>
            <span className="text-xs text-white/35 shrink-0 font-medium">Step {step} / 2</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight">Create account</h2>
                <p className="text-white/40 font-medium text-sm">Join the next-gen engineering workspace.</p>
              </div>

              {/* Prevent autofill */}
              <input type="text" className="hidden" autoComplete="off" readOnly />
              <input type="password" className="hidden" autoComplete="new-password" readOnly />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      className={cn(inputBase, "pl-12 h-14 text-base")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      className={cn(inputBase, "pl-12 h-14 text-base")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputBase, "pl-12 pr-12 h-14 text-base")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3].map((i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300",
                            i <= pwStrength ? pwBar[pwStrength] : "bg-white/10"
                          )} />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-bold",
                        pwStrength === 1 ? "text-red-400" : pwStrength === 2 ? "text-amber-400" : "text-emerald-400"
                      )}>{pwLabel[pwStrength]}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border border-rose-500/20 animate-fade-in"
                  style={{ background: "rgba(244,63,94,0.08)" }}>
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                  <span className="text-rose-400">{error}</span>
                </div>
              )}

              <button onClick={handleNext}
                className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all group"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                  boxShadow: "0 8px 32px rgba(139,92,246,0.3)"
                }}>
                <span>Continue Registration</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-sm font-medium text-white/25">
                Already have an account?{" "}
                <Link href="/login" className="font-bold transition-colors hover:underline underline-offset-4" style={{ color: "#8b5cf6" }}>Sign in here</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-scale-in space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight">Your skills</h2>
                <p className="text-white/40 font-medium text-sm">Help your team know what you do</p>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 ml-1">
                  Technical Arsenal <span className="text-white/20 normal-case font-medium ml-1">(Optional)</span>
                </label>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                        {s}
                        <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="hover:text-rose-400 transition-colors ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Node.js, Python"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                    className="h-14 rounded-2xl text-sm flex-1 text-white placeholder:text-white/20 border-white/10 focus:border-purple-500/50"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <button type="button" onClick={() => addSkill(newSkill)}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50">
                    <Plus className="h-5 w-5 text-purple-400" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2 py-0.5 rounded-full text-xs font-medium transition-all text-white/35 hover:text-purple-300"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(139,92,246,0.4)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 border border-rose-500/20 animate-fade-in"
                  style={{ background: "rgba(244,63,94,0.08)" }}>
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                  <span className="text-rose-400">{error}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button type="button" onClick={() => { setStep(1); setError(""); }}
                  className="h-14 px-8 rounded-2xl text-sm font-bold text-white/50 hover:text-white/80 transition-all border border-white/10 bg-white/5 hover:bg-white/10">
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all group"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
                    boxShadow: "0 8px 32px rgba(139,92,246,0.3)"
                  }}>
                  {isLoading
                    ? <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <>
                        <span>Initialize Profile</span>
                        <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </>
                  }
                </button>
              </div>

              <p className="text-center text-sm font-medium text-white/25">
                Already have an account?{" "}
                <Link href="/login" className="font-bold transition-colors hover:underline underline-offset-4" style={{ color: "#8b5cf6" }}>Sign in here</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
