# UI Design System — TrustHire AI Web App

## 1. Design Concept

TrustHire AI's core idea is **evidence over assertion** — eligibility results are signed, application status changes are hash-chained, receipts are independently verifiable. The UI should make that tangible instead of hiding it behind a normal CRUD dashboard.

Two decisions carry the whole concept:

**The Proof Rail.** Instead of a generic sidebar-plus-topbar, the app uses a persistent right-hand panel — the *Proof Rail* — that shows the live verification state of whatever's on screen: a signature badge on an eligibility result, a hash-chain visualization on an application timeline, a "recompute & verify" action on a receipt. It's the one UI element that's genuinely unique to this product, because it's the one thing this product does that others don't.

**The Orbit Dock.** Primary navigation is a small floating icon dock (bottom-center on mobile, bottom-left on desktop) rather than a full-height sidebar with text labels — closer to Arc/Raycast than to a SaaS admin template. Power users navigate via a command palette (⌘K); the dock is for everyone else. This keeps the canvas open for content and the Proof Rail, and avoids the "generic dashboard" look explicitly ruled out below.

Everything else — cards, tables, forms — is intentionally quiet, so the Proof Rail and the data it's verifying stay the visual focus.

## 2. Design Philosophy
- Minimal but not empty — premium enterprise quality, 2026-era UI
- Pixel-perfect spacing, clean visual hierarchy, functional aesthetics
- Sophisticated micro-interactions, usability first
- Subtle glassmorphism, layered depth, rounded (not exaggerated) corners
- Elegant shadows, large whitespace, high-contrast typography over color-for-hierarchy
- Beautiful empty states, interactive charts, modern loading skeletons

## 3. Color Palette — "Verified Graphite"

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#0B0D10` | app background (dark) |
| `--bg-base-light` | `#FAFAF9` | app background (light) |
| `--surface-1` | `#12151A` / `#FFFFFF` | primary card surface |
| `--surface-2` | `#181C22` / `#F3F4F6` | elevated/glass surface |
| `--surface-glass` | `rgba(18,21,26,0.55)` | frosted panels (Proof Rail, modals), `backdrop-filter: blur(20px)` |
| `--accent-cyan` | `#22D3EE` | primary interactive accent |
| `--accent-purple` | `#A78BFA` | secondary accent (AI assistant surfaces) |
| `--accent-emerald` | `#34D399` | verified / success / eligible |
| `--accent-amber` | `#FBBF24` | pending / under review |
| `--accent-rose` | `#FB7185` | ineligible / rejected / error |
| `--text-primary` | `#F5F5F4` / `#111214` | primary text |
| `--text-muted` | `#9CA3AF` | secondary text |
| `--border-hairline` | `rgba(255,255,255,0.08)` | 1px separators |

Rule: never more than one accent color active in a single component. Emerald/amber/rose are reserved exclusively for verification/status meaning — never used decoratively.

## 4. Typography

- **UI text:** Geist (fallback: Inter, SF Pro) — variable weight 400–600, tight tracking on headings.
- **Data / proof text:** JetBrains Mono for anything cryptographic — hashes, signatures, application/drive IDs. This is a deliberate, small signal: "this is verifiable data," visually distinct from prose.
- Scale: `text-xs` (12px, mono metadata) → `text-sm` (14px, body) → `text-base` (16px) → `text-xl/2xl` (section headers) → `text-4xl/5xl` (hero/landing only). Hierarchy comes from weight + spacing, not color.

## 5. Layout Primitives (explicitly NOT this)
Do not resemble Bootstrap dashboards, Material UI examples, AdminLTE, generic SaaS templates, or a typical full-height-sidebar + topbar combo.

Instead:
- **Orbit Dock** — floating pill-shaped nav, 4–5 icons max (Home, Drives, Applications, Assistant, Coordinator-only: Console), active item gets a soft glow + label fade-in on hover.
- **Command Palette (⌘K)** — fuzzy search across drives, applications, actions ("apply to DRV-101", "verify receipt APP-501").
- **Proof Rail** — collapsible right panel, 320–380px, glass surface, shows contextual verification data for the current screen; collapses to an icon on mobile, becomes a bottom sheet.
- **Canvas** — centered content, max-width ~1100px on desktop, generous side whitespace rather than edge-to-edge tables.

