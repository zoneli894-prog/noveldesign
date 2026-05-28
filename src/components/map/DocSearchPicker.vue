<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <button
      class="w-full px-2.5 py-1.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-left flex items-center justify-between gap-2 hover:border-brand-accent/50 transition-colors"
      :class="showDropdown ? 'border-brand-accent' : ''"
      @click="showDropdown = !showDropdown"
    >
      <span v-if="selectedDoc" class="text-brand-text truncate">{{ selectedDoc.title }}</span>
      <span v-else class="text-brand-muted/60">{{ placeholder }}</span>
      <ChevronDown :size="12" class="text-brand-muted shrink-0" :class="showDropdown ? 'rotate-180' : ''" />
    </button>

    <!-- Dropdown -->
    <Transition name="palette">
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 right-0 mt-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 z-50 overflow-hidden"
      >
        <div class="p-1.5 border-b border-brand-border/30">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索词条..."
            class="w-full px-2.5 py-1.5 text-sm bg-brand-bg border border-brand-border/40 rounded-md text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
            @keydown.escape="showDropdown = false"
          />
        </div>
        <div class="max-h-[200px] overflow-y-auto">
          <button
            v-if="clearable"
            class="w-full px-3 py-1.5 text-left text-xs text-brand-muted hover:bg-brand-bg transition-colors"
            @click="handleClear"
          >
            无
          </button>
          <button
            v-for="doc in filteredDocs"
            :key="doc.id"
            class="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-brand-bg transition-colors"
            :class="modelValue === doc.id ? 'bg-brand-accent-light text-brand-accent' : 'text-brand-text'"
            @click="handleSelect(doc.id)"
          >
            <TypeIcon :type="doc.type" :size="12" />
            <span class="truncate">{{ doc.title }}</span>
          </button>
          <div v-if="filteredDocs.length === 0 && searchQuery" class="px-3 py-3 text-xs text-brand-muted text-center">
            未找到匹配的词条
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import Fuse from 'fuse.js'
import { useNovelDataStore } from '@/stores/novelData'
import TypeIcon from '@/components/common/TypeIcon.vue'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  clearable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const novelStore = useNovelDataStore()
const containerRef = ref<HTMLDivElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const showDropdown = ref(false)
const searchQuery = ref('')

const flatDocs = computed(() => novelStore.flatDocs)

const fuse = computed(() =>
  new Fuse(flatDocs.value, {
    keys: ['title', 'tags'],
    threshold: 0.3,
  })
)

const filteredDocs = computed(() => {
  if (!searchQuery.value) return flatDocs.value
  return fuse.value.search(searchQuery.value).map(r => r.item)
})

const selectedDoc = computed(() =>
  flatDocs.value.find(d => d.id === props.modelValue) || null
)

function handleSelect(id: string) {
  emit('update:modelValue', id)
  showDropdown.value = false
  searchQuery.value = ''
}

function handleClear() {
  emit('update:modelValue', '')
  showDropdown.value = false
  searchQuery.value = ''
}

watch(showDropdown, (v) => {
  if (v) {
    searchQuery.value = ''
    nextTick(() => searchInput.value?.focus())
  }
})

function handleDocSearchOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocSearchOutside)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocSearchOutside)
})
</script>
