<template>
  <Teleport to="body">
    <div
      v-if="uiStore.commandPaletteOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      @click.self="uiStore.closeCommandPalette()"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" @click="uiStore.closeCommandPalette()" />

      <!-- Palette -->
      <div class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-border overflow-hidden">
        <!-- Input -->
        <div class="p-3 border-b border-brand-border">
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="搜索词条..."
            class="w-full text-sm bg-transparent outline-none placeholder:text-brand-muted"
            @keydown.down.prevent="moveSelection(1)"
            @keydown.up.prevent="moveSelection(-1)"
            @keydown.enter.prevent="selectCurrent"
            @keydown.escape="uiStore.closeCommandPalette()"
          />
        </div>

        <!-- Results -->
        <div class="max-h-[300px] overflow-y-auto p-1">
          <button
            v-for="(result, i) in results"
            :key="result.id"
            class="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            :class="i === selectedIndex
              ? 'bg-brand-accent/10 text-brand-accent'
              : 'text-brand-text hover:bg-brand-bg'"
            @click="navigateTo(result.id)"
            @mouseenter="selectedIndex = i"
          >
            <span class="text-xs">{{ typeIcons[result.type] }}</span>
            <span class="flex-1 truncate">{{ result.title }}</span>
            <span class="text-[10px] text-brand-muted">{{ typeLabels[result.type] }}</span>
          </button>
          <div v-if="query && results.length === 0" class="text-center text-brand-muted text-xs py-6">
            未找到匹配的词条
          </div>
          <div v-if="!query" class="text-center text-brand-muted text-xs py-6">
            输入关键词搜索词条
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import { typeLabels } from '@/data/seed'

const router = useRouter()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()

const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const typeIcons: Record<string, string> = {
  character: '\u{1F464}',
  faction: '\u{1F3DB}',
  location: '\u{1F4CD}',
  item: '\u{2B50}',
  lore: '\u{1F4D6}',
  chapter: '\u{1F4DD}',
}

const results = computed(() => {
  if (!query.value.trim()) {
    return novelStore.recentDocs.slice(0, 8)
  }
  return novelStore.searchDocs(query.value).slice(0, 10)
})

watch(() => uiStore.commandPaletteOpen, async (open) => {
  if (open) {
    query.value = ''
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(query, () => {
  selectedIndex.value = 0
})

function moveSelection(delta: number) {
  selectedIndex.value = Math.max(0, Math.min(results.value.length - 1, selectedIndex.value + delta))
}

function selectCurrent() {
  if (results.value[selectedIndex.value]) {
    navigateTo(results.value[selectedIndex.value].id)
  }
}

function navigateTo(id: string) {
  novelStore.setActiveDoc(id)
  router.push(`/project/default/doc/${id}`)
  uiStore.closeCommandPalette()
}

// Global Ctrl+K listener
function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    uiStore.commandPaletteOpen ? uiStore.closeCommandPalette() : uiStore.openCommandPalette()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>
