<template>
  <main class="flex-1 overflow-y-auto">
    <div class="max-w-[800px] mx-auto px-8 py-6">
      <template v-if="novelStore.activeDoc">
        <Breadcrumbs :path="novelStore.findDocPath(novelStore.activeDocId)" @navigate="navigateTo" />
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
          :backlinks="novelStore.activeMeta.backlinks"
          @navigate="navigateTo"
        />
      </template>
      <div v-else class="flex items-center justify-center h-64 text-brand-muted">
        选择一个词条开始阅读
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
