"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Loader2, CheckCircle2, Plus, X } from "lucide-react";
import { studentsApi } from "@/lib/api";
import { ApiException } from "@/lib/api";
import type { StudentResponse } from "@/lib/types";

const STUDENT_ID_KEY = "th_student_id";

const PROGRAMMES = [
  "Computer Science", "Information Technology", "Electronics", "Mechanical Engineering",
  "Civil Engineering", "Chemical Engineering", "Biotechnology", "MBA",
];

export default function StudentProfilePage() {
  const [studentId, setStudentId] = useState<string>("");
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Form state — includes CGPA & backlogs (not shown in the StudentResponse, so stored locally)
  const [form, setForm] = useState({
    name: "", email: "", programme: "", graduationYear: 2025,
    cgpa: 7.5, activeBacklogs: 0, skills: [] as string[],
  });
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem(STUDENT_ID_KEY) || "STU-001";
    setStudentId(sid);

    // Try to fetch the existing student
    studentsApi.getById(sid)
      .then(s => {
        setStudent(s);
        setForm({
          name: s.name,
          email: s.email,
          programme: s.programme,
          graduationYear: s.graduationYear,
          cgpa: parseFloat(localStorage.getItem("th_cgpa") || "7.5"),
          activeBacklogs: parseInt(localStorage.getItem("th_backlogs") || "0"),
          skills: s.skills,
        });
      })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    // Store cgpa/backlogs locally since they're not returned by the API (privacy)
    localStorage.setItem("th_cgpa", String(form.cgpa));
    localStorage.setItem("th_backlogs", String(form.activeBacklogs));

    try {
      if (isNew) {
        const created = await studentsApi.create({
          name: form.name, email: form.email, programme: form.programme,
          graduationYear: form.graduationYear, cgpa: form.cgpa,
          activeBacklogs: form.activeBacklogs, skills: form.skills,
        });
        localStorage.setItem(STUDENT_ID_KEY, created.id);
        setStudentId(created.id);
        setStudent(created);
        setIsNew(false);
      } else {
        const updated = await studentsApi.update(studentId, {
          name: form.name, programme: form.programme,
          graduationYear: form.graduationYear, cgpa: form.cgpa,
          activeBacklogs: form.activeBacklogs, skills: form.skills,
        });
        setStudent(updated);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiException ? err.error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }));
    }
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-full bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.15)] flex items-center justify-center">
            <User size={22} className="text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {student ? student.name : "Create Profile"}
            </h1>
            {studentId && (
              <p className="mono text-xs text-[var(--text-muted)]">{studentId}</p>
            )}
          </div>
        </div>
        {isNew && (
          <p className="text-sm text-[var(--accent-amber)] mt-2">
            Complete your profile so the system can check your eligibility for drives.
          </p>
        )}
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSave}
        className="card p-6 space-y-5"
      >
        {/* Basic info */}
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Basic Information</p>

          {[
            { id: "profile-name", label: "Full Name *", type: "text", key: "name", placeholder: "Alice Sharma", required: true },
            { id: "profile-email", label: "Email *", type: "email", key: "email", placeholder: "alice@college.edu", required: isNew },
          ].map(({ id, label, type, key, placeholder, required }) => (
            <div key={key}>
              <label htmlFor={id} className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
              <input
                id={id}
                type={type}
                required={required}
                disabled={!isNew && key === "email"}
                placeholder={placeholder}
                value={form[key as keyof typeof form] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] disabled:opacity-50"
              />
            </div>
          ))}

          {/* Programme */}
          <div>
            <label htmlFor="profile-programme" className="block text-xs text-[var(--text-muted)] mb-1">Programme *</label>
            <select
              id="profile-programme"
              required
              value={form.programme}
              onChange={e => setForm(f => ({ ...f, programme: e.target.value }))}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
            >
              <option value="">Select programme…</option>
              {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="profile-gradyear" className="block text-xs text-[var(--text-muted)] mb-1">Graduation Year *</label>
            <input
              id="profile-gradyear"
              type="number"
              required
              min={2020}
              max={2030}
              value={form.graduationYear}
              onChange={e => setForm(f => ({ ...f, graduationYear: parseInt(e.target.value) }))}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
            />
          </div>
        </div>

        {/* Academic info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Academic Details</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.1)] text-[var(--accent-amber)] border border-[rgba(251,191,36,0.2)]">
              Never shown to companies
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-cgpa" className="block text-xs text-[var(--text-muted)] mb-1">CGPA (0–10)</label>
              <input
                id="profile-cgpa"
                type="number"
                step="0.1" min="0" max="10"
                value={form.cgpa}
                onChange={e => setForm(f => ({ ...f, cgpa: parseFloat(e.target.value) }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
              />
            </div>
            <div>
              <label htmlFor="profile-backlogs" className="block text-xs text-[var(--text-muted)] mb-1">Active Backlogs</label>
              <input
                id="profile-backlogs"
                type="number"
                min="0"
                value={form.activeBacklogs}
                onChange={e => setForm(f => ({ ...f, activeBacklogs: parseInt(e.target.value) }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Skills</p>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {form.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)]">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="ml-0.5 text-[var(--text-muted)] hover:text-[var(--accent-rose)]">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              id="profile-skill-input"
              type="text"
              placeholder="Add a skill…"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)]"
            />
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--accent-rose)]">{error}</p>}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-[var(--accent-emerald)]"
          >
            <CheckCircle2 size={15} /> Profile saved successfully!
          </motion.div>
        )}

        <button
          id="save-profile-btn"
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-[var(--accent-cyan)] text-[#0B0D10] hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          {saving ? "Saving…" : isNew ? "Create Profile" : "Save Changes"}
        </button>
      </motion.form>
    </div>
  );
}
