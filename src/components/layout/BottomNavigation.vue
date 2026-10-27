<script setup lang="ts">
import { Home, LayoutGrid, ListChecks, Settings, ShoppingBasket } from 'lucide-vue-next'

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/catalogo', label: 'Produtos', icon: LayoutGrid },
  { to: '/listas', label: 'Listas', icon: ListChecks },
  { to: '/configuracoes', label: 'Ajustes', icon: Settings },
]
</script>

<template>
  <nav
    aria-label="Navegação principal"
    class="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0F1C16]/95 md:sticky md:top-0 md:h-dvh md:w-56 md:shrink-0 md:border-r md:border-t-0 md:bg-transparent md:p-4"
  >
    <div class="mb-6 hidden items-center gap-2 px-2 pt-2 md:flex">
      <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><ShoppingBasket :size="20" /></span>
      <span class="text-lg font-extrabold text-brand-dark dark:text-green-300">MeuMercado</span>
    </div>
    <ul class="grid grid-cols-4 md:flex md:flex-col md:gap-1">
      <li v-for="l in links" :key="l.to">
        <RouterLink
          :to="l.to"
          :exact-active-class="l.to === '/' ? 'is-active' : ''"
          :active-class="l.to === '/' ? '' : 'is-active'"
          class="nav-link tap flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold text-ink-muted transition-colors duration-150 dark:text-slate-400 md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-3 md:text-sm"
        >
          <component :is="l.icon" :size="22" aria-hidden="true" />
          <span>{{ l.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-link.is-active { @apply text-brand dark:text-green-400 md:bg-brand-soft md:dark:bg-green-900/30; }
</style>
