# 平行词条实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为小说设定库增加平行词条功能——同一词条拥有多个纪年变体，每个变体独立内容和信息卡。

**Architecture:** 在 DocNode 上新增 `variants: DocVariant[]` 字段，与 `children`（层级子词条）独立。变体按 startYear 升序排列，所有变体可独立编辑。

**Tech Stack:** Vue 3 + TypeScript + Pinia + Tailwind CSS v4

---

## Task 1: 类型定义扩展

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: 新增 DocVariant 接口**

```ts
export interface DocVariant {
  id: string
  title: string
  startYear: string
  endYear: string
  content: string
  infobox: InfoboxSnapshot[]
  tags: string[]
  wordCount: number
  updatedAt: number
}
```

- [ ] **Step 2: 修改 DocNode 接口**

在 `DocNode` 接口中添加 `variants` 字段：

```ts
export interface DocNode {
  id: string
  title: string
  type: 'character' | 'faction' | 'location' | 'item' | 'lore' | 'chapter' | 'chronicle'
  children: DocNode[]
  variants: DocVariant[]  // 新增
  tags: string[]
  wordCount: number
  starred: boolean
  updatedAt: number
  parentId: string | null
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add DocVariant type and variants field to DocNode"
```

---

## Task 2: Store 方法扩展

**Files:**
- Modify: `src/stores/novelData.ts`

- [ ] **Step 1: 修改种子数据初始化**

在 `seedDocs` 中为所有节点添加 `variants: []`：

```ts
const docTree = ref<DocNode[]>(seedDocs.map(d => ({ ...d, variants: [] })))
```

- [ ] **Step 2: 新增 convertToParallel 方法**

```ts
function convertToParallel(docId: string, startYear: string, endYear: string = '') {
  const node = findNode(docTree.value, docId)
  if (!node || node.variants.length > 0) return

  const variant: DocVariant = {
    id: generateId('variant'),
    title: endYear ? `${startYear}~${endYear}` : startYear,
    startYear,
    endYear,
    content: docContent.value[docId] || '',
    infobox: infoboxData.value[docId] || [],
    tags: [...node.tags],
    wordCount: node.wordCount,
    updatedAt: Date.now(),
  }

  node.variants = [variant]
  // 保留主词条内容作为默认显示
}
```

- [ ] **Step 3: 新增 addVariant 方法**

```ts
function addVariant(docId: string, startYear: string, endYear: string = '') {
  const node = findNode(docTree.value, docId)
  if (!node) return null

  const variant: DocVariant = {
    id: generateId('variant'),
    title: endYear ? `${startYear}~${endYear}` : startYear,
    startYear,
    endYear,
    content: '',
    infobox: [],
    tags: [],
    wordCount: 0,
    updatedAt: Date.now(),
  }

  node.variants.push(variant)
  sortVariants(docId)
  return variant
}
```

- [ ] **Step 4: 新增 deleteVariant 方法**

```ts
function deleteVariant(docId: string, variantId: string) {
  const node = findNode(docTree.value, docId)
  if (!node) return

  node.variants = node.variants.filter(v => v.id !== variantId)

  // 如果只剩一个变体，自动恢复为普通词条
  if (node.variants.length === 1) {
    const lastVariant = node.variants[0]
    docContent.value[docId] = lastVariant.content
    infoboxData.value[docId] = lastVariant.infobox
    node.variants = []
  }
}
```

- [ ] **Step 5: 新增 updateVariantContent 方法**

```ts
function updateVariantContent(docId: string, variantId: string, html: string) {
  const node = findNode(docTree.value, docId)
  if (!node) return

  const variant = node.variants.find(v => v.id === variantId)
  if (variant) {
    variant.content = html
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    variant.wordCount = (tmp.textContent || '').replace(/\s/g, '').length
  }
}
```

- [ ] **Step 6: 新增 sortVariants 方法**

```ts
function sortVariants(docId: string) {
  const node = findNode(docTree.value, docId)
  if (!node) return

  node.variants.sort((a, b) => {
    if (a.startYear !== b.startYear) {
      return a.startYear.localeCompare(b.startYear)
    }
    return a.endYear.localeCompare(b.endYear)
  })
}
```

- [ ] **Step 7: 修改 persist 配置**

