<template>
  <aside class="w-[300px] min-w-[300px] h-screen border-l border-brand-border/60 flex flex-col bg-brand-card backdrop-blur-sm">
    <div class="flex-1 overflow-y-auto p-5 space-y-6">
      <!-- Infobox -->
      <Infobox
        v-if="novelStore.activeDoc"
        :doc-id="novelStore.activeDocId"
        :title="novelStore.activeDoc.title"
        :type="novelStore.activeDoc.type"
      />

      <!-- Graph preview -->
      <div>
        <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">关系图谱</h3>
        <GraphPreview :doc-id="novelStore.activeDocId" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useNovelDataStore } from '@/stores/novelData'
import Infobox from '@/components/right/Infobox.vue'
import GraphPreview from '@/components/right/GraphPreview.vue'

const novelStore = useNovelDataStore()
</script>
