import { CRITICAL_TIME_MS } from '@/lib/game'
import { cn } from '@/lib/utils'

type TimerBarProps = {
  /** Tiempo restante en milisegundos. */
  remaining: number
  /** Tiempo total de la ecuacion en milisegundos. */
  total: number
}

/** Barra fina de tiempo por ecuacion: se vacia de derecha a izquierda. */
export function TimerBar({ remaining, total }: TimerBarProps) {
  const ratio = Math.max(0, Math.min(1, remaining / total))
  const critical = remaining <= CRITICAL_TIME_MS

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Tiempo restante para esta ecuacion"
        aria-valuemin={0}
        aria-valuemax={Math.round(total / 1000)}
        aria-valuenow={Number((remaining / 1000).toFixed(1))}
      >
        <div
          className={cn(
            'h-full rounded-full transition-colors duration-200',
            critical ? 'bg-destructive' : 'bg-primary',
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={cn(
          'w-11 shrink-0 text-right font-mono text-xs tabular-nums transition-colors',
          critical ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {(remaining / 1000).toFixed(1)}s
      </span>
    </div>
  )
}
