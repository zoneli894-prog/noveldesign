<template>
  <div
    class="bg-brand-card rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-brand-md group"
    :class="isActive ? 'border-brand-accent/60 shadow-sm' : 'border-brand-border/60'"
    @click="$emit('open', project.id)"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" :style="{ backgroundColor: stringToColor(project.name) + '18' }">
        📖
      </div>
      <div class="relative">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted/40 opacity-0 group-hover:opacity-100 hover:text-brand-text hover:bg-brand-bg transition-all"
          @click.stop="showMenu = !showMenu"
        >
          <MoreHorizontal :size="16" />
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 top-8 z-10 w-32 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 py-1"
        >
          <button
            class="w-full text-left px-3 py-1.5 text-sm text-brand-text hover:bg-brand-bg transition-colors"
            @click.stop="$emit('edit', project); showMenu = false"
          >
            编辑
          </button>
          <button
            class="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            :disabled="projectsCount <= 1"
            :class="{ 'opacity-40 cursor-not-allowed': projectsCount <= 1 }"
            @click.stop="projectsCount > 1 && ($emit('delete', project.id), showMenu = false)"
          >
            删除
          </button>
        </div>
      </div>
    </div>
    <h3 class="font-serif font-semibold text-brand-text text-sm mb-1 truncate">{{ project.name }}</h3>
    <div class="flex items-center justify-between">
      <span class="text-[11px] text-brand-muted">{{ docCount }} 个词条</span>
      <span class="text-[11px] text-brand-muted">{{ relativeTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
  docCount: number
  projectsCount: number
  isActive?: boolean
}>()

defineEmits<{
  open: [id: string]
  edit: [project: Project]
  delete: [id: string]
}>()

const showMenu = ref(false)

const relativeTime = computed(() => {
  const diff = Date.now() - props.project.updatedAt
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return `${Math.floor(days / 30)} 个月前`
})

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 45%, 55%)`
}
</script>
