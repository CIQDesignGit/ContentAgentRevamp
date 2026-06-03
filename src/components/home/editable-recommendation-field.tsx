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
export type RecommendationFieldTone = "highlight" | "success" | "muted"

const TONE_OUTER_CLASS: Record<RecommendationFieldTone, string> = {
  highlight: "bg-violet-50",
  success: "bg-success-50",
  muted: "bg-slate-50",
}

const TONE_INNER_BORDER_CLASS: Record<RecommendationFieldTone, string> = {
  highlight: "border-violet-300",
  success: "border-success-200",
  muted: "border-slate-200",
}

interface EditableRecommendationFieldProps {
  value: string
  diff: DiffSegment[]
  originalValue: string
  onChange: (text: string) => void
  tone?: RecommendationFieldTone
  editAriaLabel?: string
  editRows?: number
  compact?: boolean
}

export function EditableRecommendationField({
  value,
  diff,
  originalValue,
  onChange,
  tone = "highlight",
  editAriaLabel = "Edit AI recommendation",
  editRows = 3,
  compact = false,
}: EditableRecommendationFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (value === originalValue) setIsEditing(false)
  }, [value, originalValue])

  return (
    <div
      className={cn(
        "w-full min-w-0 rounded-lg",
        compact ? "p-0.5" : "p-1",
        TONE_OUTER_CLASS[tone],
      )}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col rounded-md border bg-white px-3",
          compact ? "py-1.5" : "py-2",
          TONE_INNER_BORDER_CLASS[tone],
          isEditing && tone === "highlight" && "ring-2 ring-violet-200",
        )}
      >
        {isEditing ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            rows={editRows}
            autoFocus
            aria-label={editAriaLabel}
            className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-slate-900 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="block w-full cursor-text text-left focus:outline-none"
            aria-label={editAriaLabel}
          >
            <DiffView diff={diff} />
          </button>
        )}
      </div>
    </div>
  )
}
