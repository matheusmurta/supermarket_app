import type { ProductUnit } from '@/models'

/** [nome, unidade padrão, quantidade sugerida, emoji, palavras-chave extras separadas por espaço] */
export type CatalogRow = [string, ProductUnit, number, string, string?]
export type CatalogSection = Record<string, CatalogRow[]>
