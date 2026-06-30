import type { ReactNode } from "react"

interface MetricChipProps {
  label: string
  value: number | null
  icon?: ReactNode
}

export function MetricChip({ label, value, icon }: MetricChipProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
      {label}
      {value !== null && (
        <span className="font-semibold tabular-nums text-slate-700">{value}%</span>
      )}
    </span>
  )
}
