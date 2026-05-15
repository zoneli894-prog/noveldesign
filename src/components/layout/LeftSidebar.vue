<template>
  <aside class="w-[250px] min-w-[250px] h-screen border-r border-brand-border flex flex-col bg-white/50">
    <!-- Search bar -->
    <div class="p-3 border-b border-brand-border">
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
        @select="navigateTo"
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
    <div class="p-3 border-t border-brand-border flex items-center justify-between">
      <button
        class="text-brand-muted hover:text-brand-accent text-xs transition-colors"
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
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
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
  router.push(`/project/default/doc/${id}`)
}
</script>
