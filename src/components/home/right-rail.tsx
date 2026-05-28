"use client"

import { LayoutDashboard, Sparkles } from "lucide-react"

export function RightRail() {
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-l border-slate-200 bg-white pt-4">
      <button
        type="button"
        aria-label="Recommendations"
        title="Recommendations"
        className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary"
      >
        <Sparkles className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Impact Dashboard"
        title="Impact Dashboard"
        className="grid size-9 place-items-center rounded-md border border-primary bg-violet-50 text-primary hover:bg-violet-100"
      >
        <LayoutDashboard className="size-4" />
      </button>
    </aside>
  )
}
