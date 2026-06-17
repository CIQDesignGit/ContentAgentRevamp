"use client"

import { useState } from "react"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AeoPerformance, ReasonType, ReasoningCategory } from "./types"

const REASON_COLORS: Record<ReasonType, string> = {
  ADDED: "text-success-600",
  REMOVED: "text-error-600",
  REPLACED: "text-blue-600",
}

/** Visually distinct card showing which shopper questions the recommendation now answers. */
function ShopperQuestionsCard({ performance }: { performance: AeoPerformance }) {
  return (
    <div className="rounded-lg border border-success-200 bg-success-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-100">
          <Check className="size-3 text-success-700" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-800">
            Structured to answer common shopper questions
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Surfaced by LLM-powered shopping assistants ({performance.sources.join(", ")})
          </p>
        </div>
      </div>

      {/* Questions list */}
      <ul className="space-y-2">
        {performance.questions.map((q, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-3 shrink-0 text-success-600"
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-slate-700">
              <span className="font-medium text-slate-900">
                &ldquo;{q.question}&rdquo;
              </span>
              {" — "}
              <span className="text-slate-500">{q.answer}</span>
              {q.isNew && (
                <span className="ml-1.5 rounded bg-success-100 px-1.5 py-0.5 text-xs font-medium text-success-700">
                  NEW
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ReasoningPanel({
  reasoning,
  aeoPerformance,
}: {
  reasoning: ReasoningCategory[]
  aeoPerformance?: AeoPerformance
}) {
  const [activeKey, setActiveKey] = useState(reasoning[0]?.key ?? "")
  const active = reasoning.find((r) => r.key === activeKey) ?? reasoning[0]

  return (
    <div className="space-y-2">
      {/* AI reasoning categories */}
      {active && (
        <div className="rounded-lg bg-brand-25 p-3">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {reasoning.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveKey(cat.key)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-medium",
                  cat.key === activeKey
                    ? "border-primary bg-white text-primary"
                    : "border-brand-200 bg-brand-50 text-primary hover:bg-brand-100",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <ul className="space-y-3">
            {active.reasons.map((r, idx) => (
              <li key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Circle
                    className={cn("size-2 shrink-0 fill-current", REASON_COLORS[r.type])}
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-slate-900">{r.summary}</span>
                </div>
                <p className="pl-6 text-xs leading-relaxed text-slate-500">{r.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shopper questions — visually distinct success/green card */}
      {aeoPerformance && <ShopperQuestionsCard performance={aeoPerformance} />}
    </div>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
