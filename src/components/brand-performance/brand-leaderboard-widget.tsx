"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import { Pie, PieChart } from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { leaderboardData } from "./data"

// ─── Slice colors — index 0 = top scorer, index 10 = misc ─────────────────
const SLICE_COLORS = [
  { fill: "var(--color-slate-400)", bg: "bg-slate-400" }, // rank 1 — leader
  { fill: "var(--color-brand-500)", bg: "bg-brand-500" }, // rank 2 — YOU
  { fill: "var(--color-slate-300)", bg: "bg-slate-300" }, // rank 3
  { fill: "var(--color-slate-200)", bg: "bg-slate-200" }, // rank 4–5
  { fill: "var(--color-slate-200)", bg: "bg-slate-200" },
  { fill: "var(--color-slate-100)", bg: "bg-slate-100" }, // rank 6–10 tail
  { fill: "var(--color-slate-100)", bg: "bg-slate-100" },
  { fill: "var(--color-slate-100)", bg: "bg-slate-100" },
  { fill: "var(--color-slate-100)", bg: "bg-slate-100" },
  { fill: "var(--color-slate-100)", bg: "bg-slate-100" },
  { fill: "var(--color-slate-50)",  bg: "bg-slate-50"  }, // misc / other
]

// Sort descending — biggest slice sits at 12 o'clock going clockwise
const sorted = [...leaderboardData].sort((a, b) => b.score - a.score)
const totalScore = sorted.reduce((s, r) => s + r.score, 0)
const miscScore = Math.max(0, 100 - totalScore) // > 0 when brands don't fill 100%

// Chart slices — misc appended only when there's leftover share
const chartSlices = [
  ...sorted.map((r, i) => ({
    brand: r.brand,
    score: r.score,
    isYou: r.isYou,
    fill: SLICE_COLORS[i]?.fill ?? SLICE_COLORS[9].fill,
  })),
  ...(miscScore > 0
    ? [{ brand: "Other / Untracked", score: miscScore, isYou: false, fill: SLICE_COLORS[10].fill }]
    : []),
]


// ─── Tooltip state type ────────────────────────────────────────────────────
interface TipState { brand: string; score: number; x: number; y: number }

// ─── Donut chart — custom tooltip tracks mouse and renders fixed ───────────
function DonutChart() {
  const youScore = leaderboardData.find((r) => r.isYou)?.score ?? 0
  const [tip, setTip] = useState<TipState | null>(null)

  return (
    <div className="relative size-56 shrink-0">
      <ChartContainer config={{}} className="size-56">
        <PieChart>
          <Pie
            data={chartSlices}
            dataKey="score"
            nameKey="brand"
            innerRadius="52%"
            outerRadius="82%"
            strokeWidth={2}
            stroke="white"
            // Start at 12 o'clock, go clockwise
            startAngle={90}
            endAngle={-270}
            onMouseEnter={(d: unknown, _i: number, e: React.MouseEvent) => {
              const slice = d as { brand: string; score: number }
              setTip({ brand: slice.brand, score: slice.score, x: e.clientX + 14, y: e.clientY - 52 })
            }}
            onMouseMove={(d: unknown, _i: number, e: React.MouseEvent) => {
              // Update both content and position so switching slices refreshes the tooltip
              const slice = d as { brand?: string; score?: number }
              if (slice.brand != null) {
                setTip({ brand: slice.brand, score: slice.score ?? 0, x: e.clientX + 14, y: e.clientY - 52 })
              }
            }}
            onMouseLeave={() => setTip(null)}
          />
        </PieChart>
      </ChartContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{youScore}%</span>
        <span className="text-center text-[10px] leading-tight text-slate-400">your AI<br />visibility</span>
      </div>

      {/* Custom tooltip — fixed position, always top-right of cursor */}
      {tip && (
        <div
          className="pointer-events-none fixed z-50 flex min-w-[180px] items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
          style={{ left: tip.x, top: tip.y }}
        >
          <span className="truncate text-xs text-slate-600">{tip.brand}</span>
          <span className="font-mono text-xs font-semibold text-slate-900">{tip.score}%</span>
        </div>
      )}
    </div>
  )
}

// ─── Brand row in the ranked list ─────────────────────────────────────────
function BrandRow({
  rank, brand, score, isYou,
}: {
  rank: number; brand: string; score: number; isYou: boolean
}) {
  const isLeader = rank === 1
  const isTopTier = rank <= 3
  const dot = SLICE_COLORS[rank - 1]

  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-slate-50",
      isYou && "bg-brand-50",
    )}>
      {isLeader
        ? <Trophy className="size-3.5 shrink-0 text-warning-500" />
        : <span className={cn(
            "w-4 shrink-0 text-center text-xs tabular-nums",
            isYou ? "font-bold text-brand-500" : "text-slate-500",
          )}>{rank}</span>
      }
      <span className={cn("size-2 shrink-0 rounded-full", dot.bg)} />
      <span className={cn(
        "min-w-0 flex-1 truncate text-[13px]",
        isYou ? "font-semibold text-brand-700" : isTopTier ? "font-medium text-slate-800" : "text-slate-600",
      )}>{brand}</span>
      {isYou && (
        <span className="shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">YOU</span>
      )}
      <span className={cn(
        "shrink-0 text-[11px] font-semibold tabular-nums",
        isYou ? "text-brand-600" : isTopTier ? "text-slate-600" : "text-slate-500",
      )}>{score}%</span>
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────
export function BrandLeaderboardWidget() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-slate-900">Brand Leaderboard</h2>
      </div>
      <div className="flex items-center gap-6 p-6">
        <DonutChart />
        <div className="h-56 w-px shrink-0 bg-slate-100" />
        <div className="grid flex-1 grid-flow-col grid-rows-5 gap-x-3 gap-y-0.5">
          {leaderboardData.map((row) => (
            <BrandRow key={row.rank} rank={row.rank} brand={row.brand} score={row.score} isYou={row.isYou} />
          ))}
        </div>
      </div>
    </div>
  )
}
