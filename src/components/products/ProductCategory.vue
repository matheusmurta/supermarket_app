<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { LayoutGrid } from 'lucide-vue-next'
import type { Category } from '@/models'
import BottomSheet from '@/components/ui/BottomSheet.vue'

export interface CategoryChip {
  id: string
  label: string
  emoji: string
}
const props = defineProps<{ categories: Category[]; extra?: CategoryChip[]; counts?: Record<string, number> }>()
const model = defineModel<string | null>({ default: null })
const sheetOpen = ref(false)
const scroller = ref<HTMLElement | null>(null)

const chips = computed<CategoryChip[]>(() => [
  { id: '', label: 'Tudo', emoji: '🛒' },
  ...(props.extra ?? []),
  ...props.categories.map((c: Category) => ({ id: c.id, label: c.short ?? c.name, emoji: c.emoji })),
])
const current = computed(() => model.value ?? '')
const currentName = computed(() => {
  const cat = props.categories.find((c) => c.id === current.value)
  return cat?.name ?? props.extra?.find((e) => e.id === current.value)?.label ?? 'Todas as categorias'
})

function select(id: string) {
  model.value = id || null
  sheetOpen.value = false
}

// Mantém o item ativo visível na faixa rolável
watch(current, async (id) => {
  await nextTick()
  scroller.value?.querySelector<HTMLElement>(`[data-cat="${id}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}, { immediate: true })
</script>

<template>
  <div>
    <div class="relative -mx-4">
      <div
        ref="scroller"
        class="no-scrollbar flex snap-x gap-1 overflow-x-auto scroll-px-4 px-4 pb-1"
        role="radiogroup"
        aria-label="Filtrar por categoria"
      >
        <button
          v-for="chip in chips"
          :key="chip.id"
          :data-cat="chip.id"
          type="button"
          role="radio"
          :aria-checked="current === chip.id"
          class="group flex w-[68px] shrink-0 snap-start flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors duration-150"
          @click="select(chip.id)"
        >
          <span
            class="grid h-12 w-12 place-items-center rounded-2xl text-[26px] leading-none transition duration-150 group-active:scale-90"
            :class="current === chip.id
              ? 'bg-brand shadow-md shadow-brand/30 ring-2 ring-brand ring-offset-2 ring-offset-surface dark:ring-offset-[#0B1511]'
              : 'bg-white shadow-card dark:bg-[#13221B]'"
            aria-hidden="true"
          >{{ chip.emoji }}</span>
          <span
            class="line-clamp-2 w-full px-0.5 text-center text-[11px] leading-tight"
            :class="current === chip.id ? 'font-extrabold text-brand dark:text-green-400' : 'font-semibold text-ink-muted dark:text-slate-400'"
          >{{ chip.label }}</span>
        </button>
      </div>
      <!-- indica que há mais conteúdo à direita -->
      <div class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface dark:from-[#0B1511]" aria-hidden="true" />
    </div>

    <div class="mt-1 flex items-center justify-between gap-2">
      <p class="truncate text-sm font-bold" aria-live="polite">{{ currentName }}</p>
      <button type="button" class="tap inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-brand dark:text-green-400" @click="sheetOpen = true">
        <LayoutGrid :size="16" /> Ver todas
      </button>
    </div>

    <BottomSheet v-model:open="sheetOpen" title="Categorias">
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button
          v-for="chip in chips"
          :key="chip.id"
          type="button"
          class="flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition-colors duration-150 active:scale-95"
          :class="current === chip.id ? 'border-brand bg-brand-soft dark:bg-green-900/30' : 'border-transparent bg-surface dark:bg-white/5'"
          :aria-pressed="current === chip.id"
          @click="select(chip.id)"
        >
          <span class="text-3xl leading-none" aria-hidden="true">{{ chip.emoji }}</span>
          <span class="line-clamp-2 text-xs font-bold leading-tight">{{ chip.label }}</span>
          <span v-if="counts?.[chip.id] !== undefined" class="muted text-[10px] font-semibold">{{ counts[chip.id] }} itens</span>
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

