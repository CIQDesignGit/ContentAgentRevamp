"use client"

import { ChangeRecordFieldRow } from "./field-change-card"
import type { FieldCardView } from "./types"

export function ChangeRecordSection({ fieldViews }: { fieldViews: FieldCardView[] }) {
  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h3 className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Change record
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400 line-through">removed</span>
            <span className="text-slate-300">·</span>
            <span className="rounded bg-success-50 px-1 font-medium text-success-700">
              added
            </span>
          </div>
        </header>

        {fieldViews.map((view, index) => (
          <div
            key={`${view.change.field}-${index}`}
            className={index > 0 ? "border-t border-slate-100" : undefined}
          >
            <ChangeRecordFieldRow view={view} />
          </div>
        ))}
      </div>
    </section>
  )
}
