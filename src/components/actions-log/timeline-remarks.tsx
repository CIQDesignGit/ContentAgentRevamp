import type { ActionLogEntry, PanelScenario, PdpRemarks, SyndicationRemarks } from "./types"
import { RemarksCardShell } from "./remarks-card-shell"
import { PdpRemarksCard } from "./pdp-remarks-card"
import { SyndicationRemarksCard } from "./syndication-remarks-card"
import type { RemarksTone } from "./remarks-card-shell"

interface TimelineRemarksProps {
  entry: ActionLogEntry
  remarks: PdpRemarks | SyndicationRemarks | null
  scenario: PanelScenario
}

function simpleRemarksTone(scenario: PanelScenario): RemarksTone {
  if (scenario === "pending") return "info"
  if (scenario === "partially_live" || scenario === "not_reflected") return "warning"
  if (scenario === "live") return "success"
  return "info"
}

function simpleRemarksHeadline(
  entry: ActionLogEntry,
  scenario: PanelScenario,
): string {
  if (scenario === "pending") {
    if (entry.retailerStatus === "pending") return "Awaiting retailer acceptance"
    return "Awaiting PDP verification"
  }
  if (scenario === "partially_live") return "Partially live on PDP"
  if (scenario === "not_reflected") return "Not reflected on PDP"
  if (scenario === "live") return "All fields live on PDP"
  return "Status update"
}

export function TimelineRemarks({ entry, remarks, scenario }: TimelineRemarksProps) {
  if (remarks?.kind === "syndication") {
    return (
      <div className="mt-3 border-t border-slate-100 pt-3">
        <SyndicationRemarksCard remarks={remarks} />
      </div>
    )
  }

  if (remarks?.kind === "pdp") {
    return (
      <div className="mt-3 border-t border-slate-100 pt-3">
        <PdpRemarksCard remarks={remarks} />
      </div>
    )
  }

  if (!entry.syndicationRemarks) {
    return null
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <RemarksCardShell
        tone={simpleRemarksTone(scenario)}
        label="Remarks"
        headline={simpleRemarksHeadline(entry, scenario)}
      >
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {entry.syndicationRemarks}
        </p>
      </RemarksCardShell>
    </div>
  )
}
