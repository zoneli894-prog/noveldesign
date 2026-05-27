# 地图与地理功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个具有古风美学的 Canvas 地图编辑器，支持计里画方网格、6 种图章、多版本平行时空图层、纪年联动和 PNG 导出。

**Architecture:** 使用 Konva.js 作为 Canvas 渲染引擎，通过 Vue 3 Composition API 管理状态，Pinia store 持久化地图数据。地图数据嵌入 Project 模型，支持多版本时空图层绑定词条/平行分身。

**Tech Stack:** Vue 3, TypeScript, Konva.js (@konva/vue-konva), Pinia, Tailwind CSS

---

## 文件结构

```
src/
├── types/
│   └── map.ts                          # 地图相关类型定义
├── stores/
│   └── mapEditor.ts                    # 地图编辑器状态管理
├── components/
│   └── map/
│       ├── MapEditor.vue               # 地图编辑器主容器
│       ├── MapToolbar.vue              # 顶部工具栏
│       ├── MapCanvas.vue               # Konva 画布容器
│       ├── MapProperties.vue           # 右侧属性面板
│       ├── YearSlider.vue              # 纪年滑块
│       ├── MapTooltip.vue              # 悬浮提示
│       ├── BindVariantDialog.vue       # 绑定词条对话框
│       ├── assets/
│       │   ├── index.ts                # 图章资源导出
│       │   ├── inkMountainChain.ts     # 群山图章路径
│       │   ├── inkPeak.ts              # 奇峰图章路径
│       │   ├── inkRiver.ts             # 水系图章路径
│       │   ├── cityGate.ts             # 城池图章路径
│       │   ├── mountainPass.ts         # 关隘图章路径
│       │   └── ferryCrossing.ts        # 渡口图章路径
│       └── composables/
│           ├── useMapCanvas.ts         # 画布交互逻辑
│           ├── useMapTools.ts          # 工具切换逻辑
│           ├── useMapHistory.ts        # 撤销/重做逻辑
│           └── useMapExport.ts         # 导出逻辑
├── utils/
│   └── mapUtils.ts                     # 地图工具函数
└── data/
    └── seedMap.ts                      # 示例地图种子数据
```

---

## Task 1: 类型定义

**Files:**
- Create: `src/types/map.ts`

- [ ] **Step 1: 创建地图类型定义**

```typescript
// src/types/map.ts

export interface MapData {
  id: string
  name: string
  projectId: string
  scale: number
  gridSize: number
  background: '#F6F5F2' | '#EFE3C3'
  width: number
  height: number
  staticElements: MapElement[]
  dynamicLayers: MapLayer[]
  counters: {
    element: number
    layer: number
  }
}

export interface MapElement {
  id: string
  type: 'asset' | 'text' | 'marker'
  assetKey?: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  bindDocId?: string
  zIndex: number
  visible: boolean
  locked: boolean
}

export interface MapLayer {
  id: string
  type: 'polygon' | 'rectangle' | 'circle'
  points: number[][]
  bindVariantId?: string
  startYear: number
  endYear: number | null
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  zIndex: number
  visible: boolean
  locked: boolean
}

export type MapTool = 'select' | 'draw' | 'delete' | 'pan'

export type AssetKey =
  | 'ink_mountain_chain'
  | 'ink_peak'
  | 'ink_river'
  | 'city_gate'
  | 'mountain_pass'
  | 'ferry_crossing'

export interface AssetDefinition {
  key: AssetKey
  name: string
  width: number
  height: number
  path: string
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS (无类型错误)

- [ ] **Step 3: 提交**

```bash
git add src/types/map.ts
git commit -m "feat: add map editor type definitions"
```

---

## Task 2: Pinia Store

**Files:**
- Create: `src/stores/mapEditor.ts`
- Modify: `src/types/index.ts` (添加 mapData 字段到 Project)

- [ ] **Step 1: 更新 Project 类型**

```typescript
// src/types/index.ts - 在 Project 接口中添加
import type { MapData } from './map'

export interface Project {
  // ... 现有字段
  mapData: MapData | null
}
```

- [ ] **Step 2: 创建地图编辑器 Store**

```typescript
// src/stores/mapEditor.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MapData, MapElement, MapLayer, MapTool, AssetKey } from '@/types/map'
import { useNovelDataStore } from './novelData'

