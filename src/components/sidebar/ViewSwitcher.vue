<template>
  <div class="flex border-b border-brand-border">
    <button
      v-for="item in views"
      :key="item.value"
      class="flex-1 py-2 text-xs flex items-center justify-center gap-1 transition-colors"
      :class="mode === item.value
        ? 'text-brand-accent border-b-2 border-brand-accent'
        : 'text-brand-muted hover:text-brand-text'"
      @click="$emit('update:mode', item.value)"
    >
      <span v-html="item.icon" />
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from '@/types'

defineProps<{ mode: ViewMode }>()
defineEmits<{ 'update:mode': [mode: ViewMode] }>()

const views: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'tree', label: '目录', icon: '&#9776;' },
  { value: 'recent', label: '近期', icon: '&#9202;' },
  { value: 'starred', label: '收藏', icon: '&#9733;' },
]
</script>
