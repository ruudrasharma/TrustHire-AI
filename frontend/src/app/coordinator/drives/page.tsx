"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Briefcase, Loader2, CheckCircle2, Clock } from "lucide-react";
import { drivesApi, companiesApi } from "@/lib/api";
import { ApiException } from "@/lib/api";
import type { DriveResponse, CompanyResponse } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";
import { SkeletonList } from "@/components/Skeleton";

export default function CoordinatorDrivesPage() {
  const [drives, setDrives] = useState<DriveResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyId: "", role: "", location: "", packageOffered: "",
    deadline: "", requiredSkills: "", minCgpa: "7.0",
    maxActiveBacklogs: "1", eligibleProgrammes: "", minGraduationYear: "2025",
  });

  useEffect(() => {
    Promise.all([drivesApi.getAll(), companiesApi.getAll()])
      .then(([d, c]) => { setDrives(d); setCompanies(c); })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const drive = await drivesApi.create({
        companyId: form.companyId,
        role: form.role,
        location: form.location,
        packageOffered: form.packageOffered,
        deadline: new Date(form.deadline).toISOString(),
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        minCgpa: parseFloat(form.minCgpa),
        maxActiveBacklogs: parseInt(form.maxActiveBacklogs),
        eligibleProgrammes: form.eligibleProgrammes.split(",").map(s => s.trim()).filter(Boolean),
        minGraduationYear: parseInt(form.minGraduationYear),
      });
      setDrives(d => [drive, ...d]);
      setShowForm(false);
    } catch (err) {
      setCreateError(err instanceof ApiException ? err.error.message : "Failed to create drive");
    } finally {
      setCreating(false);
    }
  }

  const Field = ({ id, label, value, type = "text", onChange, placeholder, required }: any) => (
    <div>
      <label htmlFor={id} className="block text-xs text-[var(--text-muted)] mb-1">{label}{required && " *"}</label>
      <input
        id={id} type={type} required={required} placeholder={placeholder} value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Placement Drives</h1>
          <p className="text-sm text-[var(--text-muted)]">Create and manage placement drives</p>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-purple)] text-white hover:opacity-90">
          <Plus size={14} /> New Drive
        </motion.button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="card p-6 space-y-4">
          <h2 className="font-semibold text-[var(--text-primary)]">New Placement Drive</h2>
          <p className="text-xs text-[var(--text-muted)] -mt-2">Configure eligibility criteria below</p>

          {/* Company selector */}
          <div>
            <label htmlFor="drive-company" className="block text-xs text-[var(--text-muted)] mb-1">Company *</label>
            <select id="drive-company" required value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)]">
              <option value="">Select a company…</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field id="drive-role" label="Role" value={form.role} onChange={(v: string) => setForm(f => ({...f, role: v}))} placeholder="e.g. Software Engineer" required />
            <Field id="drive-location" label="Location" value={form.location} onChange={(v: string) => setForm(f => ({...f, location: v}))} placeholder="e.g. Bangalore" />
            <Field id="drive-package" label="Package" value={form.packageOffered} onChange={(v: string) => setForm(f => ({...f, packageOffered: v}))} placeholder="e.g. 12 LPA" />
            <Field id="drive-deadline" label="Deadline" type="datetime-local" value={form.deadline} onChange={(v: string) => setForm(f => ({...f, deadline: v}))} required />
          </div>

          <Field id="drive-skills" label="Required Skills (comma-separated)" value={form.requiredSkills} onChange={(v: string) => setForm(f => ({...f, requiredSkills: v}))} placeholder="Java, Spring Boot, SQL" />
          <Field id="drive-programmes" label="Eligible Programmes (comma-separated)" value={form.eligibleProgrammes} onChange={(v: string) => setForm(f => ({...f, eligibleProgrammes: v}))} placeholder="Computer Science, IT" />

          <div className="grid grid-cols-3 gap-4">
            <Field id="drive-cgpa" label="Min CGPA" type="number" value={form.minCgpa} onChange={(v: string) => setForm(f => ({...f, minCgpa: v}))} placeholder="7.0" />
            <Field id="drive-backlogs" label="Max Backlogs" type="number" value={form.maxActiveBacklogs} onChange={(v: string) => setForm(f => ({...f, maxActiveBacklogs: v}))} placeholder="1" />
            <Field id="drive-gradyear" label="Min Grad Year" type="number" value={form.minGraduationYear} onChange={(v: string) => setForm(f => ({...f, minGraduationYear: v}))} placeholder="2025" />
          </div>

          {createError && <p className="text-xs text-[var(--accent-rose)]">{createError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-purple)] text-white disabled:opacity-60">
              {creating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {creating ? "Creating…" : "Create Drive"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">Cancel</button>
          </div>
        </motion.form>
      )}

      {loading && <SkeletonList count={4} />}

      {!loading && drives.length === 0 && (
        <div className="card p-12 text-center">
          <Briefcase size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)] mb-1">No drives created yet</p>
        </div>
      )}

      <div className="space-y-3">
        {drives.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{d.id}</p>
                <p className="font-semibold text-[var(--text-primary)]">{d.role}</p>
                <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                  <span>{d.location || "Remote"}</span>
                  {d.packageOffered && <span className="text-[var(--accent-emerald)]">{d.packageOffered}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  d.status === "OPEN" ? "bg-[rgba(52,211,153,0.1)] text-[var(--accent-emerald)]" : "bg-[rgba(156,163,175,0.1)] text-[var(--text-muted)]"
                }`}>{d.status}</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1 justify-end">
                  <Clock size={9} /> Closes {formatDateOnly(d.deadline)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
