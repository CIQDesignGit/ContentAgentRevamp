"use client"

import { useEffect, useState } from "react"
import { Check, Minus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { ContentState, Sku } from "./types"
import { MOCK_SKUS } from "./data"

// ─── Tiny cell helpers ────────────────────────────────────────────────────────

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
        <li key={i} className={`flex gap-1 text-sm leading-snug ${strikethrough ? "line-through text-slate-400" : "text-slate-700"}`}>
          <span className="shrink-0">•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

function HighlightsList({ content }: { content: ContentState[string] }) {
  const points = content.titleRecommendation?.reasoning.flatMap((cat) =>
    cat.reasons.map((r) => ({ label: cat.label, summary: r.summary })),
  ) ?? []
  if (points.length === 0) return <span className="text-sm text-slate-400">No highlights</span>
  return (
    <ul className="space-y-1.5">
      {points.map((p, i) => (
        <li key={i} className="text-sm leading-relaxed font-medium text-slate-800">
          <span className="font-semibold text-slate-400">{p.label}: </span>
          {p.summary}
        </li>
      ))}
    </ul>
  )
}

// ─── Checkbox primitives ──────────────────────────────────────────────────────

function RowCheckbox({ checked, indeterminate, onToggle, label }: {
  checked: boolean
  indeterminate?: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onToggle() }}
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

// ─── Column header with field checkbox ───────────────────────────────────────

// All header cells are individually sticky top-0 so the frozen corner cell
// can also be sticky left-0 — if <thead> owns the sticky, children can't add left-0.
// z-20 ensures row 1 renders above row 2 when both are frozen
const TH_BASE = "sticky top-0 z-20 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 text-left whitespace-nowrap"
// top-[33px] offsets below the first header row; z-10 keeps it below row 1
const SUB_BASE = "sticky top-[33px] z-10 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-400 text-left whitespace-nowrap"

function FieldColHead({ label, checked, onToggle, className = "", colSpan }: {
  label: string; checked: boolean; onToggle: () => void; className?: string; colSpan?: number
}) {
  return (
    <th colSpan={colSpan} className={`${TH_BASE} ${className}`}>
      <div className="flex items-center gap-2">
        <RowCheckbox checked={checked} onToggle={onToggle} label={`${checked ? "Deselect" : "Select"} ${label}`} />
        {label}
      </div>
    </th>
  )
}

function ColHead({ label, className = "" }: { label: string; className?: string }) {
  return (
    <th className={`${TH_BASE} ${className}`}>{label}</th>
  )
}

function SubHead({ label, className = "" }: { label: string; className?: string }) {
  return (
    <th className={`${SUB_BASE} ${className}`}>{label}</th>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface BulkReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSkuIds: Set<string>
  contentState: ContentState
  skus: Sku[]
  /** Receives chosen fields AND the SKU IDs still checked in the review table */
  onBulkApprove: (fields: BulkField[], skuIds: string[]) => void
}

const ALL_FIELDS: BulkField[] = ["title", "images", "bullets", "description"]

export function BulkReviewDialog({
  open,
  onOpenChange,
  selectedSkuIds,
  contentState,
  skus,
  onBulkApprove,
}: BulkReviewDialogProps) {
  const [selectedFields, setSelectedFields] = useState<BulkField[]>(ALL_FIELDS)
  const [localSkuIds, setLocalSkuIds] = useState<Set<string>>(new Set(selectedSkuIds))

  // Reset to fully-selected state every time the dialog opens
  useEffect(() => {
    if (open) {
      setLocalSkuIds(new Set(selectedSkuIds))
      setSelectedFields(ALL_FIELDS)
    }
  }, [open])

  const allIds = Array.from(selectedSkuIds)
  const allChecked = allIds.length > 0 && allIds.every((id) => localSkuIds.has(id))
  const someChecked = !allChecked && allIds.some((id) => localSkuIds.has(id))

  const rows = allIds.map((id) => ({
    sku: skus.find((s) => s.id === id) ?? MOCK_SKUS.find((s) => s.id === id)!,
    content: contentState[id],
  }))

  function toggleField(field: BulkField) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  function toggleSku(id: string) {
    setLocalSkuIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllSkus() {
    setLocalSkuIds(allChecked ? new Set() : new Set(allIds))
  }

  const checkedSkuCount = allIds.filter((id) => localSkuIds.has(id)).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[calc(100vw-80px)]! max-w-[calc(100vw-80px)]! flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-sm font-semibold text-slate-800">
            Review Changes —{" "}
            <span className="text-brand-600">{rows.length} SKU{rows.length !== 1 ? "s" : ""}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable table */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="border-collapse text-left">
            <thead>
              {/* Group row */}
              <tr className="border-b border-slate-200">
                {/* SKU corner cell — sticky top-0 AND left-0 freezes it in the corner */}
                <th className="sticky top-0 left-0 z-30 bg-slate-50 border-r border-slate-200 w-48 min-w-48 px-3 py-2 shadow-[1px_0_0_0_#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <RowCheckbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onToggle={toggleAllSkus}
                      label={allChecked ? "Deselect all SKUs" : "Select all SKUs"}
                    />
                    <span className="text-[11px] font-semibold text-slate-600">SKU</span>
                  </div>
                </th>
                <FieldColHead label="Title" checked={selectedFields.includes("title")} onToggle={() => toggleField("title")} className="border-r border-slate-200 w-64 min-w-64" />
                <FieldColHead label="Item Highlights" checked={selectedFields.includes("images")} onToggle={() => toggleField("images")} className="border-r border-slate-200 w-[300px] min-w-[300px]" />
                <FieldColHead label="Bullet Points" checked={selectedFields.includes("bullets")} onToggle={() => toggleField("bullets")} className="border-r border-slate-200 w-[500px] min-w-[500px]" colSpan={2} />
                <FieldColHead label="Description" checked={selectedFields.includes("description")} onToggle={() => toggleField("description")} className="w-[500px] min-w-[500px]" colSpan={2} />
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
                  <tr key={sku.id} className="group/row border-b border-slate-100 align-top hover:bg-slate-50/60">
                    {/* SKU — sticky + row checkbox */}
                    <td className="sticky left-0 z-10 bg-white group-hover/row:bg-slate-50 px-3 py-3 border-r border-slate-200 w-48 min-w-48 shadow-[1px_0_0_0_#e2e8f0]">
                      <div className="flex items-start gap-2">
                        <RowCheckbox
                          checked={isChecked}
                          onToggle={() => toggleSku(sku.id)}
                          label={`${isChecked ? "Deselect" : "Select"} ${sku.brand}`}
                        />
                        <div className="min-w-0">
                          {sku.thumbnailUrl && (
                            <img src={sku.thumbnailUrl} alt="" className="mb-1 size-9 rounded-lg border border-slate-100 object-contain" />
                          )}
                          <p className="font-mono text-xs text-slate-400">{sku.asin}</p>
                          <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">{sku.brand}</p>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-3 border-r border-slate-200 w-64 min-w-64">
                      <OldCell text={content.title} />
                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <NewCell text={content.titleRecommendation?.recommendedText ?? content.title} />
                      </div>
                    </td>

                    {/* Item Highlights */}
                    <td className="px-3 py-3 border-r border-slate-200 w-[300px] min-w-[300px]">
                      <HighlightsList content={content} />
                    </td>

                    {/* Bullets — current */}
                    <td className="px-3 py-3 border-r border-slate-100 w-[500px] min-w-[500px]">
                      <BulletList items={content.bullets} strikethrough />
                    </td>

                    {/* Bullets — recommended */}
                    <td className="px-3 py-3 border-r border-slate-200 w-[500px] min-w-[500px]">
                      <BulletList items={content.bulletRecommendations.map((r) => r.recommendedText)} />
                    </td>

                    {/* Description — current */}
                    <td className="px-3 py-3 border-r border-slate-100 w-[500px] min-w-[500px]">
                      <OldCell text={content.description} />
                    </td>

                    {/* Description — recommended */}
                    <td className="px-3 py-3 w-[500px] min-w-[500px]">
                      <NewCell text={content.descriptionRecommendation?.recommendedText ?? content.description} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-500">
            {checkedSkuCount} of {rows.length} SKU{rows.length !== 1 ? "s" : ""} selected
            {selectedFields.length < ALL_FIELDS.length && (
              <> · {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""}</>
            )}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={checkedSkuCount === 0 || selectedFields.length === 0}
              className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
              onClick={() => {
                onBulkApprove(selectedFields, allIds.filter((id) => localSkuIds.has(id)))
                onOpenChange(false)
              }}
            >
              Bulk Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