```ts
}, {
  persist: {
    key: 'noveldesign-data',
    pick: ['docTree', 'docContent', 'infoboxData', 'timelineEvents'],
  },
})
```

- [ ] **Step 8: 导出新方法**

在 return 语句中添加新方法：

```ts
return {
  // ... 现有方法
  convertToParallel, addVariant, deleteVariant,
  updateVariantContent, sortVariants,
}
```

- [ ] **Step 9: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: add parallel entry store methods"
```

---

## Task 3: 目录树 UI — 变体展开/折叠

**Files:**
- Modify: `src/components/sidebar/TreeNode.vue`

- [ ] **Step 1: 添加变体展开状态**

```ts
const variantsExpanded = ref(false)
```

- [ ] **Step 2: 在节点行添加变体图标**

在类型图标后、标题前添加变体图标（仅当 `node.variants.length > 0`）：

```vue
<!-- Variant indicator -->
<button
  v-if="node.variants.length > 0"
  class="w-4 h-4 flex items-center justify-center text-brand-muted hover:text-brand-accent shrink-0 transition-transform duration-200"
  :class="{ 'rotate-90': variantsExpanded }"
  @click.stop="variantsExpanded = !variantsExpanded"
  title="展开变体"
>
  <GitBranch :size="12" />
</button>
```

- [ ] **Step 3: 在 Children 区域后添加变体列表**

```vue
<!-- Variants -->
<div v-if="node.variants.length > 0 && variantsExpanded">
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
</div>
```

- [ ] **Step 4: 添加 activeVariantId prop 和事件**

```ts
const props = defineProps<{
  node: DocNode
  activeId: string
  depth: number
  activeVariantId?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string }]
  selectVariant: [{ docId: string; variantId: string }]
}>()

function handleVariantClick(variantId: string) {
  emit('selectVariant', { docId: props.node.id, variantId })
}
```

- [ ] **Step 5: 导入 GitBranch 图标**

```ts
import { ChevronRight, Plus, GitBranch } from 'lucide-vue-next'
```

- [ ] **Step 6: 传递 activeVariantId 到子节点**

```vue
<TreeNode
  v-for="child in node.children"
  :key="child.id"
  :node="child"
  :active-id="activeId"
  :depth="depth + 1"
  :active-variant-id="activeVariantId"
  @select="$emit('select', $event)"
  @createChild="$emit('createChild', $event)"
  @selectVariant="$emit('selectVariant', $event)"
/>
```

- [ ] **Step 7: Commit**

```bash
git add src/components/sidebar/TreeNode.vue
git commit -m "feat: add variant expand/collapse in tree node"
```

---

## Task 4: 目录树 UI — 事件传递

**Files:**
- Modify: `src/components/sidebar/TreeView.vue`
- Modify: `src/components/layout/LeftSidebar.vue`

- [ ] **Step 1: 修改 TreeView.vue**

```vue
<template>
  <div class="space-y-0.5">
    <TreeNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :active-id="activeId"
      :depth="0"
      :active-variant-id="activeVariantId"
      @select="$emit('select', $event)"
      @createChild="$emit('createChild', $event)"
      @selectVariant="$emit('selectVariant', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { DocNode } from '@/types'
import TreeNode from './TreeNode.vue'

defineProps<{
  nodes: DocNode[]
  activeId: string
  activeVariantId?: string
}>()

defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string }]
  selectVariant: [{ docId: string; variantId: string }]
}>()
</script>
```

- [ ] **Step 2: 修改 LeftSidebar.vue**

在 TreeView 组件上传递 activeVariantId 和事件：

```vue
<TreeView
  v-if="uiStore.viewMode === 'tree'"
  :nodes="novelStore.docTree"
  :active-id="novelStore.activeDocId"
  :active-variant-id="novelStore.activeVariantId"
  @select="navigateTo"
  @createChild="handleQuickCreate"
  @selectVariant="handleSelectVariant"
