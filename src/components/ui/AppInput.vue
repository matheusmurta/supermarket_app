<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string; type?: string; placeholder?: string; hint?: string; error?: string; inputmode?: 'text' | 'decimal' | 'numeric' }>()
const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-sm font-semibold">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :inputmode="inputmode"
      :aria-invalid="!!error"
      :aria-describedby="error || hint ? `${id}-d` : undefined"
      class="field"
      :class="error && 'border-red-500'"
    />
    <p v-if="error || hint" :id="`${id}-d`" class="text-xs" :class="error ? 'text-red-600' : 'muted'">{{ error || hint }}</p>
  </div>
</template>
