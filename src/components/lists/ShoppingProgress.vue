<script setup lang="ts">
import { computed } from 'vue'
import type { ListStats } from '@/stores/stats'

const props = defineProps<{ stats: ListStats; compact?: boolean }>()
const label = computed(() => `${props.stats.purchased} de ${props.stats.distinct} itens comprados`)
</script>

<template>
  <div>
    <div v-if="!compact" class="mb-2 flex items-end justify-between text-sm">
      <span class="font-semibold">{{ label }}</span>
      <span class="text-lg font-extrabold text-brand dark:text-green-400">{{ stats.percent }}%</span>
    </div>
    <div
      role="progressbar"
      :aria-valuenow="stats.percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label"
      class="h-2.5 overflow-hidden rounded-full bg-brand-soft dark:bg-white/10"
    >
      <div class="h-full rounded-full bg-brand transition-[width] duration-200" :style="{ width: `${stats.percent}%` }" />
    </div>
  </div>
</template>
