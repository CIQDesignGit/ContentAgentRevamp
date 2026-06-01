"use client"

import { useMemo } from "react"
import { Calendar, X } from "lucide-react"
import { ActionLogTimeline } from "./action-log-timeline"
import { AttemptedChangesSection } from "./attempted-changes-section"
import { ChangeRecordSection } from "./change-record-section"
import { PanelLoadingState } from "./panel-loading-state"
import { RejectedButLiveBanner } from "./rejected-but-live-banner"
import { resolvePanelView } from "./resolve-panel-view"
import { PanelScenarioBadge } from "./status-badge"
import { TimelineRemarks } from "./timeline-remarks"
import type { ActionLogEntry } from "./types"

interface ActionLogDetailPanelProps {
  entry: ActionLogEntry
  onClose: () => void
}

function MetaDot() {
  return <span aria-hidden className="size-1 shrink-0 rounded-full bg-slate-300" />
}

export function ActionLogDetailPanel({ entry, onClose }: ActionLogDetailPanelProps) {
  const panel = useMemo(() => resolvePanelView(entry), [entry])
  const isLoading = panel.scenario === "loading"

  return (
    <aside
      className="fixed inset-y-0 right-0 z-30 flex h-screen w-[650px] flex-col border-l border-slate-200 bg-slate-50 shadow-md"
      aria-label="Action log details"
    >
      <div className="z-10 flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="min-w-0 flex-1 space-y-2 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
              {entry.name ?? entry.skuId}
            </h2>
            <PanelScenarioBadge scenario={panel.scenario} label={panel.scenarioLabel} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono">{entry.skuId}</span>
            <MetaDot />
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5 shrink-0" />
              {entry.actionedShort.replace(/^actioned\s/i, "")}
            </span>
            <MetaDot />
            <span className="truncate">{entry.updatedBy}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close details panel"
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!isLoading ? (
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <ActionLogTimeline steps={panel.timeline} />
            <TimelineRemarks entry={entry} remarks={panel.remarks} scenario={panel.scenario} />
          </div>
        ) : null}

        <div className="space-y-4 px-4 py-4">
          {isLoading ? (
            <PanelLoadingState />
          ) : (
            <>
              {panel.showRejectedButLiveBanner ? <RejectedButLiveBanner /> : null}

              {panel.bodyMode === "attempted_not_applied" ? (
                <AttemptedChangesSection fields={panel.attemptedFields} />
              ) : panel.fieldViews.length > 0 ? (
                <ChangeRecordSection fieldViews={panel.fieldViews} />
              ) : (
                <p className="px-1 text-sm text-slate-500">No change record for this action.</p>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
