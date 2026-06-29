"use client"

import { cn } from "@/lib/utils"
import { heroData, leaderboardData } from "./data"

// Max score in the dataset — used to normalize bar widths
const MAX_SCORE = Math.max(...leaderboardData.map((r) => r.score))

export function CategoryLeaderboard() {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-2xl font-light text-slate-300">01</span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Category Leaderboard</h2>
            <p className="text-sm text-muted-foreground">
              AI Visibility scores for leading brands in tracked categories on Alexa for{" "}
              {heroData.brand}.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
          {leaderboardData.length} brands
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_2fr_6rem] gap-4 border-b border-slate-100 px-5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Brand</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Visibility</span>
          <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Score</span>
        </div>

        {/* Rows */}
        {leaderboardData.map((row) => (
          <div
            key={row.rank}
            className={cn(
              "grid grid-cols-[3rem_1fr_2fr_6rem] items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-0",
              row.isYou && "border-l-2 border-l-brand-500 bg-brand-50",
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                "font-mono text-base",
                row.isYou ? "font-semibold text-brand-500" : "text-slate-400",
              )}
            >
              {row.rank}
            </span>

            {/* Brand name */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm",
                  row.isYou ? "font-semibold text-brand-600" : "text-slate-700",
                )}
              >
                {row.brand}
              </span>
              {row.isYou && (
                <span className="rounded-full bg-brand-200 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                  YOU
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", row.isYou ? "bg-brand-500" : "bg-slate-300")}
                style={{ width: `${(row.score / MAX_SCORE) * 100}%` }}
              />
            </div>

            {/* Score */}
            <span
              className={cn(
                "text-right text-sm font-semibold",
                row.isYou ? "text-brand-500" : "text-slate-700",
              )}
            >
              {row.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