export const useMapEditorStore = defineStore('mapEditor', () => {
  const novelStore = useNovelDataStore()
  
  const currentYear = ref(1)
  const currentTool = ref<MapTool>('select')
  const selectedElementId = ref<string | null>(null)
  const selectedLayerId = ref<string | null>(null)
  const gridVisible = ref(true)
  const snapToGrid = ref(true)
  const scale = ref(1)
  const position = ref({ x: 0, y: 0 })
  
  const currentMapData = computed(() => novelStore.activeProject?.mapData || null)
  
  const activeLayers = computed(() => {
    const mapData = currentMapData.value
    if (!mapData) return []
    return mapData.dynamicLayers.filter(layer => {
      const startMatch = layer.startYear <= currentYear.value
      const endMatch = layer.endYear === null || layer.endYear >= currentYear.value
      return startMatch && endMatch && layer.visible
    })
  })
  
  function getMapData(): MapData {
    if (!currentMapData.value) {
      throw new Error('No active map')
    }
    return currentMapData.value
  }
  
  function addElement(element: Omit<MapElement, 'id'>): MapElement {
    const mapData = getMapData()
    const id = `element-${++mapData.counters.element}`
    const newElement: MapElement = { ...element, id }
    mapData.staticElements.push(newElement)
    return newElement
  }
  
  function updateElement(id: string, updates: Partial<MapElement>) {
    const mapData = getMapData()
    const element = mapData.staticElements.find(e => e.id === id)
    if (element) Object.assign(element, updates)
  }
  
  function deleteElement(id: string) {
    const mapData = getMapData()
    mapData.staticElements = mapData.staticElements.filter(e => e.id !== id)
    if (selectedElementId.value === id) selectedElementId.value = null
  }
  
  function addLayer(layer: Omit<MapLayer, 'id'>): MapLayer {
    const mapData = getMapData()
    const id = `layer-${++mapData.counters.layer}`
    const newLayer: MapLayer = { ...layer, id }
    mapData.dynamicLayers.push(newLayer)
    return newLayer
  }
  
  function updateLayer(id: string, updates: Partial<MapLayer>) {
    const mapData = getMapData()
    const layer = mapData.dynamicLayers.find(l => l.id === id)
    if (layer) Object.assign(layer, updates)
  }
  
  function deleteLayer(id: string) {
    const mapData = getMapData()
    mapData.dynamicLayers = mapData.dynamicLayers.filter(l => l.id !== id)
    if (selectedLayerId.value === id) selectedLayerId.value = null
  }
  
  function initMap(projectId: string) {
    const project = novelStore.projects.find(p => p.id === projectId)
    if (!project) return
    
    if (!project.mapData) {
      project.mapData = {
        id: `map-${Date.now()}`,
        name: '舆地图',
        projectId,
        scale: 100,
        gridSize: 50,
        background: '#F6F5F2',
        width: 3000,
        height: 3000,
        staticElements: [],
        dynamicLayers: [],
        counters: { element: 0, layer: 0 },
      }
    }
  }
  
  return {
    currentYear, currentTool, selectedElementId, selectedLayerId,
    gridVisible, snapToGrid, scale, position,
    currentMapData, activeLayers,
    addElement, updateElement, deleteElement,
    addLayer, updateLayer, deleteLayer,
    initMap, getMapData,
  }
}, {
  persist: {
    key: 'noveldesign-map-editor',
    pick: ['currentYear', 'gridVisible', 'snapToGrid', 'scale'],
  }
})
```

- [ ] **Step 3: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/types/index.ts src/stores/mapEditor.ts
git commit -m "feat: add map editor Pinia store"
```

---

## Task 3: 图章资源

**Files:**
- Create: `src/components/map/assets/inkMountainChain.ts`
- Create: `src/components/map/assets/inkPeak.ts`
- Create: `src/components/map/assets/inkRiver.ts`
- Create: `src/components/map/assets/cityGate.ts`
- Create: `src/components/map/assets/mountainPass.ts`
- Create: `src/components/map/assets/ferryCrossing.ts`
- Create: `src/components/map/assets/index.ts`

- [ ] **Step 1: 创建群山图章**

```typescript
// src/components/map/assets/inkMountainChain.ts
import type { AssetDefinition } from '@/types/map'

export const inkMountainChain: AssetDefinition = {
  key: 'ink_mountain_chain',
  name: '群山',
  width: 120,
  height: 60,
  path: 'M0,60 L10,45 L20,55 L30,35 L40,50 L50,25 L60,45 L70,30 L80,50 L90,20 L100,45 L110,35 L120,60 Z',
}
```

- [ ] **Step 2: 创建奇峰图章**

```typescript
// src/components/map/assets/inkPeak.ts
import type { AssetDefinition } from '@/types/map'

export const inkPeak: AssetDefinition = {
  key: 'ink_peak',
  name: '奇峰',
  width: 40,
  height: 80,
  path: 'M20,0 L35,60 L30,65 L25,55 L20,70 L15,55 L10,65 L5,60 Z',
}
```

- [ ] **Step 3: 创建水系图章**

```typescript
// src/components/map/assets/inkRiver.ts
import type { AssetDefinition } from '@/types/map'

export const inkRiver: AssetDefinition = {
  key: 'ink_river',
  name: '水系',
  width: 100,
  height: 30,
  path: 'M0,15 Q25,5 50,15 Q75,25 100,15 M0,18 Q25,8 50,18 Q75,28 100,18',
}
```

- [ ] **Step 4: 创建城池图章**

```typescript
// src/components/map/assets/cityGate.ts
import type { AssetDefinition } from '@/types/map'

export const cityGate: AssetDefinition = {
  key: 'city_gate',
  name: '城池',
  width: 50,
  height: 50,
  path: 'M5,5 L45,5 L45,45 L5,45 Z M5,5 L10,0 L15,5 M35,5 L40,0 L45,5 M5,45 L10,50 L15,45 M35,45 L40,50 L45,45',
}
```

