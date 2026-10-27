<script setup lang="ts">
import { computed } from 'vue'
import { Archive, CheckCircle2, Star } from 'lucide-vue-next'
import type { ShoppingList } from '@/models'
import { computeStats } from '@/stores/stats'
import { monthName } from '@/utils/text'
import ShoppingProgress from './ShoppingProgress.vue'

const props = defineProps<{ list: ShoppingList; active?: boolean }>()
const stats = computed(() => computeStats(props.list))
const updated = computed(() => new Date(props.list.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }))
</script>

<template>
  <article class="card p-4" :class="active && 'ring-2 ring-brand'">
    <div class="mb-3 flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="flex items-center gap-1.5 truncate font-extrabold">
          {{ list.name }}
          <Star v-if="list.isTemplate" :size="16" class="shrink-0 fill-accent text-accent" aria-label="Lista modelo" />
          <Archive v-if="list.status === 'archived'" :size="16" class="muted shrink-0" aria-label="Arquivada" />
        </h3>
        <p class="muted text-xs">
          <span v-if="list.month && list.year">{{ monthName(list.month) }}/{{ list.year }} · </span>{{ stats.distinct }} itens · atualizada {{ updated }}
        </p>
      </div>
      <span v-if="active" class="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-dark dark:bg-green-900/40 dark:text-green-200">
        <CheckCircle2 :size="14" /> Ativa
      </span>
    </div>
    <ShoppingProgress :stats="stats" compact />
    <div class="mt-3"><slot /></div>
  </article>
</template>
