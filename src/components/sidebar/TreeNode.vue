<template>
  <div>
    <div
      class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm group transition-colors"
      :class="[
        activeId === node.id
          ? 'bg-brand-accent/10 text-brand-accent font-medium'
          : 'text-brand-text hover:bg-brand-bg',
      ]"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- Expand/collapse toggle -->
      <button
        v-if="node.children.length > 0"
        class="w-4 h-4 flex items-center justify-center text-brand-muted hover:text-brand-text shrink-0 transition-transform"
        :class="{ 'rotate-90': expanded }"
        @click.stop="expanded = !expanded"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M3 1 L7 5 L3 9Z" />
        </svg>
      </button>
      <span v-else class="w-4 shrink-0" />

      <!-- Type icon -->
      <span class="w-4 text-center text-xs shrink-0" :title="typeLabels[node.type]">
        {{ typeIcons[node.type] }}
      </span>

      <!-- Title -->
      <span class="truncate flex-1" :title="node.title">{{ node.title }}</span>

      <!-- Word count on hover -->
      <span
        class="text-[10px] text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        {{ node.wordCount }}字
      </span>
    </div>

    <!-- Children -->
    <div v-if="node.children.length > 0 && expanded">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DocNode } from '@/types'
import { typeLabels } from '@/data/seed'

const props = defineProps<{ node: DocNode; activeId: string; depth: number }>()
const emit = defineEmits<{ select: [id: string] }>()

const expanded = ref(props.depth < 1)

const typeIcons: Record<string, string> = {
  character: '\u{1F464}',
  faction: '\u{1F3DB}',
  location: '\u{1F4CD}',
  item: '\u{2B50}',
  lore: '\u{1F4D6}',
  chapter: '\u{1F4DD}',
}

function handleClick() {
  if (props.node.children.length > 0 && !expanded.value) {
    expanded.value = true
  }
  emit('select', props.node.id)
}
</script>
