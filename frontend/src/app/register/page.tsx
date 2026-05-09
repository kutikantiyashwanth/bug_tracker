"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { cn } from "@/lib/utils";
import {
  Bug, ArrowRight, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, Plus,
  Shield, Code2, TestTube2, Activity, GitBranch,
  AlertTriangle, BarChart2, Circle,
} from "lucide-react";
import type { Role } from "@/lib/types";

const ROLE_OPTIONS = [
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
    gradient: "from-violet-600 to-purple-700",
    bg: "rgba(124,58,237,0.15)",
    text: "#c4b5fd",
    border: "rgba(124,58,237,0.4)",
    desc: "Create & manage projects",
  },
  {
    value: "developer",
    label: "Developer",
    icon: Code2,
    gradient: "from-blue-600 to-cyan-600",
    bg: "rgba(37,99,235,0.15)",
    text: "#93c5fd",
    border: "rgba(37,99,235,0.4)",
    desc: "Build & fix bugs",
  },
  {
    value: "tester",
    label: "Tester",
    icon: TestTube2,
    gradient: "from-amber-500 to-orange-600",
    bg: "rgba(245,158,11,0.15)",
    text: "#fcd34d",
    border: "rgba(245,158,11,0.4)",
    desc: "Test & report issues",
  },
];

const SKILL_SUGGESTIONS = ["React", "Node.js", "TypeScript", "Python", "Testing", "UI/UX", "DevOps", "SQL", "Git", "Java", "Flutter", "AWS"];

const FEATURES = [
  { icon: Bug, label: "Bug Tracking", desc: "Report & resolve bugs fast", color: "from-rose-500 to-red-600" },
  { icon: GitBranch, label: "Kanban Board", desc: "Drag & drop task management", color: "from-violet-500 to-purple-600" },
  { icon: Shield, label: "Role-Based Access", desc: "Admin, Developer & Tester", color: "from-blue-500 to-indigo-600" },
  { icon: Activity, label: "Real-time Updates", desc: "Live notifications & sync", color: "from-teal-500 to-cyan-600" },
  { icon: BarChart2, label: "Analytics", desc: "Charts & productivity metrics", color: "from-amber-500 to-orange-500" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("developer");
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
      if (role === "admin") router.push("/dashboard");
      else router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)";
    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#080b14" }}>

      {/* ══ LEFT PANEL ══ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d0d1a 0%, #0a0a14 60%, #0d0a1a 100%)" }}>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow orbs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
        <div className="absolute bottom-[-100px] left-[-50px] w-[300px] h-[300px] rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />

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
                <span className="text-white/40 text-[10px]">Free for student teams</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Join your team.<br />
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Start tracking.
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Create your account in seconds and start collaborating on bugs, tasks, and projects.
            </p>
          </div>

          {/* Step progress */}
          <div className="mb-8">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Setup Progress</p>
            <div className="space-y-3">
              {[
                { n: "01", label: "Basic Information", active: step === 1, done: step > 1 },
                { n: "02", label: "Role & Skills", active: step === 2, done: false },
                { n: "03", label: "Join or Create Project", active: false, done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: s.done ? "#10b981" : s.active ? "#fff" : "rgba(255,255,255,0.08)",
                      color: s.done ? "#fff" : s.active ? "#7c3aed" : "rgba(255,255,255,0.3)",
                    }}>
                    {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <span className="text-sm transition-colors"
                    style={{ color: s.done ? "#34d399" : s.active ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: s.active ? 700 : 400 }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="flex-1">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Everything included</p>
            <div className="space-y-2">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br", f.color)}>
                    <f.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-xs font-semibold">{f.label}</p>
                    <p className="text-white/35 text-[10px]">{f.desc}</p>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-[10px] mt-6">© 2026 Student Bug Tracker · Built for teams</p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
        style={{ background: "#0f0f1a" }}>
        <div className="w-full max-w-[400px] py-4">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BugTracker</span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: step === 1 ? "50%" : "100%", background: "linear-gradient(90deg, #7c3aed, #2563eb)" }} />
            </div>
            <span className="text-xs shrink-0 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Step {step} / 2</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Create account</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Fill in your basic details</p>
              </div>

              <input type="text" className="hidden" autoComplete="off" readOnly />
              <input type="password" className="hidden" autoComplete="new-password" readOnly />

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      className="w-full pl-10 h-12 rounded-xl text-sm outline-none transition-all"
                      style={{ ...inputStyle }}
                      onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      className="w-full pl-10 h-12 rounded-xl text-sm outline-none transition-all"
                      style={{ ...inputStyle }}
                      onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    <input type={showPw ? "text" : "password"} placeholder="Min 6 characters"
                      autoComplete="new-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 h-12 rounded-xl text-sm outline-none transition-all"
                      style={{ ...inputStyle }}
                      onFocus={focusStyle} onBlur={blurStyle} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
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
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-bold" style={{ color: "#a78bfa" }}>Sign in →</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 — Skills only ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Your skills</h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Help your team know what you do</p>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Skills <span className="normal-case font-normal" style={{ color: "rgba(255,255,255,0.25)" }}>(optional)</span>
                </label>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd" }}>
                        {s}
                        <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                          className="transition-colors ml-0.5"
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
                  <input placeholder="Add a skill and press Enter"
                    value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                    className="flex-1 h-10 rounded-xl text-sm outline-none transition-all px-3"
                    style={{ ...inputStyle }}
                    onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => addSkill(newSkill)}
                    className="px-3 h-10 rounded-xl font-bold text-sm transition-colors"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#c4b5fd" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.2)")}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = ""; }}>
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
                  className="flex-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90 hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                  {isLoading
                    ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><CheckCircle2 className="h-4 w-4" /> Create Account</>
                  }
                </button>
              </div>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-bold" style={{ color: "#a78bfa" }}>Sign in →</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
