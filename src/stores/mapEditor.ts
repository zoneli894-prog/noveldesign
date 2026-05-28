import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MapData, MapElement, MapLayer, MapTool, AssetKey } from '@/types/map'
import { useNovelDataStore } from './novelData'
import { seedMap } from '@/data/seedMap'

// History state (module-level singleton)
const historyStack = ref<string[]>([])
const historyIndex = ref(-1)
const maxHistory = 50
let historySaveCallback: (() => void) | null = null

export function setHistorySaveCallback(cb: () => void) {
  historySaveCallback = cb
}

export function saveHistory(mapData: MapData) {
  const state = JSON.stringify(mapData)
  if (historyIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
  }
  historyStack.value.push(state)
  if (historyStack.value.length > maxHistory) {
    historyStack.value.shift()
  } else {
    historyIndex.value++
  }
}

export function undoHistory(mapData: MapData) {
  if (historyIndex.value <= 0) return
  historyIndex.value--
  const state = JSON.parse(historyStack.value[historyIndex.value])
  Object.assign(mapData, state)
}

export function redoHistory(mapData: MapData) {
  if (historyIndex.value >= historyStack.value.length - 1) return
  historyIndex.value++
  const state = JSON.parse(historyStack.value[historyIndex.value])
  Object.assign(mapData, state)
}

export function canUndo() { return historyIndex.value > 0 }
export function canRedo() { return historyIndex.value < historyStack.value.length - 1 }

export const useMapEditorStore = defineStore('mapEditor', () => {
  const novelStore = useNovelDataStore()

  const currentYear = ref(1)
  const currentTool = ref<MapTool>('select')
  const selectedElementId = ref<string | null>(null)
  const selectedLayerId = ref<string | null>(null)
  const selectedAssetKey = ref<AssetKey | null>(null)
  const gridVisible = ref(true)
  const snapToGrid = ref(true)
  const gridSize = ref(50) // 计里画方: pixels per grid cell
  const gridScale = ref(10) // 一格代表多少里
  const scale = ref(1)
  const position = ref({ x: 0, y: 0 })

  // Polygon drawing state
  const drawPoints = ref<number[][]>([])
  const isDrawing = ref(false)

  function startDraw(startX: number, startY: number) {
    drawPoints.value = [[startX, startY]]
    isDrawing.value = true
  }

  function addDrawPoint(x: number, y: number) {
    drawPoints.value.push([x, y])
  }

  function finishDraw(fillColor: string = 'rgba(111, 153, 129, 0.25)'): MapLayer | null {
    if (drawPoints.value.length < 3) {
      cancelDraw()
      return null
    }
    const layer = addLayer({
      type: 'polygon',
      points: [...drawPoints.value],
      startYear: currentYear.value,
      endYear: null,
      fillColor,
      strokeColor: '#2C2C2C',
      strokeWidth: 1,
      opacity: 1,
      zIndex: 0,
      visible: true,
      locked: false,
    })
    cancelDraw()
    return layer
  }

  function cancelDraw() {
    drawPoints.value = []
    isDrawing.value = false
  }

  function selectAsset(key: AssetKey | null) {
    selectedAssetKey.value = key
  }

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
    saveHistory(mapData)
    return newElement
  }

  function updateElement(id: string, updates: Partial<MapElement>) {
    const mapData = getMapData()
    const element = mapData.staticElements.find(e => e.id === id)
    if (element) {
      Object.assign(element, updates)
      saveHistory(mapData)
    }
  }

  function deleteElement(id: string) {
    const mapData = getMapData()
    mapData.staticElements = mapData.staticElements.filter(e => e.id !== id)
    if (selectedElementId.value === id) selectedElementId.value = null
    saveHistory(mapData)
  }

  function addLayer(layer: Omit<MapLayer, 'id'>): MapLayer {
    const mapData = getMapData()
    const id = `layer-${++mapData.counters.layer}`
    const newLayer: MapLayer = { ...layer, id }
    mapData.dynamicLayers.push(newLayer)
    saveHistory(mapData)
    return newLayer
  }

  function updateLayer(id: string, updates: Partial<MapLayer>) {
    const mapData = getMapData()
    const layer = mapData.dynamicLayers.find(l => l.id === id)
    if (layer) {
      Object.assign(layer, updates)
      saveHistory(mapData)
    }
  }

  function deleteLayer(id: string) {
    const mapData = getMapData()
    mapData.dynamicLayers = mapData.dynamicLayers.filter(l => l.id !== id)
    if (selectedLayerId.value === id) selectedLayerId.value = null
    saveHistory(mapData)
  }

  function initMap(projectId: string) {
    const project = novelStore.projects.find(p => p.id === projectId)
    if (!project) return

    if (!project.mapData) {
      if (projectId === 'default') {
        project.mapData = { ...seedMap }
      } else {
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
  }

  return {
    currentYear, currentTool, selectedElementId, selectedLayerId,
    selectedAssetKey, gridVisible, snapToGrid, gridSize, gridScale,
    scale, position,
    drawPoints, isDrawing,
    currentMapData, activeLayers,
    selectAsset,
    startDraw, addDrawPoint, finishDraw, cancelDraw,
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
