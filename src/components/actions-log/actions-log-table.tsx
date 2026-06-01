"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { ActionLogDetailPanel } from "./action-log-detail-drawer"
import { PdpStatusBadge, PimStatusBadge, RetailerStatusBadge } from "./status-badge"
import { effectiveTableStatuses } from "./resolve-panel-view"
import type { ActionLogEntry } from "./types"
import { cn } from "@/lib/utils"

function SkuCell({ entry }: { entry: ActionLogEntry }) {
  const [copied, setCopied] = useState(false)

  async function copySkuId() {
    try {
      await navigator.clipboard.writeText(entry.skuId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable in some contexts */
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      {entry.thumbnailUrl ? (
        <img
          src={entry.thumbnailUrl}
          alt=""
          className="size-10 shrink-0 rounded-md border border-slate-200 object-cover"
        />
      ) : (
        <div className="size-10 shrink-0 rounded-md border border-slate-200 bg-slate-100" />
      )}
      <div className="min-w-0">
        {entry.name ? (
          <p className="line-clamp-1 text-sm font-medium text-slate-900">{entry.name}</p>
        ) : null}
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-slate-600">{entry.skuId}</span>
          <button
            type="button"
            aria-label={`Copy SKU ID ${entry.skuId}`}
            onClick={(e) => {
              e.stopPropagation()
              void copySkuId()
            }}
            className="grid size-5 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {copied ? (
              <Check className="size-3 text-success-600" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const COLUMNS = [
  "SKU",
  "PIM Status",
  "Retailer Status",
  "PDP Status",
  "Remarks",
  "Actioned on",
  "Updated by",
] as const

interface ActionsLogTableProps {
  entries: ActionLogEntry[]
  selectedEntry: ActionLogEntry | null
  onRowClick: (entry: ActionLogEntry) => void
  onClosePanel: () => void
}

export function ActionsLogTable({
  entries,
  selectedEntry,
  onRowClick,
  onClosePanel,
}: ActionsLogTableProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
      <div className="h-full overflow-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-violet-50">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="border-b border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                No actions match your filters.
              </td>
            </tr>
          ) : (
            entries.map((entry) => {
              const isSelected = selectedEntry?.id === entry.id
              const effective = effectiveTableStatuses(entry)
              return (
              <tr
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => onRowClick(entry)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onRowClick(entry)
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-slate-200 hover:bg-slate-50/50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset",
                  isSelected && "bg-brand-50/60",
                )}
              >
                <td className="max-w-[320px] px-4 py-3">
                  <SkuCell entry={entry} />
                </td>
                <td className="px-4 py-3">
                  <PimStatusBadge status={effective.pim} />
                </td>
                <td className="px-4 py-3">
                  <RetailerStatusBadge status={effective.retailer} />
                </td>
                <td className="px-4 py-3">
                  <PdpStatusBadge status={effective.pdp} />
                </td>
                <td className="max-w-[220px] px-4 py-3 text-sm leading-snug text-slate-600">
                  {entry.syndicationRemarks ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                  {entry.actionedOn}
                </td>
                <td className="px-4 py-3 text-slate-700">{entry.updatedBy}</td>
              </tr>
              )
            })
          )}
        </tbody>
      </table>
      </div>

      {selectedEntry ? (
        <ActionLogDetailPanel entry={selectedEntry} onClose={onClosePanel} />
      ) : null}
    </div>
  )
}
