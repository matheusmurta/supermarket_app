<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { ListItem, ProductUnit } from '@/models'
import { PRODUCT_UNITS } from '@/models'
import { useListsStore } from '@/stores/lists'
import { UNIT_INFO } from '@/utils/units'
import { parseDecimal } from '@/utils/text'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ listId: string; item: ListItem | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ remove: [ListItem] }>()
const lists = useListsStore()
const form = reactive({ qty: '', unit: 'un' as ProductUnit, packageSize: '', notes: '', price: '' })
const errors = reactive({ qty: '', price: '' })
const saving = ref(false)

watch(open, (v) => {
  if (!v || !props.item) return
  const i = props.item
  Object.assign(form, {
    qty: String(i.quantity).replace('.', ','),
    unit: i.unit,
    packageSize: i.packageSize ?? '',
    notes: i.notes ?? '',
    price: i.price !== undefined ? String(i.price).replace('.', ',') : '',
  })
  errors.qty = errors.price = ''
})

function save() {
  if (!props.item) return
  const qty = parseDecimal(form.qty)
  errors.qty = qty === null || qty <= 0 ? 'Informe uma quantidade maior que zero (ex.: 0,5).' : ''
  const price = form.price.trim() ? parseDecimal(form.price) : undefined
  errors.price = price === null || (price !== undefined && price < 0) ? 'Preço inválido.' : ''
  if (errors.qty || errors.price) return
  saving.value = true
  lists.updateItem(props.listId, props.item.id, {
    quantity: qty!,
    unit: form.unit,
    packageSize: form.packageSize.trim() || undefined,
    notes: form.notes.trim() || undefined,
    price: price ?? undefined,
  })
  saving.value = false
  open.value = false
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="item ? `${item.icon ?? ''} ${item.name}` : 'Item'">
    <form v-if="item" class="flex flex-col gap-3" @submit.prevent="save">
      <div class="grid grid-cols-2 gap-3">
        <AppInput v-model="form.qty" label="Quantidade" inputmode="decimal" :error="errors.qty" />
        <label class="flex flex-col gap-1 text-sm font-semibold">Unidade
          <select v-model="form.unit" class="field">
            <option v-for="u in PRODUCT_UNITS" :key="u" :value="u">{{ UNIT_INFO[u].label }}</option>
          </select>
        </label>
      </div>
      <AppInput v-model="form.packageSize" label="Tamanho da embalagem (opcional)" placeholder="Ex.: 5 kg, 1 L, 500 g" hint="Ex.: 2 pacotes de 5 kg — a quantidade é o nº de embalagens." />
      <AppInput v-model="form.price" label="Preço estimado por unidade (opcional)" inputmode="decimal" placeholder="R$ 0,00" :error="errors.price" />
      <label class="flex flex-col gap-1 text-sm font-semibold">Observações
        <textarea v-model="form.notes" rows="2" class="field py-2" placeholder="Ex.: marca preferida, maduro..." />
      </label>
      <div class="mt-2 flex gap-2">
        <AppButton variant="ghost" class="text-red-600" @click="emit('remove', item); open = false">Remover</AppButton>
        <AppButton type="submit" block :disabled="saving">Salvar</AppButton>
      </div>
    </form>
  </BottomSheet>
</template>
