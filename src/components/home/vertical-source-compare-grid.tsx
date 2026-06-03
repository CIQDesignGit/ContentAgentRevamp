"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BulletSourceCell, SourceCellLabel } from "./bullet-source-cell"
import { RETAILER_LOGO_SRC, SALSIFY_LOGO_SRC } from "./source-logos"

export type FieldCompareTarget = "pim" | "pdp"

interface VerticalSourceCompareGridProps {
  pimValue: string
  pdpValue: string
  /** Used by parents for diff baseline in the recommendation body. */
  compareTarget: FieldCompareTarget
  showPim?: boolean
  showPdp?: boolean
  pimEmptyLabel?: string
  /** When false, column labels are omitted (e.g. shared headers on the parent section). */
  showColumnLabels?: boolean
  /** Full-width row below the source columns (e.g. AI Recommended Title + tabs). */
  recommendationHeader?: ReactNode
  /** Full-width row below the header (editable field, actions, reasoning). */
  recommendationBody?: ReactNode
}

function sourceColumnClass(showPim: boolean, showPdp: boolean) {
  return showPim && showPdp ? "grid-cols-2" : "grid-cols-1"
}

/** PIM and retailer side by side; AI recommendation spans full width below. */
export function VerticalSourceCompareGrid({
  pimValue,
  pdpValue,
  showPim = true,
  showPdp = true,
  pimEmptyLabel = "—",
  showColumnLabels = true,
  recommendationHeader,
  recommendationBody,
}: VerticalSourceCompareGridProps) {
  const columnClass = sourceColumnClass(showPim, showPdp)
  const hasRecommendation = Boolean(recommendationHeader || recommendationBody)

  return (
    <div className="flex w-full flex-col gap-2">
      {showColumnLabels ? (
        <div className={cn("grid items-center gap-x-3 gap-y-2", columnClass)}>
          {showPim ? (
            <SourceCellLabel logoSrc={SALSIFY_LOGO_SRC} logoAlt="Salsify" sublabel="Salsify" />
          ) : null}
          {showPdp ? (
            <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
          ) : null}
        </div>
      ) : null}

      <div className={cn("grid items-stretch gap-x-3 gap-y-2", columnClass)}>
        {showPim ? (
          <BulletSourceCell
            logoSrc={SALSIFY_LOGO_SRC}
            logoAlt="Salsify"
            sublabel="Salsify"
            value={pimValue}
            compareValue={pdpValue}
            side="pim"
            emptyLabel={pimEmptyLabel}
            showLabel={false}
          />
        ) : null}
        {showPdp ? (
          <BulletSourceCell
            logoSrc={RETAILER_LOGO_SRC}
            logoAlt="Amazon"
            sublabel="Retailer"
            value={pdpValue}
            compareValue={pimValue}
            side="pdp"
            showLabel={false}
          />
        ) : null}
      </div>

      {hasRecommendation ? (
        <div className="flex flex-col gap-2">
          {recommendationHeader ? (
            <div className="flex w-full items-end">{recommendationHeader}</div>
          ) : null}
          {recommendationBody ? <div className="w-full min-w-0">{recommendationBody}</div> : null}
        </div>
      ) : null}
    </div>
  )
}
