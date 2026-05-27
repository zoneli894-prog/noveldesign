<template>
  <div class="flex items-center gap-2 px-4 py-2 border-b border-brand-border/40 bg-brand-card/50">
    <div class="flex items-center gap-1">
      <button
        v-for="tool in tools"
        :key="tool.key"
        class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
        :class="store.currentTool === tool.key
          ? 'bg-brand-accent text-white'
          : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
        :title="tool.label"
        @click="store.currentTool = tool.key"
      >
        <component :is="tool.icon" :size="16" />
      </button>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <div class="relative" ref="assetPickerRef">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
        :class="store.selectedAssetKey
          ? 'bg-brand-accent-light text-brand-accent'
          : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
        title="图章"
        @click="showAssetPicker = !showAssetPicker"
      >
        <Mountain :size="16" />
      </button>
      <div
        v-if="showAssetPicker"
        class="absolute top-full left-0 mt-1 p-3 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 z-50"
      >
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="asset in assetList"
            :key="asset.key"
            class="w-14 h-14 flex flex-col items-center justify-center rounded-md transition-colors border"
            :class="store.selectedAssetKey === asset.key
              ? 'bg-brand-accent-light text-brand-accent border-brand-accent/40'
              : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg border-transparent'"
            :title="asset.name"
            @click="handleSelectAsset(asset.key)"
          >
            <svg :viewBox="`0 0 ${asset.width} ${asset.height}`" class="w-9 h-9" overflow="hidden">
              <g v-for="(el, i) in asset.elements" :key="i">
                <polyline
                  :points="el.points.join(' ')"
                  :fill="el.closed ? (el.fill || 'none') : 'none'"
                  :stroke="el.stroke || 'currentColor'"
                  :stroke-width="el.strokeWidth || 1.5"
                  :stroke-linecap="(el.strokeLinecap as any) || 'round'"
                  :stroke-linejoin="(el.strokeLinejoin as any) || 'round'"
                  :opacity="el.opacity || 1"
                />
              </g>
            </svg>
            <span class="text-[9px] mt-0.5 leading-none">{{ asset.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <button
      class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
      :class="store.gridVisible
        ? 'bg-brand-accent-light text-brand-accent'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      title="网格 (G)"
      @click="store.gridVisible = !store.gridVisible"
    >
      <Grid3x3 :size="16" />
    </button>

    <button
      class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
      :class="store.snapToGrid
        ? 'bg-brand-accent-light text-brand-accent'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      title="吸附 (S)"
      @click="store.snapToGrid = !store.snapToGrid"
    >
      <Magnet :size="16" />
    </button>

    <div class="flex-1" />

    <div class="flex items-center gap-1">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
        @click="store.scale = Math.max(0.1, store.scale - 0.1)"
      >
        <Minus :size="14" />
      </button>
      <span class="text-xs text-brand-muted w-10 text-center">{{ Math.round(store.scale * 100) }}%</span>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
        @click="store.scale = Math.min(5, store.scale + 0.1)"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <button
      class="w-8 h-8 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
      title="导出 PNG"
      @click="$emit('export')"
    >
      <Download :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MousePointer2, Pencil, Eraser, Move, Mountain, Grid3x3, Magnet, Plus, Minus, Download } from 'lucide-vue-next'
import { useMapEditorStore } from '@/stores/mapEditor'
import { assetList } from './assets'
import type { AssetKey } from '@/types/map'

defineEmits<{
  export: []
}>()

const store = useMapEditorStore()
const showAssetPicker = ref(false)

const tools = [
  { key: 'select' as const, label: '选择 (V)', icon: MousePointer2 },
  { key: 'draw' as const, label: '绘制 (P)', icon: Pencil },
  { key: 'delete' as const, label: '删除 (D)', icon: Eraser },
  { key: 'pan' as const, label: '平移 (Space)', icon: Move },
]

function handleSelectAsset(assetKey: AssetKey) {
  store.selectAsset(assetKey)
  showAssetPicker.value = false
}
</script>
