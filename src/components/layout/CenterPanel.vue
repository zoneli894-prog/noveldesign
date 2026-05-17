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
        <WikiEditor
          :content="novelStore.activeContent"
          :doc-id="novelStore.activeDocId"
          @update:content="novelStore.updateContent(novelStore.activeDocId, $event)"
        />
        <Backlinks
          v-if="novelStore.activeMeta"
          class="animate-content-enter"
          :backlinks="novelStore.activeMeta.backlinks"
          @navigate="navigateTo"
        />
      </template>
      <div v-else class="flex flex-col items-center justify-center h-64 text-brand-muted/50 gap-2">
        <svg class="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
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
import Backlinks from '@/components/center/Backlinks.vue'
import WikiEditor from '@/components/editor/WikiEditor.vue'

const router = useRouter()
const novelStore = useNovelDataStore()

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(`/project/default/doc/${id}`)
}
</script>
