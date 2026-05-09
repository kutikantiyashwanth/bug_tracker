"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { User, Shield, Bell, Save, Check, X, Plus, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { Role } from "@/lib/types";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { currentUser, logout } = useStore();

  // Profile state
  const [name,   setName]   = useState(currentUser?.name  || "");
  const [email,  setEmail]  = useState(currentUser?.email || "");
  const [role,   setRole]   = useState<Role>((currentUser?.role?.toLowerCase() as Role) || "developer");
  const [skills, setSkills] = useState<string[]>(currentUser?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [profileError,  setProfileError]  = useState("");

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwError,   setPwError]   = useState("");

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    task_assigned:    true,
    deadline_reminder: true,
    bug_assigned:     true,
    project_invite:   true,
    email_notifications: false,
  });

  if (!currentUser) return null;

  // ── Add / remove skill ──
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setNewSkill("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  // ── Save profile ──
  const handleSaveProfile = async () => {
    if (!name.trim()) { setProfileError("Name is required"); return; }
    setProfileSaving(true);
    setProfileError("");
    try {
      await api.patch("/auth/profile", { name, skills });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      setProfileError(err.response?.data?.error || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPw) { setPwError("Enter your current password"); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    setPwSaving(true);
    try {
      await api.patch("/auth/password", { currentPassword: currentPw, newPassword: newPw });
      setPwSaved(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: any) {
      setPwError(err.response?.data?.error || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-slide-up max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-1 bg-violet-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Account Preferences</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">System <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Settings</span></h1>
        <p className="text-slate-400 font-medium max-w-xl">
          Customize your professional profile, manage security protocols, and configure your notification ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-8">
          {/* ── Profile ── */}
          <div className="p-8 rounded-3xl bg-[#080c1d] border border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <User className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Personal Identity</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Public Professional Profile</p>
                </div>
              </div>
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5">
              <Avatar className="h-20 w-20 ring-4 ring-[#080c1d] shadow-2xl shadow-violet-500/10">
                <AvatarFallback className="text-2xl font-black bg-violet-600 text-white">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-xl font-black text-white tracking-tight">{currentUser.name}</p>
                <p className="text-sm font-medium text-slate-400">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 font-black text-[10px] tracking-widest uppercase px-3 py-1">
                    {currentUser.role?.toUpperCase()}
                  </Badge>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System Status</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Legal Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 font-bold text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">System Identifier (Email)</Label>
                <Input value={email} readOnly
                  className="h-14 rounded-2xl bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed font-bold" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Technical Competencies</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <div key={s} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-400 group shadow-lg hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-slate-600 hover:text-rose-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Input
                  placeholder="e.g. React, Microservices, Penetration Testing"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 flex-1 font-medium text-white"
                />
                <Button onClick={addSkill} variant="outline"
                  className="h-14 px-8 rounded-2xl border-white/10 text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-all">
                  <Plus className="h-4 w-4 mr-2" /> ADD
                </Button>
              </div>
            </div>

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400" /> 
                <p className="text-xs font-bold text-rose-400">{profileError}</p>
              </div>
            )}

            <Button onClick={handleSaveProfile} disabled={profileSaving} variant="premium" className="w-full h-14 !rounded-2xl shadow-violet-500/20">
              {profileSaving ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : profileSaved ? (
                <><Check className="h-5 w-5 mr-2" /> PROFILE SYNCHRONIZED</>
              ) : (
                <><Save className="h-5 w-5 mr-2" /> UPDATE IDENTITY</>
              )}
            </Button>
          </div>

          {/* ── Security ── */}
          <div className="p-8 rounded-3xl bg-[#080c1d] border border-white/5 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Cryptographic Security</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Manage Authentication Credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Current Secret</Label>
                <div className="relative group">
                  <Input type={showPw ? "text" : "password"} value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••" 
                    className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 font-bold text-white pr-14" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors">
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">New Protocol Secret</Label>
                <Input type={showPw ? "text" : "password"} value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimum 8 characters" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 font-bold text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm Protocol Secret</Label>
                <Input type={showPw ? "text" : "password"} value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Verify new secret" 
                  className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 font-bold text-white" />
              </div>
            </div>

            {pwError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-xs font-bold text-rose-400">{pwError}</p>
              </div>
            )}

            <Button onClick={handleChangePassword} disabled={pwSaving} 
              className="w-full h-14 !rounded-2xl bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all shadow-2xl">
              {pwSaving ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : pwSaved ? (
                <><Check className="h-4 w-4 mr-2" /> CREDENTIALS UPDATED</>
              ) : (
                "Update Security Credentials"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Notifications & Danger Zone */}
        <div className="space-y-8">
          {/* ── Notifications ── */}
          <div className="p-8 rounded-3xl bg-[#080c1d] border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Event Protocol</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Notification Configuration</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: "task_assigned",      label: "Task Velocity",    desc: "Assignment alerts" },
                { key: "deadline_reminder",  label: "Timeline Drift",  desc: "Deadline proximity" },
                { key: "bug_assigned",       label: "Defect Analysis",     desc: "Bug report allocation" },
                { key: "project_invite",     label: "Workspace Access",     desc: "Collaborative invitations" },
                { key: "email_notifications",label: "Remote Sync", desc: "External SMTP relay" },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white">{pref.label}</p>
                    <p className="text-[10px] font-bold text-slate-500">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                      checked={notifPrefs[pref.key as keyof typeof notifPrefs]}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-rose-400">Danger Zone</h2>
              <p className="text-[10px] font-bold text-rose-500/60 uppercase mt-1">Terminal Session Management</p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Terminating your current active session will flush all local cached authentication tokens.
            </p>
            <Button onClick={() => logout()} variant="outline"
              className="w-full h-12 rounded-xl border-rose-500/20 text-rose-400 font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white transition-all">
              Terminate Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
