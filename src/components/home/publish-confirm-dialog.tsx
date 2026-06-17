"use client"

import { useState } from "react"
import { AlertCircle, ClockArrowUp, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { PublishableField, PublishSummary } from "@/lib/publish-changes"

interface PublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: PublishSummary
  onConfirm: () => void
  hasActiveBatch: boolean
}

function FieldChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-700">
      {label}
    </span>
  )
}

function CaveatRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
      <p className="text-xs leading-relaxed text-slate-500">{children}</p>
    </div>
  )
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  hasActiveBatch,
}: PublishConfirmDialogProps) {
  const [skipNext, setSkipNext] = useState(false)
  const count = summary.publishable.length
  const fieldLabel = count === 1 ? "field" : "fields"
  const fieldNames = summary.publishable.map((f) => f.label).join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">

        {/* ── Header: title + summary sentence ── */}
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Publish to PIM &amp; PDP
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {count} {fieldLabel} will be sent to PIM and the retailer PDP.
          </p>
          <DialogDescription className="sr-only">
            Publishing {count} {fieldLabel}: {fieldNames}.
            {summary.pendingReviewCount > 0
              ? ` ${summary.pendingReviewCount} suggestions awaiting review will not be published.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-5 py-4">

          {/* Primary info: what's being published */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Publishing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.publishable.map((field: PublishableField) => (
              <FieldChip key={field.key} label={field.label} />
            ))}
          </div>

          {/* Secondary info: caveats — separated by a thin rule */}
          {(summary.pendingReviewCount > 0 || true) && (
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              {summary.pendingReviewCount > 0 && (
                <CaveatRow icon={<AlertCircle className="size-3.5" />}>
                  <span className="font-medium text-slate-600">
                    {summary.pendingReviewCount}{" "}
                    {summary.pendingReviewCount === 1 ? "suggestion" : "suggestions"} not included.
                  </span>{" "}
                  Items awaiting review will stay in the workspace.
                </CaveatRow>
              )}

              {hasActiveBatch ? (
                <CaveatRow icon={<ClockArrowUp className="size-3.5" />}>
                  <span className="font-medium text-slate-600">Queued as a follow-up.</span> A
                  publish is already in progress — these changes will sync automatically once it
                  completes.
                </CaveatRow>
              ) : (
                <CaveatRow icon={<Info className="size-3.5" />}>
                  <span className="font-medium text-slate-600">PIM</span> updates within minutes.{" "}
                  <span className="font-medium text-slate-600">PDP</span> verification may take
                  several hours.
                </CaveatRow>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          {/* Left: preference toggle */}
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <Checkbox
              id="skip-publish-confirm"
              checked={skipNext}
              onCheckedChange={(v) => setSkipNext(!!v)}
            />
            <span className="text-xs text-slate-500">Don&apos;t show this again</span>
          </label>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onConfirm}>
              Publish {count} {fieldLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
