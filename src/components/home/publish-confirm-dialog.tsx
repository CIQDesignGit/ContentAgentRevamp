"use client"

import type { ReactNode } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ClockArrowUp,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PublishableField, PublishSummary } from "@/lib/publish-changes"

interface PublishConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: PublishSummary
  onConfirm: () => void
  hasActiveBatch: boolean
}

type NoticeCardTone = "violet" | "warning" | "slate" | "info"

const NOTICE_CARD_TONE: Record<
  NoticeCardTone,
  { shell: string; icon: string }
> = {
  violet: {
    shell: "border-violet-200 bg-violet-50",
    icon: "text-violet-600",
  },
  warning: {
    shell: "border-warning-200 bg-warning-50",
    icon: "text-warning-600",
  },
  slate: {
    shell: "border-slate-200 bg-slate-50",
    icon: "text-slate-500",
  },
  info: {
    shell: "border-info-100 bg-info-50",
    icon: "text-info-600",
  },
}

/** Shared card shell: icon column + title row, body aligned under title. */
function NoticeCard({
  tone,
  icon,
  title,
  children,
}: {
  tone: NoticeCardTone
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  const styles = NOTICE_CARD_TONE[tone]

  return (
    <div className={cn("rounded-lg border p-3", styles.shell)}>
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2.5 gap-y-2">
        <div className={cn("flex size-4 items-center justify-center", styles.icon)}>{icon}</div>
        <p className="text-sm font-semibold leading-4 text-slate-900">{title}</p>
        <div className="col-start-2 min-w-0 space-y-2 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </div>
  )
}

function PublishingFieldsCard({ fields }: { fields: PublishableField[] }) {
  const count = fields.length

  return (
    <NoticeCard
      tone="violet"
      title="Ready to publish"
      icon={<CheckCircle2 className="size-4 shrink-0" aria-hidden />}
    >
      <p>
        <span className="font-semibold text-slate-900">{count}</span>
        {count === 1 ? " field" : " fields"} will be sent to PIM and the retailer PDP.
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label="Fields to publish">
        {fields.map((field) => (
          <li
            key={field.key}
            className="rounded-md border border-violet-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            {field.label}
          </li>
        ))}
      </ul>
    </NoticeCard>
  )
}

function PendingReviewNotice({ count }: { count: number }) {
  return (
    <NoticeCard
      tone="warning"
      title={`${count} ${count === 1 ? "suggestion" : "suggestions"} not included`}
      icon={<AlertCircle className="size-4 shrink-0" aria-hidden />}
    >
      <p>
        Items still awaiting review will stay in the workspace and will not be published with this
        action.
      </p>
    </NoticeCard>
  )
}

function SyndicationTimeline({ followUp }: { followUp: boolean }) {
  if (followUp) {
    return (
      <NoticeCard
        tone="info"
        title="Queued as a follow-up"
        icon={<ClockArrowUp className="size-4 shrink-0" aria-hidden />}
      >
        <p>
          A publish is already in progress. These changes will go out automatically once the current
          sync finishes.
        </p>
      </NoticeCard>
    )
  }

  return (
    <NoticeCard
      tone="slate"
      title="What to expect"
      icon={<Info className="size-4 shrink-0" aria-hidden />}
    >
      <ul className="space-y-2">
        <li>
          <span className="font-medium text-slate-800">PIM</span> — usually updates in a few minutes
        </li>
        <li>
          <span className="font-medium text-slate-800">PDP</span> — verification can take several
          hours
        </li>
      </ul>
    </NoticeCard>
  )
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  hasActiveBatch,
}: PublishConfirmDialogProps) {
  const count = summary.publishable.length
  const fieldNames = summary.publishable.map((f) => f.label).join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-slate-200 p-5">
          <DialogTitle className="text-lg font-semibold leading-tight text-slate-900">
            Publish to PIM &amp; PDP
          </DialogTitle>
          <p className="text-sm leading-relaxed text-slate-500">
            Confirm before syndicating accepted content to Salsify and the retailer listing.
          </p>
          <DialogDescription className="sr-only">
            Publishing {count} {count === 1 ? "field" : "fields"}: {fieldNames}.
            {summary.pendingReviewCount > 0
              ? ` ${summary.pendingReviewCount} suggestions awaiting review will not be published.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 p-5">
          <PublishingFieldsCard fields={summary.publishable} />
          {summary.pendingReviewCount > 0 ? (
            <PendingReviewNotice count={summary.pendingReviewCount} />
          ) : null}
          <SyndicationTimeline followUp={hasActiveBatch} />
        </div>

        <DialogFooter className="mx-0 mb-0 flex flex-col-reverse gap-2 rounded-b-xl border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={onConfirm}>
            Publish {count} {count === 1 ? "field" : "fields"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
