<template>
  <div class="min-h-screen bg-brand-bg">
    <div class="max-w-5xl mx-auto px-8 py-12">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-serif font-semibold text-brand-text">我的小说项目</h1>
          <p class="text-sm text-brand-muted mt-1">管理你的所有小说设定</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors text-sm font-medium"
          @click="showCreateDialog = true"
        >
          <Plus :size="16" />
          新建项目
        </button>
      </div>

      <div v-if="novelStore.projects.length === 0" class="flex flex-col items-center justify-center py-20 text-brand-muted/40 gap-4">
        <BookOpen :size="48" />
        <span class="text-sm">还没有项目，点击上方按钮创建第一个</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard
          v-for="project in novelStore.projects"
          :key="project.id"
          :project="project"
          :doc-count="novelStore.getProjectStats(project.id).docCount"
          :projects-count="novelStore.projects.length"
          @open="openProject"
          @edit="openEditDialog"
          @delete="handleDelete"
        />
        <div
          class="border-2 border-dashed border-brand-border/60 rounded-xl p-5 flex flex-col items-center justify-center min-h-[120px] text-brand-muted/50 cursor-pointer hover:border-brand-accent/40 hover:text-brand-accent transition-colors"
          @click="showCreateDialog = true"
        >
          <Plus :size="24" class="mb-2" />
          <span class="text-sm">新建项目</span>
        </div>
      </div>
    </div>

    <CreateProjectDialog
      :visible="showCreateDialog"
      @cancel="showCreateDialog = false"
      @confirm="handleCreate"
    />
    <EditProjectDialog
      :visible="showEditDialog"
      :project="editingProject"
      :projects-count="novelStore.projects.length"
      @cancel="showEditDialog = false"
      @save="handleRename"
      @delete="handleDeleteFromEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, BookOpen } from 'lucide-vue-next'
import { useNovelDataStore } from '@/stores/novelData'
import type { Project } from '@/types'
import ProjectCard from './ProjectCard.vue'
import CreateProjectDialog from './CreateProjectDialog.vue'
import EditProjectDialog from './EditProjectDialog.vue'

const router = useRouter()
const novelStore = useNovelDataStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingProject = ref<Project | null>(null)

function openProject(id: string) {
  novelStore.setActiveProject(id)
  const stats = novelStore.getProjectStats(id)
  if (stats.docCount > 0) {
    const flat = novelStore.flatDocs
    if (flat.length > 0) {
      router.push(`/project/${id}/doc/${flat[0].id}`)
    }
  }
}

function handleCreate(name: string) {
  const project = novelStore.createProject(name)
  showCreateDialog.value = false
  openProject(project.id)
}

function openEditDialog(project: Project) {
  editingProject.value = project
  showEditDialog.value = true
}

function handleRename(name: string) {
  if (editingProject.value) {
    novelStore.renameProject(editingProject.value.id, name)
  }
  showEditDialog.value = false
}

function handleDelete(id: string) {
  novelStore.deleteProject(id)
}

function handleDeleteFromEdit() {
  if (editingProject.value) {
    novelStore.deleteProject(editingProject.value.id)
  }
  showEditDialog.value = false
}
</script>
