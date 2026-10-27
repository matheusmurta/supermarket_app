import type { Category, ShoppingList } from '@/models'
import { formatQuantity } from '@/utils/units'
import { formatCurrency, monthName } from '@/utils/text'

/** Limite prático para URLs de compartilhamento (wa.me). Acima disso, oferecemos copiar/Web Share. */
export const WHATSAPP_SAFE_LENGTH = 6000

export function listTitle(list: ShoppingList): string {
  if (list.month && list.year) return `${list.name} — ${monthName(list.month)}/${list.year}`
  return list.name
}

export function buildShareMessage(list: ShoppingList, categories: Category[]): string {
  const lines: string[] = [`🛒 *${listTitle(list).toUpperCase()}*`, '']
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  const known = new Set(sorted.map((c) => c.id))
  const groups = sorted.map((c) => ({ cat: c, items: list.items.filter((i) => i.categoryId === c.id) }))
  const orphans = list.items.filter((i) => !known.has(i.categoryId))
  if (orphans.length) groups.push({ cat: { id: '_', name: 'Outros', emoji: '🛍️', isCustom: false, order: 999 }, items: orphans })

  let total = 0
  for (const { cat, items } of groups) {
    if (!items.length) continue
    lines.push(`${cat.emoji} *${cat.name.toUpperCase()}*`)
    for (const item of [...items].sort((a, b) => a.position - b.position)) {
      let line = `${item.purchased ? '☑' : '☐'} ${item.name} — ${formatQuantity(item.quantity, item.unit, item.packageSize)}`
      if (item.price !== undefined) {
        const sub = item.price * item.quantity
        total += sub
        line += ` (${formatCurrency(sub)})`
      }
      if (item.notes?.trim()) line += `\n   _${item.notes.trim()}_`
      lines.push(line)
    }
    lines.push('')
  }

  const bought = list.items.filter((i) => i.purchased).length
  lines.push('📊 *RESUMO*')
  lines.push(`Total: ${list.items.length} ${list.items.length === 1 ? 'item diferente' : 'itens diferentes'}`)
  lines.push(`Comprados: ${bought}`)
  lines.push(`Pendentes: ${list.items.length - bought}`)
  if (total > 0) lines.push(`Gasto estimado: ${formatCurrency(total)}`)
  lines.push('', '_Lista criada no MeuMercado_')
  return lines.join('\n')
}

/** URL oficial de compartilhamento (funciona em mobile e WhatsApp Web/desktop) */
export function whatsappUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function nativeShare(title: string, text: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!canNativeShare()) return 'unsupported'
  try {
    await navigator.share({ title, text })
    return 'shared'
  } catch {
    return 'cancelled'
  }
}
