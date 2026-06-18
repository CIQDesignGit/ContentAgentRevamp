---
name: understand-project
description: Loads full project context for the Content Agent Revamp prototype — tech stack, design system tokens, product domain rules, UI instructions, and component map. Use at the start of any task in this repo, or when the user asks "what is this project?", "what design tokens exist?", "how is the project structured?", or before building/editing any page or component.
---

# Understand Project — Content Agent Revamp

Read the files below in order. Each gives the agent a different layer of context. Stop reading a file once you have the key facts; you don't need to memorise every line.

---

## Step 1 — Product context (domain rules)

Read [`product-context.md`](../../../product-context.md).

Key things to extract:
- What is the **Content Agent**? (AI recommends edits to product copy; user reviews, accepts, publishes)
- **Channel model**: PIM (Salsify) → Retailer submission → PDP verification. Retailer and PDP are phases of one channel, not two destinations.
- **Home page flow**: Review AI recommendations → Accept/Reject per field → Publish to PIM → syndication pipeline
- **Actions Log**: tracks syndication history; status vocabulary is fixed (Accepted · Pending · Rejected · Live · Partially live · Not reflected · Verification unavailable)
- **Status colour intent**: Green = success, Blue = pending, Amber = partial/warning, Red = rejected, Grey = did not run

---

## Step 2 — Design system & tokens

Read [`design-specs.md`](../../../design-specs.md).

Key things to extract:
- **Brand primary**: `bg-brand-500` (`#875bf7`) — use this for primary actions and highlights
- **Semantic tokens** (light/dark aware): `bg-primary`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border` — prefer these in components
- **Status semantic palettes**: `bg-warning-*`, `bg-success-*`, `bg-error-*`, `bg-info-*` — use for status badges/chips
- **Neutral palette**: `bg-neutral-*` — page backgrounds, borders, body text
- **Typography**: Inter (`font-sans`) for all UI, JetBrains Mono (`font-mono`) for code/data. Headings use `font-semibold` or `font-bold`
- **Radius default**: `rounded-lg` (8px) for cards/dropdowns; `rounded-xl` for modals/drawers
- **Shadow**: `shadow-md` for cards, `shadow-xl` for drawers
- All tokens live in `src/app/globals.css` inside `@theme` blocks

---

## Step 3 — UI coding rules

Read [`instructions.md`](../../../instructions.md) (and `.cursor/rules/design-instructions.mdc` — they are mirrors of each other, reading one is enough).

Key constraints to remember:
- **Icons**: Lucide React only (`import { X } from "lucide-react"`) — never Heroicons or FontAwesome
- **Colors**: Tailwind utility classes only — no raw `#hex` values; slate for neutrals, not zinc/gray
- **Images**: `https://placehold.co/{w}x{h}` for any placeholder — never local paths that don't exist
- **No gradients** unless explicitly requested
- **Styling**: Tailwind CSS 4 + shadcn/ui for base primitives + prompt-kit for chat/agentic UI
- **Layout**: Every page uses the AppShell (left icon sidebar + main content). Alerts panel is Home-page only
- **Files**: Pages ≤ 300 lines, components ≤ 150 lines — split when needed
- **Client components**: Pages and interactive components must start with `"use client"`

---

## Step 4 — Tech stack (quick reference)

No file read needed — facts are here:

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| Components | **shadcn/ui** (style: base-nova, baseColor: neutral) |
| Icons | **Lucide React** |
| Fonts | **Inter** (sans) + **JetBrains Mono** (mono) via `next/font/google` |
| Toast | **Sonner** |
| Theming | **next-themes** |
| Aliases | `@/components`, `@/lib`, `@/components/ui` |

---

## Step 5 — Component map

No file read needed — map is here:

```
src/
├── app/
│   ├── globals.css          ← ALL design tokens (@theme blocks)
│   ├── layout.tsx           ← Font loading + AppShell wrapper
│   └── page.tsx             ← Home page entry
│
├── components/
│   ├── ui/                  ← shadcn primitives (Button, Badge, Card, Dialog, Sheet, etc.)
│   ├── layout/
│   │   ├── page-shell.tsx   ← AppShell: icon sidebar + content area
│   │   └── section.tsx      ← Reusable section wrapper
│   │
│   ├── home/                ← Home page (review & publish flow)
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
│   │   ├── data.ts          ← Mock SKU data
│   │   ├── sku-content-data.ts
│   │   └── types.ts
│   │
│   └── actions-log/         ← Actions Log page (syndication history)
│       ├── actions-log-view.tsx
│       ├── actions-log-table.tsx
│       ├── action-log-detail-drawer.tsx
│       ├── action-log-timeline.tsx
│       ├── status-badge.tsx
│       ├── status-tabs.tsx
│       ├── resolve-panel-view.ts  ← Derives drawer content from row status
│       ├── status-styles.ts       ← Centralised status colour map
│       ├── field-change-card.tsx
│       ├── remarks-card-shell.tsx
│       ├── pdp-remarks-card.tsx
│       ├── syndication-remarks-card.tsx
│       ├── data.ts          ← Mock action log rows + diff data
│       └── types.ts
│
└── lib/
    ├── utils.ts             ← cn() helper (clsx + tailwind-merge)
    ├── build-bullet-slots.ts
    ├── build-title-diff.ts
    ├── publish-changes.ts
    ├── simulate-publish.ts
    └── (other domain helpers)
```

---

## Patterns to follow

When adding or editing code, match these existing patterns:

**Conditional status colour** — look at `src/components/actions-log/status-styles.ts` for the colour map pattern; don't hardcode status colours inline.

**Mock data** — mock data lives in `data.ts` files inside each feature folder. Don't scatter it across components.

**Drawer / sheet** — use shadcn `Sheet` for side panels, `Dialog` for modals.

**Shared layout** — wrap every new page in `<PageShell>` from `src/components/layout/page-shell.tsx`.

**Status badges** — reuse `src/components/actions-log/status-badge.tsx` for any PIM/Retailer/PDP status display.

---

## Quick sanity checklist (before writing any code)

- [ ] Am I using `bg-brand-*` or semantic tokens — not raw hex?
- [ ] Am I using `lucide-react` icons only?
- [ ] Does the page start with `"use client"` if it has state or event handlers?
- [ ] Is the file under the line limit (page ≤ 300, component ≤ 150)?
- [ ] Am I reusing existing `shadcn/ui` components instead of building from scratch?
- [ ] Are new status/colour decisions aligned with the status colour intent in `product-context.md`?
