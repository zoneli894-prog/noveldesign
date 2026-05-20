<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider">属性信息</h3>
      <button
        v-if="availableYears.length > 0 || editMode"
        class="text-brand-muted/50 hover:text-brand-accent transition-colors"
        :class="{ 'text-brand-accent': editMode }"
        @click="toggleEditMode"
        :title="editMode ? '退出编辑' : '编辑属性'"
      >
        <Pencil :size="13" />
      </button>
    </div>
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

      <!-- Year selector -->
      <div class="px-3 py-2 border-b border-brand-border/50">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-brand-muted shrink-0">纪年</span>
          <div class="relative flex-1">
            <select
              v-model="selectedYear"
              class="w-full appearance-none bg-brand-bg text-brand-text text-[11px] font-medium
                     px-2 py-1 pr-5 rounded border border-brand-border/50
                     hover:border-brand-accent/40 focus:border-brand-accent focus:outline-none
                     transition-colors cursor-pointer"
            >
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
            <svg
              class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-muted pointer-events-none"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <!-- Edit mode: snapshot actions -->
          <template v-if="editMode">
            <button
              class="text-brand-muted/50 hover:text-brand-accent transition-colors shrink-0"
              title="复制当前纪年"
              @click="duplicateSnapshot"
            >
              <Copy :size="12" />
            </button>
            <button
              v-if="availableYears.length > 1"
              class="text-brand-muted/50 hover:text-red-400 transition-colors shrink-0"
              title="删除当前纪年"
              @click="removeCurrentSnapshot"
            >
              <X :size="12" />
            </button>
          </template>
        </div>
        <!-- Edit mode: add new year -->
        <div v-if="editMode" class="mt-2 flex items-center gap-1.5">
          <input
            v-model="newYearName"
            type="text"
            placeholder="新纪年名称"
            class="flex-1 text-[11px] bg-brand-bg border border-brand-border/50 rounded px-2 py-1
                   text-brand-text placeholder:text-brand-muted/40
                   focus:border-brand-accent focus:outline-none transition-colors"
            @keydown.enter="addNewSnapshot"
          />
          <button
            class="text-[10px] text-brand-accent hover:text-brand-accent/80 transition-colors shrink-0 px-1.5"
            :disabled="!newYearName.trim()"
            @click="addNewSnapshot"
          >
            + 添加
          </button>
        </div>
      </div>

      <!-- Fields -->
      <div class="divide-y divide-brand-border/50">
        <div
          v-for="field in displayFields"
          :key="field.key"
          class="px-3 py-1.5 group"
        >
          <div class="flex items-start text-xs gap-1">
            <!-- Key -->
            <template v-if="editMode">
              <input
                v-model="field.key"
                class="w-16 shrink-0 bg-brand-bg border border-brand-border/50 rounded px-1.5 py-0.5 text-[11px]
                       text-brand-muted focus:border-brand-accent focus:outline-none transition-colors"
                @change="onFieldChange"
              />
            </template>
            <span v-else class="w-16 shrink-0 text-brand-muted">{{ field.key }}</span>

            <!-- Value -->
            <template v-if="editMode">
              <input
                v-model="field.value"
                class="flex-1 bg-brand-bg border border-brand-border/50 rounded px-1.5 py-0.5 text-[11px]
                       text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                @change="onFieldChange"
              />
            </template>
            <span v-else class="flex-1 text-brand-text">{{ field.value }}</span>

            <!-- Edit mode: type toggle + remove -->
            <template v-if="editMode">
              <button
                class="text-[9px] px-1 py-0.5 rounded border border-brand-border/50 text-brand-muted
                       hover:border-brand-accent/50 hover:text-brand-accent transition-colors shrink-0"
                :title="`类型: ${field.type}，点击切换`"
                @click="cycleFieldType(field)"
              >
                {{ fieldTypeLabel(field.type) }}
              </button>
              <button
                class="text-brand-muted/30 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                @click="removeField(field.key)"
              >
                <X :size="12" />
              </button>
            </template>

            <!-- Read-only: history toggle -->
            <button
              v-if="!editMode && hasHistory(field.key)"
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

          <!-- History panel (read-only) -->
          <div
            v-if="!editMode && expandedFields.has(field.key)"
            class="mt-1.5 ml-4 pl-3 border-l-2 border-brand-accent/20 space-y-1"
          >
            <div
              v-for="entry in getFieldHistory(field.key)"
              :key="entry.year"
              class="flex items-center gap-2 text-[10px]"
            >
              <span class="text-brand-muted shrink-0">{{ entry.year }}</span>
              <span class="text-brand-accent">→</span>
              <span class="text-brand-text">{{ entry.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit mode: add field -->
      <div v-if="editMode" class="px-3 py-2 border-t border-brand-border/50">
        <button
          class="w-full text-[11px] text-brand-muted/60 hover:text-brand-accent transition-colors py-1
                 border border-dashed border-brand-border/40 rounded hover:border-brand-accent/40"
          @click="addField"
        >
          + 添加字段
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="displayFields.length === 0 && !editMode" class="px-3 py-4 text-center text-brand-muted text-xs">
        暂无属性数据
      </div>

      <!-- Edit mode: save/cancel -->
      <div v-if="editMode" class="px-3 py-2 border-t border-brand-border/50 flex items-center justify-end gap-2">
        <button
          class="text-[11px] text-brand-muted hover:text-brand-text transition-colors px-3 py-1 rounded"
          @click="cancelEdit"
        >
          取消
        </button>
        <button
          class="text-[11px] text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors px-3 py-1 rounded"
          @click="saveEdit"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Pencil, Copy, X } from 'lucide-vue-next'
import { useNovelDataStore } from '@/stores/novelData'
import { typeLabels, typeColors } from '@/data/seed'
import type { DocNode, InfoboxField, InfoboxSnapshot } from '@/types'

const props = defineProps<{
  docId: string
  title: string
  type: DocNode['type']
}>()

const novelStore = useNovelDataStore()

const editMode = ref(false)
const expandedFields = ref<Set<string>>(new Set())
const newYearName = ref('')

// Editable copy of snapshots
const localSnapshots = ref<InfoboxSnapshot[]>([])

const availableYears = computed(() => {
  if (editMode.value) {
    return localSnapshots.value.map(s => s.year)
  }
  return novelStore.getInfoboxYears(props.docId)
})

const selectedYear = ref(availableYears.value[0] || '全部')

const displayFields = computed(() => {
  if (editMode.value) {
    const snap = localSnapshots.value.find(s => s.year === selectedYear.value)
    return snap ? snap.fields : []
  }
  return novelStore.getInfoboxFieldsForYear(props.docId, selectedYear.value)
})

// Reset year when doc changes
watch(() => props.docId, () => {
  selectedYear.value = novelStore.getInfoboxYears(props.docId)[0] || '全部'
  expandedFields.value = new Set()
  editMode.value = false
})

function hasHistory(fieldKey: string): boolean {
  const history = novelStore.getFieldHistory(props.docId, fieldKey)
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

// --- Edit mode ---

function toggleEditMode() {
  if (editMode.value) {
    editMode.value = false
    return
  }
  // Deep clone current snapshots
  const current = novelStore.getInfoboxYears(props.docId)
  localSnapshots.value = current.map(year => ({
    year,
    fields: novelStore.getInfoboxFieldsForYear(props.docId, year).map(f => ({ ...f })),
  }))
  if (localSnapshots.value.length === 0) {
    localSnapshots.value = [{ year: '全部', fields: [] }]
    selectedYear.value = '全部'
  }
  editMode.value = true
}

function saveEdit() {
  novelStore.updateInfobox(props.docId, localSnapshots.value)
  editMode.value = false
}

function cancelEdit() {
  editMode.value = false
  localSnapshots.value = []
}

function addField() {
  const snap = localSnapshots.value.find(s => s.year === selectedYear.value)
  if (snap) {
    snap.fields.push({ key: '新字段', value: '', type: 'text' })
  }
}

function removeField(fieldKey: string) {
  const snap = localSnapshots.value.find(s => s.year === selectedYear.value)
  if (snap) {
    snap.fields = snap.fields.filter(f => f.key !== fieldKey)
  }
}

function cycleFieldType(field: InfoboxField) {
  const types: InfoboxField['type'][] = ['text', 'link', 'list']
  const idx = types.indexOf(field.type)
  field.type = types[(idx + 1) % types.length]
}

function fieldTypeLabel(type: InfoboxField['type']): string {
  const labels: Record<string, string> = { text: '文本', link: '链接', list: '列表' }
  return labels[type] || type
}

function onFieldChange() {
  // Trigger reactivity — localSnapshots is already reactive via ref
}

function addNewSnapshot() {
  const name = newYearName.value.trim()
  if (!name || localSnapshots.value.find(s => s.year === name)) return
  localSnapshots.value.push({ year: name, fields: [] })
  selectedYear.value = name
  newYearName.value = ''
}

function removeCurrentSnapshot() {
  if (localSnapshots.value.length <= 1) return
  localSnapshots.value = localSnapshots.value.filter(s => s.year !== selectedYear.value)
  selectedYear.value = localSnapshots.value[0]?.year || '全部'
}

function duplicateSnapshot() {
  const snap = localSnapshots.value.find(s => s.year === selectedYear.value)
  if (!snap) return
  const newYear = `${snap.year}（副本）`
  if (localSnapshots.value.find(s => s.year === newYear)) return
  localSnapshots.value.push({
    year: newYear,
    fields: snap.fields.map(f => ({ ...f })),
  })
  selectedYear.value = newYear
}
</script>
