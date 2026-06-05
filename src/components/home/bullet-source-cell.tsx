"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Image from "next/image"
import { Check, Copy, ClockArrowUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SOURCE_LOGO_BADGE_CLASS,
  SOURCE_LOGO_FRAME_CLASS,
  SOURCE_LOGO_IMAGE_CLASS,
  SALSIFY_LOGO_SRC,
} from "./source-logos"
import { SourceCompareText } from "./source-compare-text"

/** Sparkles icon for AI recommendation channel labels (18×18, 1.3px stroke). */
export function AiRecommendationSparklesIcon({ className }: { className?: string }) {
  return (
    <Sparkles
      className={cn("size-[18px] shrink-0 text-brand-500", className)}
      strokeWidth={1.3}
      aria-hidden
    />
  )
}

/** Clock-arrow-up icon for queued / in-flight published changes (18×18, 1.2px stroke). */
export function QueuedChangesTimerIcon({ className }: { className?: string }) {
  return (
    <ClockArrowUp
      className={cn("size-[18px] shrink-0 text-slate-500", className)}
      strokeWidth={1.2}
      aria-hidden
    />
  )
}

/** Square logo chip with 2px padding; logo fits inside without heavy cropping. */
export function SourceLogoBadge({ src, alt }: { src: string; alt: string }) {
  return (
    <span className={SOURCE_LOGO_BADGE_CLASS}>
      <span className={SOURCE_LOGO_FRAME_CLASS}>
        <Image src={src} alt={alt} fill sizes="20px" className={SOURCE_LOGO_IMAGE_CLASS} />
      </span>
    </span>
  )
}

/** Shared label row for PIM, Retailer, and AI recommendation channels. */
export function SourceChannelLabel({
  icon,
  label,
  trailing,
}: {
  icon: ReactNode
  label: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {icon}
      <span className="truncate text-xs font-medium text-slate-700">{label}</span>
      {trailing}
    </div>
  )
}

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
    <SourceChannelLabel icon={<SourceLogoBadge src={logoSrc} alt={logoAlt} />} label={sublabel} />
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
    <div
      className={cn(
        "flex w-full min-w-0 flex-col",
        showLabel ? "gap-2" : "h-full",
      )}
    >
      {showLabel ? <SourceCellLabel logoSrc={logoSrc} logoAlt={logoAlt} sublabel={sublabel} /> : null}

      <div
        className={cn(
          "group relative flex w-full flex-col rounded-lg border border-slate-200 bg-slate-50",
          "h-full min-h-18 flex-1",
        )}
      >
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

