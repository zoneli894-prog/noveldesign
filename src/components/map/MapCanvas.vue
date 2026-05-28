<template>
  <div
    class="relative flex-1 overflow-hidden bg-brand-bg"
    ref="containerRef"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel.prevent="handleWheel"
    :class="cursorClass"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @click="handleStageClick"
      @dblclick="handleStageDblClick"
    >
      <v-layer>
        <v-rect
          :config="{
            x: 0, y: 0,
            width: (mapData?.width || 3000) + 40,
            height: (mapData?.height || 3000) + 40,
            fill: mapData?.background || '#F6F5F2',
          }"
        />
        <v-rect
          :config="{
            x: 0, y: 0,
            width: mapData?.width || 3000,
            height: mapData?.height || 3000,
            fill: mapData?.background || '#F6F5F2',
            stroke: '#8B7355',
            strokeWidth: 2,
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
          <!-- Edge markers (计里画方 刻度) -->
          <v-text
            v-for="(m, i) in edgeMarkers"
            :key="'em-' + i"
            :config="{
              x: m.x,
              y: m.y,
              text: m.text,
              fontSize: 9,
              fontFamily: 'Noto Sans SC, sans-serif',
              fill: '#8B7355',
              align: 'center',
              verticalAlign: 'middle',
            }"
          />
          <!-- Compass directions (方位标) -->
          <v-text :config="{ x: (mapData?.width || 3000) / 2, y: -22, text: '北', fontSize: 12, fontFamily: 'Noto Serif SC, serif', fill: '#5C4033', align: 'center' }" />
          <v-text :config="{ x: (mapData?.width || 3000) / 2, y: (mapData?.height || 3000) + 28, text: '南', fontSize: 12, fontFamily: 'Noto Serif SC, serif', fill: '#5C4033', align: 'center' }" />
          <v-text :config="{ x: -22, y: (mapData?.height || 3000) / 2, text: '西', fontSize: 12, fontFamily: 'Noto Serif SC, serif', fill: '#5C4033', align: 'center' }" />
          <v-text :config="{ x: (mapData?.width || 3000) + 22, y: (mapData?.height || 3000) / 2, text: '东', fontSize: 12, fontFamily: 'Noto Serif SC, serif', fill: '#5C4033', align: 'center' }" />
          <!-- Decorative corner marks -->
          <v-line :config="{ points: [-8, -8, -8, 8, 8, 8], stroke: '#8B7355', strokeWidth: 1.5 }" />
          <v-line :config="{ points: [(mapData?.width || 3000) + 8, -8, (mapData?.width || 3000) + 8, 8, (mapData?.width || 3000) - 8, 8], stroke: '#8B7355', strokeWidth: 1.5 }" />
          <v-line :config="{ points: [-8, (mapData?.height || 3000) + 8, -8, (mapData?.height || 3000) - 8, 8, (mapData?.height || 3000) - 8], stroke: '#8B7355', strokeWidth: 1.5 }" />
          <v-line :config="{ points: [(mapData?.width || 3000) + 8, (mapData?.height || 3000) + 8, (mapData?.width || 3000) + 8, (mapData?.height || 3000) - 8, (mapData?.width || 3000) - 8, (mapData?.height || 3000) - 8], stroke: '#8B7355', strokeWidth: 1.5 }" />
        </v-group>
      </v-layer>

      <v-layer>
        <template v-for="element in visibleElements" :key="element.id">
          <v-group
            v-if="getElementAsset(element)"
            :config="{
              x: element.x,
              y: element.y,
              scaleX: element.scale,
              scaleY: element.scale,
              rotation: element.rotation,
              opacity: element.opacity,
              draggable: false,
              visible: element.visible,
            }"
          >
            <!-- Ink wash background layer (墨色晕染) -->
            <v-line
              v-for="(el, i) in getInkWashElements(getElementAsset(element)!)"
              :key="'wash-' + i"
              :config="{
                points: el.points,
                stroke: el.stroke || '#2C2C2C',
                strokeWidth: (el.strokeWidth || 1.5) * 0.6,
                lineCap: 'round',
                lineJoin: 'round',
                opacity: 0.05,
                closed: el.closed || false,
                fill: el.closed ? (el.fill || 'transparent') : undefined,
              }"
            />
            <!-- Stroke layer (骨架线条) -->
            <v-line
              v-for="(el, i) in getElementAsset(element)!.elements"
              :key="i"
              :config="{
                points: getLinePoints(el),
                stroke: el.stroke || '#2C2C2C',
                strokeWidth: el.strokeWidth || 1.5,
                lineCap: el.strokeLinecap || 'round',
                lineJoin: el.strokeLinejoin || 'round',
                opacity: el.opacity || 1,
                closed: el.closed || false,
                fill: el.closed ? (el.fill || 'transparent') : undefined,
              }"
            />
            <!-- Name label -->
            <v-text
              v-if="element.name"
              :config="{
                x: 0,
                y: (getElementAsset(element)!.height || 40) + 6,
                text: element.name,
                fontSize: 11,
                fontFamily: 'Noto Serif SC, serif',
                fill: '#2C2C2C',
                align: 'center',
                width: getElementAsset(element)!.width,
              }"
            />
          </v-group>
        </template>
      </v-layer>

      <v-layer>
        <template v-for="layer in store.activeLayers" :key="layer.id">
          <v-polygon
            :config="{
              points: layer.points.flat(),
              fill: layer.fillColor,
              stroke: layer.strokeColor,
              strokeWidth: layer.strokeWidth,
              opacity: layer.opacity,
              dash: [4, 4],
              draggable: false,
            }"
          />
          <v-text
            v-if="layer.name"
            :config="{
              x: getLayerCenter(layer).x,
              y: getLayerCenter(layer).y,
              text: layer.name,
              fontSize: 12,
              fontFamily: 'Noto Serif SC, serif',
              fill: '#2C2C2C',
              align: 'center',
              verticalAlign: 'middle',
            }"
          />
        </template>
      </v-layer>

      <!-- Polygon drawing preview -->
      <v-layer v-if="store.isDrawing && store.drawPoints.length > 0">
        <v-line
          v-if="store.drawPoints.length >= 2"
          :config="{
            points: store.drawPoints.flat(),
            stroke: '#3B6B5E',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            dash: [6, 3],
            closed: false,
          }"
        />
        <v-circle
          v-for="(pt, i) in store.drawPoints"
          :key="'pt-' + i"
          :config="{
            x: pt[0],
            y: pt[1],
            radius: 4,
            fill: '#3B6B5E',
            stroke: 'white',
            strokeWidth: 1.5,
          }"
        />
        <!-- Closing hint line from last point to first -->
        <v-line
          v-if="store.drawPoints.length >= 3"
          :config="{
            points: [
              store.drawPoints[store.drawPoints.length - 1][0],
              store.drawPoints[store.drawPoints.length - 1][1],
              store.drawPoints[0][0],
              store.drawPoints[0][1],
            ],
            stroke: '#3B6B5E',
            strokeWidth: 1,
            dash: [4, 4],
            opacity: 0.4,
          }"
        />
      </v-layer>
    </v-stage>

    <!-- Selected element highlight -->
    <div
      v-if="selectedElementBox"
      class="absolute border-2 border-brand-accent rounded pointer-events-none"
      :style="{
        left: selectedElementBox.x + 'px',
        top: selectedElementBox.y + 'px',
        width: selectedElementBox.w + 'px',
        height: selectedElementBox.h + 'px',
      }"
    />

    <!-- Drawing status bar -->
    <div
      v-if="store.isDrawing"
      class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-brand-card-solid/90 backdrop-blur-sm border border-brand-border/60 rounded-lg px-3 py-1.5 text-xs text-brand-muted shadow-brand-md flex items-center gap-3"
    >
      <span>已放置 <b class="text-brand-accent">{{ store.drawPoints.length }}</b> 个顶点</span>
      <span class="text-brand-border">|</span>
      <span>双击闭合 · Esc 取消</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import { assetRegistry } from './assets'
