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
