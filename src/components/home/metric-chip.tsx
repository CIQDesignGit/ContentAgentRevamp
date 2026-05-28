import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const BAD_THRESHOLD = 40

interface MetricChipProps {
  label: string
  value: number | null
  icon?: ReactNode
}

export function MetricChip({ label, value, icon }: MetricChipProps) {
  const isBad = value !== null && value < BAD_THRESHOLD

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
        isBad
          ? "border-error-100 bg-error-50 text-slate-600"
          : "border-slate-200 bg-white text-slate-600",
      )}
    >
      {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
      {label}
      {value !== null && (
        <span className={cn("font-bold", isBad ? "text-error-600" : "text-slate-900")}>
          {value}%
        </span>
      )}
    </span>
  )
}
