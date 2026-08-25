'use client'

import { Button } from '@/components/ui/button'
import { accuracyPercent, speedRating } from '@/lib/game'

type GameOverCardProps = {
  solved: number
  attempts: number
  averageSeconds: number
  bestFire: number
  onRestart: () => void
}

export function GameOverCard({
  solved,
  attempts,
  averageSeconds,
  bestFire,
  onRestart,
}: GameOverCardProps) {
  const accuracy = accuracyPercent(solved, attempts)
  const rating = speedRating(averageSeconds)

  return (
    <section className="animate-rise flex flex-col">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
        Tiempo agotado
      </p>
      <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {solved === 0 ? 'Sin marcador' : `${solved} operaciones`}
      </h2>

      <dl className="mt-9 flex flex-col">
        <div className="flex items-baseline justify-between gap-4 border-t border-border py-5">
          <dt className="flex flex-col">
            <span className="text-sm text-foreground">Operaciones resueltas</span>
            <span className="text-xs text-muted-foreground">
              {attempts} intentos en total
            </span>
          </dt>
          <dd className="font-mono text-4xl leading-none tabular-nums text-primary">{solved}</dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-border py-5">
          <dt className="flex flex-col">
            <span className="text-sm text-foreground">Precision</span>
            <span className="text-xs text-muted-foreground">
              {solved} correctas · {attempts - solved} fallos
            </span>
          </dt>
          <dd className="font-mono text-4xl leading-none tabular-nums text-primary">
            {accuracy}
            <span className="text-lg text-muted-foreground">%</span>
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-border py-5">
          <dt className="flex flex-col">
            <span className="text-sm text-foreground">Velocidad media</span>
            <span className="text-xs text-muted-foreground">{rating.note}</span>
          </dt>
          <dd className="flex flex-col items-end">
            <span className="font-mono text-4xl leading-none tabular-nums text-primary">
              {averageSeconds > 0 ? averageSeconds.toFixed(2) : '—'}
              <span className="text-lg text-muted-foreground">s</span>
            </span>
            <span className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent">
              {rating.label}
            </span>
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-y border-border py-5">
          <dt className="flex flex-col">
            <span className="text-sm text-foreground">Modo Fuego</span>
            <span className="text-xs text-muted-foreground">activaciones en la partida</span>
          </dt>
          <dd className="font-mono text-4xl leading-none tabular-nums text-primary">{bestFire}</dd>
        </div>
      </dl>

      <Button
        onClick={onRestart}
        size="lg"
        className="mt-9 h-12 rounded-sm bg-primary font-mono text-sm uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
      >
        Otra ronda
      </Button>
    </section>
  )
}
