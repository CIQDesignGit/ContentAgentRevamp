"use client"

import { Star } from "lucide-react"

import { heroData, leaderboardData } from "./data"

export function AeoOverview() {
  const { visibilityScore, categoryRank, categoryLabel } = heroData
  const leader = leaderboardData[0]
  const gap = leader.score - visibilityScore

  return (
    <div className="flex divide-x divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* ── Score panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
        <p className="text-[14px] font-semibold text-slate-600">AI Visibility Score</p>
        <p className="text-6xl font-light leading-none text-slate-900">
          {visibilityScore}
          <span className="text-2xl font-light text-slate-500">%</span>
        </p>
        <p className="text-xs text-slate-600">across tracked categories</p>
      </div>

      {/* ── Rank panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
        <p className="text-[14px] font-semibold text-slate-600">Category Rank</p>
        <p className="text-6xl font-light leading-none text-slate-900">#{categoryRank}</p>
        <div className="flex flex-col items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-xs font-semibold text-success-700">
            <Star className="size-3 fill-current" />
            {categoryLabel}
          </span>
          <p className="text-xs text-slate-600">
            <span className="font-semibold">{gap}pts</span> behind {leader.brand}
          </p>
        </div>
      </div>
    </div>
  )
}