- [ ] **Step 5: 创建关隘图章**

```typescript
// src/components/map/assets/mountainPass.ts
import type { AssetDefinition } from '@/types/map'

export const mountainPass: AssetDefinition = {
  key: 'mountain_pass',
  name: '关隘',
  width: 60,
  height: 50,
  path: 'M0,50 L15,20 L20,25 L25,10 L30,20 L35,10 L40,20 L45,25 L50,20 L60,50 M20,25 L20,35 L40,35 L40,25',
}
```

- [ ] **Step 6: 创建渡口图章**

```typescript
// src/components/map/assets/ferryCrossing.ts
import type { AssetDefinition } from '@/types/map'

export const ferryCrossing: AssetDefinition = {
  key: 'ferry_crossing',
  name: '渡口',
  width: 40,
  height: 30,
  path: 'M5,20 Q20,10 35,20 L30,25 L10,25 Z M20,15 L20,5 M15,8 L25,8',
}
```

- [ ] **Step 7: 创建图章索引**

```typescript
// src/components/map/assets/index.ts
import type { AssetDefinition } from '@/types/map'
import { inkMountainChain } from './inkMountainChain'
import { inkPeak } from './inkPeak'
import { inkRiver } from './inkRiver'
import { cityGate } from './cityGate'
import { mountainPass } from './mountainPass'
import { ferryCrossing } from './ferryCrossing'

export const assets: Record<string, AssetDefinition> = {
  ink_mountain_chain: inkMountainChain,
  ink_peak: inkPeak,
  ink_river: inkRiver,
  city_gate: cityGate,
  mountain_pass: mountainPass,
  ferry_crossing: ferryCrossing,
}

export const assetList = Object.values(assets)
```

- [ ] **Step 8: 提交**

```bash
git add src/components/map/assets/
git commit -m "feat: add map stamp assets (6 types)"
```

---

## Task 4: 画布交互 Composable

**Files:**
- Create: `src/components/map/composables/useMapCanvas.ts`

- [ ] **Step 1: 创建画布交互逻辑**

```typescript
// src/components/map/composables/useMapCanvas.ts
import { ref, computed } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'

export function useMapCanvas() {
  const store = useMapEditorStore()
  const stageRef = ref<any>(null)
  const isDragging = ref(false)
  const lastPointer = ref({ x: 0, y: 0 })
  
  const stageConfig = computed(() => ({
    width: 600,
    height: 400,
    scaleX: store.scale,
    scaleY: store.scale,
    x: store.position.x,
    y: store.position.y,
  }))
  
  function handleWheel(e: any) {
    e.evt.preventDefault()
    const scaleBy = 1.1
    const oldScale = store.scale
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    store.scale = Math.max(0.1, Math.min(5, newScale))
  }
  
  function handleMouseDown(e: any) {
    if (store.currentTool === 'pan' || e.evt.spaceKey) {
      isDragging.value = true
      lastPointer.value = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }
  
  function handleMouseMove(e: any) {
    if (!isDragging.value) return
    const dx = e.evt.clientX - lastPointer.value.x
    const dy = e.evt.clientY - lastPointer.value.y
    store.position = {
      x: store.position.x + dx,
      y: store.position.y + dy,
    }
    lastPointer.value = { x: e.evt.clientX, y: e.evt.clientY }
  }
  
  function handleMouseUp() {
    isDragging.value = false
  }
  
  function snapToGrid(x: number, y: number): { x: number; y: number } {
    if (!store.snapToGrid) return { x, y }
    const gridSize = 50
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }
  
  return {
    stageRef,
    stageConfig,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    snapToGrid,
  }
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/composables/useMapCanvas.ts
git commit -m "feat: add map canvas interaction composable"
```

---

## Task 5: 工具切换 Composable

**Files:**
- Create: `src/components/map/composables/useMapTools.ts`

- [ ] **Step 1: 创建工具切换逻辑**

```typescript
// src/components/map/composables/useMapTools.ts
import { ref } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import type { AssetKey } from '@/types/map'

export function useMapTools() {
  const store = useMapEditorStore()
  const selectedAsset = ref<AssetKey | null>(null)
  
  function setTool(tool: 'select' | 'draw' | 'delete' | 'pan') {
    store.currentTool = tool
    if (tool !== 'select') {
      store.selectedElementId = null
      store.selectedLayerId = null
    }
  }
  
  function selectAsset(assetKey: AssetKey) {
    selectedAsset.value = assetKey
    store.currentTool = 'select'
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    
    switch (e.key.toLowerCase()) {
      case 'v':
        setTool('select')
        break
      case 'p':
        setTool('draw')
        break
      case 'd':
        setTool('delete')
        break
      case 'g':
        store.gridVisible = !store.gridVisible
        break
      case 's':
        if (!e.ctrlKey && !e.metaKey) {
          store.snapToGrid = !store.snapToGrid
        }
        break
      case 'delete':
      case 'backspace':
        if (store.selectedElementId) {
          store.deleteElement(store.selectedElementId)
        }
        break
    }
  }
  
  return {
    selectedAsset,
    setTool,
    selectAsset,
    handleKeyDown,
  }
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/composables/useMapTools.ts
git commit -m "feat: add map tools composable"
```

