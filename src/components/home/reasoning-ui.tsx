"use client"

import { useState } from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AeoPerformance, ReasonType, ReasoningCategory } from "./types"

const REASON_COLORS: Record<ReasonType, string> = {
  ADDED: "text-success-600",
  REMOVED: "text-error-600",
  REPLACED: "text-blue-600",
}

const AEO_TAB_KEY = "aeo"
const COMPLIANCE_TAB_KEY = "compliance"

/** Fixed display order for reasoning category tabs. */
const REASONING_TAB_ORDER: Record<string, number> = {
  compliance: 0,
  seo: 1,
  aeo: 2,
}

function sortReasoningCategories(categories: ReasoningCategory[]) {
  return [...categories].sort((a, b) => {
    const aOrder = REASONING_TAB_ORDER[a.key] ?? 99
    const bOrder = REASONING_TAB_ORDER[b.key] ?? 99
    return aOrder - bOrder
  })
}

function getDefaultActiveKey(
  reasoning: ReasoningCategory[],
  sortedReasoning: ReasoningCategory[],
): string {
  const complianceTab = reasoning.find((category) => category.key === COMPLIANCE_TAB_KEY)
  if (complianceTab) return complianceTab.key
  return sortedReasoning[0]?.key ?? AEO_TAB_KEY
}

export function ReasoningPanel({
  reasoning,
  aeoPerformance,
}: {
  reasoning: ReasoningCategory[]
  aeoPerformance?: AeoPerformance
}) {
  const sortedReasoning = sortReasoningCategories(reasoning)
  const [activeKey, setActiveKey] = useState(() =>
    getDefaultActiveKey(reasoning, sortedReasoning),
  )
  const hasAeoInReasoning = reasoning.some((category) => category.key === AEO_TAB_KEY)
  const showAeoPerformanceTab = Boolean(aeoPerformance && !hasAeoInReasoning)
  const activeReasoning =
    reasoning.find((category) => category.key === activeKey) ?? reasoning[0]
  const isAeoShopperView = activeKey === AEO_TAB_KEY && Boolean(aeoPerformance)

  return (
    <div className="rounded-lg bg-brand-25 p-3">
      <div
        className={cn(
          "flex flex-wrap gap-1.5",
          (isAeoShopperView || activeReasoning) && "mb-3",
        )}
      >
        {sortedReasoning.map((cat) => (
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
        {showAeoPerformanceTab ? (
          <button
            type="button"
            onClick={() => setActiveKey(AEO_TAB_KEY)}
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium",
              isAeoShopperView
                ? "border-primary bg-white text-primary"
                : "border-brand-200 bg-brand-50 text-primary hover:bg-brand-100",
            )}
          >
            AEO
          </button>
        ) : null}
      </div>

      {isAeoShopperView && aeoPerformance ? (
        <ul className="space-y-3">
          {aeoPerformance.questions.map((q, idx) => (
            <li key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <Circle
                  className="size-2 shrink-0 fill-current text-success-600"
                  aria-hidden
                />
                <span className="text-sm font-medium text-slate-900">
                  &ldquo;{q.question}&rdquo;
                  {q.isNew ? (
                    <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                      NEW
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-slate-500">{q.answer}</p>
            </li>
          ))}
        </ul>
      ) : activeReasoning ? (
        <ul className="space-y-3">
          {activeReasoning.reasons.map((r, idx) => (
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
      ) : null}
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
