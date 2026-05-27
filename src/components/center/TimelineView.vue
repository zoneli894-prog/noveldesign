<template>
  <div class="timeline-container relative py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-serif font-semibold text-brand-text">编年大事记</h2>
      <button
        class="flex items-center gap-1.5 text-brand-accent hover:text-brand-accent/80 text-sm transition-colors"
        @click="openCreateDialog"
      >
        <Plus :size="14" />
        新建事件
      </button>
    </div>

    <!-- Central line -->
    <div class="absolute left-[18px] top-16 bottom-0 w-px bg-brand-border" />

    <div
      v-for="event in events"
      :key="event.id"
      class="relative pl-10 pb-8 last:pb-0 group"
    >
      <!-- Dot on the line -->
      <div
        class="absolute left-[14px] top-1 w-[9px] h-[9px] rounded-full border-2 bg-white"
        :style="{ borderColor: categoryColors[event.category] }"
      />

      <!-- Event card -->
      <div class="bg-white/80 rounded-lg border border-brand-border/50 p-3 hover:shadow-sm transition-shadow">
        <!-- Category + date + actions -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] font-medium px-1.5 py-0.5 rounded"
              :style="{ color: categoryColors[event.category], backgroundColor: categoryColors[event.category] + '15' }"
            >
              {{ categoryLabels[event.category] }}
            </span>
            <span class="text-[10px] text-brand-muted">{{ event.date }}</span>
          </div>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-brand-muted/40 opacity-0 group-hover:opacity-100 hover:text-brand-text hover:bg-brand-bg transition-all"
            @click="openEditDialog(event)"
          >
            <Pencil :size="12" />
          </button>
        </div>

        <!-- Title -->
        <h4 class="font-serif font-semibold text-sm text-brand-text">{{ event.title }}</h4>

        <!-- Description -->
        <p class="text-xs text-brand-text/70 mt-1 leading-relaxed">{{ event.description }}</p>

        <!-- Related docs -->
        <div v-if="event.relatedDocs.length > 0" class="flex flex-wrap gap-1.5 mt-2.5">
          <button
            v-for="doc in event.relatedDocs"
            :key="doc.id"
            class="text-[10px] px-2 py-0.5 rounded-full border transition-colors"
            :class="doc.id === novelStore.activeDocId
              ? 'bg-brand-accent text-white border-brand-accent'
              : 'border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'"
            @click="$emit('navigate', doc.id)"
          >
            {{ doc.title }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="events.length === 0" class="flex flex-col items-center justify-center py-12 text-brand-muted/40 gap-3">
      <Calendar :size="32" />
      <span class="text-sm">还没有事件，点击上方按钮创建第一个</span>
    </div>

    <!-- Edit dialog -->
    <EditTimelineEventDialog
      :visible="showEditDialog"
      :event="editingEvent"
      @cancel="closeEditDialog"
      @confirm="handleConfirm"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Pencil, Calendar } from 'lucide-vue-next'
import type { TimelineEvent } from '@/types'
import { useNovelDataStore } from '@/stores/novelData'
import EditTimelineEventDialog from '@/components/common/EditTimelineEventDialog.vue'

defineProps<{ events: TimelineEvent[] }>()
defineEmits<{ navigate: [id: string] }>()

const novelStore = useNovelDataStore()

const showEditDialog = ref(false)
const editingEvent = ref<TimelineEvent | null>(null)

const categoryColors: Record<string, string> = {
  war: '#E07A5F',
  discovery: '#81B29A',
  political: '#3D405B',
  personal: '#F2CC8F',
  catastrophe: '#9B2335',
}

const categoryLabels: Record<string, string> = {
  war: '战争',
  discovery: '发现',
  political: '政治',
  personal: '个人',
  catastrophe: '灾变',
}

function openCreateDialog() {
  editingEvent.value = null
  showEditDialog.value = true
}

function openEditDialog(event: TimelineEvent) {
  editingEvent.value = event
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editingEvent.value = null
}

function handleConfirm(eventData: Omit<TimelineEvent, 'id'>) {
  if (editingEvent.value) {
    novelStore.updateTimelineEvent(editingEvent.value.id, eventData)
  } else {
    novelStore.addTimelineEvent(eventData)
  }
  closeEditDialog()
}

function handleDelete(id: string) {
  novelStore.deleteTimelineEvent(id)
  closeEditDialog()
}
</script>
