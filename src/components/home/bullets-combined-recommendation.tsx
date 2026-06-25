"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Circle, RotateCcw, ToggleLeft, ToggleRight, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildTitleDiff } from "@/lib/build-title-diff"
import { CompareTabs } from "./content-recommendation-card"
import { AltKeywordsPanel } from "./alt-keywords-panel"
import type { AltKeyword, BulletRecommendation, Reason } from "./types"
import type { FieldCompareTarget } from "./vertical-source-compare-grid"

// ─── Grouped reasoning ────────────────────────────────────────────────────────

type BulletGroup = { bulletId: string; bulletLabel: string; reasons: Reason[] }
type GroupedCategory = { key: string; label: string; bulletGroups: BulletGroup[] }

const REASON_DOT: Record<string, string> = {
  ADDED: "text-success-600",
  REMOVED: "text-error-600",
  REPLACED: "text-blue-600",
}

function buildGroupedReasoning(bullets: BulletRecommendation[]): GroupedCategory[] {
  const order: string[] = []
  const meta: Record<string, string> = {}
  for (const b of bullets) {
    for (const cat of b.reasoning) {
      if (!meta[cat.key]) { order.push(cat.key); meta[cat.key] = cat.label }
    }
  }
  return order
    .map((key) => ({
      key,
      label: meta[key],
      bulletGroups: bullets.flatMap((b) => {
        const cat = b.reasoning.find((c) => c.key === key)
        return cat?.reasons.length
          ? [{ bulletId: b.id, bulletLabel: b.label, reasons: cat.reasons }]
          : []
      }),
    }))
    .filter((c) => c.bulletGroups.length > 0)
}

