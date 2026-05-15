import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ViewMode } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const leftSidebarOpen = ref(true)
  const rightSidebarOpen = ref(true)
  const splitViewOpen = ref(false)
  const splitViewDocId = ref<string | null>(null)
  const nightMode = ref(false)
  const viewMode = ref<ViewMode>('tree')
  const commandPaletteOpen = ref(false)

  function toggleLeft() { leftSidebarOpen.value = !leftSidebarOpen.value }
  function toggleRight() { rightSidebarOpen.value = !rightSidebarOpen.value }
  function toggleSplit(docId?: string) {
    splitViewOpen.value = !splitViewOpen.value
    if (docId) splitViewDocId.value = docId
    if (!splitViewOpen.value) splitViewDocId.value = null
  }
  function toggleNight() {
    nightMode.value = !nightMode.value
    document.documentElement.classList.toggle('dark', nightMode.value)
  }
  function setViewMode(mode: ViewMode) { viewMode.value = mode }
  function openCommandPalette() { commandPaletteOpen.value = true }
  function closeCommandPalette() { commandPaletteOpen.value = false }

  return {
    leftSidebarOpen, rightSidebarOpen, splitViewOpen, splitViewDocId,
    nightMode, viewMode, commandPaletteOpen,
    toggleLeft, toggleRight, toggleSplit, toggleNight,
    setViewMode, openCommandPalette, closeCommandPalette,
  }
})
