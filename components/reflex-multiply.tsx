'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { GameHud } from '@/components/game-hud'
import { GameOverCard } from '@/components/game-over-card'
import { TimerBar } from '@/components/timer-bar'
import {
  CORRECT_BONUS_MS,
  FAST_ANSWER_MS,
  FIRE_STREAK,
  type Problem,
  START_TIME_MS,
  WRONG_PENALTY_MS,
  generateProblem,
} from '@/lib/game'
import { cn } from '@/lib/utils'

type Status = 'ready' | 'playing' | 'over'

const initialProblem = { a: 0, b: 0, answer: 0 } satisfies Problem

export function ReflexMultiply() {
  const [status, setStatus] = useState<Status>('ready')
  const [problem, setProblem] = useState<Problem>(initialProblem)
  const [value, setValue] = useState('')

  const [remaining, setRemaining] = useState(START_TIME_MS)
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [fastStreak, setFastStreak] = useState(0)
  const [fire, setFire] = useState(false)
  const [fireCount, setFireCount] = useState(0)
  const [delta, setDelta] = useState<{ ms: number; id: number } | null>(null)
  const [flash, setFlash] = useState<{ type: 'ok' | 'bad'; id: number } | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  /** Reloj autoritativo en ms, para no depender del ritmo de render. */
  const clock = useRef(START_TIME_MS)
  const shownAt = useRef(0)
  const totalAnswerMs = useRef(0)
  const answersTimed = useRef(0)
  const playing = useRef(false)

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const showNext = useCallback(() => {
    setValue('')
    setProblem((prev) => generateProblem(prev))
    shownAt.current = performance.now()
  }, [])

  const start = useCallback(() => {
    clock.current = START_TIME_MS
    totalAnswerMs.current = 0
    answersTimed.current = 0
    playing.current = true
    setRemaining(START_TIME_MS)
    setSolved(0)
    setAttempts(0)
    setFastStreak(0)
    setFire(false)
    setFireCount(0)
    setDelta(null)
    setFlash(null)
    setStatus('playing')
    showNext()
    focusInput()
  }, [focusInput, showNext])

  // Cuenta atras del reloj global.
  useEffect(() => {
    if (status !== 'playing') return
    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      clock.current = Math.max(0, clock.current - (now - last))
      last = now
      setRemaining(clock.current)

      if (clock.current <= 0) {
        playing.current = false
        setStatus('over')
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status])

  const applyDelta = useCallback((ms: number) => {
    clock.current = Math.max(0, Math.min(START_TIME_MS * 3, clock.current + ms))
    setRemaining(clock.current)
    setDelta({ ms, id: Date.now() })
  }, [])

  const submit = useCallback(
    (raw: string) => {
      if (!playing.current || raw === '') return

      const elapsed = performance.now() - shownAt.current
      setAttempts((a) => a + 1)

      if (Number(raw) === problem.answer) {
        totalAnswerMs.current += elapsed
        answersTimed.current += 1
        setSolved((s) => s + 1)
        setFlash({ type: 'ok', id: Date.now() })

        const wasFire = fire
        applyDelta(wasFire ? CORRECT_BONUS_MS * 2 : CORRECT_BONUS_MS)

        if (elapsed < FAST_ANSWER_MS) {
          const next = fastStreak + 1
          setFastStreak(next)
          if (!wasFire && next >= FIRE_STREAK) {
            setFire(true)
            setFireCount((c) => c + 1)
          }
        } else {
          setFastStreak(0)
          setFire(false)
        }
      } else {
        setFlash({ type: 'bad', id: Date.now() })
        applyDelta(-WRONG_PENALTY_MS)
        setFastStreak(0)
        setFire(false)
      }

      showNext()
      focusInput()
    },
    [applyDelta, fastStreak, fire, focusInput, problem.answer, showNext],
  )

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 3)
    setValue(digits)
    if (digits.length >= String(problem.answer).length) submit(digits)
  }

  useEffect(() => {
    if (status === 'playing') focusInput()
  }, [focusInput, status])

  const averageSeconds =
    answersTimed.current > 0 ? totalAnswerMs.current / answersTimed.current / 1000 : 0

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10"
      onPointerDown={() => status === 'playing' && focusInput()}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 transition-opacity duration-500',
          fire ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, oklch(0.72 0.19 48 / 0.22), transparent 65%)',
        }}
      />

      {flash && (
        <div
          key={flash.id}
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed inset-0 z-10',
            flash.type === 'ok' ? 'animate-flash-ok bg-primary/10' : 'animate-flash-bad bg-destructive/20',
          )}
        />
      )}

      <div className="relative z-20 w-full max-w-md">
        {status === 'over' ? (
          <GameOverCard
            solved={solved}
            attempts={attempts}
            averageSeconds={averageSeconds}
            bestFire={fireCount}
            onRestart={start}
          />
        ) : status === 'ready' ? (
          <section className="animate-rise">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Contrarreloj puro · 30s
            </p>
            <h1 className="mt-3 text-balance font-mono text-4xl font-semibold uppercase leading-[1.05] tracking-tight sm:text-5xl">
              Reflejos de
              <br />
              Multiplicacion
            </h1>

            <ul className="mt-8 flex flex-col font-mono text-sm">
              {[
                ['Tablas', 'del 2x2 al 12x12'],
                ['Acierto', '+2s en el reloj'],
                ['Error', '-3s en el reloj'],
                ['Fuego', `${FIRE_STREAK} aciertos bajo 1.5s = bonus x2`],
              ].map(([label, detail]) => (
                <li
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-t border-border py-3 last:border-b"
                >
                  <span className="uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-right text-foreground">{detail}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={start}
              size="lg"
              className="mt-9 h-12 w-full rounded-sm bg-primary font-mono text-sm uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
            >
              Iniciar
            </Button>
          </section>
        ) : (
          <div className="animate-rise flex flex-col gap-8">
            <GameHud
              remaining={remaining}
              solved={solved}
              fire={fire}
              fastStreak={fastStreak}
            />

            <TimerBar remaining={remaining} fire={fire} />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3 font-mono text-5xl tabular-nums sm:gap-4 sm:text-6xl">
                <span>{problem.a}</span>
                <span className="text-muted-foreground">×</span>
                <span>{problem.b}</span>
                <span className="text-muted-foreground">=</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={onChange}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    if (event.nativeEvent.isComposing || event.keyCode === 229) return
                    submit(value)
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={`Resultado de ${problem.a} por ${problem.b}`}
                  className={cn(
                    'w-[3.5ch] border-b-2 bg-transparent text-center font-mono tabular-nums caret-primary outline-none transition-colors placeholder:text-muted-foreground/30',
                    fire
                      ? 'border-accent text-accent focus:border-accent'
                      : 'border-border text-primary focus:border-primary',
                  )}
                  placeholder="··"
                />
              </div>

              <div className="flex h-6 items-center justify-center" aria-live="polite">
                {delta && (
                  <span
                    key={delta.id}
                    className={cn(
                      'animate-rise-out font-mono text-sm tabular-nums',
                      delta.ms > 0 ? 'text-primary' : 'text-destructive',
                    )}
                  >
                    {delta.ms > 0 ? '+' : '−'}
                    {Math.abs(delta.ms / 1000).toFixed(0)}s
                    {delta.ms > CORRECT_BONUS_MS ? ' · fuego' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
