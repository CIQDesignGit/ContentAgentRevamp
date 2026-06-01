"use client"

import { useState } from "react"
import { ChevronDown, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RemarksCardShell, RemarksDetailBox } from "./remarks-card-shell"
import type { SyndicationRemarks } from "./types"

const COLLAPSED_ERROR_COUNT = 2

export function SyndicationRemarksCard({ remarks }: { remarks: SyndicationRemarks }) {
  const [errorsExpanded, setErrorsExpanded] = useState(false)
  const hasMoreErrors = remarks.errors.length > COLLAPSED_ERROR_COUNT
  const visibleErrors =
    errorsExpanded || !hasMoreErrors
      ? remarks.errors
      : remarks.errors.slice(0, COLLAPSED_ERROR_COUNT)

  async function copyRaw() {
    try {
      await navigator.clipboard.writeText(remarks.rawText)
    } catch {
      /* clipboard unavailable */
    }
  }

  const stageLabel =
    remarks.stage === "pim" ? "Remarks — PIM" : "Remarks — Syndication"

  return (
    <RemarksCardShell
      tone="error"
      label={stageLabel}
      headline={remarks.headline}
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => void copyRaw()}
        >
          <Copy className="size-3" />
          Copy raw
        </Button>
      }
    >
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-semibold">Summary: </span>
        {remarks.plainTerms}
      </p>

      <RemarksDetailBox>
        <ol className="list-decimal space-y-1 pl-4">
          {visibleErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ol>
      </RemarksDetailBox>

      {hasMoreErrors ? (
        <button
          type="button"
          onClick={() => setErrorsExpanded((open) => !open)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          {errorsExpanded
            ? "Show less"
            : `Show all ${remarks.errors.length} errors`}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              errorsExpanded && "rotate-180",
            )}
          />
        </button>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-500">
          Raw response (verbatim)
        </summary>
        <pre className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed whitespace-pre-wrap text-slate-700">
          {remarks.rawText}
        </pre>
      </details>

      <p className="mt-3 text-xs text-info-700">{remarks.suggestedFix}</p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 gap-1.5 text-xs"
      >
        <Sparkles className="size-3.5 text-primary" />
        Summarize this error with AI
      </Button>
    </RemarksCardShell>
  )
}
