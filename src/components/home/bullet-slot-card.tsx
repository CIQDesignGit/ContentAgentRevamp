"use client"

import { useState } from "react"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import { resolveBulletSyncFootprint } from "@/lib/sync-footprint"
import {
  BulletRecommendationBody,
  BulletRecommendationHeader,
  type BulletCompareTarget,
} from "./bullet-recommendation-block"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { BulletSlot } from "@/lib/build-bullet-slots"
import type { BulletRecommendation, PublishBatch } from "./types"

interface BulletSlotRowProps {
  slot: BulletSlot
  originals: Record<string, string>
  getFieldPublishBatch?: (fieldKey: string) => PublishBatch | undefined
  onTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onUndoAccept: (id: string) => void
  onUndoReject: (id: string) => void
  onPushUpdate: (id: string) => void
}

/** One bullet row inside the combined bullet points card. */
export function BulletSlotRow({
  slot,
  originals,
  getFieldPublishBatch,
  onTextChange,
  onAccept,
  onReject,
  onReset,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
}: BulletSlotRowProps) {
  const [compareTarget, setCompareTarget] = useState<BulletCompareTarget>("pim")

  const pimText = slot.kind === "indexed" ? slot.pimText : ""
  const pdpText =
    slot.kind === "indexed"
      ? (slot.pdpText ?? "")
      : slot.kind === "retailer-only"
        ? slot.pdpText
        : ""

  const recommendation: BulletRecommendation | null =
    slot.kind === "indexed" ? slot.recommendation : slot.kind === "add" ? slot.recommendation : null

  const fp = recommendation ? resolveBulletSyncFootprint(recommendation) : "none"
  const fieldKey = recommendation ? `bullet:${recommendation.id}` : ""
  const fieldPublishBatch = fieldKey ? getFieldPublishBatch?.(fieldKey) : undefined
  const publishedText = recommendation?.recommendedText
  const { pim: displayPim, pdp: displayPdp } = resolvePublishedSourceDisplay(
    pimText,
    pdpText,
    publishedText,
    fp,
    fieldPublishBatch,
  )

  const pimBaseline = slot.kind === "add" ? "" : displayPim
  const pdpBaseline = slot.kind === "add" ? "" : displayPdp

  const showAiBlock =
    recommendation &&
    (recommendation.status === "pending" ||
      recommendation.status === "accepted" ||
      recommendation.status === "rejected")

  const showPimSource = slot.kind !== "retailer-only"
  const showPdpSource = slot.kind === "indexed" || slot.kind === "retailer-only"

  const gridCompareTarget: FieldCompareTarget = compareTarget
  const pimDisplay = showPimSource ? displayPim : ""
  const pdpDisplay = showPdpSource ? displayPdp : ""

  return (
    <div className="space-y-2 px-3 py-5">
      {(showPimSource || showPdpSource) && (
        <VerticalSourceCompareGrid
          pimValue={pimDisplay}
          pdpValue={pdpDisplay}
          compareTarget={gridCompareTarget}
          showPim={showPimSource}
          showPdp={showPdpSource}
          showColumnLabels={false}
          recommendationHeader={
            showAiBlock ? (
              <BulletRecommendationHeader
                item={recommendation}
                compareTarget={compareTarget}
                onCompareTargetChange={setCompareTarget}
              />
            ) : undefined
          }
          recommendationBody={
            showAiBlock ? (
              <BulletRecommendationBody
                item={recommendation}
                activeBatch={fieldPublishBatch}
                pimBaseline={pimBaseline}
                pdpBaseline={pdpBaseline}
                originalText={originals[recommendation.id] ?? recommendation.recommendedText}
                compareTarget={compareTarget}
                onTextChange={(text) => onTextChange(recommendation.id, text)}
                onAccept={() => onAccept(recommendation.id)}
                onReject={() => onReject(recommendation.id)}
                onReset={() => onReset(recommendation.id)}
                onUndoAccept={() => onUndoAccept(recommendation.id)}
                onUndoReject={() => onUndoReject(recommendation.id)}
                onPushUpdate={() => onPushUpdate(recommendation.id)}
              />
            ) : undefined
          }
        />
      )}
    </div>
  )
}
