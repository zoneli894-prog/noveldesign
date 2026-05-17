<template>
  <button
    class="text-brand-muted/50 hover:text-brand-accent transition-all duration-200 hover:rotate-12"
    @click="uiStore.toggleNight()"
    :title="uiStore.nightMode ? '切换到日间模式' : '切换到夜间模式'"
  >
    <Sun v-if="uiStore.nightMode" :size="15" />
    <Moon v-else :size="15" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>
