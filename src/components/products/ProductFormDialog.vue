<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Product, ProductUnit } from '@/models'
import { PRODUCT_UNITS } from '@/models'
import { useCatalogStore } from '@/stores/catalog'
import { useToastStore } from '@/stores/toast'
import { UNIT_INFO } from '@/utils/units'
import { parseDecimal } from '@/utils/text'
import { lookupBarcode } from '@/services/openfoodfacts.service'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const props = defineProps<{ product?: Product | null; initialName?: string }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [Product] }>()
const catalog = useCatalogStore()
const toast = useToastStore()

const form = reactive({ name: '', categoryId: 'outros', unit: 'un' as ProductUnit, qty: '1', icon: '', barcode: '', imageUrl: '' })
const error = ref('')
const confirmDelete = ref(false)
const looking = ref(false)

watch(open, (v) => {
  if (!v) return
  const p = props.product
  Object.assign(form, {
    name: p?.name ?? props.initialName ?? '',
    categoryId: p?.categoryId ?? 'outros',
    unit: p?.defaultUnit ?? 'un',
    qty: String(p?.suggestedQuantity ?? 1),
    icon: p?.icon ?? '',
    barcode: p?.barcode ?? '',
    imageUrl: p?.imageUrl ?? '',
  })
  error.value = ''
})

async function lookup() {
  looking.value = true
  const r = await lookupBarcode(form.barcode)
  looking.value = false
  if (!r) return toast.show('Produto não encontrado no Open Food Facts (ou sem conexão).', { type: 'error' })
  form.name = form.name || r.name
  form.imageUrl = r.imageUrl ?? ''
  toast.show('Dados obtidos do Open Food Facts')
}

function save() {
  const qty = parseDecimal(form.qty)
  if (qty === null || qty <= 0) return (error.value = 'Quantidade inválida.')
  const input = {
    name: form.name,
    categoryId: form.categoryId,
    defaultUnit: form.unit,
    suggestedQuantity: qty,
    icon: form.icon.trim() || undefined,
    barcode: form.barcode.trim() || undefined,
    imageUrl: form.imageUrl || undefined,
  }
  if (props.product) {
    const r = catalog.updateProduct(props.product.id, input)
    if (!r.ok) return (error.value = r.error ?? '')
    toast.show('Produto atualizado')
    emit('saved', { ...props.product, ...input })
  } else {
    const r = catalog.addProduct(input)
    if (!r.ok) return (error.value = r.error)
    toast.show('Produto criado')
    emit('saved', r.product)
  }
  open.value = false
}

function remove() {
  if (!props.product) return
  catalog.removeProduct(props.product.id)
  toast.show('Produto excluído', { type: 'info' })
  open.value = false
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="product ? 'Editar produto' : 'Novo produto'">
    <form class="flex flex-col gap-3" @submit.prevent="save">
      <AppInput v-model="form.name" label="Nome" placeholder="Ex.: Queijo cottage" :error="error" />
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1 text-sm font-semibold">Categoria
          <select v-model="form.categoryId" class="field">
            <option v-for="c in catalog.categories" :key="c.id" :value="c.id">{{ c.emoji }} {{ c.name }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm font-semibold">Unidade
          <select v-model="form.unit" class="field">
            <option v-for="u in PRODUCT_UNITS" :key="u" :value="u">{{ UNIT_INFO[u].label }}</option>
          </select>
        </label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <AppInput v-model="form.qty" label="Qtd. sugerida" inputmode="decimal" />
        <AppInput v-model="form.icon" label="Emoji (opcional)" placeholder="🧀" />
      </div>
      <div class="flex items-end gap-2">
        <div class="flex-1"><AppInput v-model="form.barcode" label="Código de barras (opcional)" inputmode="numeric" hint="Busca opcional no Open Food Facts" /></div>
        <AppButton variant="secondary" :disabled="looking || form.barcode.length < 8" class="mb-5" @click="lookup">{{ looking ? '...' : 'Buscar' }}</AppButton>
      </div>
      <p v-if="form.imageUrl" class="muted flex items-center gap-2 text-xs">
        <img :src="form.imageUrl" alt="" loading="lazy" class="h-10 w-10 rounded-lg object-cover" />
        Imagem: Open Food Facts (CC BY-SA)
      </p>
      <div class="mt-2 flex gap-2">
        <AppButton v-if="product" variant="ghost" class="text-red-600" @click="confirmDelete = true">Excluir</AppButton>
        <AppButton type="submit" block>Salvar</AppButton>
      </div>
    </form>
    <ConfirmDialog v-model:open="confirmDelete" title="Excluir produto?" message="O produto será removido do catálogo. Itens já adicionados às listas serão mantidos." confirm-label="Excluir" @confirm="remove" />
  </BottomSheet>
</template>
