"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import {
  Bug, ArrowRight, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, Plus, Shield, Code2,
  TestTube2, Activity, GitBranch, TrendingUp, Zap,
} from "lucide-react";
import type { Role } from "@/lib/types";

const SKILL_SUGGESTIONS = ["React", "Node.js", "TypeScript", "Python", "Testing", "UI/UX", "DevOps", "SQL", "Git", "Java", "Flutter", "AWS"];

const STEPS = [
  { n: "01", label: "Account Details" },
  { n: "02", label: "Skills" },
];

const FEATURES = [
  { icon: Bug, label: "AI Bug Analysis", desc: "Auto-detect severity with AI", color: "#f43f5e" },
  { icon: GitBranch, label: "Kanban Board", desc: "Drag & drop task management", color: "#8b5cf6" },
  { icon: Shield, label: "Role-Based Access", desc: "Admin, Developer & Tester", color: "#06b6d4" },
  { icon: Activity, label: "Real-time Sync", desc: "Live updates via WebSocket", color: "#10b981" },
  { icon: TrendingUp, label: "Analytics", desc: "Charts & productivity metrics", color: "#f59e0b" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ["", "#f87171", "#fbbf24", "#34d399"];
  const pwLabels = ["", "Too short", "Good", "Strong ✓"];

  const addSkill = (s: string) => {
    const t = s.trim();
    if (t && !skills.includes(t) && skills.length < 8) setSkills([...skills, t]);
    setNewSkill("");
  };

  const validateStep1 = () => {
    if (!name.trim() || name.trim().length < 2) { setError("Enter your full name (min 2 chars)"); return false; }
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address"); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleNext = () => { setError(""); if (validateStep1()) setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password, "developer" as Role, skills);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" };
  const focusColor = "rgba(139,92,246,0.6)";

  return (
    <div className="min-h-screen flex" style={{ background: "#050810" }}>

      {/* ══ LEFT PANEL ══ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.12) 0%, transparent 60%), #050810"
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <Bug className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">Bug<span style={{ color: "#8b5cf6" }}>Tracker</span></p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Free for student teams</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <Zap className="h-3.5 w-3.5" style={{ color: "#8b5cf6" }} />
              <span className="text-xs font-semibold" style={{ color: "#c4b5fd" }}>Join 500+ student teams</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Start tracking.<br />
              <span style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Ship faster.
              </span>
            </h1>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Create your account and start collaborating on bugs, tasks, and projects with your team.
            </p>
          </div>

          {/* Step progress */}
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Setup Progress</p>
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const isActive = step === i + 1;
                const isDone = step > i + 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: isDone ? "#10b981" : isActive ? "#fff" : "rgba(255,255,255,0.08)",
                        color: isDone ? "#fff" : isActive ? "#8b5cf6" : "rgba(255,255,255,0.3)",
                      }}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                    </div>
                    <span className="text-sm transition-colors"
                      style={{ color: isDone ? "#34d399" : isActive ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: isActive ? 700 : 400 }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="flex-1 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Everything included</p>
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${f.color}20` }}>
                  <f.icon className="h-3.5 w-3.5" style={{ color: f.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{f.label}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</p>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>

          <p className="text-[10px] mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>© 2026 BugTracker · Built for teams</p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto" style={{ background: "#080b14" }}>
        <div className="w-full max-w-[400px] py-4">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BugTracker</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: step === 1 ? "50%" : "100%", background: "linear-gradient(90deg, #8b5cf6, #06b6d4)" }} />
            </div>
            <span className="text-xs shrink-0 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Step {step} / 2</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">Create account</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Fill in your details to get started</p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 h-12 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => e.currentTarget.style.borderColor = focusColor}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 h-12 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => e.currentTarget.style.borderColor = focusColor}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 h-12 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => e.currentTarget.style.borderColor = focusColor}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= pwStrength ? pwColors[pwStrength] : "rgba(255,255,255,0.08)" }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 animate-fade-in"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#fda4af" }}>
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <button onClick={handleNext}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 8px 32px rgba(139,92,246,0.3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Already have an account? <Link href="/login" className="font-bold" style={{ color: "#a78bfa" }}>Sign in →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">Your skills</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Help your team know what you do</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Skills <span className="normal-case font-normal" style={{ color: "rgba(255,255,255,0.25)" }}>(optional)</span>
                </label>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                        {s}
                        <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          style={{ color: "#c4b5fd" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#c4b5fd")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input placeholder="Add a skill and press Enter" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                    className="flex-1 h-10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all px-3"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = focusColor}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  <button type="button" onClick={() => addSkill(newSkill)}
                    className="px-3 h-10 rounded-xl font-bold text-sm transition-colors"
                    style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.2)")}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = ""; }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-3 animate-fade-in"
                  style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#fda4af" }}>
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(""); }}
                  className="h-12 px-5 rounded-xl text-sm font-bold transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  Back
                </button>
                <button type="submit" disabled={isLoading}
                  className="flex-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 8px 32px rgba(139,92,246,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  {isLoading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Create Account</>}
                </button>
              </div>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Already have an account? <Link href="/login" className="font-bold" style={{ color: "#a78bfa" }}>Sign in →</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
