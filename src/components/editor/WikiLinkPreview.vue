<template>
  <Teleport to="body">
    <div
      v-if="visible && targetDoc"
      class="fixed z-50 bg-white rounded-lg shadow-xl border border-brand-border p-3 w-[280px]"
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
    >
      <div class="flex items-center gap-2 mb-2">
        <span
          class="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
          :style="{ backgroundColor: typeColors[targetDoc.type] || '#888' }"
        >
          {{ typeLabels[targetDoc.type] }}
        </span>
        <span class="font-serif font-semibold text-sm truncate">{{ targetDoc.title }}</span>
      </div>
      <div class="text-xs text-brand-muted leading-relaxed line-clamp-4" v-html="excerpt" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNovelDataStore } from '@/stores/novelData'
import { typeLabels, typeColors } from '@/data/seed'

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const targetId = ref('')

const novelStore = useNovelDataStore()

const targetDoc = computed(() => {
  if (!targetId.value) return null
  return novelStore.flatDocs.find(d => d.id === targetId.value) || null
})

const excerpt = computed(() => {
  if (!targetId.value) return ''
  const html = novelStore.docContent[targetId.value] || ''
  const text = html.replace(/<[^>]+>/g, '').trim()
  return text.slice(0, 150) + (text.length > 150 ? '...' : '')
})

function show(id: string, rect: DOMRect) {
  targetId.value = id
  position.value = {
    x: rect.left,
    y: rect.bottom + 8,
  }
  visible.value = true
}

function hide() {
  visible.value = false
}

defineExpose({ show, hide })
</script>
