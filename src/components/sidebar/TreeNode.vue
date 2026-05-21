<template>
  <div>
    <div
      class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm group transition-colors"
      :class="[
        activeId === node.id
          ? 'bg-brand-accent/10 text-brand-accent font-medium'
          : 'text-brand-text hover:bg-brand-bg',
      ]"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- Expand/collapse toggle -->
      <button
        v-if="node.children.length > 0"
        class="w-4 h-4 flex items-center justify-center text-brand-muted hover:text-brand-text shrink-0 transition-transform duration-200"
        :class="{ 'rotate-90': expanded }"
        @click.stop="expanded = !expanded"
      >
        <ChevronRight :size="12" />
      </button>
      <span v-else class="w-4 shrink-0" />

      <!-- Type icon -->
      <TypeIcon :type="node.type" :size="14" class="shrink-0 opacity-70" />

      <!-- Title -->
      <span class="truncate flex-1" :title="node.title">{{ node.title }}</span>

      <!-- Add child button -->
      <button
        class="w-4 h-4 flex items-center justify-center text-brand-muted opacity-0 group-hover:opacity-100 hover:text-brand-accent transition-all shrink-0"
        @click.stop="showInput = !showInput; if (showInput) nextTick(() => inputRef?.focus())"
        title="添加子词条"
      >
        <Plus :size="11" />
      </button>

      <!-- Word count on hover -->
      <span
        class="text-[10px] text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        {{ node.wordCount }}字
      </span>
    </div>

    <!-- Inline add input -->
    <div
      v-if="showInput"
      class="flex items-center gap-1 py-1"
      :style="{ paddingLeft: `${(depth + 1) * 12 + 28}px` }"
    >
      <input
        ref="inputRef"
        v-model="newTitle"
        type="text"
        placeholder="输入标题后回车..."
        class="flex-1 text-xs bg-brand-bg border border-brand-border/60 rounded px-2 py-1 outline-none focus:border-brand-accent transition-colors text-brand-text placeholder:text-brand-muted/40"
        @keydown.enter="handleCreate"
        @keydown.escape="showInput = false; newTitle = ''"
      />
    </div>

    <!-- Children -->
    <div v-if="node.children.length > 0 && expanded">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @createChild="$emit('createChild', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ChevronRight, Plus } from 'lucide-vue-next'
import type { DocNode } from '@/types'
import TypeIcon from '@/components/common/TypeIcon.vue'

const props = defineProps<{ node: DocNode; activeId: string; depth: number }>()
const emit = defineEmits<{ select: [id: string]; createChild: [{ parentId: string; title: string }] }>()

const expanded = ref(props.depth < 1)
const showInput = ref(false)
const newTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleClick() {
  if (props.node.children.length > 0 && !expanded.value) {
    expanded.value = true
  }
  emit('select', props.node.id)
}

function handleCreate() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('createChild', { parentId: props.node.id, title })
  newTitle.value = ''
  showInput.value = false
  if (!expanded.value) expanded.value = true
}
</script>
