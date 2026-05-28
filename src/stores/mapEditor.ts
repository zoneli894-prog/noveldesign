import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MapData, MapElement, MapLayer, MapTool, AssetKey } from '@/types/map'
import { useNovelDataStore } from './novelData'
import { seedMap } from '@/data/seedMap'

export const useMapEditorStore = defineStore('mapEditor', () => {
  const novelStore = useNovelDataStore()

  const currentYear = ref(1)
  const currentTool = ref<MapTool>('select')
  const selectedElementId = ref<string | null>(null)
  const selectedLayerId = ref<string | null>(null)
  const selectedAssetKey = ref<AssetKey | null>(null)
  const gridVisible = ref(true)
  const snapToGrid = ref(true)
  const scale = ref(1)
  const position = ref({ x: 0, y: 0 })

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
    selectedAssetKey, gridVisible, snapToGrid, scale, position,
    currentMapData, activeLayers,
    selectAsset,
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
