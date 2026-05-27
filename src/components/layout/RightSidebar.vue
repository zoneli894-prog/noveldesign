<template>
  <aside class="w-[300px] min-w-[300px] h-screen border-l border-brand-border/60 flex flex-col bg-brand-card backdrop-blur-sm">
    <!-- Tab switcher -->
    <div class="flex border-b border-brand-border/40">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2.5 text-xs font-medium transition-colors"
        :class="activeTab === tab.key
          ? 'text-brand-accent border-b-2 border-brand-accent'
          : 'text-brand-muted hover:text-brand-text'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Infobox tab -->
      <div v-if="activeTab === 'infobox'" class="flex-1 overflow-y-auto p-5 space-y-6 h-full">
        <Infobox
          v-if="novelStore.activeDoc"
          :doc-id="novelStore.activeDocId"
          :meta="novelStore.activeMeta"
          :doc="novelStore.activeDoc"
          :active-variant="novelStore.activeVariant"
        />

        <Backlinks
          v-if="novelStore.activeMeta"
          :backlinks="novelStore.activeMeta.backlinks"
          @navigate="navigateTo"
        />
      </div>

      <!-- Map tab -->
      <MapEditor v-else-if="activeTab === 'map'" />

      <!-- Graph tab -->
      <div v-else-if="activeTab === 'graph'" class="p-5">
        <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">关系图谱</h3>
        <GraphPreview :doc-id="novelStore.activeDocId" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNovelDataStore } from '@/stores/novelData'
import { docRoute } from '@/utils/routes'
import Infobox from '@/components/right/Infobox.vue'
import Backlinks from '@/components/center/Backlinks.vue'
import GraphPreview from '@/components/right/GraphPreview.vue'
import MapEditor from '@/components/map/MapEditor.vue'

const router = useRouter()
const novelStore = useNovelDataStore()

const activeTab = ref('infobox')

const tabs = [
  { key: 'infobox', label: '属性' },
  { key: 'map', label: '地图' },
  { key: 'graph', label: '图谱' },
]

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(docRoute(id, novelStore.activeProjectId))
}
</script>
