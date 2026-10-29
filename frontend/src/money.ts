// Quick stakes and peso formatting for the COP return simulators.
export const STAKES = [10_000, 20_000, 50_000, 100_000]

export const pesos = (value: number) => `$${Math.round(value).toLocaleString('es-CO')}`
