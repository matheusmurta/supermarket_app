import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEFAULT_PRODUCTS } from '@/data/products'
import { DEFAULT_CATEGORIES } from '@/data/categories'
import { useCatalogStore } from '@/stores/catalog'
import { useListsStore } from '@/stores/lists'
import { computeStats } from '@/stores/stats'

const product = (id: string) => DEFAULT_PRODUCTS.find((p) => p.id === id)!

describe('catálogo', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('possui ao menos 250 produtos com IDs únicos e categorias válidas', () => {
    expect(DEFAULT_PRODUCTS.length).toBeGreaterThanOrEqual(250)
    expect(new Set(DEFAULT_PRODUCTS.map((p) => p.id)).size).toBe(DEFAULT_PRODUCTS.length)
    const cats = new Set(DEFAULT_CATEGORIES.map((c) => c.id))
    expect(DEFAULT_CATEGORIES).toHaveLength(20)
    DEFAULT_PRODUCTS.forEach((p) => expect(cats.has(p.categoryId)).toBe(true))
  })

  it('busca ignorando acentos e maiúsculas', () => {
    const c = useCatalogStore()
    expect(c.search('FEIJAO').map((p) => p.name)).toContain('Feijão carioca')
    expect(c.search('acucar').some((p) => p.name === 'Açúcar refinado')).toBe(true)
    expect(c.search('mussarela').map((p) => p.name)).toContain('Queijo muçarela')
  })

  it('filtra por categoria', () => {
    const r = useCatalogStore().search('', 'limpeza')
    expect(r.length).toBeGreaterThan(10)
    expect(r.every((p) => p.categoryId === 'limpeza')).toBe(true)
  })

  it('cria, edita e exclui produto personalizado evitando duplicidade', () => {
    const c = useCatalogStore()
    expect(c.addProduct({ name: 'banana', categoryId: 'hortifruti', defaultUnit: 'kg', suggestedQuantity: 1 }).ok).toBe(false)
    const r = c.addProduct({ name: 'Kombucha', categoryId: 'bebidas', defaultUnit: 'gf', suggestedQuantity: 1 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(c.search('kombu')[0]?.id).toBe(r.product.id)
    expect(c.updateProduct(r.product.id, { name: 'Kombucha de gengibre', categoryId: 'bebidas', defaultUnit: 'gf', suggestedQuantity: 2 }).ok).toBe(true)
    c.removeProduct(r.product.id)
    expect(c.productMap.has(r.product.id)).toBe(false)
  })
})

describe('listas', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('cria, edita, duplica e exclui lista', () => {
    const s = useListsStore()
    const l = s.createList('Compras de Outubro', { month: 10, year: 2026 })
    expect(s.activeListId).toBe(l.id)
    s.updateList(l.id, { name: 'Outubro' })
    expect(s.find(l.id)?.name).toBe('Outubro')
    s.addProduct(l.id, product('p-arroz-branco'))
    s.togglePurchased(l.id, s.find(l.id)!.items[0]!.id)
    const copy = s.duplicateList(l.id, 'Compras de Novembro', 11, 2026)!
    expect(copy.items).toHaveLength(1)
    expect(copy.items[0]!.purchased).toBe(false)
    expect(copy.items[0]!.id).not.toBe(s.find(l.id)!.items[0]!.id)
    s.deleteList(l.id)
    expect(s.find(l.id)).toBeUndefined()
  })

  it('adiciona sem duplicar, altera quantidade e marca/desmarca', () => {
    const s = useListsStore()
    const l = s.createList('Teste')
    s.addProduct(l.id, product('p-leite-integral'))
    s.addProduct(l.id, product('p-leite-integral'), 2)
    const item = s.find(l.id)!.items[0]!
    expect(s.find(l.id)!.items).toHaveLength(1)
    expect(item.quantity).toBe(14)
    s.stepQuantity(l.id, item.id, -1)
    expect(item.quantity).toBe(13)
    s.togglePurchased(l.id, item.id)
    expect(computeStats(s.find(l.id)).percent).toBe(100)
    s.togglePurchased(l.id, item.id)
    expect(computeStats(s.find(l.id)).purchased).toBe(0)
  })

  it('aceita decimais (0,5 kg)', () => {
    const s = useListsStore()
    const l = s.createList('Kg')
    const it = s.addProduct(l.id, product('p-uva'))!
    expect(it.quantity).toBe(0.5)
    expect(s.stepQuantity(l.id, it.id, -1)).toBe(false)
    expect(s.stepQuantity(l.id, it.id, 1)).toBe(true)
    expect(it.quantity).toBe(1)
  })

  it('estatísticas de lista vazia', () => {
    const stats = computeStats(useListsStore().createList('Vazia'))
    expect(stats).toMatchObject({ distinct: 0, purchased: 0, pending: 0, percent: 0 })
  })

  it('reordena manualmente', () => {
    const s = useListsStore()
    const l = s.createList('Ordem')
    const a = s.addProduct(l.id, product('p-banana'))!
    s.addProduct(l.id, product('p-maca'))
    s.moveItem(l.id, a.id, 1)
    const ordered = [...s.find(l.id)!.items].sort((x, y) => x.position - y.position)
    expect(ordered[1]!.id).toBe(a.id)
  })
})
