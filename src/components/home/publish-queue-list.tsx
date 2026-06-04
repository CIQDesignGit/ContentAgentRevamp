"use client"

import { FieldSyncStatusRow } from "./recommendation-sync-ui"
import type { FieldPublishQueueItem } from "@/lib/build-field-publish-queue"

function PublishQueueItem({
  item,
  fieldKey,
}: {
  item: FieldPublishQueueItem
  fieldKey: string
}) {
  const isLocked = item.footprint === "syncing" || item.footprint === "queued"

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <p
          className={
            isLocked
              ? "min-w-0 flex-1 text-sm leading-relaxed text-slate-600"
              : "min-w-0 flex-1 text-sm leading-relaxed text-slate-900"
          }
        >
          {item.text}
        </p>
        <FieldSyncStatusRow
          syncFootprint={item.footprint}
          batch={item.batch}
          fieldKey={fieldKey}
        />
      </div>
    </div>
  )
}

export function PublishQueueList({
  items,
  fieldKey,
}: {
  items: FieldPublishQueueItem[]
  fieldKey: string
}) {
  if (items.length === 0) return null

  return (
    <ul className="flex flex-col gap-2" aria-label="Queued changes">
      {items.map((item) => (
        <li key={item.batchId}>
          <PublishQueueItem item={item} fieldKey={fieldKey} />
        </li>
      ))}
    </ul>
  )
}
