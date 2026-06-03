"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { RETAILER_LOGO_SRC, SALSIFY_LOGO_SRC, logoBadgeClass } from "./source-logos"
import { SourceCompareText } from "./source-compare-text"

interface BulletSourceCellProps {
  logoSrc: string
  logoAlt: string
  sublabel: string
  value: string
  compareValue: string
  side: "pim" | "pdp"
  emptyLabel?: string
  /** When false, only the text box is shown (column label is rendered once at section top). */
  showLabel?: boolean
}

/** Logo + source name shown above the compare text box. */
export function SourceCellLabel({
  logoSrc,
  logoAlt,
  sublabel,
}: {
  logoSrc: string
  logoAlt: string
  sublabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={logoBadgeClass(logoSrc)}>
        <Image src={logoSrc} alt={logoAlt} width={20} height={20} className="size-5 object-contain" />
      </span>
      <span className="text-xs text-slate-500">{sublabel}</span>
    </div>
  )
}

export function BulletSourceCell({
  logoSrc,
  logoAlt,
  sublabel,
  value,
  compareValue,
  side,
  emptyLabel = "—",
  showLabel = true,
}: BulletSourceCellProps) {
  const [copied, setCopied] = useState(false)
  const display = value.trim() ? value : emptyLabel

  async function handleCopy() {
    if (!value.trim()) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col self-start", showLabel && "gap-2")}>
      {showLabel ? <SourceCellLabel logoSrc={logoSrc} logoAlt={logoAlt} sublabel={sublabel} /> : null}

      <div className="group relative flex w-full flex-col rounded-lg border border-slate-200 bg-slate-50">
        {value.trim() ? (
          <SourceCompareText value={value} compareValue={compareValue} side={side} />
        ) : (
          <p className="flex-1 px-3 py-2 pr-10 text-sm leading-relaxed text-slate-400 italic">
            {display}
          </p>
        )}
        {value.trim() ? (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : `Copy ${sublabel} bullet`}
            title={copied ? "Copied" : "Copy"}
            className={cn(
              "absolute bottom-2 right-2 grid size-7 place-items-center rounded-md border border-slate-200 bg-white shadow-sm",
              "text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-900",
              copied && "opacity-100 text-success-600",
            )}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** Shared PIM / retailer column titles for the combined bullet points card. */
export function BulletCompareColumnHeaders() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2">
        <span className={logoBadgeClass(SALSIFY_LOGO_SRC)}>
          <Image src={SALSIFY_LOGO_SRC} alt="Salsify" width={20} height={20} className="size-5 object-contain" />
        </span>
        <span className="text-xs text-slate-500">Salsify</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={logoBadgeClass(RETAILER_LOGO_SRC)}>
          <Image
            src={RETAILER_LOGO_SRC}
            alt="Amazon"
            width={20}
            height={20}
            className="size-5 object-contain"
          />
        </span>
        <span className="text-xs text-slate-500">Retailer</span>
      </div>
    </div>
  )
}
