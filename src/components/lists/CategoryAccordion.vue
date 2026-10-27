<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
import type { Category } from '@/models'

const props = defineProps<{ category: Category; done: number; total: number }>()
const complete = computed(() => props.total > 0 && props.done === props.total)
// Grupos concluídos começam fechados e fecham automaticamente ao terminar
const open = ref(!complete.value)
watch(complete, (c) => (open.value = !c))
const percent = computed(() => (props.total ? Math.round((props.done / props.total) * 100) : 0))
const id = `acc-${props.category.id}`
</script>

<template>
  <section class="card overflow-hidden" :class="complete && 'opacity-80'">
    <h3>
      <button
        type="button"
        class="flex min-h-[56px] w-full items-center gap-3 px-3 py-2 text-left active:bg-black/5 dark:active:bg-white/5"
        :aria-expanded="open"
        :aria-controls="id"
        @click="open = !open"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" :class="complete ? 'bg-brand text-white' : 'bg-brand-soft dark:bg-green-900/30'" aria-hidden="true">
          <Check v-if="complete" :size="20" />
          <template v-else>{{ category.emoji }}</template>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate font-extrabold leading-tight">{{ category.name }}</span>
          <span class="mt-1 flex items-center gap-2">
            <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" aria-hidden="true">
              <span class="block h-full rounded-full bg-brand transition-[width] duration-200" :style="{ width: `${percent}%` }" />
            </span>
            <span class="muted shrink-0 text-xs font-semibold">{{ complete ? 'Concluído' : `${done} de ${total}` }}</span>
          </span>
        </span>
        <ChevronDown :size="20" class="muted shrink-0 transition-transform duration-200" :class="open && 'rotate-180'" aria-hidden="true" />
      </button>
    </h3>
    <div v-show="open" :id="id" class="border-t border-slate-100 dark:border-white/5">
      <slot />
    </div>
  </section>
</template>
