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
        <TypeIcon :type="doc.type" :size="14" class="shrink-0 opacity-60" />
        <span class="truncate flex-1">{{ doc.title }}</span>
      </div>
      <div class="text-[10px] text-brand-muted mt-0.5 ml-5">
        {{ formatTime(doc.updatedAt) }}
      </div>
    </div>
    <div v-if="docs.length === 0" class="flex flex-col items-center py-8 gap-2">
      <EmptyCollection />
      <span class="text-brand-muted/50 text-xs">暂无近期修改</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'
import TypeIcon from '@/components/common/TypeIcon.vue'
import EmptyCollection from '@/assets/illustrations/EmptyCollection.vue'

defineProps<{ docs: DocNode[]; activeId: string }>()
defineEmits<{ select: [id: string] }>()

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
