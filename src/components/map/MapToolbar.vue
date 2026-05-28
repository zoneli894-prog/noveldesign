<template>
  <div class="flex items-center gap-1.5 px-3 py-2 border-b border-brand-border/40 bg-brand-card/50">
    <!-- Tool buttons with clear labels -->
    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium"
      :class="store.currentTool === 'select' && !store.selectedAssetKey
        ? 'bg-brand-accent text-white'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.currentTool = 'select'; store.selectedAssetKey = null"
    >
      <MousePointer2 :size="14" />
      选择
    </button>

    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium"
      :class="store.selectedAssetKey
        ? 'bg-brand-accent text-white'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="showAssetPicker = !showAssetPicker"
    >
      <Mountain :size="14" />
      {{ selectedAssetName || '图章' }}
    </button>

    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium"
      :class="store.currentTool === 'draw'
        ? 'bg-brand-accent text-white'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.currentTool = 'draw'; store.selectedAssetKey = null; store.cancelDraw()"
    >
      <Pen :size="14" />
      绘制
    </button>

    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium"
      :class="store.currentTool === 'delete'
        ? 'bg-red-500 text-white'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.currentTool = 'delete'; store.selectedAssetKey = null"
    >
      <Eraser :size="14" />
      擦除
    </button>

    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium"
      :class="store.currentTool === 'pan'
        ? 'bg-brand-accent text-white'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.currentTool = 'pan'"
    >
      <Move :size="14" />
      平移
    </button>

    <div class="w-px h-5 bg-brand-border/40" />

    <!-- Stamp picker dropdown -->
    <div
      v-if="showAssetPicker"
      class="absolute top-full left-0 mt-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 z-50 w-[260px] max-h-[400px] overflow-y-auto"
    >
      <div class="p-2 border-b border-brand-border/30 text-[10px] text-brand-muted">
        选择图章后，在画布上点击放置
      </div>
      <div v-for="category in assetCategories" :key="category.name" class="p-2">
        <div class="text-[10px] font-medium text-brand-muted mb-1.5 px-0.5">{{ category.name }}</div>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="assetKey in category.keys"
            :key="assetKey"
            class="flex flex-col items-center justify-center rounded-lg transition-all border p-1"
            :class="store.selectedAssetKey === assetKey
              ? 'bg-brand-accent text-white border-brand-accent'
              : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg border-transparent'"
            @click="handleSelectAsset(assetKey)"
          >
            <div class="w-10 h-10 flex items-center justify-center overflow-hidden rounded bg-brand-bg/50">
              <svg :viewBox="`0 0 ${assetRegistry[assetKey].width} ${assetRegistry[assetKey].height}`" class="w-8 h-8">
                <g v-for="(el, i) in assetRegistry[assetKey].elements" :key="i">
                  <polyline
                    :points="el.points.join(' ')"
                    :fill="el.closed ? (el.fill || 'none') : 'none'"
                    :stroke="store.selectedAssetKey === assetKey ? 'white' : 'currentColor'"
                    :stroke-width="el.strokeWidth || 1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :opacity="el.opacity || 1"
                  />
                </g>
              </svg>
            </div>
            <span class="text-[9px] mt-0.5 leading-none font-medium">{{ assetRegistry[assetKey].name }}</span>
          </button>
        </div>
      </div>
      <div v-if="store.selectedAssetKey" class="p-2 border-t border-brand-border/30">
        <button
          class="w-full text-[10px] text-brand-muted hover:text-red-500 transition-colors py-1"
          @click="store.selectedAssetKey = null"
        >
          取消选择
        </button>
      </div>
    </div>

    <div class="w-px h-5 bg-brand-border/40" />

    <!-- Toggle buttons -->
    <button
      class="h-8 px-2 flex items-center gap-1 rounded-md transition-colors text-xs"
      :class="store.gridVisible
        ? 'bg-brand-accent-light text-brand-accent'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.gridVisible = !store.gridVisible"
    >
      <Grid3x3 :size="14" />
      网格
    </button>

    <!-- Grid size control -->
    <div v-if="store.gridVisible" class="flex items-center gap-0.5">
      <button
        class="w-6 h-6 flex items-center justify-center rounded text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors text-[10px]"
        @click="store.gridSize = Math.max(20, store.gridSize - 10)"
      >-</button>
      <span class="text-[10px] text-brand-muted tabular-nums w-8 text-center">{{ store.gridSize }}px</span>
      <button
        class="w-6 h-6 flex items-center justify-center rounded text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors text-[10px]"
        @click="store.gridSize = Math.min(200, store.gridSize + 10)"
      >+</button>
    </div>

    <button
      class="h-8 px-2 flex items-center gap-1 rounded-md transition-colors text-xs"
      :class="store.snapToGrid
        ? 'bg-brand-accent-light text-brand-accent'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
      @click="store.snapToGrid = !store.snapToGrid"
    >
      <Magnet :size="14" />
      吸附
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

    <!-- Properties toggle -->
    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium text-brand-muted hover:text-brand-text hover:bg-brand-bg"
      @click="$emit('toggleProperties')"
    >
      <Settings :size="14" />
      属性
    </button>

    <!-- Export -->
    <button
      class="h-8 px-2.5 flex items-center gap-1.5 rounded-md transition-colors text-xs font-medium text-brand-muted hover:text-brand-text hover:bg-brand-bg"
      @click="$emit('export')"
    >
      <Download :size="14" />
      导出
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MousePointer2, Eraser, Move, Mountain, Pen, Grid3x3, Magnet, Plus, Minus, Download, Settings } from 'lucide-vue-next'
import { useMapEditorStore } from '@/stores/mapEditor'
import { assetList, assetRegistry, assetCategories } from './assets'
import type { AssetKey } from '@/types/map'

defineEmits<{
  export: []
  toggleProperties: []
}>()

const store = useMapEditorStore()
const showAssetPicker = ref(false)

const selectedAssetName = computed(() => {
  if (!store.selectedAssetKey) return ''
  return assetRegistry[store.selectedAssetKey]?.name || ''
})

function handleSelectAsset(assetKey: AssetKey) {
  store.selectAsset(assetKey)
  showAssetPicker.value = false
}
</script>
