<template>
  <div class="mb-8 animate-content-enter">
    <div class="flex items-start justify-between gap-4">
      <h1 class="text-[1.85rem] font-serif font-semibold text-brand-text leading-snug tracking-tight">
        {{ title }}
      </h1>
      <div class="flex items-center gap-1 mt-1.5 shrink-0">
        <button
          class="transition-all duration-200 hover:scale-110"
          :class="starred ? 'text-amber-400' : 'text-brand-border/60 hover:text-amber-400'"
          @click="$emit('toggleStar')"
          :title="starred ? '取消收藏' : '添加收藏'"
        >
          <Star :size="20" :fill="starred ? 'currentColor' : 'none'" />
        </button>
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-red-400"
          @click="$emit('delete')"
          title="删除词条"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span
        class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
        :style="{
          backgroundColor: typeColors[type] ? typeColors[type] + '18' : '#88888818',
          color: typeColors[type] || '#888'
        }"
      >
        {{ typeLabels[type] }}
      </span>
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-block px-2 py-0.5 rounded-md text-[10px] text-brand-muted/70 bg-brand-bg/80 hover:bg-brand-accent-light hover:text-brand-accent transition-colors duration-150 cursor-default"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Trash2 } from 'lucide-vue-next'
import type { DocNode } from '@/types'
import { typeLabels, typeColors } from '@/data/seed'

defineProps<{
  title: string
  tags: string[]
  type: DocNode['type']
  starred: boolean
}>()
defineEmits<{ toggleStar: []; delete: [] }>()
</script>
