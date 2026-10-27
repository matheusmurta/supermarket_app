<script setup lang="ts">
import { ref } from 'vue'
import { Check, Heart, Pencil, Plus } from 'lucide-vue-next'
import type { ListItem, Product } from '@/models'
import ProductQuantitySelector from './ProductQuantitySelector.vue'

defineProps<{ product: Product; item?: ListItem; favorite: boolean }>()
const emit = defineEmits<{ add: []; dec: []; favorite: []; edit: [] }>()
const imgFailed = ref(false)
const popping = ref(false)
function add() {
  emit('add')
  popping.value = true
  setTimeout(() => (popping.value = false), 220)
}
</script>

<template>
  <li
    class="card flex items-center gap-3 p-3 transition-colors duration-150"
    :class="item && 'ring-2 ring-brand/60 dark:ring-green-500/50'"
    :data-testid="`product-${product.id}`"
  >
    <div class="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface text-2xl dark:bg-white/5" :class="popping && 'pop'" aria-hidden="true">
      <img v-if="product.imageUrl && !imgFailed" :src="product.imageUrl" alt="" loading="lazy" class="h-full w-full rounded-xl object-cover" @error="imgFailed = true" />
      <span v-else>{{ product.icon ?? '🛒' }}</span>
      <span v-if="item" class="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-white"><Check :size="12" /></span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate font-bold leading-tight">{{ product.name }}</p>
      <p class="muted text-xs">
        <span v-if="item" class="font-semibold text-brand dark:text-green-400">Na lista</span>
        <span v-else-if="product.isCustom">Personalizado</span>
        <span v-else>Sugestão: {{ product.suggestedQuantity }} {{ product.defaultUnit }}</span>
      </p>
    </div>
    <button type="button" class="tap grid place-items-center rounded-full" :aria-label="favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`" :aria-pressed="favorite" @click="$emit('favorite')">
      <Heart :size="20" :class="favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'" />
    </button>
    <button v-if="product.isCustom" type="button" class="tap grid place-items-center rounded-full text-slate-500" :aria-label="`Editar ${product.name}`" @click="$emit('edit')">
      <Pencil :size="18" />
    </button>
    <ProductQuantitySelector v-if="item" :quantity="item.quantity" :unit="item.unit" :name="product.name" @inc="add" @dec="$emit('dec')" />
    <button v-else type="button" class="tap grid place-items-center rounded-full bg-brand text-white active:scale-90" :aria-label="`Adicionar ${product.name} à lista`" @click="add">
      <Plus :size="22" />
    </button>
  </li>
</template>
