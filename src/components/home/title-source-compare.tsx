"use client"

import { SourceCompareGrid } from "./source-compare-grid"

interface TitleSourceCompareProps {
  pimTitle: string
  pdpTitle: string
}

export function TitleSourceCompare({ pimTitle, pdpTitle }: TitleSourceCompareProps) {
  return <SourceCompareGrid pimValue={pimTitle} pdpValue={pdpTitle} copyLabel="title" />
}