## 6. Components (all custom, shadcn/ui as base only)
Cards, buttons, inputs, tables, tabs, modals, notifications/toasts, tooltips, charts, progress indicators, search, filters, command palette, settings panel — every one restyled with the tokens above; none used stock. Specific custom components unique to this product:
- **SignatureBadge** — small pill showing "Verified ✓" (emerald) or "Signature Invalid" (rose) with a monospace truncated hash, expandable on click to the full signature.
- **HashChainTimeline** — vertical timeline of `AuditEvent`s per application; each node shows status transition + its hash, connected by a visible chain line; broken-chain state renders in rose.
- **EligibilityReasonList** — animated list of reasons (stagger-in), emerald check icons for met criteria, rose x-icons for unmet ones.
- **ReceiptCard** — a physical-receipt-styled card (subtle perforated-edge motif, tasteful, not skeuomorphic) with a "Verify" button that calls `POST /api/verify` live and animates the result.

## 7. Motion
Framer Motion, spring physics (`type: "spring", stiffness: 300, damping: 30` as default), fade+scale for modals, slide for the Proof Rail and command palette, subtle stagger for list items, no motion longer than ~300ms for anything in the primary interaction path. Loading skeletons pulse, never spin.

## 8. Screens (source of truth: `flow.md` Part 2)
Landing → Student Home (drive feed) → Drive Detail (+ live eligibility check) → Apply Confirm → My Applications (+ HashChainTimeline) → Receipt (+ ReceiptCard) → AI Assistant (chat drawer) → Coordinator Console (companies, drives, applications review). Full screen-to-endpoint mapping is in `flow.md`.

## 9. Accessibility & Responsiveness
WCAG AA contrast minimum, full keyboard navigation (⌘K included), visible focus rings using `--accent-cyan`, mobile-first breakpoints, Proof Rail becomes a bottom sheet under 768px, Orbit Dock becomes bottom-center under 1024px.

---

## 10. Build Prompt (for Claude Code / Cursor / v0 — paste as-is)

