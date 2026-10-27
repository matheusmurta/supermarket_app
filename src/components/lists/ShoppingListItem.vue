<script setup lang="ts">
import { ArrowDown, ArrowUp, GripVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { ListItem } from '@/models'
import { formatCurrency } from '@/utils/text'
import ProductQuantitySelector from '@/components/products/ProductQuantitySelector.vue'

defineProps<{ item: ListItem; reorderable?: boolean; isFirst?: boolean; isLast?: boolean }>()
defineEmits<{ toggle: []; inc: []; dec: []; edit: []; remove: []; up: []; down: [] }>()
</script>

<template>
  <li class="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 transition-opacity duration-200" :class="item.purchased && 'opacity-60'" :data-testid="`item-${item.productId}`">
    <span v-if="reorderable" class="drag-handle tap hidden cursor-grab touch-none place-items-center text-slate-400 sm:grid" aria-hidden="true">
      <GripVertical :size="18" />
    </span>
    <label class="tap relative grid shrink-0 cursor-pointer place-items-center">
      <input type="checkbox" class="peer sr-only" :checked="item.purchased" :aria-label="`Marcar ${item.name} como comprado`" @change="$emit('toggle')" />
      <span class="grid h-7 w-7 place-items-center rounded-lg border-2 border-slate-300 transition duration-150 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand dark:border-slate-500" :class="item.purchased && 'pop'">
        <svg v-if="item.purchased" viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M5 12l5 5L20 7" /></svg>
      </span>
    </label>
    <span class="text-2xl" aria-hidden="true">{{ item.icon ?? '🛒' }}</span>
    <!-- basis-40: em telas estreitas o seletor de quantidade quebra para a linha de baixo, preservando o nome -->
    <button type="button" class="min-h-[44px] min-w-0 flex-1 basis-40 py-1 text-left" :aria-label="`Editar ${item.name}`" @click="$emit('edit')">
      <span class="line-clamp-2 font-bold leading-snug" :class="item.purchased && 'line-through'">{{ item.name }}</span>
      <span v-if="item.notes || item.price !== undefined" class="muted block truncate text-xs">
        <template v-if="item.price !== undefined">{{ formatCurrency(item.price * item.quantity) }}</template>
        <template v-if="item.notes && item.price !== undefined"> · </template>{{ item.notes }}
      </span>
    </button>
    <div class="ml-auto flex items-center">
    <ProductQuantitySelector :quantity="item.quantity" :unit="item.unit" :package-size="item.packageSize" :name="item.name" @inc="$emit('inc')" @dec="$emit('dec')" />
    <div class="hidden items-center sm:flex">
      <button type="button" class="tap grid place-items-center rounded-full text-slate-500" :aria-label="`Editar ${item.name}`" @click="$emit('edit')"><Pencil :size="18" /></button>
      <button type="button" class="tap grid place-items-center rounded-full text-red-500" :aria-label="`Remover ${item.name}`" @click="$emit('remove')"><Trash2 :size="18" /></button>
    </div>
    <div v-if="reorderable" class="flex flex-col">
      <button type="button" class="grid h-[22px] w-9 place-items-center rounded disabled:opacity-30" :disabled="isFirst" :aria-label="`Mover ${item.name} para cima`" @click="$emit('up')"><ArrowUp :size="16" /></button>
      <button type="button" class="grid h-[22px] w-9 place-items-center rounded disabled:opacity-30" :disabled="isLast" :aria-label="`Mover ${item.name} para baixo`" @click="$emit('down')"><ArrowDown :size="16" /></button>
    </div>
    </div>
  </li>
</template>
