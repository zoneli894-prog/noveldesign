<template>
  <div class="relative">
    <input
      v-model="query"
      type="text"
      placeholder="搜索... Ctrl+K"
      class="w-full px-3 py-1.5 text-sm bg-brand-bg border border-brand-border rounded-md
             focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30
             placeholder:text-brand-muted transition-colors"
      @focus="uiStore.openCommandPalette()"
    />
    <kbd class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted bg-white
                border border-brand-border rounded px-1.5 py-0.5 font-mono">
      Ctrl+K
    </kbd>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const query = ref('')
</script>
