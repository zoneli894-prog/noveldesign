<template>
  <div
    class="relative flex-1 overflow-hidden bg-brand-bg"
    ref="containerRef"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel.prevent="handleWheel"
    :class="cursorClass"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
    >
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
          </v-group>
        </template>
      </v-layer>

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
            draggable: false,
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import { assetRegistry } from './assets'
import type { MapElement, MapLayer, AssetElement, AssetKey } from '@/types/map'

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
  const gridSize = 50
  const width = mapData.value?.width || 3000
  const height = mapData.value?.height || 3000
  for (let x = 0; x <= width; x += gridSize) {
    lines.push({ key: `v-${x}`, points: [x, 0, x, height] })
  }
  for (let y = 0; y <= height; y += gridSize) {
    lines.push({ key: `h-${y}`, points: [0, y, width, y] })
  }
  return lines
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
  const gridSize = 50
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
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

function handleClick(e: MouseEvent) {
  // Don't process if we just finished panning
  if (isPanning.value) return

  const canvasPos = screenToCanvas(e.clientX, e.clientY)
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

  // 2. Delete tool — find and remove element at click position
  if (store.currentTool === 'delete') {
    const hit = findElementAt(canvasPos.x, canvasPos.y)
    if (hit) {
      store.deleteElement(hit.id)
    }
    return
  }

  // 3. Select tool — find and select element at click position
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

// --- Rendering helpers ---

function getElementAsset(element: MapElement) {
  if (!element.assetKey) return null
  return assetRegistry[element.assetKey as AssetKey] || null
}

function getLinePoints(el: AssetElement): number[] {
  if (el.type === 'line' && el.points) {
    return el.points
  }
  return []
}
</script>
