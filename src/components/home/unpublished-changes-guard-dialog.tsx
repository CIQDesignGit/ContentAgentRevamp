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
      <DialogContent className="max-w-md gap-4">
        <DialogHeader className="gap-3">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning-100">
              <AlertTriangle className="size-5 text-warning-600" aria-hidden />
            </span>
            <div className="space-y-1.5">
              <DialogTitle>Heads up!</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-slate-600">
                You have some accepted changes that are not published yet. If you move away,
                they will be lost.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onLeave}>
            Leave anyway
          </Button>
          <Button type="button" onClick={onStay}>
            Stay on this product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
