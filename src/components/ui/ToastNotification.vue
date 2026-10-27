<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const store = useToastStore()
const { toasts } = storeToRefs(store)
function run(id: number, action?: () => void) {
  action?.()
  store.dismiss(id)
}
</script>

<template>
  <div aria-live="polite" class="pointer-events-none fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md flex-col gap-2 md:bottom-6">
    <TransitionGroup name="sheet">
      <div
        v-for="t in toasts"
        :key="t.id"
        role="status"
        class="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-4 py-2 text-white shadow-lg dark:bg-slate-100 dark:text-ink"
      >
        <CheckCircle2 v-if="t.type === 'success'" :size="20" class="shrink-0 text-green-400 dark:text-brand" />
        <AlertCircle v-else-if="t.type === 'error'" :size="20" class="shrink-0 text-red-400 dark:text-red-600" />
        <Info v-else :size="20" class="shrink-0" />
        <p class="flex-1 py-2 text-sm font-medium">{{ t.message }}</p>
        <button
          v-if="t.actionLabel"
          type="button"
          class="tap rounded-lg px-2 text-sm font-extrabold text-green-300 dark:text-brand"
          @click="run(t.id, t.action)"
        >
          {{ t.actionLabel }}
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
