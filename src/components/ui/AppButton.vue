<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit'
    block?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', block: false, disabled: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl font-bold transition duration-150 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      block && 'w-full',
      size === 'sm' && 'px-3 text-sm',
      size === 'md' && 'px-4 text-[15px]',
      size === 'lg' && 'px-5 text-base',
      variant === 'primary' && 'bg-brand text-white hover:bg-brand-dark',
      variant === 'secondary' && 'bg-brand-soft text-brand-dark hover:bg-green-200 dark:bg-green-900/40 dark:text-green-200',
      variant === 'ghost' && 'text-ink hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
    ]"
  >
    <slot />
  </button>
</template>