---

## Task 6: 撤销/重做 Composable

**Files:**
- Create: `src/components/map/composables/useMapHistory.ts`

- [ ] **Step 1: 创建撤销/重做逻辑**

```typescript
// src/components/map/composables/useMapHistory.ts
import { ref } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'

export function useMapHistory() {
  const store = useMapEditorStore()
  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  const maxHistory = 50
  
  function saveState() {
    const mapData = store.currentMapData
    if (!mapData) return
    
    const state = JSON.stringify(mapData)
    
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    
    history.value.push(state)
    
    if (history.value.length > maxHistory) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }
  
  function undo() {
    if (historyIndex.value <= 0) return
    
    historyIndex.value--
    const state = JSON.parse(history.value[historyIndex.value])
    restoreState(state)
  }
  
  function redo() {
    if (historyIndex.value >= history.value.length - 1) return
    
    historyIndex.value++
    const state = JSON.parse(history.value[historyIndex.value])
    restoreState(state)
  }
  
  function restoreState(state: any) {
    const mapData = store.currentMapData
    if (!mapData) return
    
    Object.assign(mapData, state)
  }
  
  function canUndo() {
    return historyIndex.value > 0
  }
  
  function canRedo() {
    return historyIndex.value < history.value.length - 1
  }
  
  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/composables/useMapHistory.ts
git commit -m "feat: add map history composable (undo/redo)"
```

---

## Task 7: 导出 Composable

**Files:**
- Create: `src/components/map/composables/useMapExport.ts`

- [ ] **Step 1: 创建导出逻辑**

```typescript
// src/components/map/composables/useMapExport.ts
import { useMapEditorStore } from '@/stores/mapEditor'

export function useMapExport() {
  const store = useMapEditorStore()
  
  async function exportToPng(): Promise<Blob | null> {
    const stage = document.querySelector('.konva-stage') as any
    if (!stage) return null
    
    const konvaStage = stage.stage || stage
    if (!konvaStage || !konvaStage.toDataURL) return null
    
    const dataUrl = konvaStage.toDataURL({ pixelRatio: 2 })
    
    const response = await fetch(dataUrl)
    return response.blob()
  }
  
  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  async function exportAndDownload() {
    const blob = await exportToPng()
    if (blob) {
      const mapData = store.currentMapData
      const filename = `${mapData?.name || 'map'}-${Date.now()}.png`
      downloadBlob(blob, filename)
    }
  }
  
  function exportToJson() {
    const mapData = store.currentMapData
    if (!mapData) return
    
    const json = JSON.stringify(mapData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, `${mapData.name || 'map'}-${Date.now()}.json`)
  }
  
  function importFromJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          resolve(json)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
  
  return {
    exportToPng,
    exportAndDownload,
    exportToJson,
    importFromJson,
  }
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/composables/useMapExport.ts
git commit -m "feat: add map export composable (PNG/JSON)"
```

---

## Task 8: 纪年滑块组件

**Files:**
- Create: `src/components/map/YearSlider.vue`

- [ ] **Step 1: 创建纪年滑块组件**

```vue
<!-- src/components/map/YearSlider.vue -->
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
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/YearSlider.vue
git commit -m "feat: add year slider component"
```

---

## Task 9: 工具栏组件

**Files:**
- Create: `src/components/map/MapToolbar.vue`

- [ ] **Step 1: 创建工具栏组件**

```vue
<!-- src/components/map/MapToolbar.vue -->
<template>
  <div class="flex items-center gap-2 px-4 py-2 border-b border-brand-border/40 bg-brand-card/50">
    <!-- 工具按钮 -->
    <div class="flex items-center gap-1">
      <button
        v-for="tool in tools"
        :key="tool.key"
        class="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
        :class="store.currentTool === tool.key
          ? 'bg-brand-accent text-white'
          : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'"
        :title="tool.label"
        @click="setTool(tool.key)"
      >
        <component :is="tool.icon" :size="16" />
      </button>
    </div>
    
    <div class="w-px h-5 bg-brand-border/40" />
    
    <!-- 图章选择 -->
    <div class="relative" ref="assetPickerRef">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
        :class="{ 'bg-brand-accent-light text-brand-accent': selectedAsset }"
        title="图章"
        @click="showAssetPicker = !showAssetPicker"
      >
        <Mountain :size="16" />
      </button>
      <div
        v-if="showAssetPicker"
        class="absolute top-full left-0 mt-1 p-2 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 z-10"
      >
        <div class="grid grid-cols-3 gap-1">
          <button
            v-for="asset in assetList"
            :key="asset.key"
            class="w-12 h-12 flex flex-col items-center justify-center rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
            :class="{ 'bg-brand-accent-light text-brand-accent': selectedAsset === asset.key }"
            :title="asset.name"
            @click="selectAssetHandler(asset.key)"
          >
            <svg :viewBox="`0 0 ${asset.width} ${asset.height}`" class="w-8 h-8">
              <path :d="asset.path" fill="none" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="w-px h-5 bg-brand-border/40" />
    
    <!-- 开关按钮 -->
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
    
    <!-- 缩放控制 -->
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
    
    <!-- 导出按钮 -->
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
const selectedAsset = ref<AssetKey | null>(null)

const tools = [
  { key: 'select' as const, label: '选择 (V)', icon: MousePointer2 },
  { key: 'draw' as const, label: '绘制 (P)', icon: Pencil },
  { key: 'delete' as const, label: '删除 (D)', icon: Eraser },
  { key: 'pan' as const, label: '平移 (Space)', icon: Move },
]

function setTool(tool: 'select' | 'draw' | 'delete' | 'pan') {
  store.currentTool = tool
  if (tool !== 'select') {
    selectedAsset.value = null
  }
}

function selectAssetHandler(assetKey: AssetKey) {
  selectedAsset.value = assetKey
  showAssetPicker.value = false
}
</script>
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/MapToolbar.vue
git commit -m "feat: add map toolbar component"
```

