import type { Product } from '@/models'
import { DEFAULT_PRODUCTS } from './products'

/** Lista de exemplo oferecida no primeiro acesso */
const SAMPLE_IDS = [
  'p-arroz',
  'p-feijao-carioca',
  'p-cafe',
  'p-leite-integral',
  'p-ovos',
  'p-banana',
  'p-tomate',
  'p-cebola',
  'p-peito-de-frango',
  'p-carne-moida',
  'p-oleo-de-soja',
  'p-acucar',
  'p-pao-de-forma',
  'p-detergente',
  'p-sabao-em-po',
  'p-papel-higienico',
  'p-creme-dental',
]

export function sampleProducts(): Product[] {
  const map = new Map(DEFAULT_PRODUCTS.map((p) => [p.id, p]))
  return SAMPLE_IDS.map((id) => map.get(id)).filter((p): p is Product => !!p)
}
