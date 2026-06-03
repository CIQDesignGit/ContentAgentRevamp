# Product Context — Content Agent

High-level product behavior and domain rules for the Content Agent prototype.

---

## Channels & terminology

| Channel | What it is |
|---------|------------|
| **PIM** | Salsify (or equivalent) — internal product catalog and source of truth. Shown as **Salsify** in compare UI. |
| **Retailer / PDP** | **The same thing.** The live product listing on the retailer site (e.g. Amazon product detail page). |

**Retailer = PDP.** Use one mental model: copy is syndicated from PIM to the retailer, then verified on the **product detail page (PDP)**. In the UI you may see both words:

- **“Retailer”** — compare column label, submission step (“Submitted to retailer”, “At retailer”)
- **“PDP”** — verification and outcome (“PDP verifying”, “PDP updated”, “Live on PDP”)

Those labels describe **phases on one channel**, not two separate destinations. When both are updated, the user’s change is reflected on the same Amazon (or other retailer) listing.

The **Actions Log** still models **Retailer** and **PDP** as separate timeline stages (submission vs crawl/reflection). That split is operational (did the retailer accept the feed vs is the listing visible on the page), not two different places.

### Home page (review & publish)

1. **Review** — Accept / reject AI recommendations per field (title, bullets, description).
2. **Publish** — Push accepted changes to PIM, then through the retailer/PDP pipeline.
3. **Staged** — Accepted but not yet published (`Staged for publish · Not yet on PDP`).
4. **Syndication** — After publish, per-field chips track PIM update → retailer submission → PDP verification → **PIM updated** + **PDP updated** when complete.

---

## Actions Log

The Actions Log tracks syndication of product content from PIM through retailer acceptance to PDP reflection. Each row represents one syndication action on a SKU.

> **Retailer vs PDP in this table:** Same customer-facing listing; **Retailer** = feed/submission status, **PDP** = whether the page reflects the change (crawl/verification). See [Channels & terminology](#channels--terminology).

### Status vocabulary (use exactly)

| Stage | Values |
|-------|--------|
| **PIM Status** | Accepted · Pending · Rejected · — |
| **Retailer Status** | Accepted · Pending · Rejected · — |
| **PDP Status** | Live · Pending · Partially live · Not reflected · — · Verification unavailable |

### Colour intent

| Colour | Meaning |
|--------|---------|
| **Green** | Accepted (PIM / Retailer) · Live (PDP) |
| **Blue** | Pending (in-flight at any stage) |
| **Amber** | Partially live · Not reflected |
| **Red** | Rejected |
| **Grey —** | Stage did not run · Verification unavailable |

### Status badge icons

| Stage | Status | Icon |
|-------|--------|------|
| PIM / Retailer | Accepted | Check (green) |
| PIM / Retailer | Pending | Clock (blue) |
| PIM / Retailer | Rejected | X (red) |
| Retailer | — | Em dash only, grey (no badge) |
| PDP | Live | Check in circle (green) |
| PDP | Pending | Clock (blue) |
| PDP | Partially live | File question mark (amber) |
| PDP | Not reflected | Warning triangle (amber) |
| PDP | — | Em dash only, grey (no badge) |
| PDP | Verification unavailable | Question mark in circle (grey) |

### Critical behaviour rules

1. **Acceptance ≠ Live** — Only **PDP: Live** is the overall success outcome for a syndication. PIM and Retailer **Accepted** still use green stage badges, but the drawer scenario badge treats Live as the end-state success.
2. **Pending cascades** — While an upstream stage is Pending, downstream stages display as Pending in the table and timeline.
3. **Failure is never misattributed** — If PIM or Retailer is Rejected, downstream stages show **—** (they never ran), not red. The Remarks block explains the breakpoint.
4. **Rejected but live anyway** — If retailer rejected but crawl finds content live on PDP: PDP shows Live/Partially live, Retailer keeps Rejected, Remarks reconcile the anomaly, and a **Flagged for FDE** banner appears in the drawer.

### Detail drawer layout (top to bottom)

1. **Header** — Product name, SKU/ASIN, actioned timestamp, user, overall scenario badge
2. **Stage timeline** — PIM → Retailer → PDP, each with status label + timestamp; **remarks** directly below the timeline in the same block
3. **Change record** — Before/after diff per field, or "Attempted changes — not applied" when rejected before PDP

### Remarks styling (unified card)

All remarks under the stage timeline use the same **card shell**: white background, rounded border, 4px left accent, uppercase label, colored headline, body text.

| Tone | Left accent | Used for |
|------|-------------|----------|
| **Red (error)** | `error-600` | PIM / Retailer rejection — error list, copy raw, AI summarize |
| **Blue (info)** | `info-600` | Pending — awaiting retailer or PDP verification |
| **Amber (warning)** | `warning-600` | Partially live / not reflected — PDP field issues |
| **Green (success)** | `success-600` | Live — all fields reflected |

**Rejection / error** includes: summary line, copy raw, collapsible raw response.

**PDP partially live** includes: body summary, likely cause + next step in a slate detail box.

**Pending / live (simple)** includes: headline derived from scenario + `syndicationRemarks` summary line.

### Remarks & error handling

**PIM / Retailer rejection**

- Headline + summary (plain terms)
- Copy raw control
- Raw response verbatim (collapsible)

**PDP not reflected**

- Plain-language summary naming specific field(s)
- Likely cause + next step

### Change record (before/after diff)

Per changed field:

- **Reflection chip** — Live · date, Pending, or Not reflected
- **Left accent** — Green = reflected on PDP, Amber = not reflected, Blue = pending

| Field type | Diff format |
|------------|-------------|
| Title (short) | Inline word-level — struck-through removed, green-highlight added |
| Description (long) | Block before / block after; after highlighted when added from empty |
| Bullets | List view; new bullets marked with `+` and green highlight |

Legend above diff: `removed` (strikethrough grey) · `added` (green on light green background)

### Prototype demo rows

Six table rows cover the status matrix:

| # | PIM | Retailer | PDP | Scenario |
|---|-----|----------|-----|----------|
| 1 | Accepted | Accepted | Live | Happy path |
| 2 | Accepted | Accepted | Pending | PDP verifying (day X of 5) |
| 3 | Accepted | Accepted | Partially live | Mixed field reflection + PDP remarks |
| 4 | Accepted | Pending | Pending | Awaiting retailer (cascade) |
| 5 | Accepted | Rejected | — | Long Amazon error + attempted not applied |
| 6 | Accepted | Rejected | Live | Rejected but live anyway (FDE) |

### Implementation notes

- Panel content is **derived** from status columns + row payload via `resolvePanelView()` in [`src/components/actions-log/resolve-panel-view.ts`](src/components/actions-log/resolve-panel-view.ts).
- Status colours are centralized in [`src/components/actions-log/status-styles.ts`](src/components/actions-log/status-styles.ts).
- Mock diff content lives in [`src/components/actions-log/data.ts`](src/components/actions-log/data.ts).

---

## Related files

| File | Purpose |
|------|---------|
| `design-specs.md` | Figma tokens, typography, shadows |
| `instructions.md` | UI implementation rules for all pages |
| `src/components/actions-log/` | Actions Log page, table, and detail drawer |
