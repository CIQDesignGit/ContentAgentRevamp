"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { logoBadgeClass, RETAILER_LOGO_SRC, SALSIFY_LOGO_SRC } from "./source-logos"
import { SourceCompareText } from "./source-compare-text"

function SourceColumn({
  logoSrc,
  logoAlt,
  sublabel,
  value,
  compareValue,
  side,
  copyLabel,
  cellClassName,
}: {
  logoSrc: string
  logoAlt: string
  sublabel: string
  value: string
  compareValue: string
  side: "pim" | "pdp"
  copyLabel: string
  cellClassName?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={logoBadgeClass(logoSrc)}>
          <Image src={logoSrc} alt={logoAlt} width={20} height={20} className="size-5 object-contain" />
        </span>
        <span className="text-xs text-slate-500">{sublabel}</span>
      </div>

      <div
        className={cn(
          "group relative flex flex-1 flex-col rounded-lg border border-slate-200 bg-slate-50",
          cellClassName ?? "min-h-[4.5rem]",
        )}
      >
        <SourceCompareText value={value} compareValue={compareValue} side={side} />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : `Copy ${sublabel} ${copyLabel}`}
          title={copied ? "Copied" : "Copy"}
          className={cn(
            "absolute bottom-2 right-2 grid size-7 place-items-center rounded-md border border-slate-200 bg-white shadow-sm",
            "text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-900",
            copied && "opacity-100 text-success-600",
          )}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  )
}

interface SourceCompareGridProps {
  pimValue: string
  pdpValue: string
  /** Used in copy button aria-label, e.g. "title" or "description". */
  copyLabel?: string
  cellClassName?: string
}

export function SourceCompareGrid({
  pimValue,
  pdpValue,
  copyLabel = "content",
  cellClassName,
}: SourceCompareGridProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-3">
      <SourceColumn
        logoSrc={SALSIFY_LOGO_SRC}
        logoAlt="Salsify"
        sublabel="Salsify"
        value={pimValue}
        compareValue={pdpValue}
        side="pim"
        copyLabel={copyLabel}
        cellClassName={cellClassName}
      />
      <SourceColumn
        logoSrc={RETAILER_LOGO_SRC}
        logoAlt="Amazon"
        sublabel="Retailer"
        value={pdpValue}
        compareValue={pimValue}
        side="pdp"
        copyLabel={copyLabel}
        cellClassName={cellClassName}
      />
    </div>
  )
}
