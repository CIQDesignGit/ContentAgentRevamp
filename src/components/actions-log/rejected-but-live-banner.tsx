import { AlertTriangle } from "lucide-react"

export function RejectedButLiveBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning-200 border-l-4 border-l-warning-600 bg-warning-50 px-3 py-2.5">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-600" />
      <div className="text-sm text-slate-800">
        <p className="font-semibold text-warning-800">Rejected but live on PDP</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          The latest submission was rejected, but a prior version is still live on the PDP.
          Flagged for FDE review.
        </p>
      </div>
    </div>
  )
}
