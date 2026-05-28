"use client"

import { Calendar, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SalsifyIssue } from "./types"

interface SalsifyHeaderProps {
  date: string
  issues: SalsifyIssue[]
  compareMode: boolean
  onToggleCompare: () => void
}

export function SalsifyHeader({ date, issues, compareMode, onToggleCompare }: SalsifyHeaderProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-cyan-100 text-cyan-700">
          <span className="text-[10px] font-bold">S</span>
        </span>
        <span className="text-sm font-semibold text-slate-900">Salsify</span>
        {issues.map((issue) => (
          <span
            key={issue.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
              issue.type === "error"
                ? "border-error-100 bg-error-50 text-error-600"
                : "border-warning-200 bg-warning-50 text-warning-600",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                issue.type === "error" ? "bg-error-600" : "bg-warning-600",
              )}
            />
            {issue.label}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="size-3.5" />
          {date}
        </span>
        {/* Amazon "a" icon — toggles PDP comparison panel */}
        <button
          type="button"
          onClick={onToggleCompare}
          aria-pressed={compareMode}
          title={compareMode ? "Hide PDP comparison" : "View PDP Content"}
          className={cn(
            "grid size-7 place-items-center rounded-full transition-colors",
            compareMode ? "bg-primary text-white" : "bg-slate-900 text-white hover:bg-slate-700",
          )}
        >
          <span className="text-[11px] font-bold">a</span>
        </button>
      </div>
    </div>
  )
}

export function PdpHeader({ date }: { date: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-6 place-items-center rounded-full bg-slate-900 text-white">
          <span className="text-[10px] font-bold">a</span>
        </span>
        <span className="text-sm font-semibold text-slate-900">PDP Content</span>
        <button type="button" aria-label="Open in retailer" title="Open in retailer" className="text-slate-500 hover:text-slate-900">
          <ExternalLink className="size-3.5" />
        </button>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="size-3.5" />
        {date}
      </span>
    </div>
  )
}
