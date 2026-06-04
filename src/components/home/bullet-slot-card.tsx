"use client"

import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import {
  useBulletRecommendationView,
  type BulletRecommendationSlotProps,
} from "./bullet-recommendation-slot"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { BulletSlot } from "@/lib/build-bullet-slots"
import type { PublishBatch } from "./types"

interface BulletSlotRowProps {
  slot: BulletSlot
  /** 1-based row label shown above the compare grid (e.g. "Bullet 2"). */
  bulletNumber: number
  /** Salsify / Retailer labels only on the first bullet row in the section. */
  showColumnLabels?: boolean
  originals: Record<string, string>
  publishQueue: FieldPublishQueueItem[]
  activeBatch?: PublishBatch
  onTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onUndoAccept: (id: string) => void
  onUndoReject: (id: string) => void
  onPushUpdate: (id: string) => void
  onAcceptNewDraft?: (id: string, text: string) => void
}

function BulletSlotRecoGrid({
  displayPim,
  displayPdp,
  showPim,
  showPdp,
  showColumnLabels,
  slotProps,
}: {
  displayPim: string
  displayPdp: string
  showPim: boolean
  showPdp: boolean
  showColumnLabels: boolean
  slotProps: BulletRecommendationSlotProps
}) {
  const { compareTarget, gridHeader, gridBody } = useBulletRecommendationView(slotProps)

  return (
    <VerticalSourceCompareGrid
      pimValue={showPim ? displayPim : ""}
      pdpValue={showPdp ? displayPdp : ""}
      compareTarget={compareTarget}
      showPim={showPim}
      showPdp={showPdp}
      showColumnLabels={showColumnLabels}
      recommendationHeader={gridHeader ?? undefined}
      recommendationBody={gridBody ?? undefined}
    />
  )
}

/** One bullet row inside the combined bullet points card. */
export function BulletSlotRow({
  slot,
  bulletNumber,
  showColumnLabels = false,
  originals,
  publishQueue,
  activeBatch,
  onTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
  onAcceptNewDraft,
}: BulletSlotRowProps) {
  const pimText = slot.kind === "indexed" ? slot.pimText : ""
  const pdpText =
    slot.kind === "indexed"
      ? (slot.pdpText ?? "")
      : slot.kind === "retailer-only"
        ? slot.pdpText
        : ""

  const recommendation =
    slot.kind === "indexed" ? slot.recommendation : slot.kind === "add" ? slot.recommendation : null

  const fp = recommendation ? resolveBulletSyncFootprint(recommendation) : "none"
  const publishedText = recommendation?.recommendedText
  const { pim: displayPim, pdp: displayPdp } = resolvePublishedSourceDisplay(
    pimText,
    pdpText,
    publishedText,
    fp,
    activeBatch,
  )

  const showAiBlock =
    recommendation &&
    (recommendation.status === "pending" ||
      recommendation.status === "accepted" ||
      recommendation.status === "rejected")

  const showPimSource = slot.kind !== "retailer-only"
  const showPdpSource = slot.kind === "indexed" || slot.kind === "retailer-only"

  if (!showPimSource && !showPdpSource) return null

  const slotProps: BulletRecommendationSlotProps | null =
    showAiBlock && recommendation
      ? {
          item: recommendation,
          pimBaseline: slot.kind === "add" ? "" : displayPim,
          pdpBaseline: slot.kind === "add" ? "" : displayPdp,
          originalText: originals[recommendation.id] ?? recommendation.recommendedText,
          publishQueue,
          activeBatch,
          onTextChange: (text) => onTextChange(recommendation.id, text),
          onAccept: () => onAccept(recommendation.id),
          onReject: () => onReject(recommendation.id),
          onReset: () => onReset(recommendation.id),
          onUndoAccept: () => onUndoAccept(recommendation.id),
          onUndoReject: () => onUndoReject(recommendation.id),
          onPushUpdate: () => onPushUpdate(recommendation.id),
          onAcceptNewDraft: onAcceptNewDraft
            ? (text) => onAcceptNewDraft(recommendation.id, text)
            : undefined,
        }
      : null

  return (
    <div className="space-y-2 px-3 py-4">
      <h3 className="text-xs font-semibold text-slate-700">Bullet {bulletNumber}</h3>
      {slotProps ? (
        <BulletSlotRecoGrid
          displayPim={displayPim}
          displayPdp={displayPdp}
          showPim={showPimSource}
          showPdp={showPdpSource}
          showColumnLabels={showColumnLabels}
          slotProps={slotProps}
        />
      ) : (
        <VerticalSourceCompareGrid
          pimValue={showPimSource ? displayPim : ""}
          pdpValue={showPdpSource ? displayPdp : ""}
          compareTarget="pim"
          showPim={showPimSource}
          showPdp={showPdpSource}
          showColumnLabels={showColumnLabels}
        />
      )}
    </div>
  )
}
