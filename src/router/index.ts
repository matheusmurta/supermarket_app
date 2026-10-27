import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

// Hash history: funciona em qualquer hospedagem estática (GitHub Pages) sem rewrites
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: DashboardView, meta: { title: 'Início' } },
    { path: '/catalogo', name: 'catalog', component: () => import('@/views/CatalogView.vue'), meta: { title: 'Produtos' } },
    { path: '/listas', name: 'lists', component: () => import('@/views/ListsView.vue'), meta: { title: 'Minhas listas' } },
    { path: '/listas/:id', name: 'list', component: () => import('@/views/ListDetailView.vue'), props: true, meta: { title: 'Lista' } },
    { path: '/configuracoes', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { title: 'Configurações' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? '')} · MeuMercado`
})

export default router
