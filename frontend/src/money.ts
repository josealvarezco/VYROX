// Quick stakes and peso formatting for the COP return simulators.
export const STAKES = [10_000, 20_000, 50_000, 100_000]

export const pesos = (value: number) => `$${Math.round(value).toLocaleString('es-CO')}`

// A gain or a loss in pesos: "+$18.600" or "-$10.000".
export const signed = (value: number) => `${value < 0 ? '-' : '+'}${pesos(Math.abs(value))}`
