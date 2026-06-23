"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AppHeader } from "./app-header"
import { BulkReviewTable } from "./bulk-review-table"
import type { BulkField } from "./bulk-publish-confirm-dialog"
import type { ContentState, Sku } from "./types"
import { MOCK_SKUS } from "./data"

// ─── sessionStorage key contract (shared with home page) ─────────────────────
export const BRD_INPUT_KEY = "brd-input"
export const BRD_OUTPUT_KEY = "brd-output"

export type BrdInput = {
  selectedSkuIds: string[]
  contentState: ContentState
}

export type BrdOutput = {
  fields: BulkField[]
  skuIds: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

const ALL_FIELDS: BulkField[] = ["title", "images", "bullets", "description"]

export function BulkReviewView() {
  const router = useRouter()

  // Populated from sessionStorage once the component mounts
  const [allIds, setAllIds] = useState<string[]>([])
  const [skus, setSkus] = useState<Sku[]>([])
  const [contentState, setContentState] = useState<ContentState>({})

  // Selection state — mirrors what was in the dialog
  const [selectedFields, setSelectedFields] = useState<BulkField[]>(ALL_FIELDS)
  const [localSkuIds, setLocalSkuIds] = useState<Set<string>>(new Set())

  // Read the input payload that the home page stored before navigating here
  useEffect(() => {
    const raw = sessionStorage.getItem(BRD_INPUT_KEY)
    if (!raw) return
    sessionStorage.removeItem(BRD_INPUT_KEY)

    const { selectedSkuIds, contentState: cs } = JSON.parse(raw) as BrdInput
    const resolvedSkus = selectedSkuIds
      .map((id) => MOCK_SKUS.find((s) => s.id === id))
      .filter(Boolean) as Sku[]

    setAllIds(selectedSkuIds)
    setSkus(resolvedSkus)
    setContentState(cs)
    setLocalSkuIds(new Set(selectedSkuIds))
    setSelectedFields(ALL_FIELDS)
  }, [])

  const rows = allIds
    .map((id) => ({ sku: skus.find((s) => s.id === id)!, content: contentState[id] }))
    .filter((r) => r.sku && r.content)

  const allChecked = allIds.length > 0 && allIds.every((id) => localSkuIds.has(id))
  const someChecked = !allChecked && allIds.some((id) => localSkuIds.has(id))
  const checkedSkuCount = allIds.filter((id) => localSkuIds.has(id)).length

  function toggleField(field: BulkField) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  function toggleSku(id: string) {
    setLocalSkuIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAllSkus() {
    setLocalSkuIds(allChecked ? new Set() : new Set(allIds))
  }

  function handleApprove() {
    const output: BrdOutput = {
      fields: selectedFields,
      skuIds: allIds.filter((id) => localSkuIds.has(id)),
    }
    sessionStorage.setItem(BRD_OUTPUT_KEY, JSON.stringify(output))
    router.push("/")
  }

  function handleCancel() {
    router.push("/")
  }

  const skuLabel = `${rows.length} SKU${rows.length !== 1 ? "s" : ""}`

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Page header — matches AppHeader design ───────────────────────── */}
      <AppHeader backHref="/" title={`Review Changes — ${skuLabel}`} />

      {/* ── Scrollable table area ────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto">
        {rows.length > 0 ? (
          <BulkReviewTable
            rows={rows}
            selectedFields={selectedFields}
            localSkuIds={localSkuIds}
            allChecked={allChecked}
            someChecked={someChecked}
            onToggleField={toggleField}
            onToggleSku={toggleSku}
            onToggleAllSkus={toggleAllSkus}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No SKUs selected — go back and select SKUs from the sidebar.
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
        <p className="text-xs text-slate-500">
          {checkedSkuCount} of {rows.length} SKU{rows.length !== 1 ? "s" : ""} selected
          {selectedFields.length < ALL_FIELDS.length && (
            <> · {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""}</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={checkedSkuCount === 0 || selectedFields.length === 0}
            className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            onClick={handleApprove}
          >
            Bulk Approve
          </Button>
        </div>
      </footer>
    </div>
  )
}
