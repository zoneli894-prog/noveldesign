<template>
  <div
    class="absolute pointer-events-none bg-brand-card-solid/95 rounded-lg shadow-brand-md border border-brand-border/60 px-3 py-2 text-xs z-20"
    :style="{ left: `${(x || 0) + 10}px`, top: `${(y || 0) + 10}px` }"
  >
    <div class="font-medium text-brand-text">{{ element.assetKey || element.type }}</div>
    <div v-if="element.bindDocId" class="text-brand-accent mt-0.5">
      绑定: {{ element.bindDocId }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MapElement } from '@/types/map'

defineProps<{
  element: MapElement
  x?: number
  y?: number
}>()
</script>
