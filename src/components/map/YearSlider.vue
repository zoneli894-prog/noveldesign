<template>
  <div class="px-4 py-3 border-t border-brand-border/40">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-brand-muted">纪年</span>
      <span class="text-xs font-medium text-brand-text">天历 {{ currentYear }} 年</span>
    </div>
    <input
      type="range"
      :min="minYear"
      :max="maxYear"
      :value="currentYear"
      class="w-full h-1.5 bg-brand-border rounded-full appearance-none cursor-pointer accent-[var(--color-brand-accent)]"
      @input="handleInput"
    />
    <div class="flex justify-between mt-1">
      <span class="text-[10px] text-brand-muted">{{ minYear }}</span>
      <span class="text-[10px] text-brand-muted">{{ maxYear }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'

const store = useMapEditorStore()

const currentYear = computed(() => store.currentYear)
const minYear = computed(() => {
  const mapData = store.currentMapData
  if (!mapData || mapData.dynamicLayers.length === 0) return 1
  return Math.min(...mapData.dynamicLayers.map(l => l.startYear))
})
const maxYear = computed(() => {
  const mapData = store.currentMapData
  if (!mapData || mapData.dynamicLayers.length === 0) return 100
  const ends = mapData.dynamicLayers.map(l => l.endYear || 100)
  return Math.max(...ends)
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  store.currentYear = parseInt(target.value)
}
</script>
