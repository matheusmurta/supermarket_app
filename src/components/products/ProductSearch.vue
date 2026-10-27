<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

defineProps<{ placeholder?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="relative">
    <Search :size="20" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder ?? 'Buscar produtos...'"
      :aria-label="placeholder ?? 'Buscar produtos'"
      class="field h-12 rounded-2xl pl-10 pr-10 shadow-card"
      autocomplete="off"
    />
    <button v-if="model" type="button" class="tap absolute right-0 top-1/2 grid -translate-y-1/2 place-items-center text-slate-400" aria-label="Limpar busca" @click="model = ''">
      <X :size="18" />
    </button>
  </div>
</template>
