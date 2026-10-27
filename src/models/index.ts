export const PRODUCT_UNITS = [
  'un',
  'pct',
  'cx',
  'gf',
  'L',
  'mL',
  'kg',
  'g',
  'dz',
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

export interface Category {
  id: string
  name: string
  /** Rótulo curto para filtros no mobile */
  short?: string
  emoji: string
  isCustom: boolean
  /** Ordem de exibição */
  order: number
}

export interface Product {
  id: string
  name: string
  categoryId: string
  defaultUnit: ProductUnit
  suggestedQuantity: number
  icon?: string
  imageUrl?: string
  /** Código de barras (EAN) opcional para integração com Open Food Facts */
  barcode?: string
  keywords: string[]
  isCustom: boolean
}

export interface ListItem {
  id: string
  productId: string
  /** Nome copiado do produto no momento da adição (sobrevive à exclusão do produto) */
  name: string
  categoryId: string
  icon?: string
  quantity: number
  unit: ProductUnit
  /** Tamanho da embalagem, ex.: "5 kg", "1 L" — não confundir com quantidade */
  packageSize?: string
  notes?: string
  /** Preço estimado unitário (opcional, informado pelo usuário) */
  price?: number
  purchased: boolean
  /** Posição para ordenação manual */
  position: number
}

export type ListStatus = 'active' | 'archived'

export interface ShoppingList {
  id: string
  name: string
  month?: number
  year?: number
  createdAt: string
  updatedAt: string
  status: ListStatus
  isTemplate: boolean
  items: ListItem[]
}

export type SortMode = 'category' | 'alphabetical' | 'manual' | 'pending'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface Settings {
  theme: ThemeMode
  sortMode: SortMode
  repositoryUrl: string
}

export interface BackupData {
  app: 'meumercado'
  schemaVersion: number
  exportedAt: string
  lists: ShoppingList[]
  customProducts: Product[]
  customCategories: Category[]
  favorites: string[]
  settings: Settings
  activeListId: string | null
}
