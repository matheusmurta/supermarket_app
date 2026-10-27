import { useRouter } from 'vue-router'
import type { ListItem, Product } from '@/models'
import { useListsStore } from '@/stores/lists'
import { useToastStore } from '@/stores/toast'
import { monthName } from '@/utils/text'

/** Ações de lista com feedback (toast) e desfazer — mantém a lógica fora das views */
export function useListActions() {
  const lists = useListsStore()
  const toast = useToastStore()
  const router = useRouter()

  /** Garante uma lista ativa; cria a do mês atual se necessário */
  function ensureActiveList(): string {
    if (lists.activeList) return lists.activeList.id
    const d = new Date()
    return lists.createList(`Compras de ${monthName(d.getMonth() + 1)}`, { month: d.getMonth() + 1, year: d.getFullYear() }).id
  }

  function addProduct(product: Product) {
    const id = ensureActiveList()
    lists.addProduct(id, product)
    toast.show(`${product.name} adicionado`, {}, 1800)
  }

  function decrementProduct(productId: string) {
    const listId = lists.activeListId
    if (!listId) return
    const item = lists.itemFor(listId, productId)
    if (item && !lists.stepQuantity(listId, item.id, -1)) removeItem(listId, item)
  }

  function removeItem(listId: string, item: ListItem) {
    const removed = lists.removeItem(listId, item.id)
    if (!removed) return
    toast.show(`${removed.name} removido`, { type: 'info', actionLabel: 'Desfazer', action: () => lists.restoreItem(listId, removed) })
  }

  function togglePurchased(listId: string, item: ListItem) {
    lists.togglePurchased(listId, item.id)
    const now = item.purchased
    toast.show(now ? `${item.name} comprado ✓` : `${item.name} voltou para pendentes`, {
      actionLabel: 'Desfazer',
      action: () => lists.togglePurchased(listId, item.id),
    }, 2500)
  }

  function deleteList(id: string) {
    const removed = lists.deleteList(id)
    if (removed) toast.show(`Lista "${removed.name}" excluída`, { type: 'info', actionLabel: 'Desfazer', action: () => lists.restoreList(removed) }, 5000)
  }

  function duplicateNextMonth(id: string) {
    const src = lists.find(id)
    if (!src) return
    const base = src.month && src.year ? new Date(src.year, src.month, 1) : new Date()
    const m = base.getMonth() + 1
    const copy = lists.duplicateList(id, `Compras de ${monthName(m)}`, m, base.getFullYear())
    if (copy) {
      toast.show(`Lista duplicada: ${copy.name}`)
      router.push(`/listas/${copy.id}`)
    }
  }

  return { ensureActiveList, addProduct, decrementProduct, removeItem, togglePurchased, deleteList, duplicateNextMonth }
}
