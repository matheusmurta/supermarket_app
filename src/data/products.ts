import type { Product } from '@/models'
import { slugify } from '@/utils/text'
import { fresh } from './catalog/fresh'
import { pantry } from './catalog/pantry'
import { grocery } from './catalog/grocery'
import { household } from './catalog/household'
import type { CatalogSection } from './catalog/types'

const sections: CatalogSection[] = [fresh, pantry, grocery, household]

/** Catálogo estático (offline). IDs estáveis derivados do nome: p-<slug>. */
export const DEFAULT_PRODUCTS: Product[] = sections.flatMap((section) =>
  Object.entries(section).flatMap(([categoryId, rows]) =>
    rows.map(([name, defaultUnit, suggestedQuantity, icon, kw]) => ({
      id: `p-${slugify(name)}`,
      name,
      categoryId,
      defaultUnit,
      suggestedQuantity,
      icon,
      keywords: kw ? kw.split(' ') : [],
      isCustom: false,
    })),
  ),
)
