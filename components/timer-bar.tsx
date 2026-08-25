import { CRITICAL_TIME_MS, START_TIME_MS } from '@/lib/game'
import { cn } from '@/lib/utils'

type TimerBarProps = {
  /** Tiempo restante del reloj global, en milisegundos. */
  remaining: number
  /** Si el modo Fuego esta activo. */
  fire: boolean
}

/** Barra del reloj global: se vacia de derecha a izquierda. */
export function TimerBar({ remaining, fire }: TimerBarProps) {
  const ratio = Math.max(0, Math.min(1, remaining / START_TIME_MS))
  const critical = remaining <= CRITICAL_TIME_MS

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Tiempo restante"
        aria-valuemin={0}
        aria-valuemax={Math.round(START_TIME_MS / 1000)}
        aria-valuenow={Number((remaining / 1000).toFixed(1))}
      >
        <div
          className={cn(
            'h-full rounded-full transition-colors duration-200',
            critical ? 'bg-destructive' : fire ? 'bg-accent' : 'bg-primary',
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={cn(
          'w-11 shrink-0 text-right font-mono text-xs tabular-nums transition-colors',
          critical ? 'text-destructive' : fire ? 'text-accent' : 'text-muted-foreground',
        )}
      >
        {(remaining / 1000).toFixed(1)}s
      </span>
    </div>
  )
}