"use client"

import { cn } from "@/lib/utils"
import { promptData } from "./data"

// ─── Continuous visibility color scale — same 10-stop scale as TopicCompetitionTable ──
function visClass(pct: number): { bg: string; text: string } {
  if (pct >= 88) return { bg: "bg-emerald-300", text: "text-emerald-900" }
  if (pct >= 80) return { bg: "bg-emerald-200", text: "text-emerald-900" }
  if (pct >= 72) return { bg: "bg-emerald-100", text: "text-emerald-800" }
  if (pct >= 65) return { bg: "bg-emerald-50",  text: "text-emerald-700" }
  if (pct >= 58) return { bg: "bg-yellow-100",  text: "text-yellow-800"  }
  if (pct >= 50) return { bg: "bg-amber-100",   text: "text-amber-800"   }
  if (pct >= 40) return { bg: "bg-amber-200",   text: "text-amber-900"   }
  if (pct >= 28) return { bg: "bg-orange-100",  text: "text-orange-700"  }
  if (pct >= 15) return { bg: "bg-red-100",     text: "text-red-700"     }
  return                 { bg: "bg-red-200",     text: "text-red-900"     }
}

// SOV — relative brand-purple shading, light shades only
const SOV_MIN = Math.min(...promptData.map((r) => r.weightedSov))
const SOV_MAX = Math.max(...promptData.map((r) => r.weightedSov))

function sovClass(value: number): { bg: string; text: string } {
  const t = (value - SOV_MIN) / (SOV_MAX - SOV_MIN || 1)
  if (t >= 0.8) return { bg: "bg-brand-300", text: "text-brand-900" }
  if (t >= 0.6) return { bg: "bg-brand-200", text: "text-brand-800" }
  if (t >= 0.4) return { bg: "bg-brand-100", text: "text-brand-700" }
  if (t >= 0.2) return { bg: "bg-brand-50",  text: "text-brand-600" }
  return           { bg: "bg-brand-50",      text: "text-brand-500" }
}

function HeatCell({ value, suffix = "%", colorClass }: {
  value: number
  suffix?: string
  colorClass: { bg: string; text: string }
}) {
  return (
    <div className={cn(
      "flex h-10 w-28 items-center justify-center rounded-[14px] text-sm font-semibold tabular-nums",
      colorClass.bg,
      colorClass.text,
    )}>
      {value}{suffix}
    </div>
  )
}

export function PromptPerformanceTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-slate-900">AI Visibility by Prompt</h2>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Shopper Prompt
        </span>
        <div className="flex w-28 justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Visibility %
          </span>
        </div>
        <div className="flex w-28 justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Weighted SOV
          </span>
        </div>
        <div className="flex w-24 justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Rank
          </span>
        </div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-slate-100 px-6 pb-2">
        {promptData.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3"
          >
            <p className="text-sm italic text-slate-700">
              &ldquo;{row.prompt}&rdquo;
            </p>
            <HeatCell value={row.visibility} colorClass={visClass(row.visibility)} />
            <HeatCell value={row.weightedSov} colorClass={sovClass(row.weightedSov)} />
            <div className="flex w-24 items-center justify-center">
              <span className="text-sm font-bold text-slate-700">#{row.rank}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scale footer — same as TopicCompetitionTable */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-3">
        <span className="text-xs text-slate-400">Scale</span>
        <div className="h-2 w-32 rounded-full bg-linear-to-r from-red-400 via-amber-400 to-emerald-500" />
        <span className="text-xs text-slate-400">Low → High</span>
      </div>
    </div>
  )
}