function GroupedReasoningPanel({ grouped }: { grouped: GroupedCategory[] }) {
  const [activeKey, setActiveKey] = useState(grouped[0]?.key ?? "")
  const active = grouped.find((c) => c.key === activeKey)
  return (
    <div className="rounded-lg bg-brand-25 p-3">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {grouped.map((cat) => (
          <button key={cat.key} type="button" onClick={() => setActiveKey(cat.key)}
            className={cn("rounded-md border px-2 py-1 text-xs font-medium",
              cat.key === activeKey
                ? "border-primary bg-white text-primary"
                : "border-brand-200 bg-brand-50 text-primary hover:bg-brand-100",
            )}>
            {cat.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="space-y-4">
          {active.bulletGroups.map((group) => (
            <div key={group.bulletId}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {group.bulletLabel}
              </p>
              <ul className="space-y-2">
                {group.reasons.map((r, i) => (
                  <li key={i} className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Circle className={cn("size-2 shrink-0 fill-current", REASON_DOT[r.type])} aria-hidden />
                      <span className="text-sm font-medium text-slate-900">{r.summary}</span>
                    </div>
                    <p className="pl-6 text-xs leading-relaxed text-slate-500">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Flat list types ──────────────────────────────────────────────────────────

export interface CombinedBulletItem {
  reco: BulletRecommendation
  pimBaseline: string
  pdpBaseline: string
  originalText: string
}

type FlatEntry =
  | { kind: "existing"; id: string; item: CombinedBulletItem }
  | { kind: "local"; id: string; text: string }

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  items: CombinedBulletItem[]
  hasPimData?: boolean
  altKeywords?: AltKeyword[]
  hideActions?: boolean
  onTextChange: (id: string, text: string) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onUndoAccept: (id: string) => void
  onUndoReject: (id: string) => void
  onAddBullet?: (text: string) => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BulletsCombinedRecommendationView({
  items, hasPimData = true, altKeywords = [], hideActions = false,
  onTextChange, onAccept, onReject, onReset, onUndoAccept, onUndoReject, onAddBullet,
}: Props) {
  const [compareTarget, setCompareTarget] = useState<FieldCompareTarget>("final")
  // Ordered flat list: existing bullets interleaved with locally-inserted ones
  const [flatList, setFlatList] = useState<FlatEntry[]>(() =>
    items.map((item) => ({ kind: "existing" as const, id: item.reco.id, item })),
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [showReasoning, setShowReasoning] = useState(false)
  const [showAltKeywords, setShowAltKeywords] = useState(false)
  const [usedKeywordIds, setUsedKeywordIds] = useState<Set<string>>(new Set())
  const [appliedSuffixes, setAppliedSuffixes] = useState<Map<string, string>>(new Map())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync existing entries when parent updates text (after onTextChange)
  useEffect(() => {
    setFlatList((prev) =>
      prev.map((entry) => {
        if (entry.kind !== "existing") return entry
        const updated = items.find((i) => i.reco.id === entry.id)
        return updated ? { ...entry, item: updated } : entry
      }),
    )
  }, [items])

  const grouped = useMemo(
    () => buildGroupedReasoning(items.map((i) => i.reco)),
    [items],
  )
  const hasPendingItems = items.some((i) => i.reco.status === "pending")

  const allAccepted = items.every((i) => i.reco.status === "accepted")
  const allRejected = items.every((i) => i.reco.status === "rejected")
  const outerCls = allAccepted ? "bg-success-50" : allRejected ? "bg-slate-50" : "bg-brand-50"
  const borderCls = allAccepted ? "border-success-200" : allRejected ? "border-slate-200" : "border-brand-300"

  // ─── Edit helpers ───────────────────────────────────────────────────────────

  function openEdit(id: string, initialText: string) {
    setEditingId(id)
    setEditingText(initialText)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function commitEdit(entry: FlatEntry) {
    const trimmed = editingText.trim()
    if (entry.kind === "existing") {
      if (trimmed) onTextChange(entry.id, trimmed)
    } else {
      if (trimmed) {
        setFlatList((prev) => prev.map((e) => e.id === entry.id ? { ...e, text: trimmed } : e))
        onAddBullet?.(trimmed)
      } else {
        setFlatList((prev) => prev.filter((e) => e.id !== entry.id))
      }
    }
    setEditingId(null)
  }

  /** Insert a brand-new local bullet at flatIdx+1 and immediately open it for editing. */
  function insertLocalAt(afterFlatIdx: number, initialText: string) {
    const newId = `local-${Date.now()}`
    setFlatList((prev) => [
      ...prev.slice(0, afterFlatIdx + 1),
      { kind: "local" as const, id: newId, text: initialText },
      ...prev.slice(afterFlatIdx + 1),
    ])
    // Open the new entry for editing immediately
    setTimeout(() => {
      setEditingId(newId)
      setEditingText(initialText)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }, 0)
  }

  // ─── Key handlers ───────────────────────────────────────────────────────────

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    entry: FlatEntry,
    flatIdx: number,
  ) {
    if (e.key === "Escape") { commitEdit(entry); return }

    // Backspace at empty local bullet → remove and focus previous
    if (e.key === "Backspace" && editingText === "" && entry.kind === "local") {
      e.preventDefault()
      setFlatList((prev) => prev.filter((fe) => fe.id !== entry.id))
      setEditingId(null)
      const prev = flatList[flatIdx - 1]
      if (prev) {
        const prevText = prev.kind === "existing" ? prev.item.reco.recommendedText : prev.text
        setTimeout(() => openEdit(prev.id, prevText), 0)
      }
      return
    }

    if (e.key !== "Enter" || e.shiftKey) return
    e.preventDefault()

    const cursorPos = e.currentTarget.selectionStart ?? editingText.length
    // If cursor is at position 0, just insert a blank bullet below without splitting
    if (cursorPos === 0) {
      setEditingId(null)
      insertLocalAt(flatIdx, "")
      return
    }

    const before = editingText.slice(0, cursorPos).trimEnd()
    const after = editingText.slice(cursorPos).trimStart()

    // Save current entry with text before cursor
    if (entry.kind === "existing") {
      if (before) onTextChange(entry.id, before)
    } else {
      setFlatList((prev) =>
        prev.map((fe) => fe.id === entry.id ? { ...fe, text: before || (fe as { kind: "local"; text: string }).text } : fe),
      )
    }
    setEditingId(null)

    // Insert new bullet after current with text after cursor
    insertLocalAt(flatIdx, after)
  }

  // ─── Keyword helpers ────────────────────────────────────────────────────────

  function targetId() {
    if (editingId) return editingId
    return items.find((i) => i.reco.status === "pending")?.reco.id ?? null
  }

  function handleUseKeyword(kw: AltKeyword) {
    const id = targetId()
    if (!id) return
    const item = items.find((i) => i.reco.id === id)
    if (!item) return
    const cur = editingId === id ? editingText : item.reco.recommendedText
    const newText = kw.replacesWord
      ? cur.replace(new RegExp(kw.replacesWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), kw.keyword)
      : cur + `, ${kw.keyword}`
    if (editingId === id) setEditingText(newText)
    else onTextChange(id, newText)
    if (!kw.replacesWord) setAppliedSuffixes((prev) => new Map(prev).set(kw.id, `, ${kw.keyword}`))
    setUsedKeywordIds((prev) => new Set(prev).add(kw.id))
  }

  function handleRemoveKeyword(kw: AltKeyword) {
    const id = targetId()
    if (!id) return
    const item = items.find((i) => i.reco.id === id)
    if (!item) return
    const suffix = appliedSuffixes.get(kw.id)
    if (suffix) {
      const cur = editingId === id ? editingText : item.reco.recommendedText
      const newText = cur.replace(suffix, "")
      if (editingId === id) setEditingText(newText)
      else onTextChange(id, newText)
      setAppliedSuffixes((prev) => { const m = new Map(prev); m.delete(kw.id); return m })
    }
    setUsedKeywordIds((prev) => { const s = new Set(prev); s.delete(kw.id); return s })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2">
      {hasPendingItems && (
        <div className="flex justify-end">
          <CompareTabs
            value={compareTarget}
            onChange={(t) => { setCompareTarget(t); setEditingId(null) }}
            exclude={hasPimData ? [] : ["pim"]}
          />
        </div>
      )}

      <div className={cn("w-full min-w-0 rounded-lg px-0.5 py-0.5", outerCls)}>
        <div className={cn("rounded-md border bg-white px-3 py-2.5", borderCls,
          editingId && "ring-2 ring-brand-200",
        )}>
          <ul className="space-y-2">
            {flatList.map((entry, flatIdx) => {
              const isEditing = editingId === entry.id

              if (entry.kind === "local") {
                const displayText = isEditing ? editingText : entry.text
                return (
                  <li key={entry.id} className="flex items-start gap-2">
                    <span className="mt-0.5 grid size-5 shrink-0 select-none place-items-center rounded-md bg-brand-50 text-[11px] font-semibold text-primary">
                      {flatIdx + 1}
                    </span>
                    {isEditing ? (
                      <textarea
                        ref={textareaRef}
                        value={editingText}
                        rows={1}
                        placeholder="Type bullet point…"
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, entry, flatIdx)}
                        onBlur={() => commitEdit(entry)}
                        className="flex-1 resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    ) : (
                      <button type="button" onClick={() => openEdit(entry.id, entry.text)}
                        className="flex-1 cursor-text bg-transparent text-left text-sm leading-relaxed text-slate-900">
                        {displayText || <span className="italic text-slate-400">Empty bullet</span>}
                      </button>
                    )}
                  </li>
                )
              }

              // Existing recommendation entry
              const { reco, pimBaseline, pdpBaseline, originalText } = entry.item
              const isFinal = compareTarget === "final"
              const baseline = compareTarget === "pdp" ? pdpBaseline : pimBaseline
              const diff = buildTitleDiff(baseline, reco.recommendedText)
              const isModified = reco.recommendedText !== originalText
              const isEditable = reco.status !== "rejected"

              return (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className={cn(
                    "mt-0.5 grid size-5 shrink-0 select-none place-items-center rounded-md text-[11px] font-semibold",
                    reco.status === "rejected" ? "bg-slate-100 text-slate-300"
                      : reco.status === "accepted" ? "bg-success-50 text-success-600"
                      : "bg-slate-100 text-slate-500",
                  )}>{flatIdx + 1}</span>

                  {isEditing ? (
                    <textarea
                      ref={textareaRef}
                      value={editingText}
                      rows={2}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, entry, flatIdx)}
                      onBlur={() => commitEdit(entry)}
                      aria-label={`Edit ${reco.label}`}
                      className="flex-1 resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-slate-900 focus:outline-none"
                    />
                  ) : isEditable ? (
                    <button type="button" onClick={() => openEdit(reco.id, reco.recommendedText)}
                      className={cn("flex-1 cursor-text bg-transparent text-left text-sm leading-relaxed",
                        reco.status === "rejected" ? "text-slate-400 line-through" : "text-slate-900",
                      )}>
                      {isFinal || reco.status !== "pending"
                        ? reco.recommendedText
                        : diff.map((seg, si) => {
                            if (seg.kind === "kept") return <span key={si}>{seg.text}</span>
                            if (seg.kind === "removed") return <span key={si} className="text-slate-400 line-through">{seg.text}</span>
                            return <span key={si} className="rounded bg-green-50 px-0.5 font-medium text-green-700">{seg.text}</span>
                          })
                      }
                    </button>
                  ) : (
                    <p className="flex-1 text-sm leading-relaxed text-slate-400 line-through">{reco.recommendedText}</p>
                  )}

                  {!hideActions && !isEditing && (
                    <div className="flex shrink-0 items-center gap-1">
                      {reco.status === "pending" && (
                        <>
                          {isModified && (
                            <button type="button" onClick={() => onReset(reco.id)} aria-label="Reset"
                              className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100">
                              <RotateCcw className="size-3" />
                            </button>
                          )}
                          <button type="button" onClick={() => onReject(reco.id)} aria-label={`Reject ${reco.label}`}
                            className="grid size-7 place-items-center rounded-md border border-error-100 bg-error-50 text-error-600 hover:bg-error-100">
                            <X className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => onAccept(reco.id)} aria-label={`Accept ${reco.label}`}
                            className="grid size-7 place-items-center rounded-md border border-success-100 bg-success-50 text-success-600 hover:bg-success-100">
                            <Check className="size-3.5" />
                          </button>
                        </>
                      )}
                      {reco.status !== "pending" && (
                        <button type="button"
                          onClick={() => reco.status === "accepted" ? onUndoAccept(reco.id) : onUndoReject(reco.id)}
                          aria-label={reco.status === "accepted" ? "Undo accept" : "Undo reject"}
                          className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                          <Undo2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {(grouped.length > 0 || altKeywords.length > 0) && (
        <div className="flex flex-col">
          <div className="flex items-center gap-3 py-1.5">
            {grouped.length > 0 && (
              <button type="button" onClick={() => setShowReasoning((v) => !v)}
                className={cn("inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                  showReasoning ? "text-primary" : "text-slate-500 hover:text-slate-900",
                )}>
                {showReasoning ? <ToggleRight className="size-3.5 shrink-0 text-primary" aria-hidden /> : <ToggleLeft className="size-3.5 shrink-0 text-slate-400" aria-hidden />}
                Reasoning
              </button>
            )}
            {altKeywords.length > 0 && (
              <button type="button" onClick={() => setShowAltKeywords((v) => !v)}
                className={cn("inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                  showAltKeywords ? "text-primary" : "text-slate-500 hover:text-slate-900",
                )}>
                {showAltKeywords ? <ToggleRight className="size-3.5 shrink-0 text-primary" aria-hidden /> : <ToggleLeft className="size-3.5 shrink-0 text-slate-400" aria-hidden />}
                Alt Keywords
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{altKeywords.length}</span>
              </button>
            )}
          </div>
          {showReasoning && grouped.length > 0 && <div className="pb-2"><GroupedReasoningPanel grouped={grouped} /></div>}
          {showAltKeywords && altKeywords.length > 0 && (
            <div className="pb-2">
              <AltKeywordsPanel keywords={altKeywords} usedIds={usedKeywordIds} onUse={handleUseKeyword} onRemove={handleRemoveKeyword} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
