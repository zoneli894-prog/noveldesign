<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div
        v-if="visible"
        class="fixed inset-0 z-[60]"
        @mousedown="emit('close')"
        @contextmenu.prevent="emit('close')"
      >
        <!-- Menu positioned at x/y -->
        <Transition name="palette" appear>
          <div
            ref="menuRef"
            class="fixed z-[61] min-w-[160px] py-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60"
            :style="menuStyle"
            @mousedown.stop
          >
            <template v-for="(item, i) in items" :key="i">
              <!-- Divider -->
              <div
                v-if="item.divided"
                class="my-1 mx-2 border-t border-brand-border/40"
              />
              <!-- Menu item -->
              <button
                class="w-full text-left px-2.5 py-1.5 text-sm flex items-center gap-2.5 transition-colors duration-150 rounded-md mx-0.5"
                :class="item.danger
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-brand-text hover:bg-brand-accent/8'"
                @click="handleClick(item)"
                @mouseenter="hoveredIndex = i"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  :size="14"
                  class="shrink-0 opacity-60"
                />
                <span class="truncate">{{ item.label }}</span>
              </button>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'

export interface MenuItem {
  label: string
  icon?: Component
  danger?: boolean
  divided?: boolean
  action: () => void
}

interface ContextMenuProps {
  visible: boolean
  x: number
  y: number
  items: MenuItem[]
}

const props = defineProps<ContextMenuProps>()
const emit = defineEmits<{
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)
const hoveredIndex = ref(-1)

// Compute adjusted position to keep menu within viewport
const menuStyle = computed(() => {
  const estimatedWidth = 180
  const estimatedHeight = props.items.length * 32 + 16
  const padding = 8

  let left = props.x
  let top = props.y

  // Shift left if overflowing right edge
  if (left + estimatedWidth > window.innerWidth - padding) {
    left = Math.max(padding, window.innerWidth - estimatedWidth - padding)
  }

  // Shift up if overflowing bottom edge
  if (top + estimatedHeight > window.innerHeight - padding) {
    top = Math.max(padding, window.innerHeight - estimatedHeight - padding)
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

function handleClick(item: MenuItem) {
  item.action()
  emit('close')
}

// Close on Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Reset hovered state when menu opens
watch(() => props.visible, (v) => {
  if (v) {
    hoveredIndex.value = -1
  }
})
</script>
