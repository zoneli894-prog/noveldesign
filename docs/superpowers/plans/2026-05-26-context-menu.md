# 目录树右键菜单与内联编辑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add VSCode-style right-click context menu to tree nodes with inline creation, rename, and delete functionality.

**Architecture:** Single new ContextMenu.vue component for the floating menu. TreeNode.vue gains three new states (creating, creating-sibling, renaming) with inline forms. LeftSidebar.vue handles event routing and delete confirmation. Store gets renameDoc method and addDoc afterId parameter.

**Tech Stack:** Vue 3 Composition API, TypeScript, Tailwind CSS, lucide-vue-next icons

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/common/ContextMenu.vue` | Create | Generic right-click menu component |
| `src/components/sidebar/TreeNode.vue` | Modify | Right-click trigger, inline create/rename forms |
| `src/components/sidebar/TreeView.vue` | Modify | Event passthrough for new events |
| `src/components/layout/LeftSidebar.vue` | Modify | Event handlers, delete confirmation |
| `src/stores/novelData.ts` | Modify | renameDoc method, addDoc afterId param |

---

### Task 1: Create ContextMenu.vue Component

**Files:**
- Create: `src/components/common/ContextMenu.vue`

- [ ] **Step 1: Create the ContextMenu component**

```vue
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100]"
      @click="$emit('close')"
      @contextmenu.prevent="$emit('close')"
    />
    <Transition name="context-menu">
      <div
        v-if="visible"
        class="fixed z-[101] min-w-[180px] py-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60"
        :style="menuStyle"
      >
        <template v-for="(item, i) in items" :key="i">
          <div v-if="item.divided" class="my-1 border-t border-brand-border/40" />
          <button
            class="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors text-left"
            :class="item.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-brand-text hover:bg-brand-bg'"
            @click.stop="handleClick(item)"
          >
            <component v-if="item.icon" :is="item.icon" :size="14" class="shrink-0 opacity-60" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

export interface MenuItem {
  label: string
  icon?: Component
  danger?: boolean
  divided?: boolean
  action: () => void
}

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  items: MenuItem[]
}>()

const emit = defineEmits<{ close: [] }>()

const menuStyle = computed(() => {
  let left = props.x
  let top = props.y
  // Adjust if overflowing right edge
  if (left + 200 > window.innerWidth) {
    left = window.innerWidth - 200
  }
  // Adjust if overflowing bottom edge
  if (top + props.items.length * 32 > window.innerHeight) {
    top = window.innerHeight - props.items.length * 32 - 10
  }
  return { left: `${left}px`, top: `${top}px` }
})

function handleClick(item: MenuItem) {
  item.action()
  emit('close')
}
</script>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
```

- [ ] **Step 2: Verify component renders**

Run: `npm run dev`
Open browser, temporarily add ContextMenu to any page with `visible: true` to confirm it renders correctly.
Expected: Menu appears at specified coordinates with correct styling.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/ContextMenu.vue
git commit -m "feat: add ContextMenu component for right-click menus"
```

---

### Task 2: Store Changes — renameDoc and addDoc afterId

**Files:**
- Modify: `src/stores/novelData.ts`

- [ ] **Step 1: Add renameDoc method**

Add after the `deleteDoc` function (around line 253):

```ts
function renameDoc(id: string, newTitle: string) {
  const node = findNode(docTree.value, id)
  if (node) {
    node.title = newTitle
    node.updatedAt = Date.now()
  }
}
```

- [ ] **Step 2: Add afterId parameter to addDoc**

Modify the `addDoc` function signature and implementation:

```ts
function addDoc(params: { title: string; type: DocNode['type']; parentId: string | null; afterId?: string }): DocNode {
  const id = generateId(params.type)
  const newNode: DocNode = {
    id,
    title: params.title,
    type: params.type,
    children: [],
    variants: [],
    tags: [],
    wordCount: 0,
    starred: false,
    updatedAt: Date.now(),
    parentId: params.parentId,
  }

  const parent = params.parentId ? findNode(docTree.value, params.parentId) : null
  const target = parent?.children ?? docTree.value

  if (params.afterId) {
    const idx = target.findIndex(n => n.id === params.afterId)
    if (idx >= 0) {
      target.splice(idx + 1, 0, newNode)
    } else {
      target.push(newNode)
    }
  } else {
    target.push(newNode)
  }

  docContent.value[id] = ''
  infoboxData.value[id] = []

  return newNode
}
```

- [ ] **Step 3: Export renameDoc**

Add `renameDoc` to the return object of the store.

- [ ] **Step 4: Verify existing functionality still works**

Run: `npm run dev`
Create a new doc using the existing "新建" button. Confirm it still works.
Expected: No regression in existing creation flow.

- [ ] **Step 5: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: add renameDoc method and addDoc afterId parameter"
```

---

### Task 3: TreeNode — Right-Click Menu Trigger

**Files:**
- Modify: `src/components/sidebar/TreeNode.vue`

- [ ] **Step 1: Add imports and state**

Add to script section:

```ts
import { FilePlus, Pencil, Trash2 } from 'lucide-vue-next'
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu.vue'

