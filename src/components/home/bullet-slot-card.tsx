"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  BulletRecommendationBody,
  BulletRecommendationHeader,
  type BulletCompareTarget,
} from "./bullet-recommendation-block"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { BulletSlot } from "@/lib/build-bullet-slots"
import type { BulletRecommendation } from "./types"

interface BulletSlotRowProps {
  slot: BulletSlot
  originals: Record<string, string>
  onTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
}

/** One bullet row inside the combined bullet points card. */
export function BulletSlotRow({
  slot,
  originals,
  onTextChange,
  onAccept,
  onReject,
  onReset,
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

  const isProcessing = recommendation?.footprint === "processing"

  const displayPim = isProcessing && recommendation ? recommendation.recommendedText : pimText
  const displayPdp = isProcessing && recommendation ? recommendation.recommendedText : pdpText

  const pimBaseline = slot.kind === "add" ? "" : pimText
  const pdpBaseline = slot.kind === "add" ? "" : pdpText

  const showAiBlock =
    recommendation &&
    (recommendation.status === "pending" ||
      recommendation.footprint === "processing" ||
      recommendation.footprint === "recently-updated")

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
                pimBaseline={pimBaseline}
                pdpBaseline={pdpBaseline}
                originalText={originals[recommendation.id] ?? recommendation.recommendedText}
                compareTarget={compareTarget}
                onTextChange={(text) => onTextChange(recommendation.id, text)}
                onAccept={() => onAccept(recommendation.id)}
                onReject={() => onReject(recommendation.id)}
                onReset={() => onReset(recommendation.id)}
              />
            ) : undefined
          }
        />
      )}

      {isProcessing ? (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" aria-hidden />
          Updates are being processed across PIM and retailer…
        </p>
      ) : null}
    </div>
  )
}
