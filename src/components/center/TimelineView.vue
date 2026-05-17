<template>
  <div class="timeline-container relative py-6">
    <!-- Central line -->
    <div class="absolute left-[18px] top-0 bottom-0 w-px bg-brand-border" />

    <div
      v-for="event in events"
      :key="event.id"
      class="relative pl-10 pb-8 last:pb-0"
    >
      <!-- Dot on the line -->
      <div
        class="absolute left-[14px] top-1 w-[9px] h-[9px] rounded-full border-2 bg-white"
        :style="{ borderColor: categoryColors[event.category] }"
      />

      <!-- Event card -->
      <div class="bg-white/80 rounded-lg border border-brand-border/50 p-3 hover:shadow-sm transition-shadow">
        <!-- Category + date -->
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded"
            :style="{ color: categoryColors[event.category], backgroundColor: categoryColors[event.category] + '15' }"
          >
            {{ categoryLabels[event.category] }}
          </span>
          <span class="text-[10px] text-brand-muted">{{ event.date }}</span>
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
  </div>
</template>

<script setup lang="ts">
import type { TimelineEvent } from '@/types'
import { useNovelDataStore } from '@/stores/novelData'

defineProps<{ events: TimelineEvent[] }>()
defineEmits<{ navigate: [id: string] }>()

const novelStore = useNovelDataStore()

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
</script>
