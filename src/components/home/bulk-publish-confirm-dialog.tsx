"use client"

import { useEffect, useState } from "react"
import { Check, CheckCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type BulkField = "title" | "images" | "bullets" | "description"

// ─── Field config — icon, display name, colours ───────────────────────────────

const FIELD_CONFIG: { id: BulkField; label: string }[] = [
  { id: "title",       label: "Title"               },
  { id: "images",      label: "Item Highlights"      },
  { id: "bullets",     label: "Bullet Points"        },
  { id: "description", label: "Product Description"  },
]

export const FIELD_LABELS: Record<BulkField, string> = Object.fromEntries(
  FIELD_CONFIG.map((f) => [f.id, f.label]),
) as Record<BulkField, string>

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface BulkPublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skuCount: number
  fields: BulkField[]
  /** Called with the subset of fields the user chose to include */
  onConfirm: (fields: BulkField[]) => void
}

export function BulkPublishConfirmDialog({
  open,
  onOpenChange,
  skuCount,
  fields,
  onConfirm,
}: BulkPublishConfirmDialogProps) {
  const [checkedFields, setCheckedFields] = useState<Set<BulkField>>(
    () => new Set(fields),
  )

  // Reset selection every time the dialog opens
  useEffect(() => {
    if (open) setCheckedFields(new Set(fields))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleField(id: BulkField) {
    setCheckedFields((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const checkedCount = checkedFields.size
  const totalUpdates = checkedCount * skuCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {/* Header */}
        <div className="px-6 pt-6">
          <h2 className="text-xl font-bold text-slate-900">
            Bulk approve &middot; {skuCount.toLocaleString()} SKU{skuCount !== 1 ? "s" : ""}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose what the agent should publish across your selection.
          </p>
        </div>

        {/* Field rows */}
        <div className="space-y-2 px-6 py-4">
          {FIELD_CONFIG.map(({ id, label }) => {
            const checked = checkedFields.has(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleField(id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                  checked
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                {/* Checkbox */}
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors",
                    checked
                      ? "border-brand-500 bg-brand-500"
                      : "border-slate-300 bg-white",
                  )}
                >
                  {checked && <Check className="size-3 stroke-3 text-white" />}
                </span>

                {/* Name + description */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      checked ? "text-slate-900" : "text-slate-400",
                    )}
                  >
                    {label}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      checked ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {checked ? (
                      <>
                        Agent recommends a new {label.toLowerCase()} for{" "}
                        <span className="font-semibold text-slate-700">
                          {skuCount.toLocaleString()}
                        </span>{" "}
                        SKUs
                      </>
                    ) : (
                      "Not included in this publish"
                    )}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 px-6 pt-3 pb-6">
          <p className="text-xs text-slate-500">
            Publishing{" "}
            <span className="font-semibold text-slate-800">
              {totalUpdates.toLocaleString()} update{totalUpdates !== 1 ? "s" : ""}
            </span>{" "}
            across {skuCount.toLocaleString()} SKU{skuCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Review first
            </Button>
            <Button
              disabled={checkedCount === 0}
              className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
              onClick={() => onConfirm(Array.from(checkedFields))}
            >
              Approve &amp; publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Success dialog ───────────────────────────────────────────────────────────

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
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-100">
          <CheckCircle className="size-7 text-success-700" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">Changes sent!</h3>
          <p className="text-sm text-muted-foreground">
            Recommendations accepted for{" "}
            <span className="font-semibold text-slate-700">
              {skuCount} SKU{skuCount > 1 ? "s" : ""}
            </span>
            . PIM and PDP sync is now in progress.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Send className="size-3.5" />
            {skuCount} SKU{skuCount > 1 ? "s" : ""} &middot; {fields.length} field{fields.length > 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
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
