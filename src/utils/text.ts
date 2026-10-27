/** Remove acentos e normaliza para comparação/busca */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

export function monthName(month: number): string {
  return MONTHS[(month - 1 + 12) % 12] ?? ''
}

export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

export function formatCurrency(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Converte "0,5" ou "0.5" para número; retorna null se inválido */
export function parseDecimal(input: string): number | null {
  const n = Number(input.replace(',', '.').trim())
  return Number.isFinite(n) ? n : null
}