---

## Task 10: 画布组件

**Files:**
- Create: `src/components/map/MapCanvas.vue`

- [ ] **Step 1: 创建画布组件**

```vue
<!-- src/components/map/MapCanvas.vue -->
<template>
  <div class="relative flex-1 overflow-hidden bg-brand-bg" ref="containerRef">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <!-- 背景层 -->
      <v-layer>
        <v-rect
          :config="{
            x: 0, y: 0,
            width: mapData?.width || 3000,
            height: mapData?.height || 3000,
            fill: mapData?.background || '#F6F5F2',
          }"
        />
        <v-group v-if="store.gridVisible">
          <v-line
            v-for="i in gridLines"
            :key="i.key"
            :config="{
              points: i.points,
              stroke: '#7F7F7F',
              strokeWidth: 1,
              opacity: 0.3,
            }"
          />
        </v-group>
      </v-layer>
      
      <!-- 静态元素层 -->
      <v-layer>
        <v-image
          v-for="element in visibleElements"
          :key="element.id"
          :config="{
            x: element.x,
            y: element.y,
            scaleX: element.scale,
            scaleY: element.scale,
            rotation: element.rotation,
            opacity: element.opacity,
            draggable: store.currentTool === 'select' && !element.locked,
            visible: element.visible,
          }"
          @click="handleElementClick(element)"
          @dragend="handleElementDragEnd(element, $event)"
        />
      </v-layer>
      
      <!-- 动态图层 -->
      <v-layer>
        <v-polygon
          v-for="layer in store.activeLayers"
          :key="layer.id"
          :config="{
            points: layer.points.flat(),
            fill: layer.fillColor,
            stroke: layer.strokeColor,
            strokeWidth: layer.strokeWidth,
            opacity: layer.opacity,
            dash: [4, 4],
            draggable: store.currentTool === 'select' && !layer.locked,
          }"
          @click="handleLayerClick(layer)"
        />
      </v-layer>
    </v-stage>
    
    <!-- 悬浮提示 -->
    <MapTooltip v-if="hoveredElement" :element="hoveredElement" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import { useMapCanvas } from './composables/useMapCanvas'
import MapTooltip from './MapTooltip.vue'
import type { MapElement, MapLayer } from '@/types/map'

const store = useMapEditorStore()
const { stageRef, stageConfig, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, snapToGrid } = useMapCanvas()

const containerRef = ref<HTMLDivElement | null>(null)
const hoveredElement = ref<MapElement | null>(null)

const mapData = computed(() => store.currentMapData)

const gridLines = computed(() => {
  const lines = []
  const gridSize = 50
  const width = mapData.value?.width || 3000
  const height = mapData.value?.height || 3000
  
  for (let x = 0; x <= width; x += gridSize) {
    lines.push({
      key: `v-${x}`,
      points: [x, 0, x, height],
    })
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    lines.push({
      key: `h-${y}`,
      points: [0, y, width, y],
    })
  }
  
  return lines
})

const visibleElements = computed(() => {
  return (mapData.value?.staticElements || []).filter(e => e.visible)
})

function handleElementClick(element: MapElement) {
  store.selectedElementId = element.id
  store.selectedLayerId = null
}

function handleElementDragEnd(element: MapElement, e: any) {
  const pos = snapToGrid(e.target.x(), e.target.y())
  store.updateElement(element.id, { x: pos.x, y: pos.y })
}

function handleLayerClick(layer: MapLayer) {
  store.selectedLayerId = layer.id
  store.selectedElementId = null
}
</script>
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/MapCanvas.vue
git commit -m "feat: add map canvas component"
```

---

## Task 11: 属性面板组件

**Files:**
- Create: `src/components/map/MapProperties.vue`

- [ ] **Step 1: 创建属性面板组件**

