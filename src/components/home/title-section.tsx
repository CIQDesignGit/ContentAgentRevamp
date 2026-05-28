"use client"

import { ShieldCheck, Type } from "lucide-react"
import { TitleRecommendationCard } from "./title-recommendation"
import type { TitleRecommendation, TitleStatus } from "./types"

interface ProductTitleSectionProps {
  title: string
  onTitleChange: (v: string) => void
  status: TitleStatus
  recommendation: TitleRecommendation | null
  onAccept: () => void
  onReject: () => void
  onRevert: () => void
}

export function ProductTitleSection({
  title, onTitleChange, status, recommendation, onAccept, onReject, onRevert,
}: ProductTitleSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Product Title</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-primary">
            <Type className="size-3" />
            60%
          </span>
        </div>
      </header>

      <textarea
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        rows={2}
        placeholder="Enter product title..."
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-violet-200"
      />

      {recommendation && (
        <div className="mt-3">
          <TitleRecommendationCard
            recommendation={recommendation}
            status={status}
            onAccept={onAccept}
            onReject={onReject}
            onRevert={onRevert}
          />
        </div>
      )}
    </section>
  )
}
