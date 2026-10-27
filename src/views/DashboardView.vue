<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Copy, Plus, Share2, ShoppingCart, Sparkles } from 'lucide-vue-next'
import { useListsStore } from '@/stores/lists'
import { useCatalogStore } from '@/stores/catalog'
import { computeStats } from '@/stores/stats'
import { useListActions } from '@/composables/useListActions'
import { sampleProducts } from '@/data/sample'
import { monthName } from '@/utils/text'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ShoppingListCard from '@/components/lists/ShoppingListCard.vue'
import CreateListDialog from '@/components/lists/CreateListDialog.vue'
import ShareListDialog from '@/components/lists/ShareListDialog.vue'

const lists = useListsStore()
const catalog = useCatalogStore()
const router = useRouter()
const actions = useListActions()
const creating = ref(false)
const sharing = ref(false)

const now = new Date()
const greeting = computed(() => {
  const h = now.getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
})
const active = computed(() => lists.activeList)
const stats = computed(() => computeStats(active.value))
const topCategories = computed(() => lists.categoryFrequency.slice(0, 6).map(([id, n]) => ({ cat: catalog.getCategory(id), n })))
const previous = computed(() => lists.recentLists.find((l) => l.id !== active.value?.id))

function openList(l: { id: string }) {
  router.push(`/listas/${l.id}`)
}

function useSample() {
  const l = lists.createList(`Compras de ${monthName(now.getMonth() + 1)}`, { month: now.getMonth() + 1, year: now.getFullYear() })
  sampleProducts().forEach((p) => lists.addProduct(l.id, p))
  router.push(`/listas/${l.id}`)
}
</script>

<template>
  <div class="safe-top px-4 pt-5">
    <header class="mb-5">
      <p class="muted text-sm font-semibold">{{ monthName(now.getMonth() + 1) }} de {{ now.getFullYear() }}</p>
      <h1 class="text-2xl font-extrabold tracking-tight">{{ greeting }}! 👋</h1>
    </header>

    <section v-if="!lists.lists.length" class="card">
      <EmptyState emoji="🧺" title="Bem-vindo ao MeuMercado" description="Monte sua compra do mês tocando nos produtos — nada de digitar tudo de novo.">
        <AppButton @click="creating = true"><Plus :size="18" /> Criar lista do zero</AppButton>
        <AppButton variant="secondary" data-testid="use-sample" @click="useSample"><Sparkles :size="18" /> Usar lista de exemplo</AppButton>
      </EmptyState>
    </section>

    <template v-else>
      <section v-if="active" class="mb-6 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-card">
        <p class="text-sm font-semibold text-green-100">Lista ativa</p>
        <RouterLink :to="`/listas/${active.id}`" class="mb-4 block text-xl font-extrabold hover:underline">{{ active.name }}</RouterLink>
        <div class="mb-4 grid grid-cols-3 gap-2 text-center">
          <div class="rounded-2xl bg-white/10 p-2"><p class="text-2xl font-extrabold">{{ stats.distinct }}</p><p class="text-xs text-green-100">itens</p></div>
          <div class="rounded-2xl bg-white/10 p-2"><p class="text-2xl font-extrabold">{{ stats.purchased }}</p><p class="text-xs text-green-100">comprados</p></div>
          <div class="rounded-2xl bg-white/10 p-2"><p class="text-2xl font-extrabold">{{ stats.pending }}</p><p class="text-xs text-green-100">pendentes</p></div>
        </div>
        <div class="mb-1 flex justify-between text-sm font-semibold"><span>Progresso</span><span>{{ stats.percent }}%</span></div>
        <div class="h-2.5 overflow-hidden rounded-full bg-white/20" role="progressbar" :aria-valuenow="stats.percent" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso da lista">
          <div class="h-full rounded-full bg-white transition-[width] duration-200" :style="{ width: `${stats.percent}%` }" />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <RouterLink to="/catalogo" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white font-bold text-brand-dark active:scale-[.97]"><Plus :size="18" /> Produtos</RouterLink>
          <button type="button" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/15 font-bold disabled:opacity-50" :disabled="!stats.distinct" @click="sharing = true"><Share2 :size="18" /> Compartilhar</button>
        </div>
      </section>
      <section v-else class="card mb-6">
        <EmptyState emoji="📝" title="Nenhuma lista ativa" description="Escolha uma lista ou crie uma nova.">
          <AppButton @click="creating = true"><Plus :size="18" /> Nova lista</AppButton>
        </EmptyState>
      </section>

      <section v-if="topCategories.length" class="mb-6">
        <h2 class="mb-2 font-extrabold">Categorias mais usadas</h2>
        <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          <RouterLink v-for="{ cat, n } in topCategories" :key="cat.id" :to="{ path: '/catalogo', query: { cat: cat.id } }" class="chip bg-white shadow-card dark:bg-[#13221B]">
            <span aria-hidden="true">{{ cat.emoji }}</span>{{ cat.name }}<span class="muted text-xs">{{ n }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="mb-6">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="font-extrabold">Últimas listas</h2>
          <RouterLink to="/listas" class="tap inline-flex items-center text-sm font-bold text-brand dark:text-green-400">Ver todas</RouterLink>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink v-for="l in lists.recentLists.slice(0, 4)" :key="l.id" :to="`/listas/${l.id}`" class="block rounded-2xl">
            <ShoppingListCard :list="l" :active="l.id === lists.activeListId" />
          </RouterLink>
        </div>
      </section>

      <div class="flex flex-col gap-2 sm:flex-row">
        <AppButton v-if="previous" variant="secondary" block @click="actions.duplicateNextMonth(previous.id)"><Copy :size="18" /> Duplicar lista anterior</AppButton>
        <AppButton variant="ghost" block @click="creating = true"><ShoppingCart :size="18" /> Nova lista</AppButton>
      </div>
    </template>

    <CreateListDialog v-model:open="creating" @saved="openList" />
    <ShareListDialog v-if="active" v-model:open="sharing" :list="active" />
  </div>
</template>
