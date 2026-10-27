import type { ShoppingList } from '@/models'
import { roundQty } from '@/utils/units'

export interface ListStats {
  distinct: number
  totalQuantity: number
  purchased: number
  pending: number
  percent: number
  pendingCategories: string[]
  estimatedTotal: number
  hasPrices: boolean
}

const COUNTABLE = ['un', 'pct', 'cx', 'gf', 'dz']

export function computeStats(list: ShoppingList | null | undefined): ListStats {
  const items = list?.items ?? []
  const purchased = items.filter((i) => i.purchased).length
  const priced = items.filter((i) => i.price !== undefined)
  return {
    distinct: items.length,
    // Itens por peso/volume contam como 1 produto
    totalQuantity: roundQty(items.reduce((s, i) => s + (COUNTABLE.includes(i.unit) ? i.quantity : 1), 0)),
    purchased,
    pending: items.length - purchased,
    percent: items.length ? Math.round((purchased / items.length) * 100) : 0,
    pendingCategories: [...new Set(items.filter((i) => !i.purchased).map((i) => i.categoryId))],
    estimatedTotal: priced.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0),
    hasPrices: priced.length > 0,
  }
}
