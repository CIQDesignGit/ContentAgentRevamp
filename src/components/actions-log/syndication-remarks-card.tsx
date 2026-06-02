"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RemarksCardShell } from "./remarks-card-shell"
import type { SyndicationRemarks } from "./types"

export function SyndicationRemarksCard({ remarks }: { remarks: SyndicationRemarks }) {
  const [copied, setCopied] = useState(false)

  async function copyRaw() {
    try {
      await navigator.clipboard.writeText(remarks.rawText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
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
          {copied ? (
            <Check className="size-3 text-success-600" />
          ) : (
            <Copy className="size-3" />
          )}
          {copied ? "Copied" : "Copy raw"}
        </Button>
      }
    >
      <p className="mt-2 text-sm text-slate-700">{remarks.plainTerms}</p>

      <details className="mt-3" open>
        <summary className="cursor-pointer text-xs font-medium text-slate-500">
          Raw response (verbatim)
        </summary>
        <pre className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-relaxed whitespace-pre-wrap text-slate-700">
          {remarks.rawText}
        </pre>
      </details>
    </RemarksCardShell>
  )
}
