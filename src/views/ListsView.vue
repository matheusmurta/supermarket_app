<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Archive, ArchiveRestore, CheckCircle2, Copy, Pencil, Plus, Star, Trash2 } from 'lucide-vue-next'
import type { ShoppingList } from '@/models'
import { useListsStore } from '@/stores/lists'
import { useListActions } from '@/composables/useListActions'
import { normalize } from '@/utils/text'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ProductSearch from '@/components/products/ProductSearch.vue'
import ShoppingListCard from '@/components/lists/ShoppingListCard.vue'
import CreateListDialog from '@/components/lists/CreateListDialog.vue'

const lists = useListsStore()
const actions = useListActions()
const router = useRouter()

const tab = ref<'active' | 'archived'>('active')
const query = ref('')
const sort = ref<'updated' | 'name' | 'created'>('updated')
const dialog = ref(false)
const editing = ref<ShoppingList | null>(null)
const toDelete = ref<ShoppingList | null>(null)
const confirmOpen = computed({ get: () => !!toDelete.value, set: (v) => { if (!v) toDelete.value = null } })

const shown = computed(() => {
  const q = normalize(query.value)
  const src = tab.value === 'active' ? lists.activeLists : lists.archivedLists
  return src
    .filter((l) => !q || normalize(l.name).includes(q))
    .sort((a, b) =>
      sort.value === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : sort.value === 'created' ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt),
    )
})

function openNew() { editing.value = null; dialog.value = true }
function openEdit(l: ShoppingList) { editing.value = l; dialog.value = true }
const iconBtn = 'tap grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10'
</script>

<template>
  <div>
    <AppHeader title="Minhas listas" :subtitle="`${lists.lists.length} listas salvas neste aparelho`">
      <template #actions>
        <AppButton size="sm" data-testid="new-list" @click="openNew"><Plus :size="18" /> Nova</AppButton>
      </template>
      <div class="flex flex-col gap-3 px-4 pb-3">
        <ProductSearch v-model="query" placeholder="Buscar listas..." />
        <div class="flex items-center gap-2">
          <div class="flex rounded-full bg-white p-1 shadow-card dark:bg-[#13221B]" role="tablist">
            <button v-for="t in (['active', 'archived'] as const)" :key="t" type="button" role="tab" :aria-selected="tab === t" class="chip min-h-[36px]" :class="tab === t ? 'bg-brand text-white' : ''" @click="tab = t">
              {{ t === 'active' ? 'Ativas' : `Arquivadas (${lists.archivedLists.length})` }}
            </button>
          </div>
          <label class="ml-auto text-sm"><span class="sr-only">Ordenar</span>
            <select v-model="sort" class="field min-h-[40px] py-0 text-sm">
              <option value="updated">Recentes</option>
              <option value="created">Criação</option>
              <option value="name">Nome</option>
            </select>
          </label>
        </div>
      </div>
    </AppHeader>

    <div class="grid gap-3 px-4 sm:grid-cols-2">
      <ShoppingListCard v-for="l in shown" :key="l.id" :list="l" :active="l.id === lists.activeListId">
        <div class="flex flex-wrap items-center gap-1">
          <AppButton size="sm" variant="secondary" @click="router.push(`/listas/${l.id}`)">Abrir</AppButton>
          <button v-if="l.id !== lists.activeListId" type="button" :class="iconBtn" :aria-label="`Definir ${l.name} como ativa`" title="Definir como ativa" @click="lists.setActive(l.id)"><CheckCircle2 :size="18" /></button>
          <button type="button" :class="iconBtn" :aria-label="`Editar ${l.name}`" title="Renomear/editar" @click="openEdit(l)"><Pencil :size="18" /></button>
          <button type="button" :class="iconBtn" :aria-label="`Duplicar ${l.name} para o próximo mês`" title="Duplicar para o próximo mês" @click="actions.duplicateNextMonth(l.id)"><Copy :size="18" /></button>
          <button type="button" :class="iconBtn" :aria-pressed="l.isTemplate" :aria-label="l.isTemplate ? 'Deixar de ser modelo' : 'Usar como lista padrão da casa'" title="Lista modelo" @click="lists.setTemplate(l.id)"><Star :size="18" :class="l.isTemplate && 'fill-accent text-accent'" /></button>
          <button type="button" :class="iconBtn" :aria-label="l.status === 'archived' ? `Reativar ${l.name}` : `Arquivar ${l.name}`" :title="l.status === 'archived' ? 'Reativar' : 'Arquivar'" @click="lists.setArchived(l.id, l.status !== 'archived')">
            <ArchiveRestore v-if="l.status === 'archived'" :size="18" /><Archive v-else :size="18" />
          </button>
          <button type="button" :class="[iconBtn, 'ml-auto text-red-600']" :aria-label="`Excluir ${l.name}`" title="Excluir" @click="toDelete = l"><Trash2 :size="18" /></button>
        </div>
      </ShoppingListCard>
    </div>
    <EmptyState v-if="!shown.length" :emoji="tab === 'archived' ? '🗄️' : '📝'" :title="query ? 'Nenhuma lista encontrada' : tab === 'archived' ? 'Nenhuma lista arquivada' : 'Nenhuma lista ainda'">
      <AppButton v-if="tab === 'active' && !query" @click="openNew"><Plus :size="18" /> Criar lista</AppButton>
    </EmptyState>

    <CreateListDialog v-model:open="dialog" :list="editing" />
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Excluir lista?"
      :message="`A lista &quot;${toDelete?.name ?? ''}&quot; e seus itens serão excluídos.`"
      confirm-label="Excluir"
      @confirm="toDelete && actions.deleteList(toDelete.id)"
    />
  </div>
</template>
