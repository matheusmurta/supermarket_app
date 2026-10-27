import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { useSettingsStore } from './stores/settings'
import { useCatalogStore } from './stores/catalog'
import { useListsStore } from './stores/lists'
import { useToastStore } from './stores/toast'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Hidratação antes de montar
useSettingsStore().hydrate()
const corrupted = [useCatalogStore().hydrate(), useListsStore().hydrate()].some(Boolean)

app.use(router)
app.mount('#app')

if (corrupted) {
  useToastStore().show(
    'Alguns dados salvos estavam corrompidos e foram ignorados. Uma cópia foi preservada.',
    { type: 'error' },
    8000,
  )
}
