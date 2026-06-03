"use client"

import type { ReactNode } from "react"
import { BulletSourceCell, SourceCellLabel } from "./bullet-source-cell"
import { RETAILER_LOGO_SRC, SALSIFY_LOGO_SRC } from "./source-logos"

export type FieldCompareTarget = "pim" | "pdp"

interface VerticalSourceCompareGridProps {
  pimValue: string
  pdpValue: string
  compareTarget: FieldCompareTarget
  showPim?: boolean
  showPdp?: boolean
  pimEmptyLabel?: string
  /** Same grid row as the first source label (e.g. Salsify). */
  recommendationHeader?: ReactNode
  /** Same grid row as the active source text box (PIM or PDP). */
  recommendationBody?: ReactNode
}

function EmptyRecoCell() {
  return <div className="min-h-0" aria-hidden="true" />
}

/** PIM and PDP stacked on the left; recommendation beside the active source row. */
export function VerticalSourceCompareGrid({
  pimValue,
  pdpValue,
  compareTarget,
  showPim = true,
  showPdp = true,
  pimEmptyLabel = "—",
  recommendationHeader,
  recommendationBody,
}: VerticalSourceCompareGridProps) {
  const showRecoColumn = Boolean(recommendationHeader || recommendationBody)

  if (!showRecoColumn) {
    return (
      <div className="flex min-w-0 w-full flex-col gap-2">
        {showPim ? (
          <>
            <SourceCellLabel logoSrc={SALSIFY_LOGO_SRC} logoAlt="Salsify" sublabel="Salsify" />
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
          </>
        ) : null}
        {showPdp ? (
          <>
            <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
            <BulletSourceCell
              logoSrc={RETAILER_LOGO_SRC}
              logoAlt="Amazon"
              sublabel="Retailer"
              value={pdpValue}
              compareValue={pimValue}
              side="pdp"
              showLabel={false}
            />
          </>
        ) : null}
      </div>
    )
  }

  const headerCell = recommendationHeader ? (
    <div className="flex min-h-8 min-w-0 w-full items-center">{recommendationHeader}</div>
  ) : (
    <EmptyRecoCell />
  )

  const pimRecoCell =
    compareTarget === "pim" && recommendationBody ? (
      <div className="min-w-0 self-start">{recommendationBody}</div>
    ) : (
      <EmptyRecoCell />
    )

  const pdpRecoCell =
    compareTarget === "pdp" && recommendationBody ? (
      <div className="min-w-0 self-start">{recommendationBody}</div>
    ) : (
      <EmptyRecoCell />
    )

  return (
    <div className="grid grid-cols-2 items-start gap-x-3 gap-y-2">
      {showPim ? (
        <>
          <SourceCellLabel logoSrc={SALSIFY_LOGO_SRC} logoAlt="Salsify" sublabel="Salsify" />
          {headerCell}

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
          {pimRecoCell}
        </>
      ) : null}

      {showPdp ? (
        <>
          <SourceCellLabel logoSrc={RETAILER_LOGO_SRC} logoAlt="Amazon" sublabel="Retailer" />
          {showPim ? <EmptyRecoCell /> : headerCell}

          <BulletSourceCell
            logoSrc={RETAILER_LOGO_SRC}
            logoAlt="Amazon"
            sublabel="Retailer"
            value={pdpValue}
            compareValue={pimValue}
            side="pdp"
            showLabel={false}
          />
          {pdpRecoCell}
        </>
      ) : null}
    </div>
  )
}
