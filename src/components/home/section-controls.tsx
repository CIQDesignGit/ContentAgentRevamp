"use client"

import { Check, Minus, Square } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Section-level checkbox toggle ───────────────────────────────────────────

/** Checkbox shown in each section header to include/exclude it from publish. */
export function SectionSelectToggle({
  selected,
  onToggle,
}: {
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={selected ? "Deselect section" : "Select section"}
      title={selected ? "Remove from publish" : "Include in publish"}
      className="rounded p-0.5 transition-colors hover:bg-slate-100"
    >
      {selected ? (
        <span className="flex size-5 items-center justify-center rounded-[3px] bg-brand-500">
          <Check className="size-3 stroke-3 text-white" />
        </span>
      ) : (
        <Square className="size-5 text-slate-300" />
      )}
    </button>
  )
}

// ─── Bulk select control (top strip) ─────────────────────────────────────────

/** Top strip showing selected count and a single toggle button. */
export function BulkSelectControl({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
}: {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
}) {
  const allSelected = selectedCount === totalCount
  const noneSelected = selectedCount === 0

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 transition-colors hover:bg-slate-100"
      >
        <span className={cn("text-sm font-medium", allSelected ? "text-brand-500" : noneSelected ? "text-slate-400" : "text-brand-500")}>
          {allSelected
            ? "Accept All"
            : noneSelected
            ? "Select all"
            : `Accept ${selectedCount}`}
        </span>
        {allSelected ? (
          <span className="flex size-5 items-center justify-center rounded-[3px] bg-brand-500">
            <Check className="size-3 stroke-3 text-white" />
          </span>
        ) : noneSelected ? (
          <Square className="size-5 text-slate-300" />
        ) : (
          <span className="flex size-5 items-center justify-center rounded-[3px] bg-brand-200">
            <Minus className="size-3 stroke-3 text-brand-600" />
          </span>
        )}
      </button>
    </div>
  )
}
