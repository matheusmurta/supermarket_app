import type { ProductUnit } from '@/models'
import { formatNumber } from './text'

interface UnitInfo {
  label: string
  singular: string
  plural: string
  /** Passo do seletor de quantidade */
  step: number
  decimal: boolean
}

export const UNIT_INFO: Record<ProductUnit, UnitInfo> = {
  un: { label: 'Unidade', singular: 'unidade', plural: 'unidades', step: 1, decimal: false },
  pct: { label: 'Pacote', singular: 'pacote', plural: 'pacotes', step: 1, decimal: false },
  cx: { label: 'Caixa', singular: 'caixa', plural: 'caixas', step: 1, decimal: false },
  gf: { label: 'Garrafa', singular: 'garrafa', plural: 'garrafas', step: 1, decimal: false },
  L: { label: 'Litro', singular: 'L', plural: 'L', step: 0.5, decimal: true },
  mL: { label: 'Mililitro', singular: 'mL', plural: 'mL', step: 100, decimal: false },
  kg: { label: 'Quilograma', singular: 'kg', plural: 'kg', step: 0.5, decimal: true },
  g: { label: 'Grama', singular: 'g', plural: 'g', step: 100, decimal: false },
  dz: { label: 'Dúzia', singular: 'dúzia', plural: 'dúzias', step: 1, decimal: true },
}

export function unitStep(unit: ProductUnit): number {
  return UNIT_INFO[unit].step
}

/** "2 pacotes", "0,5 kg", "1 dúzia" */
export function formatQuantity(quantity: number, unit: ProductUnit, packageSize?: string): string {
  const info = UNIT_INFO[unit]
  const word = quantity === 1 || (quantity < 1 && info.decimal && !['dz'].includes(unit)) ? info.singular : info.plural
  const base = `${formatNumber(quantity)} ${word}`
  return packageSize ? `${base} de ${packageSize}` : base
}

/** Arredonda para evitar 0.30000000004 */
export function roundQty(n: number): number {
  return Math.round(n * 1000) / 1000
}