/>
```

添加处理函数：

```ts
function handleSelectVariant({ docId, variantId }: { docId: string; variantId: string }) {
  novelStore.setActiveDoc(docId)
  novelStore.setActiveVariant(variantId)
  router.push(docRoute(docId))
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebar/TreeView.vue src/components/layout/LeftSidebar.vue
git commit -m "feat: pass variant events through tree view"
```

---

## Task 5: Store — 变体活动状态

**Files:**
- Modify: `src/stores/novelData.ts`

- [ ] **Step 1: 添加 activeVariantId 状态**

```ts
const activeVariantId = ref<string | null>(null)
```

- [ ] **Step 2: 添加 setActiveVariant 方法**

```ts
function setActiveVariant(variantId: string | null) {
  activeVariantId.value = variantId
}
```

- [ ] **Step 3: 添加 activeVariant computed**

```ts
const activeVariant = computed(() => {
  if (!activeVariantId.value || !activeDoc.value) return null
  return activeDoc.value.variants.find(v => v.id === activeVariantId.value) || null
})
```

- [ ] **Step 4: 修改 activeContent 支持变体**

```ts
const activeContent = computed(() => {
  if (activeVariant.value) {
    return activeVariant.value.content
  }
  return docContent.value[activeDocId.value] || ''
})
```

- [ ] **Step 5: 修改 activeMeta 支持变体**

```ts
const activeMeta = computed(() => {
  if (activeVariant.value) {
    return {
      id: activeVariant.value.id,
      title: activeVariant.value.title,
      type: activeDoc.value?.type || 'lore',
      tags: activeVariant.value.tags,
      infobox: activeVariant.value.infobox,
      backlinks: [],
      wordCount: activeVariant.value.wordCount,
    }
  }
  return docMetaMap.value[activeDocId.value] || null
})
```

- [ ] **Step 6: 导出新状态**

```ts
return {
  // ... 现有
  activeVariantId, activeVariant,
  setActiveVariant,
}
```

- [ ] **Step 7: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: add active variant state management"
```

---

## Task 6: 编辑器 — 变体 Tab 栏

**Files:**
- Modify: `src/components/center/DocHeader.vue`

- [ ] **Step 1: 添加变体 Tab 栏 UI**

在标题下方添加变体标签栏（仅当词条有变体时显示）：

```vue
<!-- Variant tabs -->
<div
  v-if="doc.variants.length > 0"
  class="flex items-center gap-1 mt-3 pb-2 border-b border-brand-border/40"
>
  <button
    class="px-3 py-1 text-xs rounded-md transition-colors"
    :class="[
      !activeVariantId
        ? 'bg-brand-accent/10 text-brand-accent font-medium'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg',
    ]"
    @click="$emit('selectVariant', null)"
  >
    当前版本
  </button>
  <button
    v-for="variant in doc.variants"
    :key="variant.id"
    class="px-3 py-1 text-xs rounded-md transition-colors"
    :class="[
      activeVariantId === variant.id
        ? 'bg-brand-accent/10 text-brand-accent font-medium'
        : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg',
    ]"
    @click="$emit('selectVariant', variant.id)"
  >
    {{ variant.title }}
  </button>
</div>
```

- [ ] **Step 2: 修改标题显示**

当查看变体时，标题显示 "主名（时间范围）"：

```vue
<h1 class="text-2xl font-serif font-semibold text-brand-text tracking-wide">
  {{ activeVariant ? `${doc.title}（${activeVariant.title}）` : doc.title }}
</h1>
```

- [ ] **Step 3: 添加 props 和 emits**

```ts
const props = defineProps<{
  doc: DocNode
  meta: DocMeta | null
  activeVariantId?: string | null
}>()

const emit = defineEmits<{
  toggleStar: []
  selectVariant: [variantId: string | null]
}>()
```

- [ ] **Step 4: 计算 activeVariant**

```ts
const activeVariant = computed(() => {
  if (!props.activeVariantId || !props.doc.variants.length) return null
  return props.doc.variants.find(v => v.id === props.activeVariantId) || null
})
```

- [ ] **Step 5: Commit**

```bash
git add src/components/center/DocHeader.vue
git commit -m "feat: add variant tabs in doc header"
```

---

## Task 7: CenterPanel — 变体内容绑定

**Files:**
- Modify: `src/components/layout/CenterPanel.vue`

- [ ] **Step 1: 传递 activeVariantId 到 DocHeader**

```vue
<DocHeader
  :doc="novelStore.activeDoc!"
  :meta="novelStore.activeMeta"
  :active-variant-id="novelStore.activeVariantId"
  @toggle-star="handleToggleStar"
  @select-variant="handleSelectVariant"
/>
```

- [ ] **Step 2: 添加 handleSelectVariant**

```ts
function handleSelectVariant(variantId: string | null) {
  novelStore.setActiveVariant(variantId)
}
```

- [ ] **Step 3: 修改编辑器内容保存**

在 WikiEditor 的 `update:content` 事件处理中，区分主词条和变体：

```ts
function handleUpdateContent(html: string) {
  if (novelStore.activeVariantId && novelStore.activeDoc) {
    novelStore.updateVariantContent(
      novelStore.activeDoc.id,
      novelStore.activeVariantId,
      html
    )
  } else {
    novelStore.updateContent(novelStore.activeDocId, html)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/CenterPanel.vue
git commit -m "feat: bind variant content in center panel"
```

---

## Task 8: 转换对话框组件

**Files:**
- Create: `src/components/common/ConvertToParallelDialog.vue`

- [ ] **Step 1: 创建对话框组件**

```vue
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <div class="bg-brand-card rounded-xl shadow-brand-lg w-[400px] p-6 border border-brand-border/60">
        <h3 class="text-lg font-serif font-semibold text-brand-text mb-4">转为平行词条</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-brand-muted mb-1">起始纪年 *</label>
            <input
              v-model="startYear"
              type="text"
              placeholder="如：天历元年"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>
          
          <div>
            <label class="block text-xs text-brand-muted mb-1">结束纪年（可选）</label>
            <input
              v-model="endYear"
              type="text"
              placeholder="留空表示至今"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button
            class="px-4 py-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
            @click="$emit('cancel')"
          >
            取消
          </button>
          <button
            class="px-4 py-2 text-sm bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
            :disabled="!startYear.trim()"
            @click="handleConfirm"
          >
            确认转换
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  cancel: []
  confirm: [{ startYear: string; endYear: string }]
}>()

const startYear = ref('')
const endYear = ref('')

function handleConfirm() {
  emit('confirm', {
    startYear: startYear.value.trim(),
    endYear: endYear.value.trim(),
  })
  startYear.value = ''
  endYear.value = ''
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/ConvertToParallelDialog.vue
git commit -m "feat: create convert to parallel dialog component"
```

---

## Task 9: DocHeader — 转换按钮

**Files:**
- Modify: `src/components/center/DocHeader.vue`

- [ ] **Step 1: 添加转换按钮**

在星标按钮旁添加"转为平行词条"按钮（仅当词条无变体时显示）：

```vue
<button
  v-if="doc.variants.length === 0"
  class="text-brand-muted/60 hover:text-brand-accent transition-colors duration-150"
  @click="$emit('convertToParallel')"
  title="转为平行词条"
>
  <GitBranch :size="16" />
</button>
```

- [ ] **Step 2: 导入 GitBranch 图标**

```ts
import { Star, Download, Trash2, GitBranch } from 'lucide-vue-next'
```

- [ ] **Step 3: 添加 emit**

```ts
const emit = defineEmits<{
  toggleStar: []
  delete: []
  export: []
  convertToParallel: []
  selectVariant: [variantId: string | null]
}>()
```

- [ ] **Step 4: Commit**

```bash
git add src/components/center/DocHeader.vue
git commit -m "feat: add convert to parallel button in doc header"
```

---

## Task 10: CenterPanel — 对话框集成

**Files:**
- Modify: `src/components/layout/CenterPanel.vue`

- [ ] **Step 1: 导入对话框组件**

```ts
import ConvertToParallelDialog from '@/components/common/ConvertToParallelDialog.vue'
```

- [ ] **Step 2: 添加状态**

```ts
const showConvertDialog = ref(false)
```

- [ ] **Step 3: 在模板中添加对话框**

```vue
<ConvertToParallelDialog
  :visible="showConvertDialog"
  @cancel="showConvertDialog = false"
  @confirm="handleConvertToParallel"
/>
```

- [ ] **Step 4: 添加处理函数**

```ts
function handleConvertToParallel({ startYear, endYear }: { startYear: string; endYear: string }) {
  if (novelStore.activeDoc) {
    novelStore.convertToParallel(novelStore.activeDoc.id, startYear, endYear)
  }
  showConvertDialog.value = false
}
```

- [ ] **Step 5: 监听 DocHeader 事件**

```vue
<DocHeader
  :doc="novelStore.activeDoc!"
  :meta="novelStore.activeMeta"
  :active-variant-id="novelStore.activeVariantId"
  @toggle-star="handleToggleStar"
  @select-variant="handleSelectVariant"
  @convert-to-parallel="showConvertDialog = true"
/>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/CenterPanel.vue
git commit -m "feat: integrate convert to parallel dialog"
```

---

## Task 11: 新建变体对话框

**Files:**
- Create: `src/components/common/CreateVariantDialog.vue`

- [ ] **Step 1: 创建对话框组件**

```vue
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <div class="bg-brand-card rounded-xl shadow-brand-lg w-[400px] p-6 border border-brand-border/60">
        <h3 class="text-lg font-serif font-semibold text-brand-text mb-4">新建变体</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-brand-muted mb-1">起始纪年 *</label>
            <input
              v-model="startYear"
              type="text"
              placeholder="如：天历元年"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>
          
          <div>
            <label class="block text-xs text-brand-muted mb-1">结束纪年（可选）</label>
            <input
              v-model="endYear"
              type="text"
              placeholder="留空表示至今"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button
            class="px-4 py-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
            @click="$emit('cancel')"
          >
            取消
          </button>
          <button
            class="px-4 py-2 text-sm bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
            :disabled="!startYear.trim()"
            @click="handleConfirm"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  cancel: []
  confirm: [{ startYear: string; endYear: string }]
}>()

const startYear = ref('')
const endYear = ref('')

function handleConfirm() {
  emit('confirm', {
    startYear: startYear.value.trim(),
    endYear: endYear.value.trim(),
  })
  startYear.value = ''
  endYear.value = ''
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/CreateVariantDialog.vue
git commit -m "feat: create new variant dialog component"
```

---

## Task 12: 变体列表底部 — 新建按钮

**Files:**
- Modify: `src/components/sidebar/TreeNode.vue`

- [ ] **Step 1: 在变体列表底部添加新建按钮**

```vue
<!-- Variants -->
<div v-if="node.variants.length > 0 && variantsExpanded">
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
```

- [ ] **Step 2: 添加 emit**

```ts
const emit = defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string }]
  selectVariant: [{ docId: string; variantId: string }]
  createVariant: [docId: string]
}>()
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebar/TreeNode.vue
git commit -m "feat: add create variant button in variant list"
```

---

## Task 13: Store — 更新 activeMeta 支持变体信息卡

**Files:**
- Modify: `src/stores/novelData.ts`

- [ ] **Step 1: 添加 updateVariantInfobox 方法**

```ts
function updateVariantInfobox(docId: string, variantId: string, snapshots: InfoboxSnapshot[]) {
  const node = findNode(docTree.value, docId)
  if (!node) return

  const variant = node.variants.find(v => v.id === variantId)
  if (variant) {
    variant.infobox = snapshots
  }
}
```

- [ ] **Step 2: 导出新方法**

```ts
return {
  // ... 现有
  updateVariantInfobox,
}
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: add updateVariantInfobox method"
```

---

## Task 14: 信息卡 — 变体绑定

**Files:**
- Modify: `src/components/right/Infobox.vue`

- [ ] **Step 1: 修改 infobox 数据源**

当查看变体时，使用变体的 infobox 数据：

```ts
const currentInfobox = computed(() => {
  if (props.activeVariant) {
    return props.activeVariant.infobox
  }
  return props.meta?.infobox || []
})
```

- [ ] **Step 2: 修改保存逻辑**

保存时区分主词条和变体：

```ts
function handleSave() {
  if (props.activeVariant && props.doc) {
    novelStore.updateVariantInfobox(
      props.doc.id,
      props.activeVariant.id,
      localSnapshots.value
    )
  } else {
    novelStore.updateInfobox(props.docId, localSnapshots.value)
  }
  isEditing.value = false
}
```

- [ ] **Step 3: 添加 activeVariant prop**

```ts
const props = defineProps<{
  docId: string
  meta: DocMeta | null
  doc?: DocNode | null
  activeVariant?: DocVariant | null
}>()
```

- [ ] **Step 4: Commit**

```bash
git add src/components/right/Infobox.vue
git commit -m "feat: bind variant infobox in right sidebar"
```

---

## Task 15: RightSidebar — 传递变体数据

**Files:**
- Modify: `src/components/layout/RightSidebar.vue`

- [ ] **Step 1: 传递 activeVariant 到 Infobox**

```vue
<Infobox
  v-if="novelStore.activeDoc"
  :doc-id="novelStore.activeDocId"
  :meta="novelStore.activeMeta"
  :doc="novelStore.activeDoc"
  :active-variant="novelStore.activeVariant"
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/RightSidebar.vue
git commit -m "feat: pass active variant to infobox"
```

---

## Task 16: 种子数据迁移 — char-mc 示例

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Step 1: 为 char-mc 添加 variants**

```ts
{
  id: 'char-mc',
  title: '凌夜寒',
  type: 'character',
  tags: ['主角', '剑修'],
  wordCount: 4200,
  starred: true,
  updatedAt: Date.now() - 3600000,
  parentId: 'chars',
  children: [],
  variants: [
    {
      id: 'variant-mc-1',
      title: '天历元年',
      startYear: '天历元年',
      endYear: '天历十二年',
      content: `<h1>凌夜寒</h1><p><strong>身份：</strong>凡人</p><p><strong>境界：</strong>凡人</p>`,
      infobox: seedInfobox['char-mc']?.[0] ? [seedInfobox['char-mc'][0]] : [],
      tags: ['主角', '剑修'],
      wordCount: 200,
      updatedAt: Date.now(),
    },
    {
      id: 'variant-mc-2',
      title: '天历十二年~天历十五年',
      startYear: '天历十二年',
      endYear: '天历十五年',
      content: `<h1>凌夜寒</h1><p><strong>身份：</strong>天剑宗外门弟子</p><p><strong>境界：</strong>炼气期</p>`,
      infobox: seedInfobox['char-mc']?.[1] ? [seedInfobox['char-mc'][1]] : [],
      tags: ['主角', '剑修'],
      wordCount: 300,
      updatedAt: Date.now(),
    },
    {
      id: 'variant-mc-3',
      title: '天历十五年~天历十八年',
      startYear: '天历十五年',
      endYear: '天历十八年',
      content: `<h1>凌夜寒</h1><p><strong>身份：</strong>天剑宗内门弟子</p><p><strong>境界：</strong>筑基后期</p>`,
      infobox: seedInfobox['char-mc']?.[2] ? [seedInfobox['char-mc'][2]] : [],
      tags: ['主角', '剑修'],
      wordCount: 400,
      updatedAt: Date.now(),
    },
    {
      id: 'variant-mc-4',
      title: '天历十八年至今',
      startYear: '天历十八年',
      endYear: '',
      content: `<h1>凌夜寒</h1><p><strong>身份：</strong>魔道散修</p><p><strong>境界：</strong>金丹中期</p>`,
      infobox: seedInfobox['char-mc']?.[3] ? [seedInfobox['char-mc'][3]] : [],
      tags: ['主角', '剑修'],
      wordCount: 500,
      updatedAt: Date.now(),
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/seed.ts
git commit -m "feat: migrate char-mc to parallel entry with 4 variants"
```

---

## Task 17: 构建验证

**Files:**
- None

- [ ] **Step 1: 运行构建**

```bash
npm run build
```

- [ ] **Step 2: 修复任何 TypeScript 错误**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors in parallel entries feature"
```

---

## Task 18: 开发服务器测试

**Files:**
- None

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试功能**

1. 点击凌夜寒 → 查看变体 Tab 栏
2. 点击变体 Tab → 切换不同纪年版本
3. 在目录树中展开凌夜寒 → 查看变体列表
4. 编辑变体内容 → 保存 → 刷新验证
5. 转换普通词条为平行词条
6. 新建变体
7. 删除变体

- [ ] **Step 3: 修复发现的问题**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: address UI issues in parallel entries"
```

---

## 完成

所有任务完成后，平行词条功能即可使用。

**核心功能**：
- ✅ 数据模型：DocNode + DocVariant
- ✅ 目录树：变体展开/折叠 + 时间范围显示
- ✅ 编辑器：变体 Tab 栏 + 独立内容编辑
- ✅ 信息卡：变体独立信息卡
- ✅ 转换操作：普通 ↔ 平行
- ✅ 新建/删除变体
- ✅ 种子数据：char-mc 4 个变体示例
