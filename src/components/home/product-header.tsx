"use client"

import { BookmarkCheck, BookmarkPlus, Search, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricChip } from "./metric-chip"
import type { ActionStatus } from "./types"

export type PublishBarState = "disabled" | "ready" | "publishing" | "syncing" | "complete"

interface ProductHeaderProps {
  title: string
  asin: string
  productId: string
  brand: string
  thumbnailUrl?: string
  compliance: number
  seo: number
  aeo: number
  publishState: PublishBarState
  publishableCount: number
  onPublishClick: () => void
  /** Number of sections the user has checked for publish. */
  selectedCount?: number
  /** Total number of selectable sections. */
  totalSections?: number
  hideMetrics?: boolean
  actionStatus?: ActionStatus
  isBookmarked?: boolean
  onBookmarkClick?: () => void
}

export function ProductHeader({
  title,
  asin,
  productId,
  brand,
  thumbnailUrl,
  compliance,
  seo,
  aeo,
  publishState,
  publishableCount,
  onPublishClick,
  selectedCount,
  totalSections,
  hideMetrics = false,
  actionStatus,
  isBookmarked = false,
  onBookmarkClick,
}: ProductHeaderProps) {
  const hasSelection = selectedCount !== undefined && totalSections !== undefined
  const ctaLabel = "Publish to PDP"
  // When section-level selection is in use, enable publish as long as at least one section is selected.
  // Falls back to the standard publishState logic on pages that don't use section selection.
  const canPublish = hasSelection
    ? selectedCount! > 0
    : publishState === "ready" || (publishState === "syncing" && publishableCount > 0)

  return (
    <div className="flex shrink-0 flex-col border-b border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-6 px-6 py-4">
        {/* Left: thumbnail + product info — items-stretch so thumbnail matches text height */}
        <div className="flex min-w-0 items-stretch gap-3">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="size-14 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-contain p-1"
            />
          ) : (
            <div
              className="size-14 shrink-0 rounded-lg border border-slate-200 bg-slate-100"
              aria-hidden
            />
          )}

          {/* Metadata + title + optional metrics */}
          <div className="min-w-0 space-y-1">
            <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{asin}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{productId}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{brand}</span>
            </span>
            <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
            {!hideMetrics && (
              <div className="flex flex-wrap items-center gap-1.5">
                <MetricChip label="Compliance" value={compliance} icon={<ShieldCheck className="size-3" />} />
                <MetricChip label="SEO" value={seo} icon={<Search className="size-3" />} />
                <MetricChip label="AEO" value={aeo} icon={<Sparkles className="size-3" />} />
              </div>
            )}
          </div>
        </div>

        {/* Right: publish CTA + bookmark */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onPublishClick}
            disabled={!canPublish}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-4 text-xs font-medium text-white",
              canPublish ? "bg-primary hover:bg-brand-700" : "cursor-not-allowed bg-slate-300",
            )}
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            title={isBookmarked ? "Remove bookmark" : "Save for later"}
            onClick={onBookmarkClick}
            className={cn(
              "grid size-8 place-items-center rounded-md border transition-colors",
              isBookmarked
                ? "border-info-200 bg-info-50 text-info-600 hover:bg-info-100"
                : "border-slate-200 text-slate-600 hover:bg-slate-100",
            )}
          >
            {isBookmarked
              ? <BookmarkCheck className="size-4" />
              : <BookmarkPlus className="size-4" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
