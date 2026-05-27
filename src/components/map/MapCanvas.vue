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
