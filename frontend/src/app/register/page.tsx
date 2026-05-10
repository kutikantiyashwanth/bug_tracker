"use client";
// Force recompile - Role selector added

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Bug, ArrowRight, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, Plus,
  Shield, Zap, Star,
} from "lucide-react";
import type { Role } from "@/lib/types";

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
    console.log("🔍 Frontend: Submitting registration with role:", role);
    try {
      await register(name, email, password, role, skills);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // Shared input style helpers
  const inputBase = "w-full rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium";
  const inputStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  };
  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)";
  };
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid #e2e8f0";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#f8fafc" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col overflow-hidden bg-white border-r border-slate-200">
        {/* Mesh gradient */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 25% 25%, rgba(139,92,246,0.08) 0%, transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(6,182,212,0.06) 0%, transparent 55%)"
        }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />

        <div className="relative z-10 flex flex-col h-full p-12">

          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in-down">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-slate-900 font-black text-xl tracking-tight">Bug<span className="text-indigo-600">Tracker</span></span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">V2.4 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50 mb-6">
              <Zap className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Free for student teams</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Join your team.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Start tracking.
              </span>
            </h1>
            <p className="text-slate-500 mt-4 text-base leading-relaxed max-w-sm">
              A bug tracking and project management platform built for student teams.
            </p>
          </div>

          {/* Step progress */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Setup Progress</p>
            <div className="space-y-3">
              {[
                { n: "01", label: "Basic Information",      done: step > 1 },
                { n: "02", label: "Skills",                  done: false },
                { n: "03", label: "Join or Create Project",  done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm",
                    s.done
                      ? "bg-emerald-500 text-white"
                      : (step === 1 && i === 0) || (step === 2 && i === 1)
                        ? "bg-indigo-600 text-white shadow-indigo-200"
                        : "bg-slate-100 text-slate-400"
                  )}>
                    {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <span className={cn("text-sm transition-colors",
                    s.done ? "text-emerald-600 font-medium" :
                    (step === 1 && i === 0) || (step === 2 && i === 1) ? "text-slate-900 font-semibold" :
                    "text-slate-400"
                  )}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features list */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Everything included</p>
            <div className="space-y-2">
              {[
                { icon: Bug,          label: "Bug Tracking & Reporting",      color: "bg-rose-500" },
                { icon: Zap,          label: "Kanban Board with Drag & Drop", color: "bg-violet-500" },
                { icon: Shield,       label: "Role-Based Access Control",     color: "bg-blue-500" },
                { icon: CheckCircle2, label: "Real-time Notifications",       color: "bg-teal-500" },
                { icon: Star,         label: "Activity Log & Analytics",      color: "bg-amber-500" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-white shadow-sm"
                  style={{ animationDelay: `${300 + i * 70}ms` }}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm", f.color)}>
                    <f.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-slate-600 text-xs font-medium">{f.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-slate-300 text-xs">© 2026 Student Bug Tracker • Built for teams</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-5 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600">
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">BugTracker</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full rounded-full transition-all duration-500 bg-indigo-600"
                style={{ width: step === 1 ? "50%" : "100%" }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0 font-medium">Step {step} / 2</span>
          </div>

          {/* — STEP 1 — */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create account</h2>
                <p className="text-slate-500 text-base mt-1">Fill in your details to get started.</p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(inputBase, "pl-12 h-14 text-base shadow-sm")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(inputBase, "pl-12 h-14 text-base shadow-sm")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(inputBase, "pl-12 pr-12 h-14 text-base shadow-sm")}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3].map((i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all",
                            i <= pwStrength ? pwBar[pwStrength] : "bg-slate-100"
                          )} />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-bold",
                        pwStrength === 1 ? "text-red-500" : pwStrength === 2 ? "text-amber-500" : "text-emerald-500"
                      )}>{pwLabel[pwStrength]}</span>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Your Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 z-10 pointer-events-none" />
                    <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                      <SelectTrigger className={cn(inputBase, "pl-12 h-14 text-base shadow-sm border border-slate-200")} style={inputStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="font-bold">Developer</span>
                            <span className="text-xs text-slate-400">- Build & fix bugs</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="tester">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-bold">Tester</span>
                            <span className="text-xs text-slate-400">- Test & report issues</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="font-bold">Admin</span>
                            <span className="text-xs text-slate-400">- Full project control</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-4 py-3 border border-rose-100 bg-rose-50">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-500" />
                  <span className="text-rose-600 font-medium">{error}</span>
                </div>
              )}

              <button onClick={handleNext} style={{ transform: "none" }}
                className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-indigo-600 hover:underline underline-offset-4">Sign in here</Link>
              </p>
            </div>
          )}

          {/* — STEP 2 — */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="animate-scale-in space-y-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your skills</h2>
                <p className="text-slate-500 text-base mt-1">Optional — add skills so your team knows what you work on.</p>
              </div>

              <div className="space-y-3">
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {s}
                        <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="hover:text-rose-500 transition-colors ml-0.5">
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
                    className="h-14 rounded-2xl text-sm flex-1 text-slate-900 placeholder:text-slate-300 border-slate-200 bg-white shadow-sm"
                  />
                  <button type="button" onClick={() => addSkill(newSkill)} style={{ transform: "none" }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-indigo-600 shadow-sm transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 6).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)} style={{ transform: "none" }}
                      className="px-3 py-1 rounded-full text-xs font-medium text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white transition-colors">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-4 py-3 border border-rose-100 bg-rose-50">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-500" />
                  <span className="text-rose-600 font-medium">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(""); }} style={{ transform: "none" }}
                  className="h-14 px-8 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-600 border border-slate-200 bg-white shadow-sm transition-colors">
                  Back
                </button>
                <button type="submit" disabled={isLoading} style={{ transform: "none" }}
                  className="flex-1 h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {isLoading
                    ? <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <><span>Create Account</span><CheckCircle2 className="h-5 w-5" /></>
                  }
                </button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-indigo-600 hover:underline underline-offset-4">Sign in here</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
