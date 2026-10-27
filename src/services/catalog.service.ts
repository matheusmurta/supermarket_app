import type { Product } from '@/models'
import { normalize } from '@/utils/text'

export interface SearchOptions {
  query?: string
  categoryId?: string | null
}

interface Indexed {
  product: Product
  haystack: string
  nameNorm: string
}

/** Índice de busca em memória — nenhuma requisição remota. */
export function buildIndex(products: Product[]): Indexed[] {
  return products.map((product) => ({
    product,
    nameNorm: normalize(product.name),
    haystack: normalize([product.name, ...product.keywords].join(' ')),
  }))
}

export function searchProducts(index: Indexed[], { query = '', categoryId }: SearchOptions): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const filtered = index.filter(
    (e) =>
      (!categoryId || e.product.categoryId === categoryId) &&
      terms.every((t) => e.haystack.includes(t)),
  )
  if (terms.length) {
    const first = terms[0] ?? ''
    // Prioriza nomes que começam com o termo
    filtered.sort((a, b) => {
      const sa = a.nameNorm.startsWith(first) ? 0 : 1
      const sb = b.nameNorm.startsWith(first) ? 0 : 1
      return sa - sb || a.nameNorm.localeCompare(b.nameNorm)
    })
  }
  return filtered.map((e) => e.product)
}

/** Verifica se já existe um produto com o mesmo nome normalizado */
export function findDuplicate(products: Product[], name: string, ignoreId?: string): Product | undefined {
  const n = normalize(name)
  return products.find((p) => p.id !== ignoreId && normalize(p.name) === n)
}
