"use client"

import { CheckCircle, Layers, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type BulkField = "title" | "images" | "bullets" | "description"

const FIELD_LABELS: Record<BulkField, string> = {
  title: "Title",
  images: "Images",
  bullets: "Bullet Points",
  description: "Description",
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────

interface BulkPublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skuCount: number
  fields: BulkField[]
  onConfirm: () => void
}

export function BulkPublishConfirmDialog({
  open,
  onOpenChange,
  skuCount,
  fields,
  onConfirm,
}: BulkPublishConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
              <Layers className="size-4 text-brand-600" />
            </span>
            Accept &amp; publish {skuCount} SKU{skuCount > 1 ? "s" : ""}?
          </DialogTitle>
          <DialogDescription>
            Pending AI recommendations for{" "}
            <span className="font-semibold text-slate-700">{skuCount} SKU{skuCount > 1 ? "s" : ""}</span>{" "}
            will be accepted and pushed to PIM &amp; PDP.
          </DialogDescription>
        </DialogHeader>

        {/* Field pills */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Fields being published</p>
          <div className="flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {FIELD_LABELS[f]}
              </span>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-brand-500 text-white hover:bg-brand-600">
            Accept All &amp; Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Success dialog ────────────────────────────────────────────────────────────

interface BulkPublishSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skuCount: number
  fields: BulkField[]
}

export function BulkPublishSuccessDialog({
  open,
  onOpenChange,
  skuCount,
  fields,
}: BulkPublishSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        {/* Success icon */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-100">
          <CheckCircle className="size-7 text-success-700" />
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-base">
            Changes sent!
          </DialogTitle>
          <DialogDescription className="text-center">
            Recommendations accepted for{" "}
            <span className="font-semibold text-slate-700">{skuCount} SKU{skuCount > 1 ? "s" : ""}</span>.
            PIM and PDP sync is now in progress.
          </DialogDescription>
        </DialogHeader>

        {/* What was published */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Send className="size-3.5" />
            {skuCount} SKU{skuCount > 1 ? "s" : ""} · {fields.length} field{fields.length > 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {FIELD_LABELS[f]}
              </span>
            ))}
          </div>
        </div>

        <Button
          className="w-full bg-brand-500 text-white hover:bg-brand-600"
          onClick={() => onOpenChange(false)}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  )
}
