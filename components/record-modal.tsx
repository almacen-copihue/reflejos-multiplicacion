'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type RecordModalProps = {
  open: boolean
  saving: boolean
  onSave: (iniciales: string) => void
}

export function RecordModal({ open, saving, onSave }: RecordModalProps) {
  const [chars, setChars] = useState(['', '', ''])
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    if (!open) return
    setChars(['', '', ''])
    const id = setTimeout(() => refs[0].current?.focus(), 100)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const handleChange = (idx: number, raw: string) => {
    const letter = raw.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(-1)
    const next = [...chars]
    next[idx] = letter
    setChars(next)
    if (letter && idx < 2) refs[idx + 1].current?.focus()
  }

  const handleKeyDown = (idx: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !chars[idx] && idx > 0) {
      refs[idx - 1].current?.focus()
    }
    if (event.key === 'Enter') onSave(chars.join('') || '???')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <div className="animate-rise w-full max-w-xs rounded-sm border border-border bg-card p-6 text-center">
        <p className="text-2xl" aria-hidden="true">
          🏆
        </p>
        <h3 className="mt-1 font-mono text-lg font-semibold uppercase tracking-tight">
          Nuevo record
        </h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Entraste al top 10. Ingresa tus iniciales:
        </p>

        <div className="mt-5 flex justify-center gap-2">
          {chars.map((c, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="text"
              autoCapitalize="characters"
              aria-label={`Letra ${i + 1} de tus iniciales`}
              className="h-14 w-12 rounded-sm border border-border bg-background text-center font-mono text-2xl font-bold uppercase text-accent outline-none focus:border-accent"
            />
          ))}
        </div>

        <Button
          onClick={() => onSave(chars.join('') || '???')}
          disabled={saving}
          size="lg"
          className="mt-6 h-11 w-full rounded-sm bg-primary font-mono text-sm uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
