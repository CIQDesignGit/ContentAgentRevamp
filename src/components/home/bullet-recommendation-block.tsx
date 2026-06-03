"use client"

import { useMemo, useState } from "react"
import { Check, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import { AiRecommendationSparklesIcon, SourceChannelLabel } from "./bullet-source-cell"
import { EditableRecommendationField } from "./editable-recommendation-field"
import { ReasoningPanel, ToggleSwitch } from "./reasoning-ui"
import type { BulletRecommendation } from "./types"

export type BulletCompareTarget = "pim" | "pdp"

function CompareTabs({
  value,
  onChange,
}: {
  value: BulletCompareTarget
  onChange: (v: BulletCompareTarget) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Compare recommendation with"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
    >
      {(
        [
          { key: "pim" as const, label: "PIM" },
          { key: "pdp" as const, label: "PDP" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt.key ? "bg-violet-100 text-primary" : "text-slate-600 hover:bg-slate-50",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function headerMeta(item: BulletRecommendation): {
  title: string
  badge: string | null
  badgeClass: string
} {
  if (item.status === "pending") {
    return { title: "AI Recommendation", badge: null, badgeClass: "" }
  }
  if (item.footprint === "processing") {
    return { title: "AI Recommendation", badge: "Processing", badgeClass: "bg-blue-100 text-blue-700" }
  }
  if (item.footprint === "recently-updated") {
    return {
      title: "Recently updated recommendation",
      badge: "Synced",
      badgeClass: "bg-success-100 text-success-700",
    }
  }
  if (item.status === "accepted") {
    return { title: "AI Recommendation", badge: "Accepted", badgeClass: "bg-success-100 text-success-700" }
  }
  return { title: "AI Recommendation", badge: "Rejected", badgeClass: "bg-slate-100 text-slate-600" }
}

function isTweakableReco(item: BulletRecommendation) {
  return (
    item.status === "pending" ||
    item.footprint === "processing" ||
    item.footprint === "recently-updated"
  )
}

/** Title, badge, and PIM/PDP tabs — lives in the bullet row header. */
export function BulletRecommendationHeader({
  item,
  compareTarget,
  onCompareTargetChange,
}: {
  item: BulletRecommendation
  compareTarget: BulletCompareTarget
  onCompareTargetChange: (target: BulletCompareTarget) => void
}) {
  const { title, badge, badgeClass } = headerMeta(item)
  const tweakable = isTweakableReco(item)

  return (
    <div className="flex w-full flex-wrap items-end justify-between gap-2">
      <SourceChannelLabel
        icon={<AiRecommendationSparklesIcon />}
        label={title}
        trailing={
          badge ? (
            <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium", badgeClass)}>
              {badge}
            </span>
          ) : null
        }
      />
      {tweakable ? (
        <CompareTabs value={compareTarget} onChange={onCompareTargetChange} />
      ) : null}
    </div>
  )
}

interface BulletRecommendationBodyProps {
  item: BulletRecommendation
  pimBaseline: string
  pdpBaseline: string
  originalText: string
  compareTarget: BulletCompareTarget
  onTextChange: (text: string) => void
  onAccept: () => void
  onReject: () => void
  onReset: () => void
  className?: string
}

/** Editable recommendation field and actions — aligned beside the active source row. */
export function BulletRecommendationBody({
  item,
  pimBaseline,
  pdpBaseline,
  originalText,
  compareTarget,
  onTextChange,
  onAccept,
  onReject,
  onReset,
  className,
}: BulletRecommendationBodyProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isModified = item.recommendedText !== originalText
  const tweakable = isTweakableReco(item)
  const acceptLabel = item.status === "pending" ? "Accept" : "Push updates"

  const baseline = compareTarget === "pim" ? pimBaseline : pdpBaseline
  const compareDiff = useMemo(
    () => buildTitleDiff(baseline, item.recommendedText),
    [baseline, item.recommendedText],
  )

  const fieldTone =
    item.status === "rejected"
      ? "muted"
      : item.footprint === "recently-updated"
        ? "success"
        : "highlight"

  return (
    <div className={cn("w-full min-w-0", className)}>
      {tweakable ? (
        <div className="w-full space-y-2">
          <EditableRecommendationField
            value={item.recommendedText}
            diff={compareDiff}
            originalValue={originalText}
            onChange={onTextChange}
            tone={fieldTone}
            compact
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">Show Reasoning</span>
              <ToggleSwitch
                checked={showReasoning}
                onChange={setShowReasoning}
                ariaLabel="Toggle reasoning"
              />
            </div>
            <div className="flex items-center gap-2">
              {isModified ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw className="size-3.5" />
                  Reset recommendation
                </button>
              ) : null}
              {item.status === "pending" ? (
                <button
                  type="button"
                  onClick={onReject}
                  aria-label="Reject recommendation"
                  title="Reject"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <X className="size-4 text-error-600" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onAccept}
                aria-label={acceptLabel}
                title={acceptLabel}
                className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"
              >
                <Check className="size-4 text-success-600" />
              </button>
            </div>
          </div>

          {showReasoning && item.reasoning.length > 0 ? (
            <ReasoningPanel reasoning={item.reasoning} />
          ) : null}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-slate-700">{item.recommendedText}</p>
      )}
    </div>
  )
}
