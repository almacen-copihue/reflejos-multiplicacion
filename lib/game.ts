/**
 * "Reflejos de Multiplicacion": contrarreloj puro con tablas del 2x2 al 12x12.
 * Los aciertos suman tiempo, los errores lo restan, y una racha de respuestas
 * rapidas activa el modo Fuego (bonus x2).
 */
export type Problem = {
  a: number
  b: number
  answer: number
}

/** Tiempo inicial del reloj global (contrarreloj puro). */
export const START_TIME_MS = 30_000
/** Bonus de tiempo por acierto. */
export const CORRECT_BONUS_MS = 2_000
/** Penalidad de tiempo por error. */
export const WRONG_PENALTY_MS = 3_000
/** Umbral de "respuesta rapida" para sumar racha de Fuego. */
export const FAST_ANSWER_MS = 1_500
/** Aciertos rapidos consecutivos necesarios para activar el modo Fuego. */
export const FIRE_STREAK = 3
/** Bajo este tiempo restante el reloj entra en zona critica. */
export const CRITICAL_TIME_MS = 5_000
/** Versión visible del juego, se incrementa en cada cambio entregado. */
export const APP_VERSION = 'v1.1'

function rand(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function createProblem(): Problem {
  const a = rand(2, 12)
  const b = rand(2, 12)
  return { a, b, answer: a * b }
}

/** Genera una multiplicacion evitando repetir el mismo par que la anterior. */
export function generateProblem(previous?: Problem): Problem {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const next = createProblem()
    if (previous && previous.a === next.a && previous.b === next.b) continue
    return next
  }
  return createProblem()
}

export function accuracyPercent(correct: number, attempts: number) {
  if (attempts <= 0) return 0
  return Math.round((correct / attempts) * 100)
}

export type SpeedRating = { label: string; note: string }

/** Traduce el tiempo medio por acierto (en segundos) a un nivel de velocidad. */
export function speedRating(averageSeconds: number): SpeedRating {
  if (averageSeconds <= 0) return { label: 'Sin datos', note: 'No resolviste ninguna operacion' }
  if (averageSeconds < 1.2) return { label: 'Instinto numerico', note: 'Respondes antes de pensarlo' }
  if (averageSeconds < 2) return { label: 'Muy rapido', note: 'Casi sin pensarlo' }
  if (averageSeconds < 3) return { label: 'Buen ritmo', note: 'Con margen de sobra' }
  if (averageSeconds < 4) return { label: 'Justo a tiempo', note: 'Apurando el reloj' }
  return { label: 'Al limite', note: 'Cada respuesta rozo el limite' }
}