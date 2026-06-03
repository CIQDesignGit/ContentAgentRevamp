"use client"

import { useMemo, useState } from "react"
import { Columns2, Type } from "lucide-react"
import { titleMatchPercent } from "@/lib/title-match"
import {
  ContentRecommendationBody,
  ContentRecommendationHeader,
} from "./content-recommendation-card"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"
import { VerticalSourceCompareGrid } from "./vertical-source-compare-grid"
import type { TitleRecommendation, TitleStatus } from "./types"

interface ProductTitleSectionProps {
  pimTitle: string
  pdpTitle: string
  status: TitleStatus
  recommendation: TitleRecommendation | null
  onRecommendationChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onRevert: () => void
}

export function ProductTitleSection({
  pimTitle,
  pdpTitle,
  status,
  recommendation,
  onRecommendationChange,
  onAccept,
  onReject,
  onRevert,
}: ProductTitleSectionProps) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("pim")
  const [isOpen, setIsOpen] = useState(true)
  const [originalText] = useState(() => recommendation?.recommendedText ?? "")

  const matchPercent = useMemo(
    () => titleMatchPercent(pimTitle, pdpTitle),
    [pimTitle, pdpTitle],
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
        pimValue={pimTitle}
        pdpValue={pdpTitle}
        compareTarget={compareTarget}
        recommendationHeader={
          showReco ? (
            <ContentRecommendationHeader
              labels={{
                pending: "AI Recommended Title",
                accepted: "Accepted AI recommended title",
                rejected: "Rejected AI recommended title",
              }}
              status={status}
              compareTarget={compareTarget}
              onCompareTargetChange={setCompareTarget}
              isOpen={isOpen}
              onToggleOpen={() => setIsOpen((v) => !v)}
              onRevert={onRevert}
            />
          ) : undefined
        }
        recommendationBody={
          showRecoBody && recommendation ? (
            <ContentRecommendationBody
              key={`${pimTitle}|${pdpTitle}`}
              recommendation={recommendation}
              pimBaseline={pimTitle}
              pdpBaseline={pdpTitle}
              originalText={originalText}
              compareTarget={compareTarget}
              status={status}
              onRecommendedTextChange={onRecommendationChange}
              onAccept={onAccept}
              onReject={onReject}
              onReset={() => onRecommendationChange(originalText)}
              editAriaLabel="Edit AI recommended title"
            />
          ) : undefined
        }
      />
    </section>
  )
}
