import type { Category } from '@/models'

const raw: Array<[string, string, string, string]> = [
  ['carnes', 'Carnes, aves e peixes', '🥩', 'Carnes'],
  ['hortifruti', 'Hortifruti — verduras e legumes', '🥦', 'Hortifruti'],
  ['frutas', 'Frutas', '🍎', 'Frutas'],
  ['laticinios', 'Laticínios, ovos e frios', '🥛', 'Laticínios'],
  ['padaria', 'Padaria e café da manhã', '🥖', 'Padaria'],
  ['mercearia', 'Mercearia e alimentos básicos', '🌾', 'Mercearia'],
  ['temperos', 'Temperos e molhos', '🧂', 'Temperos'],
  ['enlatados', 'Enlatados e conservas', '🥫', 'Enlatados'],
  ['congelados', 'Congelados e alimentos práticos', '🧊', 'Congelados'],
  ['doces', 'Biscoitos, doces e sobremesas', '🍫', 'Doces'],
  ['bebidas', 'Bebidas', '🧃', 'Bebidas'],
  ['higiene', 'Higiene pessoal', '🧴', 'Higiene'],
  ['limpeza', 'Produtos de limpeza', '🧽', 'Limpeza'],
  ['utilidades', 'Utilidades domésticas', '🧻', 'Utilidades'],
  ['pet', 'Pets', '🐾', 'Pets'],
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
