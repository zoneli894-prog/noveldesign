<template>
  <nav class="flex items-center gap-1.5 text-xs text-brand-muted/50 mb-5">
    <template v-for="(node, i) in path" :key="node.id">
      <button
        class="hover:text-brand-accent transition-colors duration-150 px-1 py-0.5 -mx-1 rounded hover:bg-brand-accent-light/50"
        :class="{ 'text-brand-text/70 font-medium': i === path.length - 1 }"
        @click="$emit('navigate', node.id)"
      >
        {{ node.title }}
      </button>
      <span v-if="i < path.length - 1" class="text-brand-border/50 text-[10px]">›</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'

defineProps<{ path: DocNode[] }>()
defineEmits<{ navigate: [id: string] }>()
</script>
