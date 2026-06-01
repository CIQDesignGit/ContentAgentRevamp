"use client"

import { cn } from "@/lib/utils"
import { TabStatusIcon } from "./status-badge"
import type { LogStatus, StatusTabKey } from "./types"

const TABS: { key: StatusTabKey; label: string; showIcon?: boolean }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending", showIcon: true },
  { key: "failed", label: "Failed", showIcon: true },
  { key: "success", label: "Success", showIcon: true },
  { key: "cancelled", label: "Cancelled", showIcon: true },
]

interface StatusTabsProps {
  active: StatusTabKey
  counts: Record<StatusTabKey, number>
  onChange: (tab: StatusTabKey) => void
}

export function StatusTabs({ active, counts, onChange }: StatusTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
      {TABS.map((tab) => {
        const isActive = active === tab.key
        const iconStatus =
          tab.key === "all" ? null : (tab.key as LogStatus)

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-brand-50 text-primary"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {iconStatus && <TabStatusIcon status={iconStatus} />}
            {tab.label} ({counts[tab.key]})
          </button>
        )
      })}
    </div>
  )
}
