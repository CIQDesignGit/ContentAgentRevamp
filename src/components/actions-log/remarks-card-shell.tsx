import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type RemarksTone = "error" | "info" | "warning" | "success"

const TONE_STYLES: Record<
  RemarksTone,
  { shell: string; headline: string }
> = {
  error: {
    shell: "border-error-200 border-l-error-600",
    headline: "text-error-700",
  },
  info: {
    shell: "border-info-200 border-l-info-600",
    headline: "text-info-700",
  },
  warning: {
    shell: "border-warning-200 border-l-warning-600",
    headline: "text-warning-700",
  },
  success: {
    shell: "border-success-200 border-l-success-600",
    headline: "text-success-700",
  },
}

interface RemarksCardShellProps {
  tone: RemarksTone
  label: string
  headline: string
  actions?: ReactNode
  children?: ReactNode
}

export function RemarksCardShell({
  tone,
  label,
  headline,
  actions,
  children,
}: RemarksCardShellProps) {
  const styles = TONE_STYLES[tone]

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-white px-3 py-3",
        styles.shell,
      )}
    >
      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <div className="mt-2 flex items-start justify-between gap-2">
        <p className={cn("text-sm font-semibold", styles.headline)}>{headline}</p>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function RemarksDetailBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
      {children}
    </div>
  )
}
