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
        <span class="text-brand-muted text-[10px]">{{ doc.wordCount }}字</span>
      </div>
    </div>
    <div v-if="docs.length === 0" class="text-center text-brand-muted text-xs py-8">
      暂无星标收藏
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
</script>
