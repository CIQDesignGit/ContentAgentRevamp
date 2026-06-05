"use client"

import { Check, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BulletRecommendation } from "./types"

/** Keeps toolbar height stable before any bullets are accepted or rejected. */
function ReviewedSummaryLabel({ summary }: { summary: string | null }) {
  return (
    <span
      className={cn(
        "min-h-4 text-xs leading-4 text-slate-500",
        !summary && "invisible select-none",
      )}
      aria-hidden={!summary}
    >
      {summary ?? "0 accepted"}
    </span>
  )
}

function buildReviewedSummary(recommendations: BulletRecommendation[]): string | null {
  const acceptedCount = recommendations.filter((r) => r.status === "accepted").length
  const rejectedCount = recommendations.filter((r) => r.status === "rejected").length
  const parts: string[] = []
  if (acceptedCount > 0) parts.push(`${acceptedCount} accepted`)
  if (rejectedCount > 0) parts.push(`${rejectedCount} rejected`)
  return parts.length > 0 ? parts.join(", ") : null
}

interface BulletBulkActionsProps {
  recommendations: BulletRecommendation[]
  originals: Record<string, string>
  onAcceptAll: () => void
  onRejectAll: () => void
  onResetAll: () => void
}

export function BulletBulkActions({
  recommendations,
  originals,
  onAcceptAll,
  onRejectAll,
  onResetAll,
}: BulletBulkActionsProps) {
  const pendingCount = recommendations.filter((r) => r.status === "pending").length
  const reviewedSummary = buildReviewedSummary(recommendations)
  const isAnyModified = recommendations.some((r) => r.recommendedText !== originals[r.id])

  if (recommendations.length === 0) return null

  const buttons = (
    <div className="flex flex-wrap items-center gap-2">
      {isAnyModified ? (
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <RotateCcw className="size-3.5" />
          Reset all
        </button>
      ) : null}
      <button
        type="button"
        disabled={pendingCount === 0}
        onClick={onRejectAll}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-40"
      >
        <X className="size-4 text-error-600" /> Reject all
      </button>
      <button
        type="button"
        disabled={pendingCount === 0}
        onClick={onAcceptAll}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-40"
      >
        <Check className="size-4 text-success-600" /> Accept all {pendingCount}
      </button>
    </div>
  )

  const reviewedLabel = <ReviewedSummaryLabel summary={reviewedSummary} />

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
      {reviewedLabel}
      {buttons}
    </div>
  )
}
