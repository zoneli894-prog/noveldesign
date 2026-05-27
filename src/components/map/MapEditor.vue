<template>
  <div class="flex flex-col h-full">
    <MapToolbar @export="handleExport" />
    <MapCanvas />
    <YearSlider />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMapEditorStore } from '@/stores/mapEditor'
import { useNovelDataStore } from '@/stores/novelData'
import { useMapTools } from './composables/useMapTools'
import { useMapExport } from './composables/useMapExport'
import MapToolbar from './MapToolbar.vue'
import MapCanvas from './MapCanvas.vue'
import YearSlider from './YearSlider.vue'

const store = useMapEditorStore()
const novelStore = useNovelDataStore()
const { handleKeyDown } = useMapTools()
const { exportAndDownload } = useMapExport()

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  if (novelStore.activeProjectId) {
    store.initMap(novelStore.activeProjectId)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

async function handleExport() {
  await exportAndDownload()
}
</script>
