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
      @contextmenu="handleContextMenu"
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

      <!-- Variant indicator -->
      <button
        v-if="node.variants && node.variants.length > 0"
        class="w-4 h-4 flex items-center justify-center text-brand-muted hover:text-brand-accent shrink-0 transition-transform duration-200"
        :class="{ 'rotate-90': variantsExpanded }"
        @click.stop="variantsExpanded = !variantsExpanded"
        title="展开变体"
      >
        <GitBranch :size="12" />
      </button>

      <!-- Title -->
      <span v-if="mode !== 'renaming'" class="truncate flex-1" :title="node.title">{{ node.title }}</span>
      <input
        v-else
        ref="renameInputRef"
        v-model="renameValue"
        type="text"
        class="flex-1 text-sm bg-brand-bg border border-brand-accent rounded px-1 py-0 outline-none text-brand-text min-w-0"
        @keydown.enter="handleRename"
        @keydown.escape="cancelRename"
        @blur="handleRename"
      />

      <!-- Word count on hover -->
      <span
        class="text-[10px] text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        {{ node.wordCount }}字
      </span>
    </div>

    <!-- Inline creation form (child) -->
    <div
      v-if="mode === 'creating'"
      class="flex flex-col gap-1 py-1 mx-1"
      :style="{ paddingLeft: `${(depth + 1) * 12 + 8}px` }"
    >
      <div class="flex items-center gap-1">
        <select
          v-model="newType"
          class="text-[10px] px-1.5 py-0.5 border border-brand-border/60 rounded bg-brand-bg text-brand-muted outline-none focus:border-brand-accent"
        >
          <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <input
          ref="createInputRef"
          v-model="newTitle"
          type="text"
          placeholder="输入标题..."
          class="flex-1 text-xs bg-brand-bg border border-brand-accent/60 rounded px-2 py-0.5 outline-none focus:border-brand-accent transition-colors text-brand-text placeholder:text-brand-muted/40"
          @keydown.enter="handleCreateChild"
          @keydown.escape="cancelCreate"
        />
      </div>
      <span class="text-[9px] text-brand-muted/50">Enter 确认 · Esc 取消</span>
    </div>

    <!-- Inline creation form (sibling) -->
    <div
      v-if="mode === 'creating-sibling'"
      class="flex flex-col gap-1 py-1 mx-1"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
    >
      <div class="flex items-center gap-1">
        <select
          v-model="newType"
          class="text-[10px] px-1.5 py-0.5 border border-brand-border/60 rounded bg-brand-bg text-brand-muted outline-none focus:border-brand-accent"
        >
          <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <input
          ref="createInputRef"
          v-model="newTitle"
          type="text"
          placeholder="输入标题..."
          class="flex-1 text-xs bg-brand-bg border border-brand-accent/60 rounded px-2 py-0.5 outline-none focus:border-brand-accent transition-colors text-brand-text placeholder:text-brand-muted/40"
          @keydown.enter="handleCreateSibling"
          @keydown.escape="cancelCreate"
        />
      </div>
      <span class="text-[9px] text-brand-muted/50">Enter 确认 · Esc 取消</span>
    </div>

    <!-- Children -->
    <div v-if="node.children.length > 0 && expanded">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :active-id="activeId"
        :depth="depth + 1"
        :active-variant-id="activeVariantId"
        @select="$emit('select', $event)"
        @createChild="$emit('createChild', $event)"
        @createSibling="$emit('createSibling', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
        @selectVariant="$emit('selectVariant', $event)"
        @createVariant="$emit('createVariant', $event)"
      />
    </div>

    <!-- Variants -->
    <div v-if="node.variants && node.variants.length > 0 && variantsExpanded">
      <div
        v-for="variant in node.variants"
        :key="variant.id"
        class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs group transition-colors"
        :class="[
          activeVariantId === variant.id
            ? 'bg-brand-accent/10 text-brand-accent font-medium'
            : 'text-brand-muted hover:bg-brand-bg',
        ]"
        :style="{ paddingLeft: `${(depth + 1) * 12 + 28}px` }"
        @click.stop="handleVariantClick(variant.id)"
      >
        <span class="w-3 shrink-0 border-l-2 border-brand-border/40 ml-1" />
        <span class="truncate flex-1" :title="variant.title">{{ variant.title }}</span>
        <span class="text-[10px] text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity">
          {{ variant.wordCount }}字
        </span>
      </div>

      <!-- Add variant button -->
      <div
        class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs text-brand-muted/60 hover:text-brand-accent transition-colors"
        :style="{ paddingLeft: `${(depth + 1) * 12 + 28}px` }"
        @click.stop="$emit('createVariant', node.id)"
      >
        <Plus :size="11" />
        <span>新建变体</span>
      </div>
    </div>

    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @close="contextMenuVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ChevronRight, Plus, GitBranch, FilePlus, Pencil, Trash2 } from 'lucide-vue-next'
