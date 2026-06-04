"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { fieldLabelContentStack, fieldSectionStack } from "./field-layout"
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

/** Label + source text box grouped with gap-2 (8px). */
function SourceCompareColumn({
  showLabel,
  label,
  children,
}: {
  showLabel: boolean
  label: ReactNode
  children: ReactNode
}) {
  if (!showLabel) {
    return <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
  }

  return (
    <div className={fieldLabelContentStack("min-h-0 min-w-0")}>
      {label}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
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

  const recommendationGrouped =
    recommendationHeader && recommendationBody ? (
      <div className={fieldLabelContentStack("w-full min-w-0")}>
        {recommendationHeader}
        {recommendationBody}
      </div>
    ) : (
      <>
        {recommendationHeader ? (
          <div className="flex w-full min-w-0">{recommendationHeader}</div>
        ) : null}
        {recommendationBody ? <div className="w-full min-w-0">{recommendationBody}</div> : null}
      </>
    )

  return (
    <div className={fieldSectionStack("w-full")}>
      <div className={cn("grid items-stretch gap-x-3", columnClass)}>
        {showPim ? (
          <SourceCompareColumn
            showLabel={showColumnLabels}
            label={<SourceCellLabel logoSrc={SALSIFY_LOGO_SRC} logoAlt="Salsify" sublabel="Salsify" />}
          >
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
          </SourceCompareColumn>
        ) : null}
        {showPdp ? (
          <SourceCompareColumn
            showLabel={showColumnLabels}
            label={
              <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
            }
          >
            <BulletSourceCell
              logoSrc={RETAILER_LOGO_SRC}
              logoAlt="Amazon"
              sublabel="Retailer"
              value={pdpValue}
              compareValue={pimValue}
              side="pdp"
              showLabel={false}
            />
          </SourceCompareColumn>
        ) : null}
      </div>

      {hasRecommendation ? recommendationGrouped : null}
    </div>
  )
}