import type { MapElement, MapLayer, AssetElement, AssetKey, AssetDefinition } from '@/types/map'

const store = useMapEditorStore()
const containerRef = ref<HTMLDivElement | null>(null)
const stageRef = ref<any>(null)
const containerWidth = ref(800)
const containerHeight = ref(600)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const spaceHeld = ref(false)

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
    e.preventDefault()
    spaceHeld.value = true
  }
}
function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    spaceHeld.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
})

const mapData = computed(() => store.currentMapData)

const cursorClass = computed(() => {
  if (store.selectedAssetKey) return 'cursor-crosshair'
  if (store.currentTool === 'pan') return 'cursor-grab'
  if (store.currentTool === 'draw') return 'cursor-crosshair'
  if (store.currentTool === 'delete') return 'cursor-pointer'
  return 'cursor-default'
})

const stageConfig = computed(() => ({
  width: containerWidth.value,
  height: containerHeight.value,
  scaleX: store.scale,
  scaleY: store.scale,
  x: store.position.x,
  y: store.position.y,
}))

const gridLines = computed(() => {
  const lines: { key: string; points: number[] }[] = []
  const gs = store.gridSize
  const width = mapData.value?.width || 3000
  const height = mapData.value?.height || 3000
  for (let x = 0; x <= width; x += gs) {
    lines.push({ key: `v-${x}`, points: [x, 0, x, height] })
  }
  for (let y = 0; y <= height; y += gs) {
    lines.push({ key: `h-${y}`, points: [0, y, width, y] })
  }
  return lines
})

const edgeMarkers = computed(() => {
  const gs = store.gridSize
  const width = mapData.value?.width || 3000
  const height = mapData.value?.height || 3000
  const count = { x: Math.floor(width / gs), y: Math.floor(height / gs) }
  const labels: { x: number; y: number; text: string; anchor: string }[] = []
  // Bottom edge (x-axis)
  for (let i = 1; i <= count.x; i++) {
    labels.push({ x: i * gs, y: height + 18, text: `${i * store.gridScale}`, anchor: 'middle' })
  }
  // Right edge (y-axis)
  for (let i = 1; i <= count.y; i++) {
    labels.push({ x: width + 18, y: i * gs, text: `${i * store.gridScale}`, anchor: 'middle' })
  }
  return labels
})

