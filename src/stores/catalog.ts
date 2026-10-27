import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Category, Product } from '@/models'
import { DEFAULT_CATEGORIES } from '@/data/categories'
import { DEFAULT_PRODUCTS } from '@/data/products'
import { buildIndex, findDuplicate, searchProducts } from '@/services/catalog.service'
import { storageService, StorageKeys } from '@/services/storage.service'
import { isCategoryArray, isProductArray, isStringArray } from '@/services/validators'
import { generateId, normalize, slugify } from '@/utils/text'

export type ProductInput = Pick<Product, 'name' | 'categoryId' | 'defaultUnit' | 'suggestedQuantity'> &
  Partial<Pick<Product, 'icon' | 'imageUrl' | 'barcode' | 'keywords'>>

export const useCatalogStore = defineStore('catalog', () => {
  const customProducts = ref<Product[]>([])
  const customCategories = ref<Category[]>([])
  const favorites = ref<string[]>([])

  const categories = computed<Category[]>(() =>
    [...DEFAULT_CATEGORIES, ...customCategories.value].sort((a, b) => a.order - b.order),
  )
  const categoryMap = computed(() => new Map(categories.value.map((c) => [c.id, c])))
  const products = computed<Product[]>(() => [...DEFAULT_PRODUCTS, ...customProducts.value])
  const productMap = computed(() => new Map(products.value.map((p) => [p.id, p])))
  const index = computed(() => buildIndex(products.value))
  const favoriteSet = computed(() => new Set(favorites.value))

  function hydrate() {
    const p = storageService.load(StorageKeys.customProducts, isProductArray)
    if (p.status === 'ok') customProducts.value = p.data
    const c = storageService.load(StorageKeys.customCategories, isCategoryArray)
    if (c.status === 'ok') customCategories.value = c.data
    const f = storageService.load(StorageKeys.favorites, isStringArray)
    if (f.status === 'ok') favorites.value = f.data
    return [p, c, f].some((r) => r.status === 'corrupted')
  }

  function search(query: string, categoryId: string | null = null) {
    return searchProducts(index.value, { query, categoryId })
  }

  function getCategory(id: string): Category {
    return categoryMap.value.get(id) ?? categoryMap.value.get('outros')!
  }

  function toggleFavorite(productId: string) {
    favorites.value = favoriteSet.value.has(productId)
      ? favorites.value.filter((id) => id !== productId)
      : [...favorites.value, productId]
  }

  function addProduct(input: ProductInput): { ok: true; product: Product } | { ok: false; error: string } {
    const name = input.name.trim()
    if (!name) return { ok: false, error: 'Informe o nome do produto.' }
    if (findDuplicate(products.value, name)) return { ok: false, error: 'Já existe um produto com esse nome.' }
    const product: Product = {
      id: `c-${generateId()}`,
      name,
      categoryId: input.categoryId,
      defaultUnit: input.defaultUnit,
      suggestedQuantity: input.suggestedQuantity > 0 ? input.suggestedQuantity : 1,
      icon: input.icon || getCategory(input.categoryId).emoji,
      imageUrl: input.imageUrl,
      barcode: input.barcode,
      keywords: input.keywords ?? [],
      isCustom: true,
    }
    customProducts.value = [...customProducts.value, product]
    return { ok: true, product }
  }

  function updateProduct(id: string, input: ProductInput): { ok: boolean; error?: string } {
    const existing = customProducts.value.find((p) => p.id === id)
    if (!existing) return { ok: false, error: 'Somente produtos personalizados podem ser editados.' }
    const name = input.name.trim()
    if (!name) return { ok: false, error: 'Informe o nome do produto.' }
    if (findDuplicate(products.value, name, id)) return { ok: false, error: 'Já existe um produto com esse nome.' }
    customProducts.value = customProducts.value.map((p) => (p.id === id ? { ...p, ...input, name } : p))
    return { ok: true }
  }

  function removeProduct(id: string) {
    customProducts.value = customProducts.value.filter((p) => p.id !== id)
    favorites.value = favorites.value.filter((f) => f !== id)
  }

  function addCategory(name: string, emoji: string): { ok: boolean; error?: string } {
    const n = name.trim()
    if (!n) return { ok: false, error: 'Informe o nome da categoria.' }
    if (categories.value.some((c) => normalize(c.name) === normalize(n)))
      return { ok: false, error: 'Categoria já existe.' }
    let id = `cat-${slugify(n)}`
    if (categoryMap.value.has(id)) id = `${id}-${generateId().slice(0, 6)}`
    const order = Math.max(...categories.value.map((c) => c.order)) + 1
    customCategories.value = [...customCategories.value, { id, name: n, emoji: emoji.trim() || '🏷️', isCustom: true, order }]
    return { ok: true }
  }

  /** Remove categoria personalizada; produtos dela vão para "Outros" */
  function removeCategory(id: string) {
    customCategories.value = customCategories.value.filter((c) => c.id !== id)
    customProducts.value = customProducts.value.map((p) => (p.categoryId === id ? { ...p, categoryId: 'outros' } : p))
  }

  function replaceAll(data: { customProducts: Product[]; customCategories: Category[]; favorites: string[] }) {
    customProducts.value = data.customProducts
    customCategories.value = data.customCategories
    favorites.value = data.favorites
  }

  watch(customProducts, (v) => storageService.save(StorageKeys.customProducts, v))
  watch(customCategories, (v) => storageService.save(StorageKeys.customCategories, v))
  watch(favorites, (v) => storageService.save(StorageKeys.favorites, v))

  return {
    customProducts,
    customCategories,
    favorites,
    favoriteSet,
    categories,
    products,
    productMap,
    hydrate,
    search,
    getCategory,
    toggleFavorite,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    removeCategory,
    replaceAll,
  }
})
