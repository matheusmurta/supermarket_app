<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
import type { ProductUnit } from '@/models'
import { formatQuantity } from '@/utils/units'

const props = defineProps<{ quantity: number; unit: ProductUnit; packageSize?: string; name: string; small?: boolean }>()
defineEmits<{ inc: []; dec: [] }>()
void props
</script>

<template>
  <div class="inline-flex items-center rounded-full bg-brand-soft dark:bg-green-900/30" role="group" :aria-label="`Quantidade de ${name}`">
    <button type="button" class="tap grid place-items-center rounded-full text-brand-dark active:scale-90 dark:text-green-200" :aria-label="`Diminuir ${name}`" @click.stop="$emit('dec')">
      <Minus :size="18" />
    </button>
    <span class="min-w-[3.5rem] px-1 text-center text-sm font-bold text-brand-dark dark:text-green-100" aria-live="polite">
      {{ formatQuantity(quantity, unit, packageSize) }}
    </span>
    <button type="button" class="tap grid place-items-center rounded-full text-brand-dark active:scale-90 dark:text-green-200" :aria-label="`Aumentar ${name}`" @click.stop="$emit('inc')">
      <Plus :size="18" />
    </button>
  </div>
</template>