type TreeNodeMode = 'idle' | 'creating' | 'creating-sibling' | 'renaming'

const mode = ref<TreeNodeMode>('idle')
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
```

- [ ] **Step 2: Add contextmenu handler**

Add to the node row div: `@contextmenu.prevent="handleContextMenu"`

```ts
function handleContextMenu(e: MouseEvent) {
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  contextMenuVisible.value = true
}
```

- [ ] **Step 3: Add ContextMenu to template**

Add at the end of the template (before closing `</div>`):

```vue
<ContextMenu
  :visible="contextMenuVisible"
  :x="contextMenuX"
  :y="contextMenuY"
  :items="contextMenuItems"
  @close="contextMenuVisible = false"
/>
```

- [ ] **Step 4: Define contextMenuItems computed**

```ts
const contextMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []

  // Can't add children to chronicle type or variant nodes
  if (props.node.type !== 'chronicle') {
    items.push({
      label: '新建子词条',
      icon: FilePlus,
      action: () => { mode.value = 'creating' },
    })
  }

  // Can't add siblings to root nodes (parentId is null)
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
```

- [ ] **Step 5: Verify right-click menu appears**

Run: `npm run dev`
Right-click on a tree node.
Expected: Context menu appears at mouse position with 4 items (for non-root, non-chronicle nodes).

- [ ] **Step 6: Commit**

```bash
git add src/components/sidebar/TreeNode.vue
git commit -m "feat: add right-click context menu trigger to TreeNode"
```

---

### Task 4: TreeNode — Inline Creation Form

**Files:**
- Modify: `src/components/sidebar/TreeNode.vue`

- [ ] **Step 1: Add inline creation form template**

Replace the existing inline add input section (lines 58-73) with:

```vue
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
      <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
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
      <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
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
```

- [ ] **Step 2: Add creation state and handlers**

```ts
import { typeLabels, typeColors } from '@/data/seed'

const createInputRef = ref<HTMLInputElement | null>(null)
const newTitle = ref('')
const newType = ref<DocNode['type']>(props.node.type === 'chronicle' ? 'lore' : props.node.type)

const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({
  value: value as DocNode['type'],
  label,
  icon: typeColors[value as DocNode['type']] ? '📄' : '📄',
}))

watch(mode, async (m) => {
  if (m === 'creating' || m === 'creating-sibling') {
    newTitle.value = ''
    newType.value = props.node.type === 'chronicle' ? 'lore' : props.node.type
    await nextTick()
    createInputRef.value?.focus()
  }
})

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
```

- [ ] **Step 3: Update emit definitions**

```ts
const emit = defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string; type: DocNode['type'] }]
  createSibling: [{ parentId: string | null; title: string; type: DocNode['type']; afterId: string }]
  rename: [{ id: string; newTitle: string }]
  delete: [id: string]
  selectVariant: [{ docId: string; variantId: string }]
  createVariant: [docId: string]
}>()
```

- [ ] **Step 4: Remove old inline add input**

Delete the old `showInput` / `newTitle` / `inputRef` code and the old inline input template block (the one that was there before).

- [ ] **Step 5: Verify inline creation works**

Run: `npm run dev`
Right-click a node → "新建子词条" → type selection and title input appear.
Type a title → Enter → new doc created and navigated to.
Expected: New doc appears in tree, editor opens for it.

- [ ] **Step 6: Commit**

```bash
git add src/components/sidebar/TreeNode.vue
git commit -m "feat: add inline creation form to TreeNode"
```

---

### Task 5: TreeNode — Inline Rename

**Files:**
- Modify: `src/components/sidebar/TreeNode.vue`

- [ ] **Step 1: Add rename template**

Replace the title span (line 39) with:

```vue
<!-- Title (normal) -->
<span v-if="mode !== 'renaming'" class="truncate flex-1" :title="node.title">{{ node.title }}</span>

<!-- Title (renaming) -->
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
```

- [ ] **Step 2: Add rename state and handlers**

```ts
const renameInputRef = ref<HTMLInputElement | null>(null)
const renameValue = ref('')

watch(mode, async (m) => {
  if (m === 'renaming') {
    renameValue.value = props.node.title
    await nextTick()
    renameInputRef.value?.select()
  }
  // ... existing creating watch
})

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
```

- [ ] **Step 3: Verify rename works**

Run: `npm run dev`
Right-click a node → "重命名" → title becomes input with text selected.
Type new name → Enter → title updates.
Expected: Title changes in tree and editor header.

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar/TreeNode.vue
git commit -m "feat: add inline rename to TreeNode"
```

---

### Task 6: TreeView Event Passthrough

**Files:**
- Modify: `src/components/sidebar/TreeView.vue`

- [ ] **Step 1: Add new event passthrough**

