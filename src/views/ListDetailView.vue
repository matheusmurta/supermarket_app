<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Plus, RotateCcw, Share2 } from 'lucide-vue-next'
import type { ListItem, SortMode } from '@/models'
import { useListsStore } from '@/stores/lists'
import { useCatalogStore } from '@/stores/catalog'
import { useSettingsStore } from '@/stores/settings'
import { computeStats } from '@/stores/stats'
import { useListActions } from '@/composables/useListActions'
import { formatCurrency } from '@/utils/text'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ShoppingProgress from '@/components/lists/ShoppingProgress.vue'
import CategoryAccordion from '@/components/lists/CategoryAccordion.vue'
import ShoppingListItem from '@/components/lists/ShoppingListItem.vue'
import ShareListDialog from '@/components/lists/ShareListDialog.vue'
import ItemEditDialog from '@/components/lists/ItemEditDialog.vue'

const props = defineProps<{ id: string }>()
const lists = useListsStore()
const catalog = useCatalogStore()
const settings = useSettingsStore()
const actions = useListActions()
const router = useRouter()

const list = computed(() => lists.find(props.id))
const stats = computed(() => computeStats(list.value))
const sort = computed<SortMode>({ get: () => settings.settings.sortMode, set: (v) => (settings.settings.sortMode = v) })
const sharing = ref(false)
const resetOpen = ref(false)
const editItem = ref<ListItem | null>(null)
const editOpen = ref(false)

const byPosition = computed(() => [...(list.value?.items ?? [])].sort((a, b) => a.position - b.position))
const groups = computed(() => {
  const known = new Set(catalog.categories.map((c) => c.id))
  return catalog.categories
    .map((cat) => {
      const items = byPosition.value
        .filter((i) => i.categoryId === cat.id || (cat.id === 'outros' && !known.has(i.categoryId)))
        // pendentes primeiro, comprados descem para o fim do grupo
        .sort((a, b) => Number(a.purchased) - Number(b.purchased) || a.position - b.position)
      return { cat, items, done: items.filter((i) => i.purchased).length }
    })
    .filter((g) => g.items.length)
    // grupos concluídos vão para o final
    .sort((a, b) => Number(a.done === a.items.length) - Number(b.done === b.items.length))
})
const flat = computed(() => {
  const items = [...byPosition.value]
  if (sort.value === 'alphabetical') return items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  if (sort.value === 'pending') return items.sort((a, b) => Number(a.purchased) - Number(b.purchased) || a.position - b.position)
  return items
})

function dec(item: ListItem) {
  if (!lists.stepQuantity(props.id, item.id, -1)) actions.removeItem(props.id, item)
}
function edit(item: ListItem) {
  editItem.value = item
  editOpen.value = true
}
function move(item: ListItem, delta: number) {
  const idx = flat.value.findIndex((i) => i.id === item.id)
  lists.moveItem(props.id, item.id, idx + delta)
}
function goCatalog() {
  lists.setActive(props.id)
  router.push('/catalogo')
}
function onRemove(i: ListItem) {
  actions.removeItem(props.id, i)
}
const sortOptions: Array<{ v: SortMode; l: string }> = [
  { v: 'category', l: 'Categoria' },
  { v: 'alphabetical', l: 'A–Z' },
  { v: 'pending', l: 'Pendentes' },
  { v: 'manual', l: 'Manual' },
]
</script>

