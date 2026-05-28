<template>
  <div class="flex flex-col h-full">
    <MapToolbar @export="handleExport" @toggle-properties="showProperties = !showProperties" />
    <div class="flex flex-1 min-h-0">
      <MapCanvas class="flex-1" />
      <MapProperties v-if="showProperties" />
    </div>
    <YearSlider />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMapEditorStore, undoHistory, redoHistory } from '@/stores/mapEditor'
import { useNovelDataStore } from '@/stores/novelData'
import { useMapTools } from './composables/useMapTools'
import { useMapExport } from './composables/useMapExport'
import MapToolbar from './MapToolbar.vue'
import MapCanvas from './MapCanvas.vue'
import MapProperties from './MapProperties.vue'
import YearSlider from './YearSlider.vue'

const showProperties = ref(false)

const store = useMapEditorStore()
const novelStore = useNovelDataStore()
const { handleKeyDown } = useMapTools()
const { exportAndDownload } = useMapExport()

function handleKeyDownWithHistory(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    const mapData = store.currentMapData
    if (mapData) undoHistory(mapData)
    return
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    const mapData = store.currentMapData
    if (mapData) redoHistory(mapData)
    return
  }
  handleKeyDown(e)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDownWithHistory)
  if (novelStore.activeProjectId) {
    store.initMap(novelStore.activeProjectId)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDownWithHistory)
})

async function handleExport() {
  await exportAndDownload()
}
</script>
