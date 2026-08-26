import type { GameRecord } from '@/lib/records'

type LeaderboardProps = {
  records: GameRecord[]
}

export function Leaderboard({ records }: LeaderboardProps) {
  if (records.length === 0) {
    return (
      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        Todavia no hay puntajes registrados. Se el primero.
      </p>
    )
  }

  return (
    <section className="animate-rise mt-6 rounded-sm border border-border bg-card p-5">
      <p className="mb-3 text-center font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
        Mejores puntajes
      </p>
      <ol className="flex flex-col divide-y divide-border">
        {records.map((r, i) => (
          <li key={i} className="flex items-center gap-3 py-2 font-mono text-sm">
            <span className="w-6 shrink-0 text-xs text-muted-foreground">{i + 1}º</span>
            <span className="w-10 shrink-0 font-semibold tracking-wide text-primary">
              {r.iniciales}
            </span>
            <span className="flex-1 truncate text-xs text-muted-foreground">{r.detalle}</span>
            <span className="shrink-0 tabular-nums">{r.puntaje}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
