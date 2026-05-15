<template>
  <nav class="flex items-center gap-1 text-xs text-brand-muted mb-4">
    <template v-for="(node, i) in path" :key="node.id">
      <button
        class="hover:text-brand-accent transition-colors"
        :class="{ 'text-brand-text font-medium': i === path.length - 1 }"
        @click="$emit('navigate', node.id)"
      >
        {{ node.title }}
      </button>
      <span v-if="i < path.length - 1" class="text-brand-border">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'

defineProps<{ path: DocNode[] }>()
defineEmits<{ navigate: [id: string] }>()
</script>
