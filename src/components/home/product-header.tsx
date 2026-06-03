"use client"

import Link from "next/link"
import { BookmarkPlus, Clock, Loader2, Search, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricChip } from "./metric-chip"
import type { PublishBatch } from "./types"

export type PublishBarState = "disabled" | "ready" | "publishing" | "syncing" | "complete"

interface ProductHeaderProps {
  title: string
  asin: string
  productId: string
  brand: string
  compliance: number
  seo: number
  aeo: number
  publishState: PublishBarState
  publishableCount: number
  pendingReviewCount: number
  queuedFollowUpCount: number
  activeBatch?: PublishBatch
  onPublishClick: () => void
}

function syndicationStatusLine(
  state: PublishBarState,
  activeBatch?: PublishBatch,
  publishableCount?: number,
  queuedFollowUpCount?: number,
): string {
  if (state === "disabled") return "Accept or edit recommendations to publish"
  if (state === "ready") {
    return `${publishableCount} ${publishableCount === 1 ? "change" : "changes"} ready to publish`
  }
  if (state === "publishing") return "Starting publish…"
  if (state === "syncing" && activeBatch) {
    const parts: string[] = ["Publishing…"]
    if (activeBatch.pim === "pending") parts.push("PIM updating")
    else if (activeBatch.pim === "accepted") parts.push("PIM updated")
    if (activeBatch.retailer === "pending") parts.push("submitted to retailer")
    if (activeBatch.pdp === "pending") parts.push("PDP verification pending")
    if (queuedFollowUpCount && queuedFollowUpCount > 0) {
      parts.push(`${queuedFollowUpCount} update${queuedFollowUpCount === 1 ? "" : "s"} queued`)
    }
    return parts.join(" · ")
  }
  if (state === "complete") return "Publish finished — check each field for PDP status"
  return ""
}

export function ProductHeader({
  title,
  asin,
  productId,
  brand,
  compliance,
  seo,
  aeo,
  publishState,
  publishableCount,
  pendingReviewCount,
  queuedFollowUpCount,
  activeBatch,
  onPublishClick,
}: ProductHeaderProps) {
  const canPublish = publishState === "ready" || (publishState === "syncing" && publishableCount > 0)
  const statusLine = syndicationStatusLine(
    publishState,
    activeBatch,
    publishableCount,
    queuedFollowUpCount,
  )

  return (
    <div className="flex shrink-0 flex-col border-b border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-6 px-6 py-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span>{asin}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{productId}</span>
              <span aria-hidden className="size-1 rounded-full bg-slate-300" />
              <span>{brand}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <MetricChip label="Compliance" value={compliance} icon={<ShieldCheck className="size-3" />} />
            <MetricChip label="SEO" value={seo} icon={<Search className="size-3" />} />
            <MetricChip label="AEO" value={aeo} icon={<Sparkles className="size-3" />} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPublishClick}
              disabled={!canPublish}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md px-4 text-xs font-medium text-white",
                canPublish ? "bg-primary hover:bg-violet-700" : "cursor-not-allowed bg-slate-300",
              )}
            >
              {publishState === "publishing" || publishState === "syncing" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              Publish to PIM &amp; PDP
            </button>
            <button
              type="button"
              aria-label="Bookmark"
              title="Bookmark"
              className="grid size-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <BookmarkPlus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-6 py-2">
        <p className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
          {(publishState === "syncing" || publishState === "publishing") && (
            <Clock className="size-3.5 shrink-0 text-info-600" aria-hidden />
          )}
          <span>{statusLine}</span>
          {pendingReviewCount > 0 && publishState !== "disabled" ? (
            <span className="text-slate-400">
              · {pendingReviewCount} awaiting review
            </span>
          ) : null}
        </p>
        {(publishState === "syncing" || publishState === "complete") && (
          <Link
            href="/actions-log"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            View in Actions Log
          </Link>
        )}
      </div>
    </div>
  )
}
