<template>
  <aside class="w-[250px] min-w-[250px] h-screen border-r border-brand-border/60 flex flex-col bg-brand-card backdrop-blur-sm">
    <!-- Search bar -->
    <div class="p-3 border-b border-brand-border/40">
      <SearchBar />
    </div>

    <!-- View switcher -->
    <ViewSwitcher :mode="uiStore.viewMode" @update:mode="uiStore.setViewMode($event)" />

    <!-- Content area -->
    <div class="flex-1 overflow-y-auto p-2">
      <TreeView
        v-if="uiStore.viewMode === 'tree'"
        :nodes="novelStore.docTree"
        :active-id="novelStore.activeDocId"
        :active-variant-id="novelStore.activeVariantId ?? undefined"
        @select="navigateTo"
        @createChild="handleQuickCreate"
        @selectVariant="handleSelectVariant"
      />
      <RecentView
        v-else-if="uiStore.viewMode === 'recent'"
        :docs="novelStore.recentDocs"
        :active-id="novelStore.activeDocId"
        @select="navigateTo"
      />
      <StarredView
        v-else
        :docs="novelStore.starredDocs"
        :active-id="novelStore.activeDocId"
        @select="navigateTo"
      />
    </div>

    <!-- Bottom actions -->
    <div class="p-3 border-t border-brand-border/40 flex items-center gap-2">
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="uiStore.openCreateDocModal()"
        title="新建词条"
      >
        <Plus :size="14" />
        <span>新建</span>
      </button>
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="uiStore.openGlobalGraph()"
        title="全局图谱"
      >
        <GitBranch :size="14" />
      </button>
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="exportAllDocs(novelStore.flatDocs, novelStore.docContent)"
        title="导出全部设定"
      >
        <Download :size="14" />
      </button>
      <div class="flex-1" />
      <button
        class="text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150"
        @click="uiStore.toggleRight()"
      >
        {{ uiStore.rightSidebarOpen ? '隐藏属性栏' : '显示属性栏' }}
      </button>
      <ThemeToggle />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, GitBranch, Download } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import { docRoute } from '@/utils/routes'
import { exportAllDocs } from '@/utils/export-docx'
import SearchBar from '@/components/sidebar/SearchBar.vue'
import ViewSwitcher from '@/components/sidebar/ViewSwitcher.vue'
import TreeView from '@/components/sidebar/TreeView.vue'
import RecentView from '@/components/sidebar/RecentView.vue'
import StarredView from '@/components/sidebar/StarredView.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(docRoute(id))
}

function handleQuickCreate({ parentId, title }: { parentId: string; title: string }) {
  const parent = novelStore.flatDocs.find(d => d.id === parentId)
  const newNode = novelStore.addDoc({
    title,
    type: parent?.type === 'lore' ? 'lore' : parent?.type || 'lore',
    parentId,
  })
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id))
}

function handleSelectVariant({ docId, variantId }: { docId: string; variantId: string }) {
  novelStore.setActiveDoc(docId)
  novelStore.setActiveVariant(variantId)
  router.push(docRoute(docId))
}
</script>
