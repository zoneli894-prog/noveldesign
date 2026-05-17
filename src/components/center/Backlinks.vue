<template>
  <div v-if="Object.keys(groupedBacklinks).length > 0">
    <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">
      关联考据 · {{ backlinks.length }}
    </h3>
    <div class="space-y-1">
      <div v-for="(links, groupType) in groupedBacklinks" :key="groupType">
        <!-- Group header -->
        <button
          class="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-[10px] font-medium
                 text-brand-muted hover:text-brand-text transition-colors"
          @click="toggleGroup(groupType)"
        >
          <svg
            class="w-2.5 h-2.5 transition-transform shrink-0"
            :class="{ 'rotate-90': !collapsedGroups.has(groupType) }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
          <span
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :style="{ backgroundColor: typeColors[groupType] || '#888' }"
          />
          {{ typeLabels[groupType] || groupType }}
          <span class="text-brand-muted/50 ml-auto">{{ links.length }}</span>
        </button>

        <!-- Group links -->
        <div v-if="!collapsedGroups.has(groupType)" class="ml-4 space-y-0.5 mt-0.5">
          <button
            v-for="link in links"
            :key="link.id"
            class="block w-full text-left px-2.5 py-1.5 rounded-md text-xs text-brand-accent/80
                   hover:bg-brand-accent/5 hover:text-brand-accent transition-all duration-150"
            @click="$emit('navigate', link.id)"
          >
            {{ link.title }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { typeLabels, typeColors } from '@/data/seed'
import type { DocNode } from '@/types'

const props = defineProps<{
  backlinks: { id: string; title: string; type: DocNode['type'] }[]
}>()

defineEmits<{ navigate: [id: string] }>()

const groupedBacklinks = computed(() => {
  const groups: Record<string, { id: string; title: string; type: DocNode['type'] }[]> = {}
  for (const link of props.backlinks) {
    const t = link.type
    if (!groups[t]) groups[t] = []
    groups[t].push(link)
  }
  return groups
})

// All groups expanded by default
const collapsedGroups = ref<Set<string>>(new Set())

function toggleGroup(type: string) {
  const next = new Set(collapsedGroups.value)
  if (next.has(type)) {
    next.delete(type)
  } else {
    next.add(type)
  }
  collapsedGroups.value = next
}
</script>