import type { DocNode } from '@/types'
import TypeIcon from '@/components/common/TypeIcon.vue'
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu.vue'
import { typeLabels } from '@/data/seed'

const props = defineProps<{ node: DocNode; activeId: string; depth: number; activeVariantId?: string }>()
const emit = defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string; type: DocNode['type'] }]
  createSibling: [{ parentId: string | null; title: string; type: DocNode['type']; afterId: string }]
  rename: [{ id: string; newTitle: string }]
  delete: [id: string]
  selectVariant: [{ docId: string; variantId: string }]
  createVariant: [docId: string]
}>()

const expanded = ref(props.depth < 1)
const variantsExpanded = ref(false)

type TreeNodeMode = 'idle' | 'creating' | 'creating-sibling' | 'renaming'

const mode = ref<TreeNodeMode>('idle')
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const createInputRef = ref<HTMLInputElement | null>(null)
const renameInputRef = ref<HTMLInputElement | null>(null)
const newTitle = ref('')
const newType = ref<DocNode['type']>(props.node.type === 'chronicle' ? 'lore' : props.node.type)
const renameValue = ref('')

const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({
  value: value as DocNode['type'],
  label,
}))

const contextMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []

  if (props.node.type !== 'chronicle') {
    items.push({
      label: '新建子词条',
      icon: FilePlus,
      action: () => { mode.value = 'creating' },
    })
  }

  if (props.node.parentId !== null) {
    items.push({
      label: '新建同级词条',
      icon: FilePlus,
      action: () => { mode.value = 'creating-sibling' },
    })
  }

  items.push(
    { label: '重命名', icon: Pencil, divided: true, action: () => { mode.value = 'renaming' } },
    { label: '删除', icon: Trash2, danger: true, action: () => emit('delete', props.node.id) },
  )

  return items
})

function handleClick() {
  if (props.node.children.length > 0 && !expanded.value) {
    expanded.value = true
  }
  emit('select', props.node.id)
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  contextMenuVisible.value = true
}

function handleCreateChild() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('createChild', { parentId: props.node.id, title, type: newType.value })
  newTitle.value = ''
  mode.value = 'idle'
  if (!expanded.value) expanded.value = true
}

function handleCreateSibling() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('createSibling', {
    parentId: props.node.parentId,
    title,
    type: newType.value,
    afterId: props.node.id,
  })
  newTitle.value = ''
  mode.value = 'idle'
}

function cancelCreate() {
  newTitle.value = ''
  mode.value = 'idle'
}

function handleRename() {
  const title = renameValue.value.trim()
  if (title && title !== props.node.title) {
    emit('rename', { id: props.node.id, newTitle: title })
  }
  mode.value = 'idle'
}

function cancelRename() {
  mode.value = 'idle'
}

function handleVariantClick(variantId: string) {
  emit('selectVariant', { docId: props.node.id, variantId })
}

watch(mode, async (m) => {
  if (m === 'creating' || m === 'creating-sibling') {
    newTitle.value = ''
    newType.value = props.node.type === 'chronicle' ? 'lore' : props.node.type
    await nextTick()
    createInputRef.value?.focus()
  } else if (m === 'renaming') {
    renameValue.value = props.node.title
    await nextTick()
    renameInputRef.value?.select()
  }
})
</script>
