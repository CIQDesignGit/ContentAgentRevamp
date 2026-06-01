"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  FileDown,
  Funnel,
  History,
  Search,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ACTION_LOG_ENTRIES, DEFAULT_DATE_RANGE } from "./data"
import { ActionsLogTable } from "./actions-log-table"
import { StatusTabs } from "./status-tabs"
import type { ActionLogEntry, StatusTabKey } from "./types"

function countByStatus(entries: ActionLogEntry[]) {
  const counts = {
    all: entries.length,
    pending: 0,
    failed: 0,
    success: 0,
    cancelled: 0,
  }
  for (const entry of entries) {
    counts[entry.status] += 1
  }
  return counts
}

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

  const tabCounts = useMemo(() => countByStatus(ACTION_LOG_ENTRIES), [])

  const filteredEntries = useMemo(() => {
    return ACTION_LOG_ENTRIES.filter((entry) => {
      if (activeTab !== "all" && entry.status !== activeTab) return false
      return matchesSearch(entry, search)
    })
  }, [activeTab, search])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <History className="size-5" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Actions Log</h1>
        </div>
        <button
          type="button"
          aria-label="Close actions log"
          onClick={() => router.push("/")}
          className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU name or SKU ID"
            className="h-9 pl-9"
          />
        </div>
        <button
          type="button"
          aria-label="Filter"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Funnel className="size-4" />
        </button>
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

      <StatusTabs active={activeTab} counts={tabCounts} onChange={setActiveTab} />

      <ActionsLogTable
        entries={filteredEntries}
        selectedEntry={selectedEntry}
        onRowClick={setSelectedEntry}
        onClosePanel={() => setSelectedEntry(null)}
      />
    </div>
  )
}