```
You are an award-winning Senior Product Designer at Apple, Linear, Stripe, and Vercel.
Design and build the web app for TrustHire AI — a campus placement platform whose
defining idea is "evidence over assertion": eligibility results are cryptographically
signed, application status changes are hash-chained, and students can generate a
signed receipt that anyone can independently verify. The UI must make that
verifiability tangible and central, not decorative.

Design a completely original, premium, futuristic user interface. Avoid generic
templates or common dashboard layouts. Every screen should feel handcrafted,
elegant, and highly polished.

## Design Philosophy
- Minimal but not empty
- Premium enterprise quality
- Modern 2026 UI trends
- Pixel-perfect spacing
- Clean visual hierarchy
- Functional aesthetics
- Sophisticated micro interactions
- Focus on usability first

## Visual Style
- Glassmorphism used subtly
- Soft depth with layered surfaces
- Rounded corners (not exaggerated)
- Beautiful gradients only where appropriate
- Elegant shadows
- High contrast typography
- Large whitespace
- Rich hover states
- Smooth animations
- Dynamic lighting effects
- Floating cards
- Premium icons
- Beautiful empty states
- Interactive charts
- Modern loading skeletons

## Layout
Do NOT build:
- Bootstrap dashboards
- Material UI examples
- AdminLTE
- Generic SaaS templates
- Typical sidebar + topbar combinations

Instead build this original layout:
- An "Orbit Dock": a floating pill-shaped icon navigation (bottom-center on mobile,
  bottom-left on desktop), 4-5 items max, soft glow on the active item.
- A "Command Palette" (⌘K) for fuzzy search/navigation/actions.
- A "Proof Rail": a persistent, collapsible right-hand glass panel (320-380px) that
  shows the live verification state of whatever is on screen — a signed eligibility
  result, a hash-chain timeline for an application, or a receipt verification action.
  This is the single most important, most unique surface in the app.
- A centered canvas (max-width ~1100px) with generous whitespace, not edge-to-edge
  tables.

## Colour Palette — "Verified Graphite" (use exactly this palette)
- Background (dark): #0B0D10 | Background (light): #FAFAF9
- Surface 1: #12151A / #FFFFFF | Surface 2: #181C22 / #F3F4F6
- Glass surface: rgba(18,21,26,0.55) with backdrop-blur(20px)
- Primary accent (interactive): Electric cyan #22D3EE
- Secondary accent (AI assistant surfaces only): Soft purple #A78BFA
- Verified/eligible/success: Emerald #34D399
- Pending/under review: Amber #FBBF24
- Ineligible/rejected/error: Rose #FB7185
- Text primary: #F5F5F4 (dark) / #111214 (light) | Text muted: #9CA3AF
- Hairline borders: rgba(255,255,255,0.08)
Never use more than one accent colour in a single component. Emerald/amber/rose are
reserved strictly for verification/status meaning, never decorative.

## Typography
- UI text: Geist (fallback Inter/SF Pro), variable weight 400-600
- Any cryptographic/ID data (hashes, signatures, application IDs, drive IDs):
  JetBrains Mono, visually distinct from prose — this is intentional, it signals
  "this is verifiable data"
- Build hierarchy through weight, spacing, and scale — not colour

## Components (all custom, shadcn/ui as a foundation only, heavily restyled)
Cards, buttons, inputs, tables, navigation, tabs, modals, notifications, tooltips,
charts, progress indicators, search, filters, command palette, settings panels —
none used stock. Also build these product-specific components:
- SignatureBadge: "Verified ✓" (emerald) / "Signature Invalid" (rose) pill with a
  truncated monospace hash, expandable to full signature on click
- HashChainTimeline: vertical timeline of an application's status-change events,
  each node showing the transition + its hash, connected by a visible chain line;
  renders in rose if the chain fails verification
- EligibilityReasonList: animated stagger-in list of eligibility reasons, emerald
  check icons for met criteria, rose x-icons for unmet ones
- ReceiptCard: receipt-styled card with a live "Verify" button that calls the
  verification endpoint and animates the pass/fail result

## Motion
Framer Motion, spring physics (stiffness 300, damping 30) as the default transition.
Fade+scale for modals, slide for the Proof Rail and command palette, subtle stagger
for list items. Nothing in the primary interaction path animates longer than ~300ms.
Loading skeletons pulse, never spin.

## Screens to build
1. Landing / role select
2. Student Home (drive feed, filterable)
3. Drive Detail with live Eligibility Check (Proof Rail shows the signed result)
4. Apply Confirm → Application Submitted
5. My Applications → Application Detail with HashChainTimeline in the Proof Rail
6. Receipt screen with ReceiptCard + live verify action
7. AI Career Assistant chat drawer (FAQ / eligibility explain / prep guidance / profile summary)
8. Coordinator Console: Manage Companies, Manage Drives (criteria builder), Applications Review

## UX Principles
- One primary action per screen
- Clear visual focus, progressive disclosure
- WCAG AA accessibility, full keyboard shortcuts (⌘K included)
- Responsive, mobile-first (Proof Rail becomes a bottom sheet under 768px, Orbit
  Dock moves bottom-center under 1024px)
- Fast perceived performance — skeleton loading everywhere, no blank-white flashes

## Code Requirements
- React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- shadcn/ui only as a foundation — heavily customised, never stock
- Lucide Icons
- Dark/light mode
- Fully responsive, accessible
- Clean, reusable component architecture and design system (tokens in
  tailwind.config.ts + CSS variables, no inline magic hex values)
- No placeholder styling, no lorem ipsum — use real TrustHire AI copy and the
  actual API contract from this project's flow.md/tech-design.md

## Quality Bar
The result should belong alongside Linear, Raycast, Vercel, Stripe, Notion, Arc
Browser, Figma, and Framer — without imitating any of them directly. Every pixel
should feel intentional.

Before writing code, briefly describe the design concept and the reasoning behind
the major layout decisions (Orbit Dock, Proof Rail, colour/type choices). Then
generate the complete implementation, screen by screen, wiring every action to the
real backend API defined in tech-design.md and flow.md — no mocked data.
```
