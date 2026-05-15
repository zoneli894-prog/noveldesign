<template>
  <div class="space-y-1">
    <div
      v-for="doc in docs"
      :key="doc.id"
      class="px-3 py-2 rounded cursor-pointer text-sm transition-colors"
      :class="activeId === doc.id
        ? 'bg-brand-accent/10 text-brand-accent font-medium'
        : 'text-brand-text hover:bg-brand-bg'"
      @click="$emit('select', doc.id)"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs">{{ typeIcons[doc.type] }}</span>
        <span class="truncate flex-1">{{ doc.title }}</span>
      </div>
      <div class="text-[10px] text-brand-muted mt-0.5 ml-5">
        {{ formatTime(doc.updatedAt) }}
      </div>
    </div>
    <div v-if="docs.length === 0" class="text-center text-brand-muted text-xs py-8">
      暂无近期修改
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'

defineProps<{ docs: DocNode[]; activeId: string }>()
defineEmits<{ select: [id: string] }>()

const typeIcons: Record<string, string> = {
  character: '\u{1F464}',
  faction: '\u{1F3DB}',
  location: '\u{1F4CD}',
  item: '\u{2B50}',
  lore: '\u{1F4D6}',
  chapter: '\u{1F4DD}',
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}
</script>
