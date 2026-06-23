import type { ReactNode } from "react"

interface MetricChipProps {
  label: string
  value: number | null
  icon?: ReactNode
}

export function MetricChip({ label, value, icon }: MetricChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
      {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
      {label}
      {value !== null && (
        <span className="font-bold text-slate-900">{value}%</span>
      )}
    </span>
  )
}
