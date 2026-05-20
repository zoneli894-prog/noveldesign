<template>
  <div class="flex h-screen overflow-hidden bg-brand-bg">
    <Transition name="sidebar-left">
      <LeftSidebar v-if="uiStore.leftSidebarOpen" />
    </Transition>
    <div class="flex-1 flex flex-col overflow-hidden">
      <CenterPanel />
    </div>
    <Transition name="sidebar-right">
      <RightSidebar v-if="uiStore.rightSidebarOpen" />
    </Transition>
    <CommandPalette />
    <CreateDocModal />
    <GlobalGraph />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import LeftSidebar from '@/components/layout/LeftSidebar.vue'
import CenterPanel from '@/components/layout/CenterPanel.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import CommandPalette from '@/components/common/CommandPalette.vue'
import CreateDocModal from '@/components/common/CreateDocModal.vue'
import GlobalGraph from '@/components/common/GlobalGraph.vue'

const route = useRoute()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()

watch(
  () => route.params.docId,
  (docId) => {
    if (typeof docId === 'string') {
      novelStore.setActiveDoc(docId)
    }
  },
  { immediate: true }
)
</script>
