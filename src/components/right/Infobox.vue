<template>
  <div>
    <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">属性信息</h3>
    <div class="bg-white/80 rounded-lg border border-brand-border overflow-hidden">
      <!-- Header -->
      <div class="px-3 py-2 border-b border-brand-border bg-brand-bg/50">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: typeColors[type] || '#888' }" />
          <span class="font-serif font-semibold text-sm truncate">{{ title }}</span>
        </div>
        <span
          class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
          :style="{ backgroundColor: typeColors[type] || '#888' }"
        >
          {{ typeLabels[type] }}
        </span>
      </div>

      <!-- Chapter selector -->
      <div v-if="availableChapters.length > 1" class="px-3 py-2 border-b border-brand-border/50 flex flex-wrap gap-1">
        <button
          v-for="ch in availableChapters"
          :key="ch"
          class="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
          :class="selectedChapter === ch
            ? 'bg-brand-accent text-white'
            : 'bg-brand-bg text-brand-muted hover:text-brand-text'"
          @click="selectedChapter = ch"
        >
          {{ ch }}
        </button>
      </div>

      <!-- Fields -->
      <div class="divide-y divide-brand-border/50">
        <div
          v-for="field in currentFields"
          :key="field.key"
          class="px-3 py-1.5"
        >
          <div class="flex items-start text-xs">
            <span class="w-16 shrink-0 text-brand-muted">{{ field.key }}</span>
            <span class="flex-1 text-brand-text">{{ field.value }}</span>
            <!-- History toggle -->
            <button
              v-if="hasHistory(field.key)"
              class="ml-1 text-brand-muted hover:text-brand-accent transition-colors shrink-0"
              :class="{ 'text-brand-accent': expandedFields.has(field.key) }"
              @click="toggleHistory(field.key)"
              title="查看属性变更历史"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          </div>
          <!-- History panel -->
          <div
            v-if="expandedFields.has(field.key)"
            class="mt-1.5 ml-4 pl-3 border-l-2 border-brand-accent/20 space-y-1"
          >
            <div
              v-for="entry in getFieldHistory(field.key)"
              :key="entry.chapter"
              class="flex items-center gap-2 text-[10px]"
            >
              <span class="text-brand-muted shrink-0">{{ entry.chapter }}</span>
              <span class="text-brand-accent">→</span>
              <span class="text-brand-text">{{ entry.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="currentFields.length === 0" class="px-3 py-4 text-center text-brand-muted text-xs">
        暂无属性数据
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNovelDataStore } from '@/stores/novelData'
import { typeLabels, typeColors } from '@/data/seed'
import type { DocNode } from '@/types'

const props = defineProps<{
  docId: string
  title: string
  type: DocNode['type']
}>()

const novelStore = useNovelDataStore()

const availableChapters = computed(() => novelStore.getInfoboxChapters(props.docId))
const selectedChapter = ref(availableChapters.value[0] || '全部')

// Reset chapter when doc changes
watch(() => props.docId, () => {
  selectedChapter.value = novelStore.getInfoboxChapters(props.docId)[0] || '全部'
  expandedFields.value = new Set()
})

const currentFields = computed(() =>
  novelStore.getInfoboxFieldsForChapter(props.docId, selectedChapter.value)
)

// Track expanded history panels
const expandedFields = ref<Set<string>>(new Set())

function hasHistory(fieldKey: string): boolean {
  const history = novelStore.getFieldHistory(props.docId, fieldKey)
  // Has history if more than one unique value across snapshots
  const uniqueValues = new Set(history.map(h => h.value))
  return uniqueValues.size > 1
}

function getFieldHistory(fieldKey: string) {
  return novelStore.getFieldHistory(props.docId, fieldKey)
}

function toggleHistory(fieldKey: string) {
  const next = new Set(expandedFields.value)
  if (next.has(fieldKey)) {
    next.delete(fieldKey)
  } else {
    next.add(fieldKey)
  }
  expandedFields.value = next
}
</script>
