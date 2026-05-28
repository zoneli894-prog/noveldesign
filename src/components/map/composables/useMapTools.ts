import { useMapEditorStore } from '@/stores/mapEditor'
import { assetList } from '../assets'

export function useMapTools() {
  const store = useMapEditorStore()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key.toLowerCase()) {
      case 'v':
        store.currentTool = 'select'
        store.selectedAssetKey = null
        break
      case 'p':
        store.currentTool = 'draw'
        break
      case 'd':
        store.currentTool = 'delete'
        store.selectedAssetKey = null
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
      case 'escape':
        store.cancelDraw()
        store.selectedAssetKey = null
        store.selectedElementId = null
        store.selectedLayerId = null
        break
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6': {
        const idx = parseInt(e.key) - 1
        if (idx < assetList.length) {
          store.selectAsset(assetList[idx].key)
        }
        break
      }
    }
  }

  return {
    handleKeyDown,
  }
}