```vue
<!-- src/components/map/MapProperties.vue -->
<template>
  <div class="w-64 border-l border-brand-border/40 bg-brand-card/50 overflow-y-auto">
    <!-- 元素属性 -->
    <div v-if="selectedElement" class="p-4 border-b border-brand-border/40">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">元素属性</h3>
      
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-brand-muted mb-1">类型</label>
          <span class="text-sm text-brand-text">{{ selectedElement.type }}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-brand-muted mb-1">X</label>
            <input
              type="number"
              :value="selectedElement.x"
              class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateElementProp('x', $event)"
            />
          </div>
          <div>
            <label class="block text-xs text-brand-muted mb-1">Y</label>
            <input
              type="number"
              :value="selectedElement.y"
              class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateElementProp('y', $event)"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-xs text-brand-muted mb-1">缩放</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            :value="selectedElement.scale"
            class="w-full"
            @input="updateElementProp('scale', $event)"
          />
        </div>
        
        <div>
          <label class="block text-xs text-brand-muted mb-1">绑定词条</label>
          <select
            :value="selectedElement.bindDocId || ''"
            class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
            @change="updateElementProp('bindDocId', $event)"
          >
            <option value="">无</option>
            <option v-for="doc in flatDocs" :key="doc.id" :value="doc.id">
              {{ doc.title }}
            </option>
          </select>
        </div>
        
        <button
          class="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="store.deleteElement(selectedElement.id)"
        >
          删除元素
        </button>
      </div>
    </div>
    
    <!-- 图层属性 -->
    <div v-else-if="selectedLayer" class="p-4 border-b border-brand-border/40">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">图层属性</h3>
      
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-brand-muted mb-1">纪年范围</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              :value="selectedLayer.startYear"
              class="w-20 px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateLayerProp('startYear', $event)"
            />
            <span class="text-xs text-brand-muted">-</span>
            <input
              type="number"
              :value="selectedLayer.endYear"
              placeholder="至今"
              class="w-20 px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateLayerProp('endYear', $event)"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-xs text-brand-muted mb-1">填充颜色</label>
          <div class="flex gap-2">
            <button
              v-for="color in fillColorOptions"
              :key="color.value"
              class="w-8 h-8 rounded border-2 transition-colors"
              :class="selectedLayer.fillColor === color.value
                ? 'border-brand-accent'
                : 'border-transparent'"
              :style="{ backgroundColor: color.value }"
              @click="store.updateLayer(selectedLayer.id, { fillColor: color.value })"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-xs text-brand-muted mb-1">绑定平行分身</label>
          <select
            :value="selectedLayer.bindVariantId || ''"
            class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
            @change="updateLayerProp('bindVariantId', $event)"
          >
            <option value="">无</option>
            <option v-for="variant in availableVariants" :key="variant.id" :value="variant.id">
              {{ variant.title }}
            </option>
          </select>
        </div>
        
        <button
          class="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="store.deleteLayer(selectedLayer.id)"
        >
          删除图层
        </button>
      </div>
    </div>
    
    <!-- 图层列表 -->
    <div class="p-4">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">图层列表</h3>
      
      <div class="space-y-2">
        <div
          v-for="layer in mapData?.dynamicLayers"
          :key="layer.id"
          class="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors"
          :class="store.selectedLayerId === layer.id
            ? 'bg-brand-accent-light'
            : 'hover:bg-brand-bg'"
          @click="store.selectedLayerId = layer.id"
        >
          <div
            class="w-4 h-4 rounded"
            :style="{ backgroundColor: layer.fillColor }"
          />
          <span class="text-xs text-brand-text flex-1 truncate">
            天历 {{ layer.startYear }}-{{ layer.endYear || '至今' }}
          </span>
          <button
            class="text-brand-muted hover:text-brand-text"
            @click.stop="store.updateLayer(layer.id, { visible: !layer.visible })"
          >
            <Eye v-if="layer.visible" :size="12" />
            <EyeOff v-else :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useMapEditorStore } from '@/stores/mapEditor'
import { useNovelDataStore } from '@/stores/novelData'
import type { MapElement, MapLayer } from '@/types/map'

const store = useMapEditorStore()
const novelStore = useNovelDataStore()

const mapData = computed(() => store.currentMapData)
const flatDocs = computed(() => novelStore.flatDocs)

const selectedElement = computed(() => {
  if (!store.selectedElementId || !mapData.value) return null
  return mapData.value.staticElements.find(e => e.id === store.selectedElementId) || null
})

const selectedLayer = computed(() => {
  if (!store.selectedLayerId || !mapData.value) return null
  return mapData.value.dynamicLayers.find(l => l.id === store.selectedLayerId) || null
})

const availableVariants = computed(() => {
  if (!selectedLayer.value?.bindVariantId) return []
  const doc = flatDocs.value.find(d => 
    d.variants?.some(v => v.id === selectedLayer.value?.bindVariantId)
  )
  return doc?.variants || []
})

const fillColorOptions = [
  { value: 'rgba(111, 153, 129, 0.25)', label: '浅石绿' },
  { value: 'rgba(70, 130, 180, 0.25)', label: '靛青' },
  { value: 'rgba(192, 72, 81, 0.25)', label: '朱砂红' },
  { value: 'rgba(180, 150, 100, 0.25)', label: '土黄' },
  { value: 'rgba(120, 80, 120, 0.25)', label: '紫檀' },
]

function updateElementProp(prop: string, e: Event) {
  const target = e.target as HTMLInputElement
  const value = prop === 'bindDocId' ? target.value || undefined : Number(target.value)
  store.updateElement(store.selectedElementId!, { [prop]: value })
}

function updateLayerProp(prop: string, e: Event) {
  const target = e.target as HTMLInputElement
  let value: any = target.value ? Number(target.value) : null
  if (prop === 'bindVariantId') value = target.value || undefined
  store.updateLayer(store.selectedLayerId!, { [prop]: value })
}
</script>
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/MapProperties.vue
git commit -m "feat: add map properties panel"
```

