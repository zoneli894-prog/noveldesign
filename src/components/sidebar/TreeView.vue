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
  createChild: [{ parentId: string; title: string }]
  selectVariant: [{ docId: string; variantId: string }]
}>()
</script>
