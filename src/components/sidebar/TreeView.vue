<template>
  <div class="space-y-0.5">
    <TreeNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      :depth="0"
      :active-variant-id="activeVariantId"
      @select="$emit('select', $event)"
      @createChild="$emit('createChild', $event)"
      @selectVariant="$emit('selectVariant', $event)"
      @createSibling="$emit('createSibling', $event)"
      @rename="$emit('rename', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'
import TreeNode from './TreeNode.vue'

defineProps<{
  nodes: DocNode[]
  activeId: string
  activeVariantId?: string
}>()

defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string; type: DocNode['type'] }]
  selectVariant: [{ docId: string; variantId: string }]
  createSibling: [{ parentId: string | null; title: string; type: DocNode['type']; afterId: string }]
  rename: [{ id: string; newTitle: string }]
  delete: [id: string]
}>()
</script>
