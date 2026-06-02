"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  FileDown,
} from "lucide-react"
import { ACTION_LOG_ENTRIES, DEFAULT_DATE_RANGE } from "./data"
import { ActionsLogTable } from "./actions-log-table"
import { ActionLogDetailPanel } from "./action-log-detail-drawer"
import { countByFilterTab, entryFilterTab } from "./resolve-panel-view"
import { StatusTabs } from "./status-tabs"
import type { ActionLogEntry, StatusTabKey } from "./types"

function matchesSearch(entry: ActionLogEntry, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    entry.skuId.toLowerCase().includes(q) ||
    (entry.name?.toLowerCase().includes(q) ?? false)
  )
}

export function ActionsLogView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<StatusTabKey>("all")
  const [selectedEntry, setSelectedEntry] = useState<ActionLogEntry | null>(null)

  const tabCounts = useMemo(() => countByFilterTab(ACTION_LOG_ENTRIES), [])

  const filteredEntries = useMemo(() => {
    return ACTION_LOG_ENTRIES.filter((entry) => {
      if (activeTab !== "all" && entryFilterTab(entry) !== activeTab) return false
      return matchesSearch(entry, search)
    })
  }, [activeTab, search])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.push("/")}
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="truncate text-lg font-semibold text-slate-900">Actions Log</h1>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50"
          >
            <Calendar className="size-4 text-slate-500" />
            <span className="whitespace-nowrap">{DEFAULT_DATE_RANGE}</span>
          </button>
          <button
            type="button"
            aria-label="Export log"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <FileDown className="size-4" />
          </button>
        </div>
      </header>

      <StatusTabs
        active={activeTab}
        counts={tabCounts}
        search={search}
        onSearchChange={setSearch}
        onChange={setActiveTab}
      />

      <ActionsLogTable
        entries={filteredEntries}
        selectedEntry={selectedEntry}
        onRowClick={setSelectedEntry}
      />

      {selectedEntry ? (
        <ActionLogDetailPanel
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      ) : null}
    </div>
  )
}
