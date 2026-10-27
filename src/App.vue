<script setup lang="ts">
import BottomNavigation from '@/components/layout/BottomNavigation.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'
import UpdatePrompt from '@/components/layout/UpdatePrompt.vue'
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-2">
    Pular para o conteúdo
  </a>
  <div class="mx-auto flex min-h-dvh max-w-5xl flex-col md:flex-row">
    <BottomNavigation />
    <main id="main" class="min-w-0 flex-1 pb-28 md:pb-8">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
  <ToastNotification />
  <UpdatePrompt />
</template>
