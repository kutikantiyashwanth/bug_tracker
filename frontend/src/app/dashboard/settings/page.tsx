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
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Profile ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-800">Profile</h2>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg bg-purple-100 text-purple-700 font-bold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{currentUser.name}</p>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 capitalize">
              {currentUser.role?.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              className="h-9 text-sm border-gray-200 focus:border-purple-400" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Email</Label>
            <Input value={email} readOnly
              className="h-9 text-sm border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-[10px] text-gray-400">Email cannot be changed</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin / Team Lead</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="tester">Tester</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600">Skills</Label>
          <div className="flex flex-wrap gap-2 min-h-8">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium">
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g. React, Testing...)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="h-9 text-sm border-gray-200 flex-1"
            />
            <button onClick={addSkill}
              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {profileError && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {profileError}
          </div>
        )}

        <button onClick={handleSaveProfile} disabled={profileSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {profileSaving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : profileSaved ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save Profile</>
          )}
        </button>
      </div>

      {/* ── Security ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-800">Security</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Current Password</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••" className="h-9 text-sm border-gray-200 pr-9" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">New Password</Label>
            <Input type={showPw ? "text" : "password"} value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min 6 characters" className="h-9 text-sm border-gray-200" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-gray-600">Confirm New Password</Label>
            <Input type={showPw ? "text" : "password"} value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat new password" className="h-9 text-sm border-gray-200 max-w-xs" />
          </div>
        </div>

        {pwError && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {pwError}
          </div>
        )}

        <button onClick={handleChangePassword} disabled={pwSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
          {pwSaving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : pwSaved ? (
            <><Check className="h-4 w-4" /> Password Updated!</>
          ) : (
            "Update Password"
          )}
        </button>
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-800">Notification Preferences</h2>
        </div>

        {[
          { key: "task_assigned",      label: "Task assignments",    desc: "When a task is assigned to you" },
          { key: "deadline_reminder",  label: "Deadline reminders",  desc: "Before task deadlines" },
          { key: "bug_assigned",       label: "Bug assignments",     desc: "When a bug is assigned to you" },
          { key: "project_invite",     label: "Project invites",     desc: "When invited to a project" },
          { key: "email_notifications",label: "Email notifications", desc: "Also receive alerts via email" },
        ].map((pref) => (
          <div key={pref.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700">{pref.label}</p>
              <p className="text-xs text-gray-400">{pref.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox"
                checked={notifPrefs[pref.key as keyof typeof notifPrefs]}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, [pref.key]: e.target.checked })}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-purple-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h2>
        <p className="text-xs text-gray-500 mb-3">Once you sign out, you'll need to log in again.</p>
        <button onClick={() => logout()}
          className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
