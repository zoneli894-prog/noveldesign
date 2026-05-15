<template>
  <div>
    <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">属性信息</h3>
    <div class="bg-white/80 rounded-lg border border-brand-border overflow-hidden">
      <!-- Header -->
      <div class="px-3 py-2 border-b border-brand-border bg-brand-bg/50">
        <div class="font-serif font-semibold text-sm">{{ title }}</div>
        <span
          class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
          :style="{ backgroundColor: typeColors[type] || '#888' }"
        >
          {{ typeLabels[type] }}
        </span>
      </div>
      <!-- Fields -->
      <div class="divide-y divide-brand-border/50">
        <div
          v-for="field in fields"
          :key="field.key"
          class="flex px-3 py-1.5 text-xs"
        >
          <span class="w-16 shrink-0 text-brand-muted">{{ field.key }}</span>
          <span class="flex-1 text-brand-text">{{ field.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InfoboxField, DocNode } from '@/types'
import { typeLabels, typeColors } from '@/data/seed'

defineProps<{
  fields: InfoboxField[]
  title: string
  type: DocNode['type']
}>()
</script>
