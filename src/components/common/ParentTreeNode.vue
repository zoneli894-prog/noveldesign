<template>
  <div>
    <label
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
      :class="selectedId === node.id ? 'bg-brand-accent-light/50' : 'hover:bg-brand-bg'"
      :style="{ paddingLeft: `${depth * 16 + 12}px` }"
    >
      <input
        type="radio"
        :checked="selectedId === node.id"
        class="accent-[var(--color-brand-accent)]"
        @change="$emit('select', node.id)"
      />
      <TypeIcon :type="node.type" :size="14" :color="typeColors[node.type]" class="shrink-0 opacity-60" />
      <span class="text-sm text-brand-text truncate">{{ node.title }}</span>
    </label>
    <ParentTreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :depth="depth + 1"
      :selected-id="selectedId"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script lang="ts">
export default { name: 'ParentTreeNode' }
</script>

<script setup lang="ts">
import type { DocNode } from '@/types'
import { typeColors } from '@/data/seed'
import TypeIcon from '@/components/common/TypeIcon.vue'

defineProps<{
  node: DocNode
  depth: number
  selectedId: string | null
}>()
defineEmits<{ select: [id: string] }>()
</script>
