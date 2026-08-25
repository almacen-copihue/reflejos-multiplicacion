'use client'

import { FIRE_STREAK } from '@/lib/game'
import { cn } from '@/lib/utils'

type GameHudProps = {
  remaining: number
  solved: number
  fire: boolean
  fastStreak: number
}

export function GameHud({ remaining, solved, fire, fastStreak }: GameHudProps) {
  const seconds = remaining / 1000
  const critical = seconds <= 5

  return (
    <header className="flex items-end justify-between gap-4">
      <div className="flex flex-col">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
          Reloj
        </span>
        <span
          className={cn(
            'font-mono text-5xl leading-none tabular-nums transition-colors sm:text-6xl',
            critical ? 'text-destructive' : fire ? 'text-accent' : 'text-foreground',
          )}
        >
          {Math.max(0, seconds).toFixed(1)}
          <span className="ml-1 text-base text-muted-foreground">s</span>
        </span>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-col items-end">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Resueltas
          </span>
          <span className="font-mono text-2xl leading-none tabular-nums text-foreground">
            {solved}
          </span>
        </div>

        {fire ? (
          <span className="animate-pulse-fire rounded-sm bg-accent px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent-foreground">
            Fuego · x2
          </span>
        ) : (
          <span
            className="flex items-center gap-1"
            aria-label={`${fastStreak} de ${FIRE_STREAK} respuestas rapidas para modo Fuego`}
          >
            {Array.from({ length: FIRE_STREAK }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-4 rounded-[1px] transition-colors duration-200',
                  i < fastStreak ? 'bg-accent' : 'bg-muted',
                )}
              />
            ))}
          </span>
        )}
      </div>
    </header>
  )
}
