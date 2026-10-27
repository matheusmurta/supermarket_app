import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ListItem, Product, ShoppingList } from '@/models'
import { storageService, StorageKeys } from '@/services/storage.service'
import { isListArray, isNullableString } from '@/services/validators'
import { generateId } from '@/utils/text'
import { roundQty, unitStep } from '@/utils/units'

export { computeStats, type ListStats } from './stats'

export const useListsStore = defineStore('lists', () => {
  const lists = ref<ShoppingList[]>([])
  const activeListId = ref<string | null>(null)
  const saveError = ref(false)

  const activeList = computed(() => lists.value.find((l) => l.id === activeListId.value) ?? null)
  const activeLists = computed(() => lists.value.filter((l) => l.status === 'active'))
  const archivedLists = computed(() => lists.value.filter((l) => l.status === 'archived'))
  const recentLists = computed(() => [...lists.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5))
  const template = computed(() => lists.value.find((l) => l.isTemplate) ?? null)

  const productFrequency = computed(() => {
    const freq = new Map<string, number>()
    for (const l of lists.value) for (const i of l.items) freq.set(i.productId, (freq.get(i.productId) ?? 0) + 1)
    return freq
  })
  const categoryFrequency = computed(() => {
    const freq = new Map<string, number>()
    for (const l of lists.value) for (const i of l.items) freq.set(i.categoryId, (freq.get(i.categoryId) ?? 0) + 1)
    return [...freq.entries()].sort((a, b) => b[1] - a[1])
  })

  function dedupe(data: ShoppingList[]): ShoppingList[] {
    const seen = new Set<string>()
    return data.map((l) => {
      const out = seen.has(l.id) ? { ...l, id: generateId() } : l
      seen.add(out.id)
      return out
    })
  }

  function hydrate(): boolean {
    const r = storageService.load(StorageKeys.lists, isListArray)
    if (r.status === 'ok') lists.value = dedupe(r.data)
    const a = storageService.load(StorageKeys.activeList, isNullableString)
    if (a.status === 'ok' && lists.value.some((l) => l.id === a.data)) activeListId.value = a.data
    else activeListId.value = lists.value.find((l) => l.status === 'active')?.id ?? null
    return r.status === 'corrupted' || a.status === 'corrupted'
  }

  const now = () => new Date().toISOString()
  const find = (id: string) => lists.value.find((l) => l.id === id)
  const findItem = (listId: string, itemId: string) => find(listId)?.items.find((i) => i.id === itemId)
  const touch = (l: ShoppingList) => (l.updatedAt = now())

  function createList(name: string, opts: { month?: number; year?: number; items?: ListItem[] } = {}): ShoppingList {
    lists.value.push({
      id: generateId(),
      name: name.trim() || 'Nova lista',
      month: opts.month,
      year: opts.year,
      createdAt: now(),
      updatedAt: now(),
      status: 'active',
      isTemplate: false,
      items: opts.items ?? [],
    })
    const list = lists.value[lists.value.length - 1]!
    activeListId.value = list.id
    return list
  }

  function updateList(id: string, patch: { name?: string; month?: number; year?: number }) {
    const l = find(id)
    if (!l) return
    if (patch.name !== undefined) l.name = patch.name.trim() || l.name
    if ('month' in patch) l.month = patch.month
    if ('year' in patch) l.year = patch.year
    touch(l)
  }

  function deleteList(id: string): ShoppingList | undefined {
    const idx = lists.value.findIndex((l) => l.id === id)
    if (idx < 0) return
    const [removed] = lists.value.splice(idx, 1)
    if (activeListId.value === id) activeListId.value = activeLists.value[0]?.id ?? null
    return removed
  }

  function restoreList(list: ShoppingList) {
    if (!find(list.id)) lists.value.push(list)
  }

  function duplicateList(id: string, name?: string, month?: number, year?: number) {
    const src = find(id)
    if (!src) return
    const items = src.items.map((i) => ({ ...i, id: generateId(), purchased: false }))
    return createList(name ?? `${src.name} (cópia)`, { month: month ?? src.month, year: year ?? src.year, items })
  }

  function setArchived(id: string, archived: boolean) {
    const l = find(id)
    if (!l) return
    l.status = archived ? 'archived' : 'active'
    touch(l)
    if (archived && activeListId.value === id) activeListId.value = activeLists.value[0]?.id ?? null
  }

  function setActive(id: string) {
    const l = find(id)
    if (!l) return
    l.status = 'active'
    activeListId.value = id
  }

  function setTemplate(id: string) {
    lists.value.forEach((l) => (l.isTemplate = l.id === id ? !l.isTemplate : false))
  }

  // ---- Itens ----
  function itemFor(listId: string, productId: string) {
    return find(listId)?.items.find((i) => i.productId === productId)
  }

  /** Adiciona produto; se já existir, soma a quantidade (prevenção de duplicidade) */
  function addProduct(listId: string, product: Product, quantity = product.suggestedQuantity): ListItem | undefined {
    const l = find(listId)
    if (!l) return
    const existing = l.items.find((i) => i.productId === product.id)
    if (existing) {
      existing.quantity = roundQty(existing.quantity + quantity)
      touch(l)
      return existing
    }
    l.items.push({
      id: generateId(),
      productId: product.id,
      name: product.name,
      categoryId: product.categoryId,
      icon: product.icon,
      quantity,
      unit: product.defaultUnit,
      purchased: false,
      position: l.items.length ? Math.max(...l.items.map((i) => i.position)) + 1 : 0,
    })
    touch(l)
    return l.items[l.items.length - 1]
  }

  function updateItem(listId: string, itemId: string, patch: Partial<Omit<ListItem, 'id' | 'productId'>>) {
    const l = find(listId)
    const it = findItem(listId, itemId)
    if (!l || !it) return
    Object.assign(it, patch)
    if (patch.quantity !== undefined) it.quantity = Math.max(0, roundQty(patch.quantity))
    touch(l)
  }

  /** Retorna false se a quantidade chegaria a 0 (UI decide remover) */
  function stepQuantity(listId: string, itemId: string, dir: 1 | -1): boolean {
    const it = findItem(listId, itemId)
    if (!it) return false
    const next = roundQty(it.quantity + dir * unitStep(it.unit))
    if (next <= 0) return false
    updateItem(listId, itemId, { quantity: next })
    return true
  }

  function togglePurchased(listId: string, itemId: string) {
    const it = findItem(listId, itemId)
    if (it) updateItem(listId, itemId, { purchased: !it.purchased })
  }

  function removeItem(listId: string, itemId: string): ListItem | undefined {
    const l = find(listId)
    if (!l) return
    const idx = l.items.findIndex((i) => i.id === itemId)
    if (idx < 0) return
    const [removed] = l.items.splice(idx, 1)
    touch(l)
    return removed
  }

  function restoreItem(listId: string, item: ListItem) {
    const l = find(listId)
    if (l && !l.items.some((i) => i.id === item.id)) {
      l.items.push(item)
      touch(l)
    }
  }

  function moveItem(listId: string, itemId: string, toIndex: number) {
    const l = find(listId)
    if (!l) return
    const ordered = [...l.items].sort((a, b) => a.position - b.position)
    const from = ordered.findIndex((i) => i.id === itemId)
    if (from < 0 || toIndex < 0 || toIndex >= ordered.length || from === toIndex) return
    const [moved] = ordered.splice(from, 1)
    ordered.splice(toIndex, 0, moved!)
    ordered.forEach((i, idx) => (i.position = idx))
    touch(l)
  }

  function resetPurchased(listId: string) {
    const l = find(listId)
    if (!l) return
    l.items.forEach((i) => (i.purchased = false))
    touch(l)
  }

  function replaceAll(data: ShoppingList[], active: string | null) {
    lists.value = dedupe(data)
    activeListId.value = lists.value.some((l) => l.id === active) ? active : (lists.value[0]?.id ?? null)
  }

  // ---- Persistência (debounce + flush ao sair) ----
  function flush() {
    saveError.value = !storageService.save(StorageKeys.lists, lists.value)
  }
  const persist = useDebounceFn(flush, 250)
  watch(lists, () => void persist(), { deep: true })
  watch(activeListId, (v) => storageService.save(StorageKeys.activeList, v))
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }

  return {
    lists, activeListId, activeList, activeLists, archivedLists, recentLists, template,
    productFrequency, categoryFrequency, saveError,
    hydrate, flush, find, createList, updateList, deleteList, restoreList, duplicateList,
    setArchived, setActive, setTemplate, itemFor, addProduct, updateItem, stepQuantity,
    togglePurchased, removeItem, restoreItem, moveItem, resetPurchased, replaceAll,
  }
})
