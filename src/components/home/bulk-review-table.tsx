"use client"

import { useState } from "react"
import { Check, Minus } from "lucide-react"
import { EditableCell, EditableBulletCell } from "./bulk-review-editable-cell"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { ContentState, Sku } from "./types"

// ─── Cell helpers ─────────────────────────────────────────────────────────────

function OldCell({ text }: { text: string }) {
  return <p className="line-through text-sm leading-relaxed text-slate-400">{text || "—"}</p>
}

function NewCell({ text }: { text: string }) {
  return <p className="text-sm leading-relaxed font-medium text-slate-800">{text || "—"}</p>
}

function BulletList({ items, strikethrough }: { items: string[]; strikethrough?: boolean }) {
  if (items.length === 0) return <span className="text-sm text-slate-400">—</span>
  return (
    <ul className="space-y-1.5">
      {items.map((b, i) => (
        <li
          key={i}
          className={`flex gap-1 text-sm leading-snug ${strikethrough ? "line-through text-slate-400" : "text-slate-700"}`}
        >
          <span className="shrink-0">•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function HighlightsList({ content }: { content: ContentState[string] }) {
  const summaries =
    content.titleRecommendation?.reasoning.flatMap((cat) => cat.reasons.map((r) => r.summary)) ?? []
  if (summaries.length === 0)
    return <span className="text-sm text-slate-400">No highlights</span>
  return <p className="text-sm leading-relaxed text-slate-800">{summaries[0]}</p>
}

// ─── Checkbox primitive ───────────────────────────────────────────────────────

export function RowCheckbox({
  checked,
  indeterminate,
  onToggle,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        checked || indeterminate
          ? "border-brand-500 bg-brand-500"
          : "border-slate-300 bg-white hover:border-brand-400"
      }`}
    >
      {indeterminate && !checked && <Minus className="size-2.5 stroke-[2.5] text-white" />}
      {checked && <Check className="size-2.5 stroke-[2.5] text-white" />}
    </button>
  )
}

// ─── Header cell helpers ──────────────────────────────────────────────────────

// All header cells are individually sticky top-0; frozen corner also gets left-0.
// z-20 keeps row 1 above row 2.
const TH_BASE =
  "sticky top-0 z-20 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 text-left whitespace-nowrap"
// top-[33px] offsets below the first header row; z-10 keeps it below row 1.
const SUB_BASE =
  "sticky top-[33px] z-10 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-400 text-left whitespace-nowrap"

function FieldColHead({
  label,
  checked,
  onToggle,
  className = "",
  colSpan,
}: {
  label: string
  checked: boolean
  onToggle: () => void
  className?: string
  colSpan?: number
}) {
  return (
    <th colSpan={colSpan} className={`${TH_BASE} ${className}`}>
      <div className="flex items-center gap-2">
        <RowCheckbox
          checked={checked}
          onToggle={onToggle}
          label={`${checked ? "Deselect" : "Select"} ${label}`}
        />
        {label}
      </div>
    </th>
  )
}

function SubHead({ label, className = "" }: { label: string; className?: string }) {
  return <th className={`${SUB_BASE} ${className}`}>{label}</th>
}

// ─── Main table ───────────────────────────────────────────────────────────────

interface BulkReviewTableProps {
  rows: Array<{ sku: Sku; content: ContentState[string] }>
  selectedFields: BulkField[]
  localSkuIds: Set<string>
  allChecked: boolean
  someChecked: boolean
  onToggleField: (field: BulkField) => void
  onToggleSku: (id: string) => void
  onToggleAllSkus: () => void
}

export function BulkReviewTable({
  rows,
  selectedFields,
  localSkuIds,
  allChecked,
  someChecked,
  onToggleField,
  onToggleSku,
  onToggleAllSkus,
}: BulkReviewTableProps) {
  // Tracks in-cell edits keyed by `${skuId}-${field}`. Falls back to original content.
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [bulletEdits, setBulletEdits] = useState<Record<string, string[]>>({})
  // Which cell is currently open for editing — drives <td> ring/bg styles
  const [activeCell, setActiveCell] = useState<string | null>(null)

  function setEdit(skuId: string, field: string, value: string) {
    setEdits((prev) => ({ ...prev, [`${skuId}-${field}`]: value }))
  }

  function setBulletEdit(skuId: string, value: string[]) {
    setBulletEdits((prev) => ({ ...prev, [skuId]: value }))
  }

  // Returns className for an editable <td> based on its hover/active state
  function cellCls(key: string, border: string) {
    const isActive = activeCell === key
    return [
      "px-3 py-3 transition-colors cursor-text select-none",
      border,
      isActive ? "ring-2 ring-inset ring-brand-400" : "hover:bg-slate-50",
    ].join(" ")
  }

  return (
    <table className="border-collapse text-left">
      <thead>
        {/* Group row */}
        <tr className="border-b border-slate-200">
          <th className="sticky top-0 left-0 z-30 bg-slate-50 border-r border-slate-200 w-48 min-w-48 px-3 py-2 shadow-[1px_0_0_0_#e2e8f0]">
            <div className="flex items-center gap-2">
              <RowCheckbox
                checked={allChecked}
                indeterminate={someChecked}
                onToggle={onToggleAllSkus}
                label={allChecked ? "Deselect all SKUs" : "Select all SKUs"}
              />
              <span className="text-[11px] font-semibold text-slate-600">SKU</span>
            </div>
          </th>
          <FieldColHead
            label="Title"
            checked={selectedFields.includes("title")}
            onToggle={() => onToggleField("title")}
            className="border-r border-slate-200 w-64 min-w-64"
          />
          <FieldColHead
            label="Item Highlights"
            checked={selectedFields.includes("images")}
            onToggle={() => onToggleField("images")}
            className="border-r border-slate-200 w-[300px] min-w-[300px]"
          />
          <FieldColHead
            label="Bullet Points"
            checked={selectedFields.includes("bullets")}
            onToggle={() => onToggleField("bullets")}
            className="border-r border-slate-200 w-[500px] min-w-[500px]"
            colSpan={2}
          />
          <FieldColHead
            label="Description"
            checked={selectedFields.includes("description")}
            onToggle={() => onToggleField("description")}
            className="w-[500px] min-w-[500px]"
            colSpan={2}
          />
        </tr>
        {/* Sub-label row */}
        <tr className="border-b border-slate-200 bg-slate-50">
          <SubHead label="" className="left-0 z-30 border-r border-slate-200 shadow-[1px_0_0_0_#e2e8f0]" />
          <SubHead label="" className="border-r border-slate-200" />
          <SubHead label="" className="border-r border-slate-200" />
          <SubHead label="Current" className="border-r border-slate-100 text-slate-400" />
          <SubHead label="Recommended" className="border-r border-slate-200 text-brand-500" />
          <SubHead label="Current" className="border-r border-slate-100 text-slate-400" />
          <SubHead label="Recommended" className="text-brand-500" />
        </tr>
      </thead>

      <tbody>
        {rows.map(({ sku, content }) => {
          const isChecked = localSkuIds.has(sku.id)
          return (
            <tr
              key={sku.id}
              className="group/row border-b border-slate-100 align-top hover:bg-slate-50/60"
            >
              {/* SKU — sticky + row checkbox */}
              <td className="sticky left-0 z-10 bg-white group-hover/row:bg-slate-50 px-3 py-3 border-r border-slate-200 w-48 min-w-48 shadow-[1px_0_0_0_#e2e8f0]">
                <div className="flex items-start gap-2">
                  <RowCheckbox
                    checked={isChecked}
                    onToggle={() => onToggleSku(sku.id)}
                    label={`${isChecked ? "Deselect" : "Select"} ${sku.brand}`}
                  />
                  <div className="min-w-0">
                    {sku.thumbnailUrl && (
                      <img
                        src={sku.thumbnailUrl}
                        alt=""
                        className="mb-1 size-9 rounded-lg border border-slate-100 object-contain"
                      />
                    )}
                    <p className="font-mono text-xs text-slate-400">{sku.asin}</p>
                    <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">
                      {sku.brand}
                    </p>
                  </div>
                </div>
              </td>

              {/* Title — stacked old / new (new row is editable) */}
              <td
                className={`${cellCls(`${sku.id}-title`, "border-r border-slate-200")} w-64 min-w-64`}
                onClick={() => setActiveCell(`${sku.id}-title`)}
              >
                <OldCell text={content.title} />
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <EditableCell
                    editing={activeCell === `${sku.id}-title`}
                    value={edits[`${sku.id}-title`] ?? content.titleRecommendation?.recommendedText ?? content.title}
                    onChange={(v) => setEdit(sku.id, "title", v)}
                    onBlur={() => setActiveCell(null)}
                  />
                </div>
              </td>

              {/* Item Highlights (editable) */}
              <td
                className={`${cellCls(`${sku.id}-highlights`, "border-r border-slate-200")} w-[300px] min-w-[300px]`}
                onClick={() => setActiveCell(`${sku.id}-highlights`)}
              >
                <EditableCell
                  editing={activeCell === `${sku.id}-highlights`}
                  value={edits[`${sku.id}-highlights`] ?? (content.titleRecommendation?.reasoning.flatMap((c) => c.reasons.map((r) => r.summary))[0] ?? "")}
                  onChange={(v) => setEdit(sku.id, "highlights", v)}
                  onBlur={() => setActiveCell(null)}
                  placeholder="No highlights"
                />
              </td>

              {/* Bullets — current (read-only) */}
              <td className="px-3 py-3 border-r border-slate-100 w-[500px] min-w-[500px]">
                <BulletList items={content.bullets} strikethrough />
              </td>

              {/* Bullets — recommended (editable) */}
              <td
                className={`${cellCls(`${sku.id}-bullets`, "border-r border-slate-200")} w-[500px] min-w-[500px]`}
                onClick={() => setActiveCell(`${sku.id}-bullets`)}
              >
                <EditableBulletCell
                  editing={activeCell === `${sku.id}-bullets`}
                  items={bulletEdits[sku.id] ?? content.bulletRecommendations.map((r) => r.recommendedText)}
                  onChange={(v) => setBulletEdit(sku.id, v)}
                  onBlur={() => setActiveCell(null)}
                />
              </td>

              {/* Description — current (read-only) */}
              <td className="px-3 py-3 border-r border-slate-100 w-[500px] min-w-[500px]">
                <OldCell text={content.description} />
              </td>

              {/* Description — recommended (editable) */}
              <td
                className={`${cellCls(`${sku.id}-description`, "")} w-[500px] min-w-[500px]`}
                onClick={() => setActiveCell(`${sku.id}-description`)}
              >
                <EditableCell
                  editing={activeCell === `${sku.id}-description`}
                  value={edits[`${sku.id}-description`] ?? content.descriptionRecommendation?.recommendedText ?? content.description}
                  onChange={(v) => setEdit(sku.id, "description", v)}
                  onBlur={() => setActiveCell(null)}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
