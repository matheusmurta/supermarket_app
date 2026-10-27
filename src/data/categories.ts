import type { Category } from '@/models'

const raw: Array<[string, string, string, string]> = [
  ['hortifruti', 'Hortifruti', '🥦', 'Hortifruti'],
  ['carnes', 'Açougue e carnes', '🥩', 'Carnes'],
  ['aves-peixes', 'Aves e peixes', '🐟', 'Aves e peixes'],
  ['graos', 'Arroz, feijão e grãos', '🌾', 'Grãos'],
  ['massas', 'Massas e molhos', '🍝', 'Massas'],
  ['laticinios', 'Laticínios e ovos', '🥛', 'Laticínios'],
  ['padaria', 'Padaria', '🥖', 'Padaria'],
  ['frios', 'Frios e embutidos', '🧀', 'Frios'],
  ['matinais', 'Café e matinais', '☕', 'Café'],
  ['bebidas', 'Bebidas', '🧃', 'Bebidas'],
  ['congelados', 'Congelados', '🧊', 'Congelados'],
  ['enlatados', 'Enlatados e conservas', '🥫', 'Enlatados'],
  ['temperos', 'Temperos e condimentos', '🧂', 'Temperos'],
  ['oleos', 'Óleos e azeites', '🌻', 'Óleos'],
  ['limpeza', 'Limpeza da casa', '🧽', 'Limpeza'],
  ['lavanderia', 'Lavanderia', '🧺', 'Lavanderia'],
  ['higiene', 'Higiene pessoal', '🧴', 'Higiene'],
  ['papel', 'Papel e descartáveis', '🧻', 'Papel'],
  ['pet', 'Pet shop', '🐾', 'Pet'],
  ['outros', 'Outros', '🛍️', 'Outros'],
]

export const DEFAULT_CATEGORIES: Category[] = raw.map(([id, name, emoji, short], order) => ({
  id,
  name,
  short,
  emoji,
  isCustom: false,
  order,
}))
