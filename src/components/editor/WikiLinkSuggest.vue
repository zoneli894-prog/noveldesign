<template>
  <div
    v-if="items.length > 0"
    class="bg-white rounded-lg shadow-xl border border-brand-border overflow-hidden max-h-[200px] overflow-y-auto w-[250px]"
  >
    <button
      v-for="(item, i) in items"
      :key="item.id"
      class="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
      :class="i === selectedIndex
        ? 'bg-brand-accent/10 text-brand-accent'
        : 'text-brand-text hover:bg-brand-bg'"
      @click="selectItem(i)"
      @mouseenter="selectedIndex = i"
    >
      <span class="text-xs">{{ typeIcons[item.type] }}</span>
      <span class="flex-1 truncate">{{ item.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  items: { id: string; title: string; type: string }[]
  command: (item: { id: string; title: string }) => void
}>()

const selectedIndex = ref(0)

const typeIcons: Record<string, string> = {
  character: '\u{1F464}',
  faction: '\u{1F3DB}',
  location: '\u{1F4CD}',
  item: '\u{2B50}',
  lore: '\u{1F4D6}',
  chapter: '\u{1F4DD}',
}

watch(() => props.items, () => { selectedIndex.value = 0 })

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command({ id: item.id, title: item.title })
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    selectItem(selectedIndex.value)
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>
