"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { companiesApi } from "@/lib/api";
import { ApiException } from "@/lib/api";
import type { CompanyResponse } from "@/lib/types";
import { SkeletonList } from "@/components/Skeleton";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", sector: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    companiesApi.getAll().then(setCompanies).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const company = await companiesApi.create(form);
      setCompanies(c => [company, ...c]);
      setForm({ name: "", sector: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setCreateError(err instanceof ApiException ? err.error.message : "Failed to create company");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Companies</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage recruiting companies</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-purple)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> New Company
        </motion.button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="card p-6 space-y-4"
        >
          <h2 className="font-semibold text-[var(--text-primary)]">New Company</h2>
          {[
            { id: "company-name", label: "Name *", key: "name", placeholder: "e.g. Acme Corp", required: true },
            { id: "company-sector", label: "Sector", key: "sector", placeholder: "e.g. Technology, Finance" },
            { id: "company-description", label: "Description", key: "description", placeholder: "Brief description" },
          ].map(({ id, label, key, placeholder, required }) => (
            <div key={key}>
              <label htmlFor={id} className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
              <input
                id={id}
                type="text"
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
          ))}
          {createError && <p className="text-xs text-[var(--accent-rose)]">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent-purple)] text-white disabled:opacity-60"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {creating ? "Creating…" : "Create Company"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {loading && <SkeletonList count={3} />}

      {!loading && companies.length === 0 && (
        <div className="card p-12 text-center">
          <Building2 size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="font-medium text-[var(--text-primary)] mb-1">No companies yet</p>
          <p className="text-sm text-[var(--text-muted)]">Create a company first to publish drives.</p>
        </div>
      )}

      <div className="space-y-3">
        {companies.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="mono text-[10px] text-[var(--text-muted)] mb-1">{c.id}</p>
                <p className="font-semibold text-[var(--text-primary)]">{c.name}</p>
                {c.sector && <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.sector}</p>}
                {c.description && <p className="text-sm text-[var(--text-muted)] mt-2">{c.description}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
