export function AttemptedChangesSection({ fields }: { fields: string[] }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        Attempted changes — not applied
      </h3>
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <ul className="space-y-1.5">
          {fields.map((field) => (
            <li key={field} className="text-sm text-slate-500">
              {field} · not submitted
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
