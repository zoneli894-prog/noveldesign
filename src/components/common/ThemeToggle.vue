<template>
  <button
    class="text-brand-muted/50 hover:text-brand-accent text-sm transition-all duration-200 hover:rotate-12"
    @click="uiStore.toggleNight()"
    :title="uiStore.nightMode ? '切换到日间模式' : '切换到夜间模式'"
  >
    {{ uiStore.nightMode ? '☀' : '☾' }}
  </button>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>
