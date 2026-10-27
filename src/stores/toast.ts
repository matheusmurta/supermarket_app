import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  actionLabel?: string
  action?: () => void
}

let seq = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(message: string, opts: Partial<Omit<Toast, 'id' | 'message'>> = {}, duration = 3500) {
    const id = ++seq
    toasts.value = [...toasts.value.slice(-2), { id, message, type: opts.type ?? 'success', ...opts }]
    setTimeout(() => dismiss(id), duration)
    return id
  }

  return { toasts, show, dismiss }
})
