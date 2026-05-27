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
