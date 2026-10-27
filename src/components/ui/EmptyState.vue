<script setup lang="ts">
defineProps<{ emoji?: string; title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-10 text-center">
    <div class="mb-4 grid h-20 w-20 place-items-center rounded-full bg-brand-soft text-4xl dark:bg-green-900/30" aria-hidden="true">
      {{ emoji ?? '🛒' }}
    </div>
    <h2 class="text-lg font-extrabold">{{ title }}</h2>
    <p v-if="description" class="muted mt-1 max-w-xs text-sm">{{ description }}</p>
    <div class="mt-5 flex flex-wrap justify-center gap-2"><slot /></div>
  </div>
</template>
