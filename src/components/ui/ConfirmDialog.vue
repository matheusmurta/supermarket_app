<script setup lang="ts">
import BottomSheet from './BottomSheet.vue'
import AppButton from './AppButton.vue'

withDefaults(defineProps<{ title: string; message: string; confirmLabel?: string; danger?: boolean }>(), {
  confirmLabel: 'Confirmar',
  danger: true,
})
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()
function confirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="title">
    <p class="muted mb-5">{{ message }}</p>
    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <AppButton variant="ghost" @click="open = false">Cancelar</AppButton>
      <AppButton :variant="danger ? 'danger' : 'primary'" @click="confirm">{{ confirmLabel }}</AppButton>
    </div>
  </BottomSheet>
</template>
