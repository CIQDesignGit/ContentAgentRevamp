# Design Instructions

These rules apply to every page and component in this project.
Always follow them unless the user explicitly says otherwise.

> **Note for AI:** This file is mirrored as a Cursor rule in `.cursor/rules/design-instructions.mdc`
> and is enforced automatically on every task. Update both files if rules change.

---

## Icons
- Use **Lucide React** icons only.
- No other icon libraries (no Heroicons, no FontAwesome, etc.).
- Import from `lucide-react`. Example: `import { Bell, Home } from "lucide-react"`

---

## Colors
- Use **Tailwind CSS color palette** only (e.g. `violet-600`, `slate-100`, `red-500`).
- No raw hex values (e.g. avoid `#6d28d9`).
- Semantic colors like `bg-background`, `text-foreground`, `text-muted-foreground` from shadcn are fine.
- **Slate is our neutral color** — use `slate-*` shades for all neutral/gray UI elements
  (borders, muted backgrounds, secondary text, etc.). Do NOT use `zinc-*`.

---

## Images & Avatars
- Use placeholder images via `https://placehold.co/{width}x{height}` for any product/user images.
- Example: `<img src="https://placehold.co/40x40" alt="product" />`
- Never reference local images that don't exist.

---

## Gradients
- Do NOT add gradients unless the user explicitly asks for them.

---

## Styling Framework
- Tailwind CSS 4 utility classes only.
- Use shadcn/ui components for base UI primitives (Button, Avatar, Badge, etc.).
- Use prompt-kit components for all agentic/chat UI (PromptInput, Message, Loader, etc.).

---

## Layout
- All pages share the AppShell layout: left icon sidebar + main content area.
- Left alerts panel is shown on the Home page only.
- Keep pages under 300 lines. Extract reusable pieces into `src/components/`.

---

## Typography
- Font: **Inter** (configured as `--font-sans` in `globals.css`, loaded in `layout.tsx`).
- Headings: `font-semibold` or `font-bold`.
- Body: default weight.
- Muted text: `text-muted-foreground`.
- Code / data values: `font-mono` (JetBrains Mono).

---

## Code Quality
- All interactive pages must be `"use client"` components.
- No inline styles — use Tailwind classes only.
- Keep component files under 150 lines; split into sub-components if needed.
- Add short comments explaining non-obvious logic only.

---

## Related Files

| File | Purpose |
|---|---|
| `product-context.md` | Product behaviour rules (Actions Log status model, drawer, remarks) |
| `design-specs.md` | Full color tokens, typography scale, shadow values from Figma |
| `src/app/globals.css` | All design tokens as CSS variables and `@theme` block |
| `src/app/layout.tsx` | Font loading (Inter + JetBrains Mono) |
| `src/components/ui/` | shadcn component library |
| `src/components/layout/` | Shared layout primitives (PageShell, Section) |
| `../.cursor/rules/design-instructions.mdc` | Machine-readable version of this file for AI enforcement |
