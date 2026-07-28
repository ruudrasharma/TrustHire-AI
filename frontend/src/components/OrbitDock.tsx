"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Briefcase, FileText, Sparkles, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface DockItem {
  href: string;
  icon: React.ElementType;
  label: string;
  role?: "student" | "coordinator" | "both";
}

const STUDENT_ITEMS: DockItem[] = [
  { href: "/student",              icon: Home,          label: "Home" },
  { href: "/student/drives",       icon: Briefcase,     label: "Drives" },
  { href: "/student/applications", icon: FileText,      label: "My Applications" },
  { href: "/student/chat",         icon: Sparkles,      label: "AI Assistant" },
];

const COORDINATOR_ITEMS: DockItem[] = [
  { href: "/coordinator",                icon: LayoutDashboard, label: "Console" },
  { href: "/coordinator/companies",      icon: Settings,        label: "Companies" },
  { href: "/coordinator/drives",         icon: Briefcase,       label: "Drives" },
  { href: "/coordinator/applications",   icon: FileText,        label: "Applications" },
];

interface OrbitDockProps {
  role: "student" | "coordinator";
}

export default function OrbitDock({ role }: OrbitDockProps) {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const items = role === "student" ? STUDENT_ITEMS : COORDINATOR_ITEMS;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 z-50"
      aria-label="Primary navigation"
    >
      <div className="glass rounded-2xl px-3 py-3 flex items-center gap-1 shadow-float">
        {items.map((item, idx) => {
          // Exact match for root-role pages (/student, /coordinator), prefix for all others
          const isRootPage = item.href === "/student" || item.href === "/coordinator";
          const isActive = isRootPage
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href} className="relative">
              <Link
                href={item.href}
                id={`dock-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-xl
                  transition-all duration-200 group
                  ${isActive
                    ? "bg-[rgba(34,211,238,0.12)] text-[var(--accent-cyan)] orbit-glow"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                  }
                `}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <motion.span
                    layoutId="orbit-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-cyan)]"
                  />
                )}
              </Link>

              {/* Label tooltip on hover */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.nav>
  );
}
