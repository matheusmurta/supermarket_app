import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import ProductQuantitySelector from '@/components/products/ProductQuantitySelector.vue'
import ShoppingProgress from '@/components/lists/ShoppingProgress.vue'
import { computeStats } from '@/stores/stats'

describe('componentes', () => {
  it('ProductQuantitySelector formata e emite eventos', async () => {
    const { getByText, getByLabelText, emitted } = render(ProductQuantitySelector, {
      props: { quantity: 2, unit: 'pct', name: 'Arroz', packageSize: '5 kg' },
    })
    getByText('2 pacotes de 5 kg')
    await fireEvent.click(getByLabelText('Aumentar Arroz'))
    await fireEvent.click(getByLabelText('Diminuir Arroz'))
    expect(emitted().inc).toHaveLength(1)
    expect(emitted().dec).toHaveLength(1)
  })

  it('ShoppingProgress mostra percentual', () => {
    const stats = computeStats({
      id: '1', name: 'x', createdAt: '', updatedAt: '', status: 'active', isTemplate: false,
      items: [
        { id: 'a', productId: 'a', name: 'A', categoryId: 'outros', quantity: 1, unit: 'un', purchased: true, position: 0 },
        { id: 'b', productId: 'b', name: 'B', categoryId: 'outros', quantity: 1, unit: 'un', purchased: false, position: 1 },
      ],
    })
    const { getByRole, getByText } = render(ShoppingProgress, { props: { stats } })
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50')
    getByText('1 de 2 itens comprados')
  })
})
