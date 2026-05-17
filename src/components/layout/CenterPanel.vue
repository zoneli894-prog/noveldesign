<template>
  <main class="flex-1 overflow-y-auto">
    <div class="max-w-[800px] mx-auto px-10 py-8">
      <template v-if="novelStore.activeDoc">
        <Breadcrumbs class="animate-content-enter" :path="novelStore.findDocPath(novelStore.activeDocId)" @navigate="navigateTo" />
        <DocHeader
          :title="novelStore.activeDoc.title"
          :tags="novelStore.activeDoc.tags"
          :type="novelStore.activeDoc.type"
          :starred="novelStore.activeDoc.starred"
          @toggle-star="novelStore.toggleStar(novelStore.activeDocId)"
        />
        <TimelineView
          v-if="novelStore.activeDoc.type === 'chronicle'"
          :events="novelStore.sortedTimelineEvents"
          @navigate="navigateTo"
        />
        <WikiEditor
          v-else
          :content="novelStore.activeContent"
          :doc-id="novelStore.activeDocId"
          @update:content="novelStore.updateContent(novelStore.activeDocId, $event)"
        />
      </template>
      <div v-else class="flex flex-col items-center justify-center h-64 text-brand-muted/40 gap-4">
        <EmptyReading />
        <span class="text-sm">选择一个词条开始阅读</span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useNovelDataStore } from '@/stores/novelData'
import Breadcrumbs from '@/components/center/Breadcrumbs.vue'
import DocHeader from '@/components/center/DocHeader.vue'
import TimelineView from '@/components/center/TimelineView.vue'
import WikiEditor from '@/components/editor/WikiEditor.vue'
import EmptyReading from '@/assets/illustrations/EmptyReading.vue'

const router = useRouter()
const novelStore = useNovelDataStore()

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(`/project/default/doc/${id}`)
}
</script>
