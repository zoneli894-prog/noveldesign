<template>
  <div class="space-y-0.5">
    <TreeNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      :depth="0"
      @select="$emit('select', $event)"
      @createChild="$emit('createChild', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'
import TreeNode from './TreeNode.vue'

defineProps<{ nodes: DocNode[]; activeId: string }>()
defineEmits<{ select: [id: string]; createChild: [{ parentId: string; title: string }] }>()
</script>
