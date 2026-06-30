"use client"

import { Bookmark, BookmarkPlus, Package, Search, ShieldCheck, Sparkles } from "lucide-react"
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
  /** ISO string or Date — shown as "Last updated: Jun 30, 2026 at 11:30 AM" */
  lastUpdated?: string | Date
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
  lastUpdated,
}: ProductHeaderProps) {
  const hasSelection = selectedCount !== undefined && totalSections !== undefined
  const ctaLabel = "Publish to PDP"

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null
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
              <span className="flex items-center gap-1">
                <Package className="size-3 shrink-0 text-slate-400" />
                {productId}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span className="font-mono">#{asin}</span>
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

        {/* Right: publish CTA + bookmark + last updated */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
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
                  ? "border-brand-200 bg-brand-50 text-brand-500 hover:bg-brand-100"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100",
              )}
            >
              {isBookmarked
                ? <Bookmark className="size-4" fill="currentColor" />
                : <BookmarkPlus className="size-4" />
              }
            </button>
          </div>
          {formattedLastUpdated && (
            <p className="text-xs text-slate-400">
              Last updated: {formattedLastUpdated}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
