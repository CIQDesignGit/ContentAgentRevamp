"use client"

import { Funnel, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TabStatusIcon } from "./status-badge"
import type { StatusTabKey } from "./types"
import type { FilterTabKey } from "./resolve-panel-view"

const TABS: { key: StatusTabKey; label: string; icon?: FilterTabKey }[] = [
  { key: "all", label: "All" },
  { key: "live_on_pdp", label: "Live on PDP", icon: "live_on_pdp" },
  { key: "pending", label: "Pending", icon: "pending" },
  { key: "needs_attention", label: "Needs attention", icon: "needs_attention" },
]

interface StatusTabsProps {
  active: StatusTabKey
  counts: Record<StatusTabKey, number>
  search: string
  onSearchChange: (value: string) => void
  onChange: (tab: StatusTabKey) => void
}

export function StatusTabs({
  active,
  counts,
  search,
  onSearchChange,
  onChange,
}: StatusTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const isActive = active === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                if (isActive && tab.key !== "all") {
                  onChange("all")
                  return
                }
                onChange(tab.key)
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-brand-50 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab.icon ? <TabStatusIcon tab={tab.icon} /> : null}
              {tab.label} ({counts[tab.key]})
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="relative w-fit">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by SKU name or SKU ID"
            className="h-9 w-64 pl-9 text-sm placeholder:text-sm placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          aria-label="Filter"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Funnel className="size-4" />
        </button>
      </div>
    </div>
  )
}
