<template>
  <main class="flex-1 overflow-y-auto">
    <div class="max-w-[800px] mx-auto px-10 py-8">
      <template v-if="novelStore.activeDoc">
        <Breadcrumbs class="animate-content-enter" :path="novelStore.findDocPath(novelStore.activeDocId)" @navigate="navigateTo" />
        <DocHeader
          :doc="novelStore.activeDoc"
          :meta="novelStore.docMetaMap[novelStore.activeDocId] || null"
          :active-variant-id="novelStore.activeVariantId"
          @toggle-star="novelStore.toggleStar(novelStore.activeDocId)"
          @delete="showDeleteConfirm = true"
          @export="handleExport"
          @select-variant="handleSelectVariant"
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
          @update:content="handleUpdateContent"
        />
      </template>
      <div v-else class="flex flex-col items-center justify-center h-64 text-brand-muted/40 gap-4">
        <EmptyReading />
        <span class="text-sm">选择一个词条开始阅读</span>
      </div>
    </div>

    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      title="删除词条"
      message="此操作将永久删除该词条及其所有内容、属性数据。子词条也将被一并删除。"
      confirm-text="确认删除"
      @confirm="handleDelete"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNovelDataStore } from '@/stores/novelData'
import { docRoute } from '@/utils/routes'
import Breadcrumbs from '@/components/center/Breadcrumbs.vue'
import DocHeader from '@/components/center/DocHeader.vue'
import TimelineView from '@/components/center/TimelineView.vue'
import WikiEditor from '@/components/editor/WikiEditor.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyReading from '@/assets/illustrations/EmptyReading.vue'
import { exportSingleDoc } from '@/utils/export-docx'

const router = useRouter()
const novelStore = useNovelDataStore()
const showDeleteConfirm = ref(false)

function handleSelectVariant(variantId: string | null) {
  novelStore.setActiveVariant(variantId)
}

function handleUpdateContent(html: string) {
  if (novelStore.activeVariantId && novelStore.activeDoc) {
    novelStore.updateVariantContent(
      novelStore.activeDoc.id,
      novelStore.activeVariantId,
      html
    )
  } else {
    novelStore.updateContent(novelStore.activeDocId, html)
  }
}

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(docRoute(id))
}

function handleExport() {
  if (!novelStore.activeDoc) return
  const html = novelStore.docContent[novelStore.activeDocId] || ''
  exportSingleDoc(novelStore.activeDoc, html)
}

function handleDelete() {
  const deletedId = novelStore.activeDocId
  const parent = novelStore.getParentOf(deletedId)
  novelStore.deleteDoc(deletedId)
  showDeleteConfirm.value = false

  // Navigate to parent, first sibling, or fallback
  if (parent) {
    navigateTo(parent.id)
  } else {
    const remaining = novelStore.flatDocs
    if (remaining.length > 0) {
      navigateTo(remaining[0].id)
    }
  }
}
</script>
