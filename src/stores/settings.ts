import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Settings } from '@/models'
import { storageService, StorageKeys } from '@/services/storage.service'
import { isSettings } from '@/services/validators'

export const DEFAULT_REPO_URL = 'https://github.com/SEU-USUARIO/meumercado'

export const defaultSettings = (): Settings => ({
  theme: 'system',
  sortMode: 'category',
  repositoryUrl: DEFAULT_REPO_URL,
})

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(defaultSettings())
  const corrupted = ref(false)

  function hydrate() {
    const r = storageService.load(StorageKeys.settings, isSettings)
    if (r.status === 'ok') settings.value = r.data
    corrupted.value = r.status === 'corrupted'
    applyTheme()
  }

  function applyTheme() {
    if (typeof document === 'undefined') return
    const t = settings.value.theme
    const dark =
      t === 'dark' || (t === 'system' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
  }

  function replace(s: Settings) {
    settings.value = { ...s }
  }

  watch(
    settings,
    (s) => {
      storageService.save(StorageKeys.settings, s)
      applyTheme()
    },
    { deep: true },
  )

  return { settings, corrupted, hydrate, applyTheme, replace }
})
