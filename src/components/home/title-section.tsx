"use client"

import { useMemo, useState } from "react"
import { Columns2, Type } from "lucide-react"
import { titleMatchPercent } from "@/lib/title-match"
import { resolvePublishedSourceDisplay } from "@/lib/published-source-display"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { PublishBatch, TitleRecommendation, TitleStatus, SyncFootprint } from "./types"

interface ProductTitleSectionProps {
  pimTitle: string
  pdpTitle: string
  status: TitleStatus
  recommendation: TitleRecommendation | null
  syncFootprint?: SyncFootprint
  hasUnpublishedEdits?: boolean
  activeBatch?: PublishBatch
  onRecommendationChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onUndoAccept: () => void
  onUndoReject: () => void
  onPushUpdate?: () => void
}

export function ProductTitleSection({
  pimTitle,
  pdpTitle,
  status,
  recommendation,
  syncFootprint,
  hasUnpublishedEdits,
  activeBatch,
  onRecommendationChange,
  onAccept,
  onReject,
  onUndoAccept,
  onUndoReject,
  onPushUpdate,
}: ProductTitleSectionProps) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("pim")
  const [isOpen, setIsOpen] = useState(true)
  const [originalText] = useState(() => recommendation?.recommendedText ?? "")

  const publishedText = recommendation?.recommendedText
  const { pim: displayPim, pdp: displayPdp } = useMemo(
    () =>
      resolvePublishedSourceDisplay(
        pimTitle,
        pdpTitle,
        publishedText,
        syncFootprint,
        activeBatch,
      ),
    [pimTitle, pdpTitle, publishedText, syncFootprint, activeBatch],
  )

  const matchPercent = useMemo(
    () => titleMatchPercent(displayPim, displayPdp),
    [displayPim, displayPdp],
  )

  const showReco = Boolean(recommendation)
  const showRecoBody = showReco && isOpen

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-wrap items-center gap-2 px-1 py-2">
        <Type className="size-4 shrink-0 text-slate-400" aria-hidden />
        <span className="text-sm font-semibold text-slate-900">Title</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-normal text-slate-500">
          <Columns2 className="size-3.5 shrink-0 text-slate-400" aria-hidden />
          {matchPercent}% match between PIM and retailer
        </span>
      </header>

      <VerticalSourceCompareGrid
        pimValue={displayPim}
        pdpValue={displayPdp}
        compareTarget={compareTarget}
        recommendationHeader={
          showReco ? (
            <ContentRecommendationHeader
              labels={{
                pending: "AI Recommended Title",
                accepted: "Accepted",
                rejected: "Rejected",
              }}
              status={status}
              compareTarget={compareTarget}
              onCompareTargetChange={setCompareTarget}
              isOpen={isOpen}
              onToggleOpen={() => setIsOpen((v) => !v)}
            />
          ) : undefined
        }
        recommendationBody={
          showRecoBody && recommendation ? (
            <ContentRecommendationBody
              key={`${pimTitle}|${pdpTitle}`}
              recommendation={recommendation}
              pimBaseline={displayPim}
              pdpBaseline={displayPdp}
              originalText={originalText}
              compareTarget={compareTarget}
              status={status}
              syncFootprint={syncFootprint}
              hasUnpublishedEdits={hasUnpublishedEdits}
              activeBatch={activeBatch}
              fieldKey="title"
              onRecommendedTextChange={onRecommendationChange}
              onAccept={onAccept}
              onReject={onReject}
              onReset={() => onRecommendationChange(originalText)}
              onUndoAccept={onUndoAccept}
              onUndoReject={onUndoReject}
              onPushUpdate={onPushUpdate}
              editAriaLabel="Edit AI recommended title"
            />
          ) : undefined
        }
      />
    </section>
  )
}
