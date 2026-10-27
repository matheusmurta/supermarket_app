<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { refDebounced } from '@vueuse/core'
import { Plus } from 'lucide-vue-next'
import type { Product } from '@/models'
import { useCatalogStore } from '@/stores/catalog'
import { useListsStore } from '@/stores/lists'
import { useListActions } from '@/composables/useListActions'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductSearch from '@/components/products/ProductSearch.vue'
import ProductCategory from '@/components/products/ProductCategory.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import ProductFormDialog from '@/components/products/ProductFormDialog.vue'

const catalog = useCatalogStore()
const lists = useListsStore()
const actions = useListActions()
const route = useRoute()

const query = ref('')
const debounced = refDebounced(query, 120)
const filter = ref<string | null>(typeof route.query.cat === 'string' ? route.query.cat : null)
watch(() => route.query.cat, (c) => (filter.value = typeof c === 'string' ? c : null))
const PAGE = 60
const limit = ref(PAGE)
watch([debounced, filter], () => (limit.value = PAGE))

const extra = [
  { id: '_fav', label: 'Favoritos', emoji: '❤️' },
  { id: '_freq', label: 'Frequentes', emoji: '⭐' },
]

const counts = computed(() => {
  const c: Record<string, number> = { '': catalog.products.length, _fav: catalog.favorites.length }
  for (const p of catalog.products) c[p.categoryId] = (c[p.categoryId] ?? 0) + 1
  return c
})

const results = computed<Product[]>(() => {
  const f = filter.value
  if (f === '_fav') return catalog.search(debounced.value).filter((p) => catalog.favoriteSet.has(p.id))
  if (f === '_freq') {
    const freq = lists.productFrequency
    return catalog.search(debounced.value).filter((p) => freq.has(p.id)).sort((a, b) => (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0)).slice(0, 40)
  }
  return catalog.search(debounced.value, f)
})
const visible = computed(() => results.value.slice(0, limit.value))
const subtitle = computed(() => (lists.activeList ? `Adicionando em: ${lists.activeList.name}` : 'Uma lista será criada ao adicionar'))

const formOpen = ref(false)
const editing = ref<Product | null>(null)
function openNew() { editing.value = null; formOpen.value = true }
function openEdit(p: Product) { editing.value = p; formOpen.value = true }
/** Produtos já adicionados à lista ativa, na ordem em que foram incluídos */
const selected = computed<Product[]>(() => {
  const items = lists.activeList?.items ?? []
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((i) => catalog.productMap.get(i.productId))
    .filter((p): p is Product => !!p)
})
const itemOf = (id: string) => (lists.activeListId ? lists.itemFor(lists.activeListId, id) : undefined)
</script>

<template>
  <div>
    <AppHeader title="Produtos" :subtitle="subtitle">
      <template #actions>
        <AppButton size="sm" variant="secondary" aria-label="Criar produto personalizado" @click="openNew"><Plus :size="18" /><span class="hidden sm:inline">Novo</span></AppButton>
      </template>
      <div class="flex flex-col gap-3 px-4 pb-3">
        <ProductSearch v-model="query" />
        <ProductCategory v-model="filter" :categories="catalog.categories" :extra="extra" :counts="counts" />
      </div>
    </AppHeader>

    <div class="px-4">
      <p class="muted mb-2 text-xs font-semibold" aria-live="polite">{{ results.length }} produtos</p>
      <ul v-if="visible.length" class="grid gap-2 lg:grid-cols-2">
        <ProductCard
          v-for="p in visible"
          :key="p.id"
          :product="p"
          :item="itemOf(p.id)"
          :favorite="catalog.favoriteSet.has(p.id)"
          @add="actions.addProduct(p)"
          @dec="actions.decrementProduct(p.id)"
          @favorite="catalog.toggleFavorite(p.id)"
          @edit="openEdit(p)"
        />
      </ul>
      <AppButton v-if="results.length > limit" variant="ghost" block class="mt-3" @click="limit += PAGE">Mostrar mais</AppButton>
      <EmptyState
        v-if="!results.length"
        emoji="🔎"
        :title="filter === '_fav' ? 'Nenhum favorito ainda' : 'Nenhum produto encontrado'"
        :description="filter === '_fav' ? 'Toque no coração dos produtos para encontrá-los rápido aqui.' : 'Que tal criar esse produto?'"
      >
        <AppButton v-if="filter !== '_fav'" @click="openNew"><Plus :size="18" /> Criar "{{ query || 'produto' }}"</AppButton>
      </EmptyState>

      <section v-if="selected.length" class="mt-8" aria-labelledby="selected-title" data-testid="selected-products">
        <h2 id="selected-title" class="mb-2 text-sm font-bold">
          ✅ Selecionados ({{ selected.length }})
        </h2>
        <ul class="grid gap-2 lg:grid-cols-2">
          <ProductCard
            v-for="p in selected"
            :key="`sel-${p.id}`"
            :product="p"
            :item="itemOf(p.id)"
            :favorite="catalog.favoriteSet.has(p.id)"
            @add="actions.addProduct(p)"
            @dec="actions.decrementProduct(p.id)"
            @favorite="catalog.toggleFavorite(p.id)"
            @edit="openEdit(p)"
          />
        </ul>
      </section>
    </div>
    <ProductFormDialog v-model:open="formOpen" :product="editing" :initial-name="query" />
  </div>
</template>
