<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { ShoppingList } from '@/models'
import { useListsStore } from '@/stores/lists'
import { useToastStore } from '@/stores/toast'
import { MONTHS } from '@/utils/text'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ list?: ShoppingList | null }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [ShoppingList] }>()
const lists = useListsStore()
const toast = useToastStore()
const now = new Date()
const form = reactive({ name: '', month: 0, year: now.getFullYear(), fromTemplate: false })
const error = ref('')

watch(open, (v) => {
  if (!v) return
  error.value = ''
  if (props.list) Object.assign(form, { name: props.list.name, month: props.list.month ?? 0, year: props.list.year ?? now.getFullYear(), fromTemplate: false })
  else Object.assign(form, { name: `Compras de ${MONTHS[now.getMonth()]}`, month: now.getMonth() + 1, year: now.getFullYear(), fromTemplate: !!lists.template })
})

function save() {
  if (!form.name.trim()) return (error.value = 'Dê um nome à lista.')
  const month = form.month || undefined
  const year = form.month ? form.year : undefined
  let result: ShoppingList | undefined
  if (props.list) {
    lists.updateList(props.list.id, { name: form.name, month, year })
    result = props.list
    toast.show('Lista atualizada')
  } else if (form.fromTemplate && lists.template) {
    result = lists.duplicateList(lists.template.id, form.name, month, year)
    toast.show('Lista criada a partir do modelo')
  } else {
    result = lists.createList(form.name, { month, year })
    toast.show('Lista criada')
  }
  if (result) emit('saved', result)
  open.value = false
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="list ? 'Editar lista' : 'Nova lista'">
    <form class="flex flex-col gap-3" @submit.prevent="save">
      <AppInput v-model="form.name" label="Nome da lista" :error="error" />
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1 text-sm font-semibold">Mês (opcional)
          <select v-model.number="form.month" class="field">
            <option :value="0">—</option>
            <option v-for="(m, i) in MONTHS" :key="m" :value="i + 1">{{ m }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm font-semibold">Ano
          <input v-model.number="form.year" type="number" min="2000" max="2100" class="field" :disabled="!form.month" />
        </label>
      </div>
      <label v-if="!list && lists.template" class="tap flex items-center gap-3 rounded-xl bg-brand-soft/60 px-3 text-sm font-semibold dark:bg-white/5">
        <input v-model="form.fromTemplate" type="checkbox" class="h-5 w-5 accent-brand" />
        Começar com a lista modelo "{{ lists.template.name }}"
      </label>
      <AppButton type="submit" block class="mt-2">{{ list ? 'Salvar' : 'Criar lista' }}</AppButton>
    </form>
  </BottomSheet>
</template>
