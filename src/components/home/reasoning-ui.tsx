"use client"

import { useState } from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReasonType, ReasoningCategory } from "./types"

const REASON_COLORS: Record<ReasonType, string> = {
  ADDED: "text-success-600",
  REMOVED: "text-error-600",
  REPLACED: "text-blue-600",
}

export function ReasoningPanel({ reasoning }: { reasoning: ReasoningCategory[] }) {
  const [activeKey, setActiveKey] = useState(reasoning[0]?.key ?? "")
  const active = reasoning.find((r) => r.key === activeKey) ?? reasoning[0]
  if (!active) return null
  return (
    <div className="rounded-lg bg-violet-100 p-3">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {reasoning.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveKey(cat.key)}
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium",
              cat.key === activeKey
                ? "border-primary bg-white text-primary"
                : "border-violet-200 bg-violet-50 text-primary hover:bg-violet-100",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {active.reasons.map((r, idx) => (
            <li key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <Circle
                  className={cn("size-2 shrink-0 fill-current", REASON_COLORS[r.type])}
                  aria-hidden
                />
                <span className="text-sm font-medium text-slate-900">{r.summary}</span>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-slate-500">{r.detail}</p>
            </li>
        ))}
      </ul>
    </div>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
