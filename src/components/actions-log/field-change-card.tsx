"use client"

import type { ReactNode } from "react"
import { AlertTriangle, Check, Clock } from "lucide-react"
import type { ChangeSegment, FieldCardView } from "./types"

function AddedSpan({
  children,
  block,
}: {
  children: ReactNode
  block?: boolean
}) {
  if (block) {
    return (
      <div className="rounded bg-success-50 px-2 py-1.5 font-medium text-success-700">
        {children}
      </div>
    )
  }

  return (
    <span className="rounded bg-success-50 px-0.5 font-medium text-success-700">
      {children}
    </span>
  )
}

function InlineTextDiff({
  before,
  after,
  changeKind,
  block,
}: {
  before: ChangeSegment[] | null
  after: ChangeSegment[] | null
  changeKind: FieldCardView["change"]["changeKind"]
  block?: boolean
}) {
  const Tag = block ? "div" : "p"

  if (changeKind === "add" || before === null) {
    return (
      <Tag className="text-sm leading-relaxed">
        {after?.map((segment, index) => (
          <AddedSpan key={index} block={block}>
            {segment.text}
          </AddedSpan>
        ))}
      </Tag>
    )
  }

  const beforeHasRemoved = before.some((segment) => segment.variant === "removed")

  return (
    <Tag className="text-sm leading-relaxed text-slate-900">
      {before.map((segment, index) => {
        const isRemoved =
          segment.variant === "removed" || (!beforeHasRemoved && changeKind === "edit")

        if (isRemoved) {
          return (
            <span key={`before-${index}`} className="text-slate-400 line-through">
              {segment.text}
            </span>
          )
        }

        return (
          <span key={`before-${index}`} className="text-slate-600">
            {segment.text}
          </span>
        )
      })}
      {after?.map((segment, index) => {
        if (segment.variant === "added") {
          return <AddedSpan key={`after-${index}`}>{segment.text}</AddedSpan>
        }

        if (beforeHasRemoved) {
          return (
            <span key={`after-${index}`} className="text-slate-600">
              {segment.text}
            </span>
          )
        }

        return null
      })}
    </Tag>
  )
}

function BulletsDiff({
  items,
}: {
  items: { text: string; added?: boolean; removed?: boolean }[]
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => {
        if (item.removed) {
          return (
            <li key={index} className="text-sm text-slate-400 line-through">
              {item.text}
            </li>
          )
        }

        if (item.added) {
          return (
            <li key={index} className="text-sm leading-relaxed">
              <AddedSpan>+ {item.text}</AddedSpan>
            </li>
          )
        }

        return (
          <li key={index} className="text-sm leading-relaxed text-slate-600">
            {item.text}
          </li>
        )
      })}
    </ul>
  )
}

function FieldReflectionChip({
  reflectionStatus,
  liveDate,
}: {
  reflectionStatus: FieldCardView["reflectionStatus"]
  liveDate?: string
}) {
  if (reflectionStatus === "not_reflected") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-warning-700">
        <AlertTriangle className="size-3 shrink-0 text-warning-600" />
        Not reflected
        {liveDate ? (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{liveDate}</span>
          </>
        ) : null}
      </span>
    )
  }

  if (reflectionStatus === "pending") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-info-700">
        <Clock className="size-3 shrink-0 text-info-600" />
        Pending
      </span>
    )
  }

  if (reflectionStatus === "live") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success-700">
        <Check className="size-3 shrink-0 text-success-600 stroke-[2.5]" />
        Live
        {liveDate ? (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{liveDate}</span>
          </>
        ) : null}
      </span>
    )
  }

  if (reflectionStatus === "submitted") {
    return (
      <span className="text-xs font-medium text-slate-500">Submitted</span>
    )
  }

  return null
}

export function ChangeRecordFieldRow({ view }: { view: FieldCardView }) {
  const { change, reflectionStatus } = view
  const isLongField = change.type === "text" && change.field === "Description"
  const liveDate =
    change.type === "text" || change.type === "bullets" ? change.liveDate : undefined

  return (
    <div className="px-4 py-3">
      <header className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">{change.field}</span>
        <FieldReflectionChip
          reflectionStatus={reflectionStatus}
          liveDate={liveDate}
        />
      </header>

      {change.type === "text" ? (
        <InlineTextDiff
          before={change.before}
          after={change.after}
          changeKind={change.changeKind}
          block={isLongField}
        />
      ) : (
        <BulletsDiff items={change.items} />
      )}
    </div>
  )
}

/** @deprecated Use ChangeRecordSection — kept for any direct imports */
export function FieldChangeCard({ view }: { view: FieldCardView }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ChangeRecordFieldRow view={view} />
    </article>
  )
}
