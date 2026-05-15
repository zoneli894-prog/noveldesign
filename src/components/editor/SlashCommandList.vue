<template>
  <div
    v-if="items.length > 0"
    class="bg-white rounded-lg shadow-xl border border-brand-border overflow-hidden max-h-[250px] overflow-y-auto w-[220px]"
  >
    <div class="p-2 text-[10px] text-brand-muted uppercase tracking-wider">命令</div>
    <button
      v-for="(item, i) in items"
      :key="item.title"
      class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
      :class="i === selectedIndex
        ? 'bg-brand-accent/10 text-brand-accent'
        : 'text-brand-text hover:bg-brand-bg'"
      @click="selectItem(i)"
      @mouseenter="selectedIndex = i"
    >
      <span class="w-5 h-5 flex items-center justify-center rounded bg-brand-bg text-xs">{{ item.icon }}</span>
      <span>{{ item.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface SlashCommandItem {
  title: string
  icon: string
  command: (props: { editor: any; range: any }) => void
}

const props = defineProps<{
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => { selectedIndex.value = 0 })

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    props.command(item)
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
