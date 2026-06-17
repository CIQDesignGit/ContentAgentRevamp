"use client"

import { ArrowUp, Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AltKeyword } from "./types"

interface AltKeywordsPanelProps {
  keywords: AltKeyword[]
  usedIds: Set<string>
  onUse: (keyword: AltKeyword) => void
  onRemove: (keyword: AltKeyword) => void
}

function KeywordCell({
  kw,
  isUsed,
  onUse,
  onRemove,
}: {
  kw: AltKeyword
  isUsed: boolean
  onUse: () => void
  onRemove: () => void
}) {
  return (
    <li className="py-1">
      {/* Card container — each keyword is a distinct entity */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 transition-opacity",
          isUsed && "opacity-40",
        )}
      >
        {/* Keyword name */}
        <span
          className={cn(
            "min-w-0 truncate text-xs",
            isUsed ? "text-slate-400" : "text-slate-700",
          )}
        >
          {kw.keyword}
        </span>

        {/* Rank + volume — pushed right */}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <ArrowUp className="size-3 text-success-500" aria-hidden />
          <span className="text-xs font-medium text-slate-600">#{kw.rank}</span>
          <span className="text-xs text-slate-400">{kw.volume}/mo</span>
        </span>

        {/* Use / Applied action */}
        {isUsed ? (
          <span className="flex shrink-0 items-center gap-1">
            <Check className="size-3 text-success-600" aria-hidden />
            <span className="text-xs text-success-600">Applied</span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove "${kw.keyword}"`}
              title="Remove this keyword"
              className="ml-0.5 text-slate-400 hover:text-slate-700"
            >
              <X className="size-3" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={onUse}
            aria-label={`Insert "${kw.keyword}"`}
            title={`Insert "${kw.keyword}"`}
            className="grid shrink-0 size-5 place-items-center rounded border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>
    </li>
  )
}

export function AltKeywordsPanel({ keywords, usedIds, onUse, onRemove }: AltKeywordsPanelProps) {
  if (!keywords.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 pb-2.5 pt-3">
      {/* Header */}
      <p className="mb-2.5 flex items-start gap-1.5 text-xs text-slate-500">
        <span aria-hidden className="mt-px shrink-0 text-slate-400">•</span>
        Other trending keywords picked up by this title:
      </p>

      {/* 2-column keyword grid */}
      <ul className="grid grid-cols-2 gap-x-6">
        {keywords.map((kw) => (
          <KeywordCell
            key={kw.id}
            kw={kw}
            isUsed={usedIds.has(kw.id)}
            onUse={() => onUse(kw)}
            onRemove={() => onRemove(kw)}
          />
        ))}
      </ul>

      {/* Divider + source */}
      <p className="mt-2 border-t border-slate-200 pt-2 text-xs italic text-slate-400">
        Source: existing PIM and PDP title · Helium 10 keyword index · top 50 competitor titles in category.
      </p>
    </div>
  )
}
