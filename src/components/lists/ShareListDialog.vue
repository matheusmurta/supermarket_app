<script setup lang="ts">
import { computed } from 'vue'
import { Copy, MessageCircle, Share2 } from 'lucide-vue-next'
import type { ShoppingList } from '@/models'
import { useCatalogStore } from '@/stores/catalog'
import { useToastStore } from '@/stores/toast'
import { buildShareMessage, canNativeShare, copyToClipboard, listTitle, nativeShare, whatsappUrl, WHATSAPP_SAFE_LENGTH } from '@/services/sharing.service'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ list: ShoppingList }>()
const open = defineModel<boolean>('open', { default: false })
const catalog = useCatalogStore()
const toast = useToastStore()

const message = computed(() => buildShareMessage(props.list, catalog.categories))
const url = computed(() => whatsappUrl(message.value))
const tooLong = computed(() => url.value.length > WHATSAPP_SAFE_LENGTH)
const native = canNativeShare()

async function copy() {
  const ok = await copyToClipboard(message.value)
  toast.show(ok ? 'Lista copiada! Cole no WhatsApp ou onde preferir.' : 'Não foi possível copiar.', { type: ok ? 'success' : 'error' })
}
async function share() {
  const r = await nativeShare(listTitle(props.list), message.value)
  if (r === 'unsupported') await copy()
}
</script>

<template>
  <BottomSheet v-model:open="open" title="Compartilhar lista">
    <pre class="mb-4 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-surface p-3 font-sans text-sm dark:bg-black/30" data-testid="share-preview">{{ message }}</pre>
    <p v-if="tooLong" class="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100" role="note">
      Esta lista é longa e alguns aparelhos podem cortar o texto ao abrir pelo link. Para garantir a lista completa, use <strong>Copiar</strong> ou <strong>Compartilhar</strong>.
    </p>
    <div class="flex flex-col gap-2">
      <a :href="url" target="_blank" rel="noopener" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1FAF57] font-bold text-white transition hover:brightness-95 active:scale-[.98]" data-testid="whatsapp-link">
        <MessageCircle :size="20" /> Compartilhar no WhatsApp
      </a>
      <div class="grid grid-cols-2 gap-2">
        <AppButton variant="secondary" @click="copy"><Copy :size="18" /> Copiar</AppButton>
        <AppButton variant="secondary" :disabled="!native" :title="native ? '' : 'Não suportado neste navegador'" @click="share"><Share2 :size="18" /> Outros apps</AppButton>
      </div>
    </div>
  </BottomSheet>
</template>
