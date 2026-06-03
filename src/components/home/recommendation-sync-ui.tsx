"use client"

import { Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  COLOR_INTENT_CLASSES,
  statusColorIntent,
  statusLabel,
} from "@/components/actions-log/status-styles"
import type { PdpStatus, PimStatus, RetailerStatus } from "@/components/actions-log/types"
import type { PublishBatch, SyncFootprint } from "./types"
import { getFieldPublishedAt } from "@/lib/publish-batch"
import { isFieldSyncing } from "@/lib/sync-footprint"

export function formatPublishedTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function StagedForPublishChip() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-primary">
      Staged for publish
    </span>
  )
}

export function UpdateQueuedChip() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
      Update queued
    </span>
  )
}

function MicroStatusChip({
  status,
  label,
}: {
  status: PimStatus | RetailerStatus | PdpStatus
  label?: string
}) {
  const intent = statusColorIntent(status)
  const colors = COLOR_INTENT_CLASSES[intent]
  const Icon = status === "pending" ? Clock : Check
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        colors.chip,
      )}
    >
      <Icon className={cn("size-3 shrink-0", colors.icon)} aria-hidden />
      {label ?? statusLabel(status)}
    </span>
  )
}

function SyncStatusCaption({
  syncFootprint,
  batch,
  publishedAt,
}: {
  syncFootprint: SyncFootprint
  batch?: PublishBatch
  publishedAt?: string
}) {
  const pushedAt = publishedAt ?? getFieldPublishedAt(batch)
  if (syncFootprint === "none") {
    return (
      <p className="text-xs text-slate-500">
        Staged for publish
        <span aria-hidden="true"> · </span>
        Not yet on PDP
      </p>
    )
  }

  if (syncFootprint === "syncing" && batch) {
    if (batch.pim === "pending") {
      return <p className="text-xs text-slate-500">Updating PIM catalog…</p>
    }
    if (batch.retailer === "pending") {
      return <p className="text-xs text-slate-500">Waiting for retailer acceptance…</p>
    }
    if (batch.pdp === "pending") {
      return (
        <p className="text-xs text-slate-500">
          PDP verification usually takes a few hours
        </p>
      )
    }
    return <p className="text-xs text-slate-500">Publishing in progress…</p>
  }

  if (syncFootprint === "synced") {
    return (
      <p className="text-xs text-slate-500">
        {pushedAt ? (
          <>
            Published at {formatPublishedTimestamp(pushedAt)}
            <span aria-hidden="true"> · </span>
          </>
        ) : null}
        Changes reflected on PIM and retailer PDP
      </p>
    )
  }

  if (syncFootprint === "queued") {
    return <p className="text-xs text-slate-500">Queued — will publish after current sync</p>
  }

  return null
}

export function FieldSyncStatusRow({
  syncFootprint,
  hasUnpublishedEdits,
  batch,
  fieldKey,
}: {
  syncFootprint: SyncFootprint
  hasUnpublishedEdits?: boolean
  batch?: PublishBatch
  fieldKey?: string
}) {
  const pushedAt = getFieldPublishedAt(batch)

  if (hasUnpublishedEdits && (isFieldSyncing(syncFootprint) || syncFootprint === "queued")) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <UpdateQueuedChip />
        </div>
        <SyncStatusCaption syncFootprint="queued" />
      </div>
    )
  }

  if (syncFootprint === "none" && !hasUnpublishedEdits) {
    return (
      <div className="flex flex-col items-end gap-1">
        <SyncStatusCaption syncFootprint="none" />
      </div>
    )
  }

  if (syncFootprint === "queued") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <UpdateQueuedChip />
        </div>
        <SyncStatusCaption syncFootprint="queued" />
      </div>
    )
  }

  if (syncFootprint === "syncing" && batch && fieldKey && batch.fieldKeys.includes(fieldKey)) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {batch.pim === "pending" ? (
            <MicroStatusChip status="pending" label="PIM updating" />
          ) : batch.pim === "accepted" ? (
            <MicroStatusChip status="accepted" label="PIM updated" />
          ) : null}
          {batch.retailer === "pending" ? (
            <MicroStatusChip status="pending" label="Submitted to retailer" />
          ) : batch.retailer === "accepted" ? (
            <MicroStatusChip status="accepted" label="At retailer" />
          ) : null}
          {batch.pdp === "pending" ? (
            <MicroStatusChip status="pending" label="PDP verifying" />
          ) : null}
        </div>
        <SyncStatusCaption syncFootprint={syncFootprint} batch={batch} />
      </div>
    )
  }

  if (syncFootprint === "synced") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <MicroStatusChip status="accepted" label="PIM updated" />
          <MicroStatusChip status="accepted" label="PDP updated" />
        </div>
        <SyncStatusCaption syncFootprint="synced" batch={batch} publishedAt={pushedAt} />
      </div>
    )
  }

  if (syncFootprint === "syncing") {
    return (
      <div className="flex flex-col items-end gap-1">
        <p className="text-xs text-slate-500">Publishing in progress…</p>
      </div>
    )
  }

  return null
}

