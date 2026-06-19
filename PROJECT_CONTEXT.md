# Project Context — Content Agent Revamp

> Single source of truth for AI agents. Read this file at the start of every task.
> Last updated: Jun 2026

---

## What is this product?

The **Content Agent** is an AI-powered tool for reviewing and publishing product copy (titles, bullets, descriptions) to an e-commerce PIM system and through to live retailer PDPs.

**Core workflow:**
1. AI generates recommendations per field (title, bullets, description)
2. User reviews — accepts or rejects each field
3. Accepted changes are published to PIM (Salsify)
4. PIM syndicates to the retailer feed → live on the product detail page (PDP)

---

## Channel Model

| Channel | What it is |
|---------|------------|
| **PIM** | Salsify — internal product catalog and source of truth |
| **Retailer / PDP** | The **same destination** — live product listing on retailer site (e.g. Amazon) |

**Retailer = PDP.** These are two phases of one channel, not two separate places:
- **"Retailer"** = submission phase (feed sent, awaiting acceptance)
- **"PDP"** = verification phase (crawl confirms change is visible on page)

---

## Pages

### Home Page (review & publish flow)
- Review AI recommendations → accept/reject per field
- Accepted fields go into a publish queue ("Staged — Not yet Published")
- Publish pushes to PIM → syndication pipeline begins
- Per-field chips track: PIM update → Retailer submission → PDP verification

### Actions Log Page (syndication history)
- Table of past publish actions per SKU
- Each row has PIM / Retailer / PDP status columns
- Clicking a row opens a detail drawer (timeline + before/after diff)

### Title Optimization Page
- Deep-dive view for optimizing a single product title
- Has locked/unlocked sections, highlights, and item-level scoring

---

## Status Vocabulary (use exactly these words)

| Stage | Values |
|-------|--------|
| **PIM Status** | Accepted · Pending · Rejected · — |
| **Retailer Status** | Accepted · Pending · Rejected · — |
| **PDP Status** | Live · Pending · Partially live · Not reflected · — · Verification unavailable |

### Status Color Intent

| Color | Meaning |
|-------|---------|
| **Green** | Accepted (PIM/Retailer) · Live (PDP) |
| **Blue** | Pending (in-flight at any stage) |
| **Amber** | Partially live · Not reflected |
| **Red** | Rejected |
| **Grey —** | Stage did not run · Verification unavailable |

### Critical Behavior Rules
1. Only **PDP: Live** = overall success. PIM/Retailer Accepted are stage wins, not end-state.
2. **Pending cascades** — upstream Pending means downstream shows Pending too.
3. **Failure never bleeds** — If PIM/Retailer is Rejected, downstream shows `—` (never ran), not red.
4. **Rejected but live** — Retailer Rejected + PDP Live = show both statuses + "Flagged for FDE" banner.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| Components | **shadcn/ui** (style: base-nova, baseColor: neutral) |
| Icons | **Lucide React only** |
| Fonts | Inter (sans) + JetBrains Mono (mono) via `next/font/google` |
| Toast | **Sonner** |
| Theming | **next-themes** |
| Path aliases | `@/components`, `@/lib`, `@/components/ui` |

---

## Design Tokens

All tokens live in `src/app/globals.css` inside `@theme` blocks.

### Brand — Purple
| Class | Hex | Use |
|-------|-----|-----|
| `bg-brand-500` | `#875bf7` | **PRIMARY** — buttons, highlights, focus rings |
| `bg-brand-600` | `#7c3aed` | Hover on primary |
| `bg-brand-200` | `#ddd6fe` | Accent backgrounds |
| `bg-brand-100` | `#f3e8ff` | Light tints |

### Semantic Tokens (light/dark aware — prefer these in components)
| Class | Use |
|-------|-----|
| `bg-primary` / `text-primary-foreground` | Primary action surfaces |
| `text-foreground` | Main body text |
| `text-muted-foreground` | Secondary / helper text |
| `bg-muted` | Muted backgrounds |
| `border-border` | Borders and dividers |
| `bg-background` | Page background |

### Status Semantic Palettes
| Palette | Background | Text | Use |
|---------|-----------|------|-----|
| Success | `bg-success-100` | `text-success-700` | Accepted · Live |
| Error | `bg-error-100` | `text-error-700` | Rejected |
| Warning | `bg-warning-100` | `text-warning-600` | Partially live · Not reflected |
| Info | `bg-info-100` | `text-info-700` | Pending |

### Neutral Palette (use `slate-*` for inline neutrals)
`bg-neutral-50` through `bg-neutral-950` — page backgrounds, borders, body text.
> In Tailwind utilities: prefer `slate-*` for inline neutral classes (e.g. `text-slate-500`, `border-slate-200`). Never `gray-*` or `zinc-*`.

### Typography
- **Sans**: Inter — all body text, labels, headings (`font-sans`)
- **Mono**: JetBrains Mono — code, data values, logs (`font-mono`)
- Headings: `font-semibold` or `font-bold`
- Muted text: `text-muted-foreground`

### Radius
| Token | Use |
|-------|-----|
| `rounded-lg` (8px) | Default — cards, dropdowns |
| `rounded-xl` (12px) | Modals, drawers |
| `rounded-full` | Pills, avatars |

