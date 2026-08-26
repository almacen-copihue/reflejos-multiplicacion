// Backend compartido de records de minijuegos (mismo que memoria y sumas rápidas).
// Convención: SIEMPRE mayor puntaje = mejor.
const GAMES_URL =
  'https://script.google.com/macros/s/AKfycbyegP1TSQSccsjYorXIpgAJH1nVAO9fzmg3hwKQNk116Mgx1M6Rs1XUn0JkiusVmGareg/exec'

const NOMBRE_JUEGO = 'multiplicacion'

export type GameRecord = {
  iniciales: string
  puntaje: number
  detalle: string
  fecha: string
}

async function fetchGames(action: string, data?: Record<string, unknown>) {
  let url = `${GAMES_URL}?action=${action}`
  if (data) url += `&data=${encodeURIComponent(JSON.stringify(data))}`
  const res = await fetch(url)
  return res.json()
}

export async function obtenerRecords(): Promise<GameRecord[]> {
  const res = await fetchGames('obtenerRecords', { juego: NOMBRE_JUEGO })
  return res.ok && res.records ? res.records : []
}

export async function guardarRecord(iniciales: string, puntaje: number, detalle: string) {
  return fetchGames('guardarRecord', { juego: NOMBRE_JUEGO, iniciales, puntaje, detalle })
}

/** Puntaje: premia resueltas y rachas de fuego, castiga errores. Mayor = mejor. */
export function calcularPuntaje(solved: number, attempts: number, fireCount: number): number {
  const wrong = Math.max(0, attempts - solved)
  return solved * 10 - wrong * 3 + fireCount * 20
}

export function formatearDetalle(
  solved: number,
  attempts: number,
  accuracy: number,
  fireCount: number,
): string {
  return `${solved} correctas · ${accuracy}% precisión · fuego x${fireCount}`
}
