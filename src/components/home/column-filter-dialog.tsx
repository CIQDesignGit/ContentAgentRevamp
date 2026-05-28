"use client"

import { useState } from "react"
import { Check, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColumnDef {
  id: string
  label: string
  options: string[]
}

export const COLUMNS: ColumnDef[] = [
  {
    id: "sku_id",
    label: "SKU ID",
    options: ["AF101", "AF102", "AF103", "AF104", "AF105"],
  },
  {
    id: "sku",
    label: "SKU",
    options: ["Yankee Candle", "NutriChef", "Dyson", "KitchenAid", "iRobot"],
  },
  {
    id: "action_status",
    label: "Action Status",
    options: ["Pending", "In Review", "Published", "Draft", "Issues Found"],
  },
  {
    id: "pim_content_health",
    label: "PIM Content Health",
    options: ["Excellent", "Good", "Fair", "Poor", "Critical"],
  },
  {
    id: "pdp_match",
    label: "PIM and PDP Overall Content Match",
    options: ["Very High", "High", "Medium", "Low", "Very Low"],
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

// Maps column id -> array of selected option values
export type ColumnFilters = Record<string, string[]>

interface Props {
  filters: ColumnFilters
  onApply: (filters: ColumnFilters) => void
  onClose: () => void
}

// ─── Panel content (no modal wrapper — rendered inside a Popover) ─────────────

export function ColumnFilterPanel({ filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<ColumnFilters>(filters)
  const [columnSearch, setColumnSearch] = useState("")
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)

  const activeColumn = COLUMNS.find((c) => c.id === activeColumnId) ?? null
  const totalActive = Object.values(draft).filter((v) => v.length > 0).length

  const filteredColumns = COLUMNS.filter((c) =>
    c.label.toLowerCase().includes(columnSearch.toLowerCase()),
  )

  function toggleOption(columnId: string, option: string) {
    setDraft((prev) => {
      const current = prev[columnId] ?? []
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [columnId]: updated }
    })
  }

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleCancel() {
    setDraft(filters)
    onClose()
  }

  return (
    <div className="flex h-[460px] flex-col">
      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: column list ── */}
        <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
          {/* Search */}
          <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
              placeholder="Search Column"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Section label */}
          <p className="px-4 pb-2 pt-4 text-sm font-semibold text-slate-700">Columns</p>

          {/* Column rows */}
          <ul className="flex-1 overflow-y-auto">
            {filteredColumns.map((col) => {
              const count = (draft[col.id] ?? []).length
              const isActive = col.id === activeColumnId
              return (
                <li key={col.id}>
                  <button
                    type="button"
                    onClick={() => setActiveColumnId(col.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-3.5 text-left text-sm text-slate-600 transition-colors hover:bg-white",
                      isActive && "bg-white font-medium text-slate-900",
                    )}
                  >
                    <span className="flex-1 leading-snug">{col.label}</span>
                    {count > 0 && (
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">
                        {count}
                      </span>
                    )}
                    <ChevronRight className="size-4 shrink-0 text-slate-400" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Right: filter options ── */}
        <div className="flex flex-1 flex-col bg-white">
          {activeColumn && activeColumn.options.length > 0 ? (
            <>
              <p className="border-b border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-900">
                {activeColumn.label}
              </p>
              <ul className="flex-1 overflow-y-auto p-2">
                {activeColumn.options.map((opt) => {
                  const checked = (draft[activeColumn.id] ?? []).includes(opt)
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => toggleOption(activeColumn.id, opt)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded border",
                            checked
                              ? "border-primary bg-primary text-white"
                              : "border-slate-300 bg-transparent",
                          )}
                        >
                          {checked && <Check className="size-3" />}
                        </span>
                        {opt}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-8 text-center text-sm leading-relaxed text-slate-400">
              {activeColumn
                ? "No filter options available for this column."
                : "Select a column to view filter options"}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3.5">
        <Button variant="outline" onClick={handleCancel} className="rounded-full px-6">
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          disabled={totalActive === 0}
          className="rounded-full bg-primary px-6 text-white hover:bg-primary/90 disabled:opacity-40"
        >
          {totalActive === 0 ? "Apply Filter" : `Apply ${totalActive} Filter${totalActive > 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  )
}