Add to TreeView's emit and template:

```ts
// In TreeView.vue <script setup>
const emit = defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string; type: DocNode['type'] }]
  createSibling: [{ parentId: string | null; title: string; type: DocNode['type']; afterId: string }]
  rename: [{ id: string; newTitle: string }]
  delete: [id: string]
  selectVariant: [{ docId: string; variantId: string }]
  createVariant: [docId: string]
}>()
```

In the template, add event forwarding on TreeNode:

```vue
<TreeNode
  v-for="node in nodes"
  :key="node.id"
  :node="node"
  :active-id="activeId"
  :depth="0"
  :active-variant-id="activeVariantId"
  @select="$emit('select', $event)"
  @createChild="$emit('createChild', $event)"
  @createSibling="$emit('createSibling', $event)"
  @rename="$emit('rename', $event)"
  @delete="$emit('delete', $event)"
  @selectVariant="$emit('selectVariant', $event)"
  @createVariant="$emit('createVariant', $event)"
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sidebar/TreeView.vue
git commit -m "feat: passthrough createSibling, rename, delete events in TreeView"
```

---

### Task 7: LeftSidebar Event Handlers and Delete Confirmation

**Files:**
- Modify: `src/components/layout/LeftSidebar.vue`

- [ ] **Step 1: Add imports and state**

```ts
import { ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const deleteTargetId = ref<string | null>(null)
```

- [ ] **Step 2: Add handler functions**

```ts
function handleCreateSibling({ parentId, title, type, afterId }: { parentId: string | null; title: string; type: DocNode['type']; afterId: string }) {
  const newNode = novelStore.addDoc({ title, type, parentId, afterId })
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id))
}

function handleRename({ id, newTitle }: { id: string; newTitle: string }) {
  novelStore.renameDoc(id, newTitle)
}

function handleDeleteRequest(id: string) {
  deleteTargetId.value = id
}

function confirmDelete() {
  if (!deleteTargetId.value) return
  const deletedId = deleteTargetId.value
  const parent = novelStore.getParentOf(deletedId)
  novelStore.deleteDoc(deletedId)
  deleteTargetId.value = null

  if (parent) {
    navigateTo(parent.id)
  } else {
    const remaining = novelStore.flatDocs
    if (remaining.length > 0) {
      navigateTo(remaining[0].id)
    }
  }
}
```

- [ ] **Step 3: Update TreeView event bindings**

```vue
<TreeView
  v-if="uiStore.viewMode === 'tree'"
  :nodes="novelStore.docTree"
  :active-id="novelStore.activeDocId"
  :active-variant-id="novelStore.activeVariantId ?? undefined"
  @select="navigateTo"
  @createChild="handleQuickCreate"
  @createSibling="handleCreateSibling"
  @rename="handleRename"
  @delete="handleDeleteRequest"
  @selectVariant="handleSelectVariant"
/>
```

- [ ] **Step 4: Add ConfirmDialog to template**

Add before the closing `</aside>`:

```vue
<ConfirmDialog
  v-model:visible="deleteTargetId"
  title="删除词条"
  message="此操作将永久删除该词条及其所有内容、属性数据。子词条也将被一并删除。"
  confirm-text="确认删除"
  @confirm="confirmDelete"
  @cancel="deleteTargetId = null"
/>
```

Note: This uses `v-model:visible` with the string ID — when `deleteTargetId` is non-null, dialog shows. When cancelled, it's set to null.

- [ ] **Step 5: Verify full flow**

Run: `npm run dev`
1. Right-click → "新建子词条" → create a doc → verify it appears
2. Right-click → "新建同级词条" → create a doc → verify it appears after the target
3. Right-click → "重命名" → rename → verify title updates
4. Right-click → "删除" → confirm dialog appears → confirm → doc removed
Expected: All 4 operations work correctly.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/LeftSidebar.vue
git commit -m "feat: handle context menu events in LeftSidebar with delete confirmation"
```

---

### Task 8: Final Integration Test

**Files:**
- None (verification only)

- [ ] **Step 1: Full regression test**

Run: `npm run dev`

Test all existing features still work:
1. Click tree nodes → navigation works
2. "+" button on node → inline child creation works
3. Bottom "新建" button → CreateDocModal opens and works
4. DocHeader delete → ConfirmDialog works
5. Variant operations → create/switch variants work
6. Search → Command Palette works

- [ ] **Step 2: Test new context menu features**

1. Right-click on "人物志" (root node) → only "新建子词条" and "删除" (no "新建同级词条")
2. Right-click on "凌夜寒" (child node) → all 4 options available
3. Right-click on "编年大事记" (chronicle) → no "新建子词条" option
4. Create child via context menu → type dropdown defaults to parent type
5. Create sibling via context menu → new doc appears after target
6. Rename → title updates everywhere (tree, breadcrumbs, header)
7. Delete → confirm dialog → doc removed from tree

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: integration test fixes for context menu feature"
```
