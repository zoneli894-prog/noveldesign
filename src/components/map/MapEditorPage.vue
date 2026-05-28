<template>
  <div class="flex flex-col h-screen overflow-hidden bg-brand-bg">
    <!-- Top bar with back button and project name -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-brand-border/40 bg-brand-card/50">
      <button
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors text-xs"
        @click="goBack"
      >
        <ArrowLeft :size="14" />
        返回
      </button>
      <div class="w-px h-4 bg-brand-border/40" />
      <span class="text-xs font-medium text-brand-text">{{ novelStore.activeProject?.name || '项目' }}</span>
      <span class="text-xs text-brand-muted">/</span>
      <span class="text-xs text-brand-accent font-medium">舆地图</span>
    </div>

    <!-- Map editor fills remaining space -->
    <MapEditor class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useNovelDataStore } from '@/stores/novelData'
import { useMapEditorStore } from '@/stores/mapEditor'
import { docRoute } from '@/utils/routes'
import MapEditor from './MapEditor.vue'

const route = useRoute()
const router = useRouter()
const novelStore = useNovelDataStore()
const mapStore = useMapEditorStore()

onMounted(() => {
  const pid = route.params.pid as string
  if (pid) {
    novelStore.setActiveProject(pid)
    mapStore.initMap(pid)
  }
})

function goBack() {
  const pid = (route.params.pid as string) || novelStore.activeProjectId
  const firstDoc = novelStore.flatDocs[0]
  if (firstDoc) {
    router.push(docRoute(firstDoc.id, pid))
  } else {
    router.push(`/project/${pid}`)
  }
}
</script>
