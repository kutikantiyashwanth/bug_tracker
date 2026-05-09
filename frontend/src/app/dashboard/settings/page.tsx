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
          <div className="w-8 h-1 bg-indigo-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Account Preferences</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Account <span className="text-indigo-600 underline decoration-indigo-500/20 underline-offset-8">Settings</span></h1>
        <p className="text-slate-500 mt-2 font-medium max-w-xl">
          Update your profile, change your password, and manage notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* ── Profile ── */}
          <div className="premium-card space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <User className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Your Profile</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Name, email and skills</p>
                </div>
              </div>
            </div>

            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl shadow-indigo-500/10">
                <AvatarFallback className="text-2xl font-black bg-indigo-600 text-white">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xl font-black text-slate-900 tracking-tight">{currentUser.name}</p>
                <p className="text-sm font-medium text-slate-500">{currentUser.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[10px] tracking-widest uppercase px-3 py-1">
                    {currentUser.role?.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</Label>
                <Input value={email} readOnly
                  className="h-14 rounded-2xl bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed font-bold" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <div key={s} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 group shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Input
                  placeholder="e.g. React, Node.js, Python"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 flex-1 font-medium"
                />
                <Button onClick={addSkill} variant="outline"
                  className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  <Plus className="h-4 w-4 mr-2" /> ADD
                </Button>
              </div>
            </div>

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600" /> 
                <p className="text-xs font-bold text-rose-600">{profileError}</p>
              </div>
            )}

            <Button onClick={handleSaveProfile} disabled={profileSaving} variant="premium" className="w-full h-14 !rounded-2xl shadow-indigo-500/20">
              {profileSaving ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : profileSaved ? (
                <><Check className="h-5 w-5 mr-2" /> Profile Saved</>
              ) : (
                <><Save className="h-5 w-5 mr-2" /> Save Profile</>
              )}
            </Button>
          </div>

          {/* ── Security ── */}
          <div className="premium-card space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Change Password</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Update your login credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Password</Label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••" 
                    className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold pr-14" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Password</Label>
                <Input type={showPw ? "text" : "password"} value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimum 6 characters" 
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm New Password</Label>
                <Input type={showPw ? "text" : "password"} value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password" 
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold" />
              </div>
            </div>

            {pwError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-xs font-bold text-rose-600">{pwError}</p>
              </div>
            )}

            <Button onClick={handleChangePassword} disabled={pwSaving} 
              className="w-full h-14 !rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              {pwSaving ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : pwSaved ? (
                <><Check className="h-4 w-4 mr-2" /> Password Updated</>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Notifications & Danger Zone */}
        <div className="space-y-6 md:space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* ── Notifications ── */}
          <div className="premium-card space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Notifications</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Choose what alerts you receive</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: "task_assigned",       label: "Task Assigned",       desc: "When a task is assigned to you" },
                { key: "deadline_reminder",   label: "Deadline Reminder",   desc: "When a task deadline is near" },
                { key: "bug_assigned",        label: "Bug Assigned",        desc: "When a bug is assigned to you" },
                { key: "project_invite",      label: "Project Invite",      desc: "When you're invited to a project" },
                { key: "email_notifications", label: "Email Notifications", desc: "Also send alerts to your email" },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{pref.label}</p>
                    <p className="text-[10px] font-bold text-slate-400">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                      checked={notifPrefs[pref.key as keyof typeof notifPrefs]}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="premium-card border-rose-100 bg-rose-50/30 space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-rose-600">Danger Zone</h2>
              <p className="text-[10px] font-bold text-rose-500/60 uppercase mt-1">Irreversible actions</p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Logging out will clear your local session. You can log back in at any time.
            </p>
            <Button onClick={() => logout()} variant="outline"
              className="w-full h-12 rounded-xl border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all">
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