---

## Task 12: 主容器组件

**Files:**
- Create: `src/components/map/MapEditor.vue`
- Modify: `src/components/layout/RightSidebar.vue`

- [ ] **Step 1: 创建主容器组件**

```vue
<!-- src/components/map/MapEditor.vue -->
<template>
  <div class="flex flex-col h-full">
    <MapToolbar @export="handleExport" />
    <MapCanvas />
    <YearSlider />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import { useMapTools } from './composables/useMapTools'
import { useMapExport } from './composables/useMapExport'
import MapToolbar from './MapToolbar.vue'
import MapCanvas from './MapCanvas.vue'
import YearSlider from './YearSlider.vue'

const store = useMapEditorStore()
const { handleKeyDown } = useMapTools()
const { exportAndDownload } = useMapExport()

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  if (store.currentMapData === null) {
    // 初始化地图
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

async function handleExport() {
  await exportAndDownload()
}
</script>
```

- [ ] **Step 2: 集成到 RightSidebar**

```vue
<!-- src/components/layout/RightSidebar.vue - 修改 -->
<template>
  <aside class="w-[300px] min-w-[300px] h-screen border-l border-brand-border/60 flex flex-col bg-brand-card backdrop-blur-sm">
    <!-- 标签切换 -->
    <div class="flex border-b border-brand-border/40">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2.5 text-xs font-medium transition-colors"
        :class="activeTab === tab.key
          ? 'text-brand-accent border-b-2 border-brand-accent'
          : 'text-brand-muted hover:text-brand-text'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 内容 -->
    <div class="flex-1 overflow-hidden">
      <MapEditor v-if="activeTab === 'map'" />
      <Infobox v-else-if="activeTab === 'infobox'" />
      <GraphPreview v-else-if="activeTab === 'graph'" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapEditor from '@/components/map/MapEditor.vue'
import Infobox from '@/components/right/Infobox.vue'
import GraphPreview from '@/components/right/GraphPreview.vue'

const activeTab = ref('infobox')

const tabs = [
  { key: 'infobox', label: '属性' },
  { key: 'map', label: '地图' },
  { key: 'graph', label: '图谱' },
]
</script>
```

- [ ] **Step 3: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/components/map/MapEditor.vue src/components/layout/RightSidebar.vue
git commit -m "feat: integrate map editor into right sidebar"
```

---

## Task 13: 绑定对话框

**Files:**
- Create: `src/components/map/BindVariantDialog.vue`

- [ ] **Step 1: 创建绑定对话框组件**

```vue
<!-- src/components/map/BindVariantDialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-md bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6">
            <h3 class="font-serif font-semibold text-brand-text text-base mb-4">绑定词条</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">选择词条</label>
                <select
                  v-model="selectedDocId"
                  class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                >
                  <option value="">无</option>
                  <option v-for="doc in flatDocs" :key="doc.id" :value="doc.id">
                    {{ doc.title }}
                  </option>
                </select>
              </div>
              
              <div v-if="selectedDocId && variants.length > 0">
                <label class="block text-sm font-medium text-brand-text mb-1.5">选择平行分身（可选）</label>
                <select
                  v-model="selectedVariantId"
                  class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                >
                  <option value="">无</option>
                  <option v-for="variant in variants" :key="variant.id" :value="variant.id">
                    {{ variant.title }}
                  </option>
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">起始年</label>
                  <input
                    v-model.number="startYear"
                    type="number"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">结束年（空=至今）</label>
                  <input
                    v-model.number="endYear"
                    type="number"
                    placeholder="至今"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">填充颜色</label>
                <div class="flex gap-2">
                  <button
                    v-for="color in fillColorOptions"
                    :key="color.value"
                    class="w-8 h-8 rounded border-2 transition-colors"
                    :class="selectedFillColor === color.value
                      ? 'border-brand-accent'
                      : 'border-transparent'"
                    :style="{ backgroundColor: color.value }"
                    @click="selectedFillColor = color.value"
                  />
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                @click="$emit('cancel')"
              >
                取消
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                :disabled="!isValid"
                @click="handleConfirm"
              >
                确认
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNovelDataStore } from '@/stores/novelData'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [data: { docId: string; variantId?: string; startYear: number; endYear: number | null; fillColor: string }]
}>()

