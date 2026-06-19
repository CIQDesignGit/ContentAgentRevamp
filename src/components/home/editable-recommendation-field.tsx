"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { DiffSegment } from "./types"

function DiffView({ diff }: { diff: DiffSegment[] }) {
  if (diff.length === 0) {
    return (
      <p className="w-full text-sm text-slate-400">
        No changes vs selected source.
      </p>
    )
  }
  return (
    <p className="w-full text-sm leading-relaxed text-slate-900">
      {diff.map((seg, idx) => {
        if (seg.kind === "kept") return <span key={idx}>{seg.text}</span>
        if (seg.kind === "removed") {
          return (
            <span key={idx} className="text-slate-400 line-through">
              {seg.text}
            </span>
          )
        }
        return (
          <span key={idx} className="rounded bg-green-50 px-0.5 font-medium text-green-700">
            {seg.text}
          </span>
        )
      })}
    </p>
  )
}

/** Visual tone for the AI recommendation text container only. */
export type RecommendationFieldTone = "highlight" | "accepted" | "success" | "muted"

const TONE_OUTER_CLASS: Record<RecommendationFieldTone, string> = {
  highlight: "bg-brand-50",
  accepted: "bg-brand-50",
  success: "bg-success-50",
  muted: "bg-slate-50",
}

const TONE_INNER_BORDER_CLASS: Record<RecommendationFieldTone, string> = {
  highlight: "border-brand-300",
  accepted: "border-brand-200",
  success: "border-success-200",
  muted: "border-slate-200",
}

const TONE_INNER_BG_CLASS: Record<RecommendationFieldTone, string> = {
  highlight: "bg-white",
  accepted: "bg-brand-25",
  success: "bg-white",
  muted: "bg-slate-100",
}

interface EditableRecommendationFieldProps {
  value: string
  diff: DiffSegment[]
  originalValue: string
  onChange: (text: string) => void
  tone?: RecommendationFieldTone
  showDiff?: boolean
  readOnly?: boolean
  editAriaLabel?: string
  editRows?: number
  compact?: boolean
  /** When set, shows a character counter inside the box (red when over limit). */
  charLimit?: number
  /**
   * When this value changes (e.g. the compare tab switches), the field exits
   * edit mode so the diff view becomes visible again.
   */
  exitEditKey?: string
}

export function EditableRecommendationField({
  value,
  diff,
  originalValue,
  onChange,
  tone = "highlight",
  showDiff = true,
  readOnly = false,
  editAriaLabel = "Edit AI recommendation",
  editRows = 3,
  compact = false,
  charLimit,
  exitEditKey,
}: EditableRecommendationFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = !readOnly

  useEffect(() => {
    if (value === originalValue) setIsEditing(false)
  }, [value, originalValue])

  useEffect(() => {
    if (readOnly) setIsEditing(false)
  }, [readOnly])

  // Exit edit mode whenever the tab/view changes so the diff is visible again
  useEffect(() => {
    setIsEditing(false)
  }, [exitEditKey])

  const plainText = (
    <p
      className={cn(
        "w-full text-sm leading-relaxed",
        tone === "muted" ? "text-slate-500" : "text-slate-900",
      )}
    >
      {value}
    </p>
  )

  const displayContent = showDiff ? <DiffView diff={diff} /> : plainText

  return (
    <div
      data-recommendation-tone={tone}
      className={cn("w-full min-w-0 rounded-lg px-0.5 py-0.5", TONE_OUTER_CLASS[tone])}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col rounded-md border px-3 py-2",
          TONE_INNER_BG_CLASS[tone],
          TONE_INNER_BORDER_CLASS[tone],
          isEditing &&
            (tone === "highlight" || tone === "accepted") &&
            "ring-2 ring-brand-200",
        )}
      >
        {isEditing && canEdit ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={editRows}
            autoFocus
            aria-label={editAriaLabel}
            className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-slate-900 focus:outline-none"
          />
        ) : canEdit ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="block w-full cursor-text bg-transparent text-left focus:outline-none"
            aria-label={editAriaLabel}
          >
            {displayContent}
          </button>
        ) : (
          displayContent
        )}

        {charLimit ? (
          <p className={cn(
            "mt-1 text-right text-xs tabular-nums",
            value.length > charLimit ? "font-semibold text-error-600" : "text-slate-400",
          )}>
            {value.length} / {charLimit}
          </p>
        ) : null}
      </div>
    </div>
  )
}
