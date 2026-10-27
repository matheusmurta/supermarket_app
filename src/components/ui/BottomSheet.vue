<script setup lang="ts">
import { onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{ title: string }>()
const open = defineModel<boolean>('open', { default: false })
const panel = ref<HTMLElement | null>(null)
let lastFocus: Element | null = null

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
  if (e.key === 'Tab' && panel.value) {
    const f = panel.value.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}

watch(open, async (v) => {
  if (v) {
    lastFocus = document.activeElement
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    await nextTick()
    panel.value?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus()
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
    if (lastFocus instanceof HTMLElement) lastFocus.focus()
  }
}, { immediate: true })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
void props
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-40 bg-black/40" aria-hidden="true" @click="open = false" />
    </Transition>
    <Transition name="sheet">
      <div
        v-if="open"
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-[#13221B] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl"
      >
        <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-white/20 md:hidden" aria-hidden="true" />
        <div class="mb-4 flex items-center justify-between gap-2">
          <h2 class="text-lg font-extrabold">{{ title }}</h2>
          <button data-close type="button" class="tap grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Fechar" @click="open = false">
            <X :size="20" />
          </button>
        </div>
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