### Shadows
| Token | Use |
|-------|-----|
| `shadow-md` | Cards, panels |
| `shadow-xl` | Drawers, side panels |
| `shadow-brand` | Focused/active brand buttons |

---

## UI Rules (non-negotiable)

- **Icons**: Lucide React only — `import { X } from "lucide-react"`. Never Heroicons or FontAwesome.
- **Colors**: Tailwind classes only — no raw `#hex` values anywhere.
- **Neutrals**: `slate-*` for inline utilities, `neutral-*` tokens for design system values. Never `gray-*` or `zinc-*`.
- **Images**: `https://placehold.co/{w}x{h}` for placeholders — never local paths that don't exist.
- **No gradients** unless explicitly requested by the user.
- **Layout**: Every page wraps in `<PageShell>` (left icon sidebar + main content). Alerts panel is **Home page only**.
- **File limits**: Pages ≤ 300 lines · Components ≤ 150 lines — split into sub-components when needed.
- **Client directive**: Any page/component with state or event handlers must start with `"use client"`.
- **Styling engine**: Tailwind CSS 4 + shadcn/ui for base primitives + prompt-kit for chat/agentic UI.

---

## Component Map

```
src/
├── app/
│   ├── globals.css                    ← ALL design tokens (@theme blocks)
│   ├── layout.tsx                     ← Font loading + AppShell wrapper
│   ├── page.tsx                       ← Home page entry
│   ├── actions-log/page.tsx           ← Actions Log page entry
│   └── title-optimization/page.tsx   ← Title Optimization page entry
│
├── components/
│   ├── ui/                            ← shadcn primitives (Button, Badge, Card, Dialog, Sheet…)
│   │
│   ├── layout/
│   │   ├── page-shell.tsx             ← AppShell: icon sidebar + content area
│   │   └── section.tsx                ← Reusable section wrapper
│   │
│   ├── home/                          ← Home page (review & publish flow)
│   │   ├── title-section.tsx
│   │   ├── bullet-section.tsx
│   │   ├── description-section.tsx
│   │   ├── image-section.tsx
│   │   ├── sku-sidebar.tsx
│   │   ├── right-rail.tsx
│   │   ├── content-recommendation-card.tsx
│   │   ├── reasoning-ui.tsx
│   │   ├── editable-recommendation-field.tsx
│   │   ├── publish-confirm-dialog.tsx
│   │   ├── publish-queue-list.tsx
│   │   ├── recommendation-sync-ui.tsx
│   │   ├── source-compare-grid.tsx
│   │   ├── product-header.tsx
│   │   ├── app-header.tsx
│   │   ├── filter-bar.tsx
│   │   ├── data.ts                    ← Mock SKU data
│   │   ├── sku-content-data.ts
│   │   └── types.ts
│   │
│   ├── title-optimization/            ← Title Optimization page
│   │   ├── locked-section.tsx
│   │   ├── item-highlights-section.tsx
│   │   ├── highlights-data.ts
│   │   └── (other sub-components)
│   │
│   └── actions-log/                   ← Actions Log page (syndication history)
│       ├── actions-log-view.tsx
│       ├── actions-log-table.tsx
│       ├── action-log-detail-drawer.tsx
│       ├── action-log-timeline.tsx
│       ├── status-badge.tsx           ← Reuse for any PIM/Retailer/PDP status
│       ├── status-tabs.tsx
│       ├── resolve-panel-view.ts      ← Derives drawer content from row status
│       ├── status-styles.ts           ← Centralised status colour map
│       ├── field-change-card.tsx
│       ├── remarks-card-shell.tsx
│       ├── pdp-remarks-card.tsx
│       ├── syndication-remarks-card.tsx
│       ├── data.ts                    ← Mock action log rows + diff data
│       └── types.ts
│
└── lib/
    ├── utils.ts                       ← cn() helper (clsx + tailwind-merge)
    ├── build-bullet-slots.ts
    ├── build-title-diff.ts
    ├── publish-changes.ts
    ├── simulate-publish.ts
    └── (other domain helpers)
```

---

## Code Patterns to Follow

**Status colors** — always use `src/components/actions-log/status-styles.ts`. Never hardcode status colours inline.

**Mock data** — lives in `data.ts` inside each feature folder. Don't scatter it across components.

**Side panels** — use shadcn `Sheet`. Modals — use shadcn `Dialog`.

**New pages** — always wrap in `<PageShell>` from `src/components/layout/page-shell.tsx`.

**Status badges** — reuse `src/components/actions-log/status-badge.tsx` for any PIM/Retailer/PDP status.

**Diff display** — title uses inline word-level diff; description uses block before/after; bullets use list view with `+` markers.

---

## Sanity Checklist (run before writing any code)

- [ ] Using `bg-brand-*` or semantic tokens — not raw hex?
- [ ] Using `lucide-react` icons only?
- [ ] Does the page/component start with `"use client"` if it has state or handlers?
- [ ] Is the file under the line limit? (page ≤ 300, component ≤ 150)
- [ ] Reusing existing `shadcn/ui` components instead of building from scratch?
- [ ] Status/colour decisions aligned with the colour intent table above?
- [ ] Mock data goes in `data.ts`, not inline in components?
