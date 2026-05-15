<template>
  <div class="flex h-screen overflow-hidden">
    <LeftSidebar v-if="uiStore.leftSidebarOpen" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <CenterPanel />
    </div>
    <RightSidebar v-if="uiStore.rightSidebarOpen" />
    <CommandPalette />
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
