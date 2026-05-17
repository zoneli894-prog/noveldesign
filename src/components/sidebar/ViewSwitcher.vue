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
      <component :is="item.icon" :size="12" />
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { TreePine, Clock, Star } from 'lucide-vue-next'
import type { ViewMode } from '@/types'
import type { Component } from 'vue'

defineProps<{ mode: ViewMode }>()
defineEmits<{ 'update:mode': [mode: ViewMode] }>()

const views: { value: ViewMode; label: string; icon: Component }[] = [
  { value: 'tree', label: '目录', icon: TreePine },
  { value: 'recent', label: '近期', icon: Clock },
  { value: 'starred', label: '收藏', icon: Star },
]
</script>