<template>
  <div v-if="list">
    <AppHeader :title="list.name" back>
      <template #actions>
        <button type="button" class="tap grid place-items-center rounded-full text-brand disabled:opacity-40 dark:text-green-400" aria-label="Compartilhar lista" data-testid="share-btn" :disabled="!list.items.length" @click="sharing = true"><Share2 :size="22" /></button>
      </template>
      <div class="px-4 pb-3">
        <ShoppingProgress :stats="stats" />
        <div class="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 py-1" role="radiogroup" aria-label="Ordenar itens">
          <button v-for="o in sortOptions" :key="o.v" type="button" role="radio" :aria-checked="sort === o.v" class="chip min-h-[36px]" :class="sort === o.v ? 'bg-brand text-white' : 'bg-white shadow-card dark:bg-[#13221B]'" @click="sort = o.v">{{ o.l }}</button>
        </div>
      </div>
    </AppHeader>

    <div class="px-4">
      <div v-if="list.id !== lists.activeListId" class="card mb-3 flex items-center gap-3 p-3 text-sm">
        <span class="flex-1">Esta não é a lista ativa.</span>
        <AppButton size="sm" variant="secondary" @click="lists.setActive(list.id)"><CheckCircle2 :size="16" /> Tornar ativa</AppButton>
      </div>

      <EmptyState v-if="!list.items.length" emoji="🥕" title="Lista vazia" description="Adicione produtos do catálogo com poucos toques.">
        <AppButton @click="goCatalog"><Plus :size="18" /> Adicionar produtos</AppButton>
      </EmptyState>

      <div v-else-if="sort === 'category'" class="flex flex-col gap-3">
        <CategoryAccordion v-for="g in groups" :key="g.cat.id" :category="g.cat" :done="g.done" :total="g.items.length">
          <TransitionGroup tag="ul" name="list" class="relative divide-y divide-slate-100 dark:divide-white/5">
            <ShoppingListItem v-for="item in g.items" :key="item.id" :item="item"
              @toggle="actions.togglePurchased(list.id, item)" @inc="lists.stepQuantity(list.id, item.id, 1)" @dec="dec(item)" @edit="edit(item)" @remove="onRemove(item)" />
          </TransitionGroup>
        </CategoryAccordion>
      </div>

      <div v-else class="card">
        <p v-if="sort === 'manual'" class="muted px-4 pt-3 text-xs">Use as setas para reordenar (toque ou teclado).</p>
        <TransitionGroup tag="ul" name="list" class="relative divide-y divide-slate-100 dark:divide-white/5">
          <ShoppingListItem v-for="(item, idx) in flat" :key="item.id" :item="item" :reorderable="sort === 'manual'" :is-first="idx === 0" :is-last="idx === flat.length - 1"
            @toggle="actions.togglePurchased(list.id, item)" @inc="lists.stepQuantity(list.id, item.id, 1)" @dec="dec(item)" @edit="edit(item)" @remove="onRemove(item)"
            @up="move(item, -1)" @down="move(item, 1)" />
        </TransitionGroup>
      </div>

      <section v-if="list.items.length" class="card mt-4 grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4" aria-label="Resumo">
        <div><p class="muted text-xs">Itens diferentes</p><p class="text-lg font-extrabold">{{ stats.distinct }}</p></div>
        <div><p class="muted text-xs">Qtd. de produtos</p><p class="text-lg font-extrabold">{{ stats.totalQuantity }}</p></div>
        <div><p class="muted text-xs">Categorias pendentes</p><p class="text-lg font-extrabold">{{ stats.pendingCategories.length }}</p></div>
        <div v-if="stats.hasPrices"><p class="muted text-xs">Gasto estimado</p><p class="text-lg font-extrabold text-brand dark:text-green-400">{{ formatCurrency(stats.estimatedTotal) }}</p></div>
      </section>

      <div v-if="list.items.length" class="mt-4 flex flex-col gap-2 sm:flex-row">
        <AppButton block @click="goCatalog"><Plus :size="18" /> Adicionar produtos</AppButton>
        <AppButton variant="ghost" block :disabled="!stats.purchased" @click="resetOpen = true"><RotateCcw :size="18" /> Desmarcar todos</AppButton>
      </div>
    </div>

    <ShareListDialog v-model:open="sharing" :list="list" />
    <ItemEditDialog v-model:open="editOpen" :list-id="list.id" :item="editItem" @remove="onRemove" />
    <ConfirmDialog v-model:open="resetOpen" title="Desmarcar todos?" message="Todos os itens voltarão a ficar pendentes." confirm-label="Desmarcar" :danger="false" @confirm="lists.resetPurchased(list.id)" />
  </div>
  <EmptyState v-else emoji="🤔" title="Lista não encontrada" description="Ela pode ter sido excluída.">
    <AppButton @click="router.push('/listas')">Ver minhas listas</AppButton>
  </EmptyState>
</template>
