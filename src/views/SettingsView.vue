<script setup lang="ts">
import { ref } from 'vue'
import { Download, ExternalLink, Moon, Sun, Trash2, Upload, Monitor } from 'lucide-vue-next'
import type { ThemeMode } from '@/models'
import { useSettingsStore } from '@/stores/settings'
import { useCatalogStore } from '@/stores/catalog'
import { useListsStore } from '@/stores/lists'
import { useToastStore } from '@/stores/toast'
import { createBackup, downloadBackup, parseBackup } from '@/services/backup.service'
import { storageService } from '@/services/storage.service'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const settingsStore = useSettingsStore()
const catalog = useCatalogStore()
const lists = useListsStore()
const toast = useToastStore()
const version = __APP_VERSION__

const themes: Array<{ v: ThemeMode; l: string; icon: typeof Sun }> = [
  { v: 'light', l: 'Claro', icon: Sun },
  { v: 'dark', l: 'Escuro', icon: Moon },
  { v: 'system', l: 'Sistema', icon: Monitor },
]
const newCat = ref({ name: '', emoji: '' })
const catError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const clearOpen = ref(false)

function addCategory() {
  const r = catalog.addCategory(newCat.value.name, newCat.value.emoji)
  catError.value = r.error ?? ''
  if (r.ok) {
    newCat.value = { name: '', emoji: '' }
    toast.show('Categoria criada')
  }
}

function exportData() {
  downloadBackup(
    createBackup({
      lists: lists.lists,
      customProducts: catalog.customProducts,
      customCategories: catalog.customCategories,
      favorites: catalog.favorites,
      settings: settingsStore.settings,
      activeListId: lists.activeListId,
    }),
  )
  toast.show('Backup exportado')
}

async function importData(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const r = parseBackup(await file.text())
  input.value = ''
  if (!r.ok) return toast.show(r.error, { type: 'error' }, 6000)
  lists.replaceAll(r.data.lists, r.data.activeListId)
  catalog.replaceAll(r.data)
  settingsStore.replace(r.data.settings)
  lists.flush()
  toast.show(`Backup importado: ${r.data.lists.length} listas`)
}

function clearAll() {
  storageService.clearAll()
  window.location.reload()
}
</script>

<template>
  <div>
    <AppHeader title="Configurações" />
    <div class="flex flex-col gap-4 px-4">
      <section class="card p-4">
        <h2 class="mb-3 font-extrabold">Aparência</h2>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
          <button v-for="t in themes" :key="t.v" type="button" role="radio" :aria-checked="settingsStore.settings.theme === t.v" class="tap flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2 text-sm font-bold" :class="settingsStore.settings.theme === t.v ? 'border-brand bg-brand-soft text-brand-dark dark:bg-green-900/30 dark:text-green-200' : 'border-transparent bg-surface dark:bg-white/5'" @click="settingsStore.settings.theme = t.v">
            <component :is="t.icon" :size="20" />{{ t.l }}
          </button>
        </div>
        <label class="mt-4 flex flex-col gap-1 text-sm font-semibold">Ordenação padrão das listas
          <select v-model="settingsStore.settings.sortMode" class="field">
            <option value="category">Por categoria</option>
            <option value="alphabetical">Alfabética</option>
            <option value="pending">Pendentes primeiro</option>
            <option value="manual">Manual</option>
          </select>
        </label>
      </section>

      <section class="card p-4">
        <h2 class="mb-3 font-extrabold">Categorias personalizadas</h2>
        <ul v-if="catalog.customCategories.length" class="mb-3 divide-y divide-slate-100 dark:divide-white/5">
          <li v-for="c in catalog.customCategories" :key="c.id" class="flex items-center gap-2 py-1">
            <span aria-hidden="true">{{ c.emoji }}</span><span class="flex-1 font-semibold">{{ c.name }}</span>
            <button type="button" class="tap grid place-items-center text-red-600" :aria-label="`Excluir categoria ${c.name}`" @click="catalog.removeCategory(c.id)"><Trash2 :size="18" /></button>
          </li>
        </ul>
        <p v-else class="muted mb-3 text-sm">Nenhuma ainda. Produtos de categorias excluídas vão para "Outros".</p>
        <form class="grid grid-cols-[4.5rem_1fr] items-start gap-2 sm:grid-cols-[4.5rem_1fr_auto]" @submit.prevent="addCategory">
          <AppInput v-model="newCat.emoji" label="Emoji" placeholder="🍼" />
          <AppInput v-model="newCat.name" label="Nome" placeholder="Ex.: Bebê" :error="catError" />
          <AppButton type="submit" class="col-span-2 sm:col-span-1 sm:mt-6">Adicionar</AppButton>
        </form>
      </section>

      <section class="card p-4">
        <h2 class="mb-1 font-extrabold">Seus dados</h2>
        <p class="muted mb-3 text-sm">Tudo fica salvo apenas neste navegador (localStorage), sem sincronização entre aparelhos. Limpar os dados do navegador apaga suas listas — exporte backups.</p>
        <p v-if="lists.saveError" class="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200" role="alert">Não foi possível salvar: armazenamento cheio ou bloqueado. Exporte um backup.</p>
        <div class="grid gap-2 sm:grid-cols-3">
          <AppButton variant="secondary" @click="exportData"><Download :size="18" /> Exportar JSON</AppButton>
          <AppButton variant="secondary" @click="fileInput?.click()"><Upload :size="18" /> Importar backup</AppButton>
          <AppButton variant="ghost" class="text-red-600" @click="clearOpen = true"><Trash2 :size="18" /> Apagar tudo</AppButton>
        </div>
        <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" data-testid="import-input" @change="importData" />
      </section>

      <section class="card p-4 text-sm">
        <h2 class="mb-2 font-extrabold">Sobre</h2>
        <p><strong>MeuMercado</strong> v{{ version }} — software livre sob licença MIT.</p>
        <p class="muted mt-1">Imagens opcionais: Open Food Facts (CC BY-SA). Ícones: Lucide (ISC).</p>
        <div class="mt-3"><AppInput v-model="settingsStore.settings.repositoryUrl" label="Repositório GitHub" type="url" /></div>
        <a :href="settingsStore.settings.repositoryUrl" target="_blank" rel="noopener" class="tap mt-2 inline-flex items-center gap-1 font-bold text-brand dark:text-green-400">Abrir repositório <ExternalLink :size="16" /></a>
      </section>
    </div>
    <ConfirmDialog v-model:open="clearOpen" title="Apagar todos os dados?" message="Listas, produtos personalizados, favoritos e configurações serão apagados deste aparelho. Esta ação não pode ser desfeita." confirm-label="Apagar tudo" @confirm="clearAll" />
  </div>
</template>
