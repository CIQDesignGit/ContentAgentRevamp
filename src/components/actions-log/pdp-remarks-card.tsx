import { RemarksCardShell, RemarksDetailBox } from "./remarks-card-shell"
import type { PdpRemarks } from "./types"

export function PdpRemarksCard({ remarks }: { remarks: PdpRemarks }) {
  return (
    <RemarksCardShell
      tone="warning"
      label="Remarks — PDP"
      headline={remarks.headline}
    >
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{remarks.body}</p>

      {remarks.likelyCause || remarks.nextStep ? (
        <RemarksDetailBox>
          {remarks.likelyCause ? (
            <p>
              <span className="font-medium">Likely cause: </span>
              {remarks.likelyCause}
            </p>
          ) : null}
          {remarks.nextStep ? (
            <p className={remarks.likelyCause ? "mt-1.5" : undefined}>
              <span className="font-medium">Next step: </span>
              {remarks.nextStep}
            </p>
          ) : null}
        </RemarksDetailBox>
      ) : null}
    </RemarksCardShell>
  )
}
