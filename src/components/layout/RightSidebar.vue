<template>
  <aside class="w-[300px] min-w-[300px] h-screen border-l border-brand-border flex flex-col bg-white/50">
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Infobox -->
      <Infobox
        v-if="novelStore.activeMeta"
        :fields="novelStore.activeMeta.infobox"
        :title="novelStore.activeDoc?.title || ''"
        :type="novelStore.activeDoc?.type || 'lore'"
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