const novelStore = useNovelDataStore()
const flatDocs = computed(() => novelStore.flatDocs)

const selectedDocId = ref('')
const selectedVariantId = ref('')
const startYear = ref(1)
const endYear = ref<number | null>(null)
const selectedFillColor = ref('rgba(111, 153, 129, 0.25)')

const variants = computed(() => {
  const doc = flatDocs.value.find(d => d.id === selectedDocId.value)
  return doc?.variants || []
})

const isValid = computed(() => {
  return selectedDocId.value && startYear.value
})

const fillColorOptions = [
  { value: 'rgba(111, 153, 129, 0.25)', label: '浅石绿' },
  { value: 'rgba(70, 130, 180, 0.25)', label: '靛青' },
  { value: 'rgba(192, 72, 81, 0.25)', label: '朱砂红' },
  { value: 'rgba(180, 150, 100, 0.25)', label: '土黄' },
  { value: 'rgba(120, 80, 120, 0.25)', label: '紫檀' },
]

watch(() => props.visible, (v) => {
  if (v) {
    selectedDocId.value = ''
    selectedVariantId.value = ''
    startYear.value = 1
    endYear.value = null
    selectedFillColor.value = 'rgba(111, 153, 129, 0.25)'
  }
})

function handleConfirm() {
  if (!isValid.value) return
  emit('confirm', {
    docId: selectedDocId.value,
    variantId: selectedVariantId.value || undefined,
    startYear: startYear.value,
    endYear: endYear.value,
    fillColor: selectedFillColor.value,
  })
}
</script>
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/map/BindVariantDialog.vue
git commit -m "feat: add bind variant dialog"
```

---

## Task 14: 示例地图种子数据

**Files:**
- Create: `src/data/seedMap.ts`

- [ ] **Step 1: 创建示例地图数据**

```typescript
// src/data/seedMap.ts
import type { MapData } from '@/types/map'

export const seedMap: MapData = {
  id: 'map-seed',
  name: '盘古大陆舆地图',
  projectId: 'default',
  scale: 100,
  gridSize: 50,
  background: '#F6F5F2',
  width: 3000,
  height: 3000,
  staticElements: [
    {
      id: 'element-mountain-1',
      type: 'asset',
      assetKey: 'ink_mountain_chain',
      x: 450,
      y: 1200,
      scale: 1.2,
      rotation: 0,
      opacity: 1,
      bindDocId: 'loc-north',
      zIndex: 0,
      visible: true,
      locked: false,
    },
    {
      id: 'element-city-1',
      type: 'asset',
      assetKey: 'city_gate',
      x: 890,
      y: 1450,
      scale: 1,
      rotation: 0,
      opacity: 1,
      bindDocId: 'loc-capital',
      zIndex: 1,
      visible: true,
      locked: false,
    },
  ],
  dynamicLayers: [
    {
      id: 'layer-tianjian-v1',
      type: 'polygon',
      points: [[800, 1300], [1200, 1300], [1100, 1600], [850, 1550]],
      bindVariantId: undefined,
      startYear: 1,
      endYear: 15,
      fillColor: 'rgba(111, 153, 129, 0.25)',
      strokeColor: '#2C2C2C',
      strokeWidth: 1,
      opacity: 1,
      zIndex: 0,
      visible: true,
      locked: false,
    },
  ],
  counters: {
    element: 2,
    layer: 1,
  },
}
```

- [ ] **Step 2: 运行类型检查**

Run: `cd "d:/网站总/小说设定网站" && npx vue-tsc --noEmit`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/data/seedMap.ts
git commit -m "feat: add seed map data"
```

---

## Task 15: 安装依赖并验证

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 Konva.js**

Run: `cd "d:/网站总/小说设定网站" && npm install konva @konva/vue-konva`
Expected: 安装成功

- [ ] **Step 2: 运行完整构建**

Run: `cd "d:/网站总/小说设定网站" && npm run build`
Expected: 构建成功，无错误

- [ ] **Step 3: 运行开发服务器**

Run: `cd "d:/网站总/小说设定网站" && npm run dev`
Expected: 服务器启动成功

- [ ] **Step 4: 手动测试**

1. 打开 http://localhost:5173/noveldesign/
2. 进入一个项目
3. 点击右侧栏"地图"标签
4. 验证画布显示
5. 测试工具栏按钮
6. 测试缩放和平移
7. 测试图章放置
8. 测试多边形绘制
9. 测试纪年滑块
10. 测试导出 PNG

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json
git commit -m "feat: install konva.js dependencies"
```

---

## 完成

所有任务完成后，地图编辑器功能将包含：

1. Canvas 画布（Konva.js）
2. 计里画方网格（可切换十里/百里）
3. 网格吸附（可开关）
4. 6 种基础图章（群山、奇峰、水系、城池、关隘、渡口）
5. 多边形区域绘制
6. 多版本平行时空图层
7. 词条/平行分身绑定
8. 纪年滑块联动
9. 图层面板
10. 撤销/重做
11. PNG 导出
12. JSON 导入
