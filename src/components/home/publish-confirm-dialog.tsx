"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PublishSummary } from "@/lib/publish-changes"

interface PublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: PublishSummary
  onConfirm: () => void
  hasActiveBatch: boolean
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  hasActiveBatch,
}: PublishConfirmDialogProps) {
  const fieldList = summary.publishable.map((f) => f.label).join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish to PIM &amp; PDP</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              Publishing <strong>{summary.publishable.length}</strong>{" "}
              {summary.publishable.length === 1 ? "field" : "fields"}: {fieldList}.
            </span>
            {summary.pendingReviewCount > 0 ? (
              <span className="block">
                <strong>{summary.pendingReviewCount}</strong>{" "}
                {summary.pendingReviewCount === 1 ? "suggestion is" : "suggestions are"}{" "}
                still awaiting review—they will not be published.
              </span>
            ) : null}
            {hasActiveBatch ? (
              <span className="block text-info-700">
                A publish is already in progress. New changes will go out as a follow-up once the
                current sync completes.
              </span>
            ) : (
              <span className="block">
                PIM usually updates in a few minutes. PDP verification can take several hours.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Publish
          </Button>
        </DialogFooter>
        <p className="text-center text-xs text-slate-500">
          Track progress in the{" "}
          <Link href="/actions-log" className="font-medium text-primary hover:underline">
            Actions Log
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
