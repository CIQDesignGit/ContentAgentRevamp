import { Fragment } from "react"
import { cn } from "@/lib/utils"
import { stageStatusIcon } from "./status-badge"
import { COLOR_INTENT_CLASSES } from "./status-styles"
import type { TimelineStep, TimelineVariant } from "./types"

const CIRCLE_CLASSES: Record<TimelineVariant, string> = {
  success: "border-success-200 bg-success-50",
  info: "border-info-200 bg-info-50",
  warning: "border-warning-200 bg-warning-50",
  error: "border-error-200 bg-error-50",
  neutral: "border-slate-200 bg-slate-100",
}

function TimelineStepColumn({ step }: { step: TimelineStep }) {
  const colors = COLOR_INTENT_CLASSES[step.variant]
  const Icon = stageStatusIcon(step.stage, step.statusKey)

  return (
    <div className="flex w-[88px] shrink-0 flex-col items-center text-center">
      <p className="text-sm font-semibold text-slate-900">{step.stage}</p>
      <div
        className={cn(
          "mt-1.5 grid size-7 place-items-center rounded-full border",
          CIRCLE_CLASSES[step.variant],
        )}
      >
        <Icon className={cn("size-3.5 shrink-0 stroke-[2.5]", colors.icon)} />
      </div>
      <p className={cn("mt-2 text-xs font-medium", colors.text)}>{step.statusLabel}</p>
      {step.meta ? (
        <p className="mt-0.5 text-xs text-slate-400">{step.meta}</p>
      ) : null}
    </div>
  )
}

export function ActionLogTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex w-full items-start justify-between px-1">
      {steps.map((step, index) => (
        <Fragment key={step.stage}>
          {index > 0 ? (
            <div
              aria-hidden
              className="flex min-w-6 flex-1 flex-col self-start"
            >
              <div className="h-5" />
              <div className="mt-1.5 flex h-7 items-center">
                <div className="h-px w-full bg-slate-200" />
              </div>
            </div>
          ) : null}
          <TimelineStepColumn step={step} />
        </Fragment>
      ))}
    </div>
  )
}
