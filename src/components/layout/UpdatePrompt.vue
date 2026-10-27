<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { RefreshCw } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({ immediate: true })
</script>

<template>
  <Transition name="sheet">
    <div
      v-if="needRefresh || offlineReady"
      role="status"
      class="card fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 p-3 md:bottom-6"
    >
      <RefreshCw v-if="needRefresh" :size="20" class="shrink-0 text-brand" />
      <p class="flex-1 text-sm font-medium">
        {{ needRefresh ? 'Nova versão disponível.' : 'Pronto para usar offline!' }}
      </p>
      <AppButton v-if="needRefresh" size="sm" @click="updateServiceWorker(true)">Atualizar</AppButton>
      <AppButton size="sm" variant="ghost" @click="needRefresh = false; offlineReady = false">Fechar</AppButton>
    </div>
  </Transition>
</template>
