<template>
  <div class="flex items-center gap-1.5 px-3 py-2 border-b border-brand-border/40 bg-brand-card/50">
    <!-- Tool buttons -->
    <div class="flex items-center gap-0.5">
      <button
        v-for="tool in tools"
        :key="tool.key"
        class="w-8 h-8 flex items-center justify-center rounded-md transition-colors relative group"
        :class="store.currentTool === tool.key && !store.selectedAssetKey
          ? 'bg-brand-accent text-white'
          : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
        :title="tool.label"
        @click="handleToolClick(tool.key)"
      >
        <component :is="tool.icon" :size="16" />
        <span class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">{{ tool.shortcut }}</span>
      </button>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <!-- Stamp picker -->
    <div class="relative">
      <button
        class="h-8 px-2 flex items-center gap-1.5 rounded-md transition-colors text-xs"
        :class="store.selectedAssetKey
          ? 'bg-brand-accent text-white'
          : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
        title="选择图章后点击画布放置 (快捷键: 1-6)"
        @click="showAssetPicker = !showAssetPicker"
      >
        <Mountain :size="16" />
        <span v-if="selectedAssetName" class="max-w-[50px] truncate">{{ selectedAssetName }}</span>
      </button>
      <div
        v-if="showAssetPicker"
        class="absolute top-full left-0 mt-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 z-50 w-[200px]"
      >
        <div class="p-1.5 border-b border-brand-border/30 text-[10px] text-brand-muted">
          选择后点击画布放置，按 ESC 取消
        </div>
        <div class="grid grid-cols-3 gap-1 p-1.5">
          <button
            v-for="(asset, idx) in assetList"
            :key="asset.key"
            class="flex flex-col items-center justify-center rounded-lg transition-all border p-1"
            :class="store.selectedAssetKey === asset.key
              ? 'bg-brand-accent text-white border-brand-accent'
              : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg border-transparent'"
            :title="`${asset.name} (${idx + 1})`"
            @click="handleSelectAsset(asset.key)"
          >
            <div class="w-10 h-10 flex items-center justify-center overflow-hidden rounded bg-brand-bg/50">
              <svg :viewBox="`0 0 ${asset.width} ${asset.height}`" class="w-8 h-8">
                <g v-for="(el, i) in asset.elements" :key="i">
                  <polyline
                    :points="el.points.join(' ')"
                    :fill="el.closed ? (el.fill || 'none') : 'none'"
                    :stroke="store.selectedAssetKey === asset.key ? 'white' : 'currentColor'"
                    :stroke-width="el.strokeWidth || 1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :opacity="el.opacity || 1"
                  />
                </g>
              </svg>
            </div>
            <span class="text-[9px] mt-0.5 leading-none">{{ asset.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <!-- Grid & snap -->
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

    <!-- Zoom -->
    <div class="flex items-center gap-0.5">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
        @click="store.scale = Math.max(0.1, store.scale - 0.1)"
      >
        <Minus :size="14" />
      </button>
      <span class="text-xs text-brand-muted w-10 text-center tabular-nums">{{ Math.round(store.scale * 100) }}%</span>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
        @click="store.scale = Math.min(5, store.scale + 0.1)"
      >
        <Plus :size="14" />
      </button>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <!-- Export -->
    <button
      class="w-8 h-8 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
      title="导出 PNG (Ctrl+E)"
      @click="$emit('export')"
    >
      <Download :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MousePointer2, Pencil, Eraser, Move, Mountain, Grid3x3, Magnet, Plus, Minus, Download } from 'lucide-vue-next'
import { useMapEditorStore } from '@/stores/mapEditor'
import { assetList, assetRegistry } from './assets'
import type { AssetKey, MapTool } from '@/types/map'

defineEmits<{
  export: []
}>()

const store = useMapEditorStore()
const showAssetPicker = ref(false)

const selectedAssetName = computed(() => {
  if (!store.selectedAssetKey) return ''
  return assetRegistry[store.selectedAssetKey]?.name || ''
})

const tools: { key: MapTool; label: string; icon: any; shortcut: string }[] = [
  { key: 'select', label: '选择 (V)', icon: MousePointer2, shortcut: 'V' },
  { key: 'draw', label: '绘制 (P)', icon: Pencil, shortcut: 'P' },
  { key: 'delete', label: '删除 (D)', icon: Eraser, shortcut: 'D' },
  { key: 'pan', label: '平移 (Space)', icon: Move, shortcut: 'Spc' },
]

function handleToolClick(tool: MapTool) {
  store.currentTool = tool
  if (tool !== 'select') {
    store.selectedAssetKey = null
  }
  showAssetPicker.value = false
}

function handleSelectAsset(assetKey: AssetKey) {
  store.selectAsset(assetKey)
  showAssetPicker.value = false
}
</script>
