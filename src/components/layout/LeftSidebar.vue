<template>
  <aside class="w-[250px] min-w-[250px] h-screen border-r border-brand-border/60 flex flex-col bg-brand-card backdrop-blur-sm">
    <!-- Project name -->
    <div class="px-3 pt-3 pb-2 border-b border-brand-border/40">
      <button
        class="flex items-center gap-1.5 text-brand-text hover:text-brand-accent transition-colors group"
        @click="goToProjectHome"
      >
        <BookOpen :size="14" class="text-brand-muted/60 group-hover:text-brand-accent" />
        <span class="font-serif text-sm font-medium truncate">{{ novelStore.activeProject?.name || '项目' }}</span>
      </button>
    </div>

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
        @createSibling="handleCreateSibling"
        @rename="handleRename"
        @delete="handleDeleteRequest"
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
        @click="goToMapEditor"
        title="舆地图编辑器"
      >
        <Map :size="14" />
        <span>地图</span>
      </button>
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="goToProjectHome"
        title="所有项目"
      >
        <FolderOpen :size="14" />
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
    <ConfirmDialog
      :visible="deleteTargetId !== null"
      title="删除词条"
      message="此操作将永久删除该词条及其所有内容、属性数据。子词条也将被一并删除。"
      confirm-text="确认删除"
      @confirm="confirmDelete"
      @cancel="deleteTargetId = null"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, GitBranch, Download, BookOpen, FolderOpen, Map } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import { docRoute, mapRoute } from '@/utils/routes'
import { exportAllDocs } from '@/utils/export-docx'
import SearchBar from '@/components/sidebar/SearchBar.vue'
import ViewSwitcher from '@/components/sidebar/ViewSwitcher.vue'
import TreeView from '@/components/sidebar/TreeView.vue'
import RecentView from '@/components/sidebar/RecentView.vue'
import StarredView from '@/components/sidebar/StarredView.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()
const deleteTargetId = ref<string | null>(null)

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(docRoute(id, novelStore.activeProjectId))
}

function goToProjectHome() {
  if (novelStore.activeProject) {
    router.push(`/project/${novelStore.activeProject.id}`)
  } else if (novelStore.projects.length > 0) {
    router.push(`/project/${novelStore.projects[0].id}`)
  } else {
    router.push('/')
  }
}

function goToMapEditor() {
  router.push(mapRoute(novelStore.activeProjectId))
}

function handleQuickCreate({ parentId, title, type }: { parentId: string; title: string; type: import('@/types').DocNode['type'] }) {
  const newNode = novelStore.addDoc({
    title,
    type,
    parentId,
  })
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id, novelStore.activeProjectId))
}

function handleSelectVariant({ docId, variantId }: { docId: string; variantId: string }) {
  novelStore.setActiveDoc(docId)
  novelStore.setActiveVariant(variantId)
  router.push(docRoute(docId, novelStore.activeProjectId))
}

function handleCreateSibling({ parentId, title, type, afterId }: { parentId: string | null; title: string; type: import('@/types').DocNode['type']; afterId: string }) {
  const newNode = novelStore.addDoc({ title, type, parentId, afterId })
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id, novelStore.activeProjectId))
}

function handleRename({ id, newTitle }: { id: string; newTitle: string }) {
  novelStore.renameDoc(id, newTitle)
}

function handleDeleteRequest(id: string) {
  deleteTargetId.value = id
}

function confirmDelete() {
  if (!deleteTargetId.value) return
  const deletedId = deleteTargetId.value
  const parent = novelStore.getParentOf(deletedId)
  novelStore.deleteDoc(deletedId)
  deleteTargetId.value = null

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
