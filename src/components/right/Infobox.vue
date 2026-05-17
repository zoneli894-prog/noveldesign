<template>
  <div>
    <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">属性信息</h3>
    <div class="bg-brand-card rounded-xl border border-brand-border/50 overflow-hidden shadow-brand-sm">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-brand-border/40 bg-brand-bg/30">
        <div class="flex items-center gap-2">
          <span
            class="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            :style="{ backgroundColor: typeColors[type] || '#888' }"
          />
          <div class="font-serif font-semibold text-sm text-brand-text">{{ title }}</div>
        </div>
        <span
          class="inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-medium tracking-wide"
          :style="{
            backgroundColor: typeColors[type] ? typeColors[type] + '15' : '#88888815',
            color: typeColors[type] || '#888'
          }"
        >
          {{ typeLabels[type] }}
        </span>
      </div>
      <!-- Fields -->
      <div class="divide-y divide-brand-border/30">
        <div
          v-for="(field, index) in fields"
          :key="field.key"
          class="flex px-4 py-2 text-xs transition-colors hover:bg-brand-bg/30"
        >
          <span class="w-14 shrink-0 text-brand-muted/70 font-medium">{{ field.key }}</span>
          <span class="flex-1 text-brand-text/90 leading-relaxed">{{ field.value }}</span>
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