const visibleElements = computed(() => {
  return (mapData.value?.staticElements || []).filter(e => e.visible)
})

const selectedElementBox = computed(() => {
  if (!store.selectedElementId) return null
  const el = visibleElements.value.find(e => e.id === store.selectedElementId)
  if (!el) return null
  const asset = el.assetKey ? assetRegistry[el.assetKey as AssetKey] : null
  if (!asset) return null
  const w = asset.width * el.scale * store.scale
  const h = asset.height * el.scale * store.scale
  return {
    x: el.x * store.scale + store.position.x - 4,
    y: el.y * store.scale + store.position.y - 4,
    w: w + 8,
    h: h + 8,
  }
})

// --- Coordinate helpers ---

function screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: (clientX - rect.left - store.position.x) / store.scale,
    y: (clientY - rect.top - store.position.y) / store.scale,
  }
}

function snapToGrid(x: number, y: number): { x: number; y: number } {
  if (!store.snapToGrid) return { x, y }
  const gs = store.gridSize
  return {
    x: Math.round(x / gs) * gs,
    y: Math.round(y / gs) * gs,
  }
}

// --- Element hit testing ---

function findElementAt(canvasX: number, canvasY: number): MapElement | null {
  // Check elements in reverse order (top-most first)
  const elements = [...visibleElements.value].reverse()
  for (const el of elements) {
    const asset = el.assetKey ? assetRegistry[el.assetKey as AssetKey] : null
    if (!asset) continue
    const w = asset.width * el.scale
    const h = asset.height * el.scale
    if (
      canvasX >= el.x && canvasX <= el.x + w &&
      canvasY >= el.y && canvasY <= el.y + h
    ) {
      return el
    }
  }
  return null
}

// --- Event handlers ---

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const scaleBy = 1.1
  const oldScale = store.scale
  const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  store.scale = Math.max(0.1, Math.min(5, newScale))
}

function handleMouseDown(e: MouseEvent) {
  if (store.currentTool === 'pan' || spaceHeld.value) {
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  const dx = e.clientX - panStart.value.x
  const dy = e.clientY - panStart.value.y
  store.position = {
    x: store.position.x + dx,
    y: store.position.y + dy,
  }
  panStart.value = { x: e.clientX, y: e.clientY }
}

function handleMouseUp() {
  isPanning.value = false
}

function handleStageClick(e: any) {
  // Don't process if we just finished panning
  if (isPanning.value) return

  const evt = e.evt as MouseEvent
  const canvasPos = screenToCanvas(evt.clientX, evt.clientY)
  const snapped = snapToGrid(canvasPos.x, canvasPos.y)

  // 1. Place a stamp if asset is selected
  if (store.selectedAssetKey) {
    store.addElement({
      type: 'asset',
      assetKey: store.selectedAssetKey,
      x: snapped.x,
      y: snapped.y,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: store.currentMapData?.staticElements.length || 0,
      visible: true,
      locked: false,
    })
    return
  }

  // 2. Draw tool — add polygon point
  if (store.currentTool === 'draw') {
    if (!store.isDrawing) {
      store.startDraw(snapped.x, snapped.y)
    } else {
      store.addDrawPoint(snapped.x, snapped.y)
    }
    return
  }

  // 3. Delete tool — find and remove element at click position
  if (store.currentTool === 'delete') {
    const hit = findElementAt(canvasPos.x, canvasPos.y)
    if (hit) {
      store.deleteElement(hit.id)
    }
    return
  }

  // 4. Select tool — find and select element at click position
  if (store.currentTool === 'select') {
    const hit = findElementAt(canvasPos.x, canvasPos.y)
    if (hit) {
      store.selectedElementId = hit.id
      store.selectedLayerId = null
    } else {
      store.selectedElementId = null
      store.selectedLayerId = null
    }
  }
}

function handleStageDblClick(e: any) {
  if (store.currentTool === 'draw' && store.isDrawing) {
    store.finishDraw()
  }
}

// --- Rendering helpers ---

function getElementAsset(element: MapElement) {
  if (!element.assetKey) return null
  return assetRegistry[element.assetKey as AssetKey] || null
}

function getInkWashElements(asset: AssetDefinition): AssetElement[] {
  return asset.elements.filter(el => el.closed && el.fill)
}

function getLinePoints(el: AssetElement): number[] {
  if (el.type === 'line' && el.points) {
    return el.points
  }
  return []
}

function getLayerCenter(layer: MapLayer): { x: number; y: number } {
  const pts = layer.points
  if (!pts || pts.length === 0) return { x: 0, y: 0 }
  const sumX = pts.reduce((s, p) => s + p[0], 0)
  const sumY = pts.reduce((s, p) => s + p[1], 0)
  return { x: sumX / pts.length, y: sumY / pts.length }
}
</script>
