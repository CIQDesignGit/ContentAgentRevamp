"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronRight, Plus, Sparkles, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiffSegment, ReasonType, TitleRecommendation, TitleStatus } from "./types"

function DiffView({ diff }: { diff: DiffSegment[] }) {
  return (
    <p className="text-sm leading-relaxed text-slate-900">
      {diff.map((seg, idx) => {
        if (seg.kind === "kept") return <span key={idx}>{seg.text}</span>
        if (seg.kind === "removed") return <span key={idx} className="text-slate-400 line-through">{seg.text}</span>
        return <span key={idx} className="font-medium text-primary">{seg.text}</span>
      })}
    </p>
  )
}

const REASON_ICONS: Record<ReasonType, React.ElementType> = { ADDED: Plus, REMOVED: X, REPLACED: Undo2 }
const REASON_COLORS: Record<ReasonType, string> = {
  ADDED: "text-success-600",
  REMOVED: "text-error-600",
  REPLACED: "text-blue-600",
}

function ReasoningPanel({ reasoning }: { reasoning: TitleRecommendation["reasoning"] }) {
  const [activeKey, setActiveKey] = useState(reasoning[0]?.key ?? "")
  const active = reasoning.find((r) => r.key === activeKey) ?? reasoning[0]
  if (!active) return null
  return (
    <div className="mt-3 rounded-lg bg-violet-100 p-3">
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
                : "border-violet-200 bg-violet-50 text-primary hover:bg-violet-100",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {active.reasons.map((r, idx) => {
          const Icon = REASON_ICONS[r.type]
          return (
            <li key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={cn("size-4", REASON_COLORS[r.type])} />
                <span className="text-sm font-medium text-slate-900">{r.summary}</span>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-slate-500">{r.detail}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ToggleSwitch({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", checked ? "bg-primary" : "bg-slate-300")}
    >
      <span className={cn("inline-block size-4 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  )
}

interface TitleRecommendationCardProps {
  recommendation: TitleRecommendation
  status: TitleStatus
  onAccept: () => void
  onReject: () => void
  onRevert: () => void
}

export function TitleRecommendationCard({ recommendation, status, onAccept, onReject, onRevert }: TitleRecommendationCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <div className={cn("overflow-visible rounded-lg", status === "pending" ? "bg-violet-50" : "bg-slate-50")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
        <button type="button" onClick={() => setIsOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left" aria-expanded={isOpen}>
          {status === "accepted" ? (
            <span className="flex items-center gap-2">
              <Check className="size-4 text-success-600" />
              <span className="text-xs font-medium text-success-600">Accepted {recommendation.agentName}&apos;s recommendation</span>
            </span>
          ) : status === "rejected" ? (
            <span className="flex items-center gap-2">
              <X className="size-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-500">Rejected {recommendation.agentName}&apos;s recommendation</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                {recommendation.agentName.charAt(0)}
              </span>
              <span className="text-xs font-medium text-primary">{recommendation.agentName} recommended title</span>
            </span>
          )}
          {isOpen ? <ChevronDown className={cn("size-4", status === "pending" ? "text-primary" : "text-slate-400")} /> : <ChevronRight className={cn("size-4", status === "pending" ? "text-primary" : "text-slate-400")} />}
        </button>

        <div className="flex items-center gap-3">
          {status === "pending" && (
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-xs font-medium text-primary">Show Reasoning</span>
              <ToggleSwitch checked={showReasoning} onChange={setShowReasoning} ariaLabel="Toggle reasoning" />
            </div>
          )}
          {status === "accepted" && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onRevert() }} className="inline-flex h-7 items-center gap-1.5 px-2 text-xs font-medium text-slate-500 hover:text-slate-900">
              <Undo2 className="size-3.5" /> Revert
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 px-3 pb-3">
          <div className={cn("rounded-lg border px-3 py-2", status === "pending" ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white")}>
            <DiffView diff={recommendation.diff} />
          </div>
          {status === "pending" && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onAccept} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50">
                <Check className="size-4 text-success-600" /> Accept
              </button>
              <button type="button" onClick={onReject} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50">
                <X className="size-4 text-error-600" /> Reject
              </button>
            </div>
          )}
          {status === "rejected" && (
            <button type="button" onClick={onAccept} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50">
              <Check className="size-4 text-success-600" /> Accept anyway
            </button>
          )}
          {showReasoning && status === "pending" && <ReasoningPanel reasoning={recommendation.reasoning} />}
        </div>
      )}
    </div>
  )
}
