import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'

export function useMapCanvas() {
  const store = useMapEditorStore()
  const stageRef = ref<any>(null)
  const containerRef = ref<HTMLDivElement | null>(null)
  const containerWidth = ref(800)
  const containerHeight = ref(600)
  const isDragging = ref(false)
  const lastPointer = ref({ x: 0, y: 0 })

  function updateSize() {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth || 800
      containerHeight.value = containerRef.value.clientHeight || 600
    }
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  const stageConfig = computed(() => ({
    width: containerWidth.value,
    height: containerHeight.value,
    scaleX: store.scale,
    scaleY: store.scale,
    x: store.position.x,
    y: store.position.y,
  }))

  /** Convert a Konva event's pointer position to canvas coordinates */
  function getCanvasPointer(e: any): { x: number; y: number } {
    const stage = stageRef.value?.getStage?.()
    if (!stage) return { x: 0, y: 0 }
    const pointer = stage.getPointerPosition()
    if (!pointer) return { x: 0, y: 0 }
    // pointer is in stage-local coords; undo stage transform to get canvas coords
    return {
      x: (pointer.x - store.position.x) / store.scale,
      y: (pointer.y - store.position.y) / store.scale,
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

  function handleWheel(e: any) {
    e.evt.preventDefault()
    const scaleBy = 1.1
    const oldScale = store.scale
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    store.scale = Math.max(0.1, Math.min(5, newScale))
  }

  function handleMouseDown(e: any) {
    // Pan tool or space+drag
    if (store.currentTool === 'pan' || e.evt?.spaceKey) {
      isDragging.value = true
      lastPointer.value = { x: e.evt.clientX, y: e.evt.clientY }
      return
    }

    // Place a stamp when an asset is selected
    if (store.selectedAssetKey) {
      const pos = getCanvasPointer(e)
      const snapped = snapToGrid(pos.x, pos.y)
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

    // Delete tool — click an element to remove it
    if (store.currentTool === 'delete') {
      const target = e.target
      if (target?.attrs?.elementId) {
        store.deleteElement(target.attrs.elementId)
      }
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

  /** Click handler as backup for mousedown — places stamps on the canvas */
  function handleStageClick(e: any) {
    if (store.selectedAssetKey) {
      const pos = getCanvasPointer(e)
      const snapped = snapToGrid(pos.x, pos.y)
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
    }
  }

  return {
    stageRef,
    containerRef,
    stageConfig,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleStageClick,
    handleMouseMove,
    handleMouseUp,
    snapToGrid,
  }
}
