import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEFAULT_PRODUCTS } from '@/data/products'
import { DEFAULT_CATEGORIES } from '@/data/categories'
import { useListsStore } from '@/stores/lists'
import { defaultSettings } from '@/stores/settings'
import { storageService, StorageKeys } from '@/services/storage.service'
import { isListArray } from '@/services/validators'
import { buildShareMessage, whatsappUrl } from '@/services/sharing.service'
import { createBackup, parseBackup, serializeBackup } from '@/services/backup.service'

const product = (id: string) => DEFAULT_PRODUCTS.find((p) => p.id === id)!

describe('persistência', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('persiste e reidrata após recarregar', () => {
    const s = useListsStore()
    const l = s.createList('Persistente')
    s.addProduct(l.id, product('p-cafe-em-po'))
    s.flush()
    setActivePinia(createPinia())
    const s2 = useListsStore()
    s2.hydrate()
    expect(s2.find(l.id)?.items[0]?.name).toBe('Café em pó')
  })

  it('trata JSON corrompido preservando cópia', () => {
    localStorage.setItem(StorageKeys.lists, '{isso não é json')
    expect(storageService.load(StorageKeys.lists, isListArray).status).toBe('corrupted')
    expect(localStorage.getItem(`${StorageKeys.lists}:corrupted`)).toBe('{isso não é json')
    const s = useListsStore()
    expect(s.hydrate()).toBe(true)
    expect(s.lists).toEqual([])
  })

  it('rejeita schema inválido', () => {
    localStorage.setItem(StorageKeys.lists, JSON.stringify({ version: 1, data: [{ id: 1 }] }))
    expect(storageService.load(StorageKeys.lists, isListArray).status).toBe('corrupted')
  })
})

describe('compartilhamento WhatsApp', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('gera mensagem agrupada com resumo e URL codificada', () => {
    const s = useListsStore()
    const l = s.createList('Compras do mês')
    s.addProduct(l.id, product('p-banana'))
    const det = s.addProduct(l.id, product('p-detergente'))!
    s.togglePurchased(l.id, det.id)
    const msg = buildShareMessage(s.find(l.id)!, DEFAULT_CATEGORIES)
    expect(msg).toContain('🛒 *COMPRAS DO MÊS*')
    expect(msg).toContain('🥦 *HORTIFRUTI*\n☐ Banana — 2 kg')
    expect(msg).toContain('☑ Detergente — 3 unidades')
    expect(msg).toContain('Total: 2 itens diferentes')
    expect(msg).toContain('Comprados: 1')
    expect(msg).toContain('Pendentes: 1')
    const url = whatsappUrl(msg)
    expect(url.startsWith('https://wa.me/?text=')).toBe(true)
    expect(decodeURIComponent(url.slice('https://wa.me/?text='.length))).toBe(msg)
  })
})

describe('backup', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('exporta e importa com validação', () => {
    const s = useListsStore()
    const l = s.createList('Backup')
    s.addProduct(l.id, product('p-ovos'))
    const json = serializeBackup(createBackup({ lists: s.lists, customProducts: [], customCategories: [], favorites: ['p-ovos'], settings: defaultSettings(), activeListId: l.id }))
    const r = parseBackup(json)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.lists[0]!.items[0]!.productId).toBe('p-ovos')
    expect(parseBackup('xx').ok).toBe(false)
    expect(parseBackup('{"app":"outro"}').ok).toBe(false)
  })
})
