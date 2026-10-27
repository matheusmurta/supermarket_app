<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

defineProps<{ title: string; subtitle?: string; back?: boolean }>()
const router = useRouter()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <header class="safe-top sticky top-0 z-20 bg-surface/90 backdrop-blur dark:bg-[#0B1511]/90">
    <div class="flex items-center gap-2 px-4 py-3">
      <button v-if="back" type="button" class="tap -ml-2 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Voltar" @click="goBack">
        <ArrowLeft :size="22" />
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-xl font-extrabold tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="muted truncate text-sm">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </header>
</template>
