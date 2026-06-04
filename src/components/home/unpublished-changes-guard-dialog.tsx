"use client"

import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnpublishedChangesGuardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStay: () => void
  onLeave: () => void
}

export function UnpublishedChangesGuardDialog({
  open,
  onOpenChange,
  onStay,
  onLeave,
}: UnpublishedChangesGuardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4 text-slate-900 ring-slate-200">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-warning-600" aria-hidden />
            <DialogTitle className="text-slate-900">Heads up!</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-slate-600">
            You have some accepted changes that are not published yet. If you move away, they
            will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 bg-transparent sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            onClick={onLeave}
          >
            Leave anyway
          </Button>
          <Button type="button" onClick={onStay}>
            Stay on this SKU
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
