/**
 * "Encuentra la X": el jugador resuelve ecuaciones donde falta un numero.
 * Cada problema se guarda partido en dos mitades para poder dibujar el hueco
 * de la X justo en su sitio dentro de la ecuacion.
 */
export type Problem = {
  /** Texto a la izquierda del hueco, p. ej. "20 −". */
  before: string
  /** Coeficiente pegado a la X sin espacio, p. ej. "2" en "2X + 4 = 14". */
  coefficient: string
  /** Texto a la derecha del hueco, p. ej. "+ 4 = 14". */
  after: string
  /** Valor correcto de X. */
  answer: number
  /** Ecuacion completa en texto plano (accesibilidad y feedback). */
  label: string
}

/** Vidas con las que empieza la partida. */
export const LIVES = 3
/** Tiempo disponible para cada ecuacion. */
export const QUESTION_TIME_MS = 5_000
/** Aciertos necesarios para subir de nivel. */
export const CORRECT_PER_LEVEL = 4
/** Bajo este tiempo restante la barra entra en zona critica. */
export const CRITICAL_TIME_MS = 1_500

const MINUS = '\u2212'
const TIMES = '\u00d7'

function rand(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function build(before: string, coefficient: string, after: string, answer: number): Problem {
  const label = `${before} ${coefficient}X ${after}`.replace(/\s+/g, ' ').trim()
  return { before, coefficient, after, answer, label }
}

/** Nivel 1: sumas y restas con la X sola. */
function additive(maxX: number, maxOther: number): Problem {
  const form = rand(0, 3)

  if (form === 0) {
    const x = rand(1, maxX)
    const b = rand(2, maxOther)
    return build('', '', `+ ${b} = ${x + b}`, x)
  }
  if (form === 1) {
    const x = rand(1, maxX)
    const a = rand(2, maxOther)
    return build(`${a} +`, '', `= ${a + x}`, x)
  }
  if (form === 2) {
    // a − X = c
    const x = rand(1, maxX)
    const rest = rand(1, maxOther)
    return build(`${x + rest} ${MINUS}`, '', `= ${rest}`, x)
  }
  // X − b = c
  const x = rand(2, Math.max(3, maxX))
  const b = rand(1, x - 1)
  return build('', '', `${MINUS} ${b} = ${x - b}`, x)
}

/** Nivel 2: multiplicaciones simples con la X sola. */
function multiplicative(maxX: number, maxFactor: number): Problem {
  const x = rand(2, maxX)
  const factor = rand(2, maxFactor)
  if (Math.random() < 0.5) {
    return build(`${factor} ${TIMES}`, '', `= ${factor * x}`, x)
  }
  return build('', '', `${TIMES} ${factor} = ${x * factor}`, x)
}

/** Nivel 3: la X viene con coeficiente, p. ej. "2X + 4 = 14". */
function combined(maxCoefficient: number, maxX: number, maxTerm: number): Problem {
  const coefficient = rand(2, maxCoefficient)
  const x = rand(1, maxX)
  const product = coefficient * x

  if (Math.random() < 0.55) {
    const b = rand(1, maxTerm)
    return build('', `${coefficient}`, `+ ${b} = ${product + b}`, x)
  }
  const b = rand(1, Math.min(maxTerm, Math.max(1, product - 1)))
  return build('', `${coefficient}`, `${MINUS} ${b} = ${product - b}`, x)
}

function createForLevel(level: number): Problem {
  if (level <= 1) return additive(9, 12)
  if (level === 2) return multiplicative(9, 9)
  if (level === 3) return combined(5, 9, 12)

  // Nivel 4 en adelante: mezcla de los tres tipos con rangos mas amplios.
  const extra = Math.min(level - 3, 6)
  return pick([
    () => additive(12, 15 + extra * 3),
    () => multiplicative(12, 9 + Math.min(extra, 3)),
    () => combined(3 + Math.min(extra, 6), 12, 12 + extra * 2),
    () => combined(2 + Math.min(extra, 4), 9, 18 + extra * 2),
  ])()
}

/** Genera una ecuacion del nivel pedido evitando repetir la anterior. */
export function generateProblem(level: number, previous?: Problem): Problem {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const next = createForLevel(level)
    if (previous && previous.label === next.label) continue
    return next
  }
  return createForLevel(level)
}

/** Nombre del tipo de ecuaciones que toca en cada nivel. */
export function levelName(level: number) {
  if (level <= 1) return 'Sumas y restas'
  if (level === 2) return 'Multiplicaciones'
  if (level === 3) return 'X con coeficiente'
  return 'Mezcla total'
}

export function levelFromCorrect(correct: number) {
  return Math.floor(correct / CORRECT_PER_LEVEL) + 1
}

export function accuracyPercent(correct: number, attempts: number) {
  if (attempts <= 0) return 0
  return Math.round((correct / attempts) * 100)
}

export type SpeedRating = { label: string; note: string }

/** Traduce el tiempo medio por acierto (en segundos) a un nivel de velocidad. */
export function speedRating(averageSeconds: number): SpeedRating {
  if (averageSeconds <= 0) return { label: 'Sin datos', note: 'No resolviste ninguna ecuacion' }
  if (averageSeconds < 1.2) return { label: 'Instinto algebraico', note: 'Despejas antes de leer' }
  if (averageSeconds < 2) return { label: 'Muy rapido', note: 'Casi sin pensarlo' }
  if (averageSeconds < 3) return { label: 'Buen ritmo', note: 'Con margen de sobra' }
  if (averageSeconds < 4) return { label: 'Justo a tiempo', note: 'Apurando el reloj' }
  return { label: 'Al limite', note: 'Cada respuesta rozo los 5 segundos' }
}
