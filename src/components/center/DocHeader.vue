<template>
  <div class="mb-6">
    <div class="flex items-start justify-between gap-4">
      <h1 class="text-3xl font-serif font-semibold text-brand-text leading-tight">
        {{ title }}
      </h1>
      <button
        class="mt-1 text-lg shrink-0 transition-colors"
        :class="starred ? 'text-yellow-500' : 'text-brand-border hover:text-yellow-400'"
        @click="$emit('toggleStar')"
        :title="starred ? '取消收藏' : '添加收藏'"
      >
        {{ starred ? '★' : '☆' }}
      </button>
    </div>
    <div class="flex items-center gap-2 mt-2">
      <span
        class="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-white"
        :style="{ backgroundColor: typeColors[type] || '#888' }"
      >
        {{ typeLabels[type] }}
      </span>
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-block px-2 py-0.5 rounded text-[10px] bg-brand-bg text-brand-muted border border-brand-border"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'
import { typeLabels, typeColors } from '@/data/seed'

defineProps<{
  title: string
  tags: string[]
  type: DocNode['type']
  starred: boolean
}>()
defineEmits<{ toggleStar: [] }>()
</script>
