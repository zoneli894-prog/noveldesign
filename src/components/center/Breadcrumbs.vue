<template>
  <nav class="flex items-center gap-1.5 text-xs text-brand-muted/50 mb-5">
    <!-- Project name (first breadcrumb) -->
    <button
      v-if="activeProject"
      class="hover:text-brand-accent transition-colors duration-150 px-1 py-0.5 -mx-1 rounded hover:bg-brand-accent-light/50"
      @click="goToProjectHome"
    >
      {{ activeProject.name }}
    </button>
    <span v-if="activeProject && path.length > 0" class="text-brand-border/50 text-[10px]">›</span>

    <!-- Doc path breadcrumbs -->
    <template v-for="(node, i) in path" :key="node.id">
      <button
        class="hover:text-brand-accent transition-colors duration-150 px-1 py-0.5 -mx-1 rounded hover:bg-brand-accent-light/50"
        :class="{ 'text-brand-text/70 font-medium': i === path.length - 1 }"
        @click="$emit('navigate', node.id)"
      >
        {{ node.title }}
      </button>
      <span v-if="i < path.length - 1" class="text-brand-border/50 text-[10px]">›</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { DocNode } from '@/types'
import { useNovelDataStore } from '@/stores/novelData'

defineProps<{ path: DocNode[] }>()
defineEmits<{ navigate: [id: string] }>()

const router = useRouter()
const novelStore = useNovelDataStore()
const activeProject = novelStore.activeProject

function goToProjectHome() {
  if (activeProject) {
    router.push(`/project/${activeProject.id}`)
  }
}
</script>
