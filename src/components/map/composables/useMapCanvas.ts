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
