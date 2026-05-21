# 持久化 + Word 导出实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让编辑结果自动持久化到 localStorage，并支持将设定内容导出为 Word 文档。

**Architecture:** 使用 pinia-plugin-persistedstate 自动同步 store state 到 localStorage；使用 docx 库在客户端构建 .docx 文档，file-saver 触发下载。

**Tech Stack:** pinia-plugin-persistedstate, docx, file-saver, lucide-vue-next

---

## 文件变更总览

### 新增文件
| 文件 | 职责 |
|------|------|
| `src/utils/html-to-docx.ts` | HTML → docx 段落转换器 |
| `src/utils/export-docx.ts` | 导出逻辑封装（单词条 + 全部） |

### 修改文件
| 文件 | 变更 |
|------|------|
| `package.json` | 新增 3 个依赖 |
| `src/main.ts:1-10` | 注册 pinia-plugin-persistedstate |
| `src/stores/novelData.ts:59-64,263-272` | 添加 persist 配置 + resetToDefaults |
| `src/components/common/CommandPalette.vue:99,115-118,161-168` | 添加导出全部 + 恢复默认操作项 |
| `src/components/center/DocHeader.vue:7-22,47,57` | 添加导出按钮 + emit |
| `src/components/layout/LeftSidebar.vue:34-49,64` | 添加导出按钮 |

---

## Task 1: 安装依赖

- [ ] **Step 1: 安装 npm 包**

```bash
cd "d:/网站总/小说设定网站"
npm install pinia-plugin-persistedstate docx file-saver
npm install -D @types/file-saver
```

Expected: 安装成功，无报错

- [ ] **Step 2: 验证安装**

```bash
npm ls pinia-plugin-persistedstate docx file-saver
```

Expected: 显示三个包的版本号

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add pinia-plugin-persistedstate, docx, file-saver"
```

---

## Task 2: 配置 Pinia 持久化插件

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: 注册 pinia-plugin-persistedstate**

修改 `src/main.ts`，完整内容：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.mount('#app')
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功，无类型错误

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: register pinia-plugin-persistedstate"
```

---

## Task 3: Store 添加 persist 配置 + 重置方法

**Files:**
- Modify: `src/stores/novelData.ts:59-64` (defineStore 第三个参数)
- Modify: `src/stores/novelData.ts:263-272` (return + 新方法)

- [ ] **Step 1: 添加 persist 配置**

在 `src/stores/novelData.ts` 中，将 defineStore 的闭括号 `})` 改为带第三个参数的形式。

找到（约第 263 行）：
```ts
  return {
    docTree, docContent, activeDocId, infoboxData,
```

在其上方（约第 262 行，即 store 函数体的闭括号 `}` 之后）添加 persist 配置。完整修改：

将原来的：
```ts
  return {
    docTree, docContent, activeDocId, infoboxData,
    flatDocs, docMetaMap, activeDoc, activeContent, activeMeta,
    recentDocs, starredDocs, sortedTimelineEvents,
    setActiveDoc, updateContent, toggleStar, searchDocs, findDocPath,
    getInfoboxYears, getInfoboxFieldsForYear, getFieldHistory,
    generateId, addDoc, deleteDoc, getParentOf,
    updateInfobox, addInfoboxSnapshot, removeInfoboxSnapshot,
    addInfoboxField, removeInfoboxField,
  }
})
```

改为：
```ts
  // Reset

  function resetToDefaults() {
    localStorage.removeItem('noveldesign-data')
    window.location.reload()
  }

  return {
    docTree, docContent, activeDocId, infoboxData,
    flatDocs, docMetaMap, activeDoc, activeContent, activeMeta,
    recentDocs, starredDocs, sortedTimelineEvents,
    setActiveDoc, updateContent, toggleStar, searchDocs, findDocPath,
    getInfoboxYears, getInfoboxFieldsForYear, getFieldHistory,
    generateId, addDoc, deleteDoc, getParentOf,
    updateInfobox, addInfoboxSnapshot, removeInfoboxSnapshot,
    addInfoboxField, removeInfoboxField,
    resetToDefaults,
  }
}, {
  persist: {
    key: 'noveldesign-data',
    pick: ['docTree', 'docContent', 'infoboxData', 'timelineEvents'],
  },
})
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 3: 手动测试持久化**

```bash
npm run dev
```

在浏览器中：
1. 打开应用，新建一个词条（标题"测试持久化"）
2. 刷新页面 → 确认"测试持久化"词条仍在
3. 编辑任意词条正文 → 刷新 → 确认内容保留
4. 删除刚才新建的词条 → 刷新 → 确认已删除

- [ ] **Step 4: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: add localStorage persistence + resetToDefaults"
```

---

## Task 4: HTML → docx 转换器

**Files:**
- Create: `src/utils/html-to-docx.ts`

- [ ] **Step 1: 创建转换器**

新建 `src/utils/html-to-docx.ts`，完整内容：

```ts
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  LevelFormat,
  AlignmentType,
  convertInchesToTwip,
  type ParagraphChild,
  type IRunOptions,
} from 'docx'

const FONT = 'Noto Sans SC'
const FONT_SIZE = 24 // 12pt in half-points

function makeTextRun(text: string, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({ text, font: FONT, size: FONT_SIZE, ...opts })
}

function processInlineNodes(
  nodes: NodeListOf<ChildNode>,
  formatting: { bold?: boolean; italics?: boolean } = {},
): (TextRun | ExternalHyperlink)[] {
  const results: (TextRun | ExternalHyperlink)[] = []

  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text) results.push(makeTextRun(text, formatting))
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      // Skip wiki-link wrapper <a>, extract inner text only
      if (tag === 'a' && el.hasAttribute('data-wiki-link')) {
        results.push(makeTextRun(el.textContent || '', formatting))
        continue
      }

      if (tag === 'strong' || tag === 'b') {
        results.push(...processInlineNodes(el.childNodes, { ...formatting, bold: true }))
      } else if (tag === 'em' || tag === 'i') {
        results.push(...processInlineNodes(el.childNodes, { ...formatting, italics: true }))
      } else if (tag === 'a' && el.getAttribute('href')) {
        const href = el.getAttribute('href')!
        const text = el.textContent || ''
        results.push(
          new ExternalHyperlink({
            children: [makeTextRun(text, { style: 'Hyperlink' })],
            link: href,
          })
        )
      } else if (tag === 'code') {
        results.push(new TextRun({ text: el.textContent || '', font: 'Courier New', size: FONT_SIZE }))
      } else if (tag === 'br') {
        results.push(makeTextRun('', { break: 1 }))
      } else {
        results.push(...processInlineNodes(el.childNodes, formatting))
      }
    }
  }

  return results
}

function processBlockNode(node: Node): Paragraph[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (text.trim()) {
      return [new Paragraph({ children: [new TextRun({ text, font: FONT, size: FONT_SIZE })] })]
    }
    return []
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'h1':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'h2':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'h3':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'p':
      return [new Paragraph({
        children: processInlineNodes(el.childNodes) as ParagraphChild[],
        spacing: { after: 200 },
      })]
    case 'blockquote':
      return [new Paragraph({
        children: processInlineNodes(el.childNodes) as ParagraphChild[],
        indent: { left: convertInchesToTwip(0.5) },
        spacing: { before: 120, after: 120 },
      })]
    case 'pre': {
      const code = el.querySelector('code')
      const text = code ? code.textContent || '' : el.textContent || ''
      return [new Paragraph({
        children: [new TextRun({ text, font: 'Courier New', size: 20 })],
        spacing: { before: 120, after: 120 },
      })]
    }
    case 'ul':
      return Array.from(el.children).flatMap(li =>
        processBlockNode(li).map((p, i) =>
          i === 0
            ? new Paragraph({
                children: [new TextRun({ text: '  •  ', font: FONT, size: FONT_SIZE }), ...(p.children as ParagraphChild[])],
                spacing: { after: 80 },
              })
            : p
        )
      )
    case 'ol':
      return Array.from(el.children).flatMap((li, idx) =>
        processBlockNode(li).map((p, i) =>
          i === 0
            ? new Paragraph({
                children: [new TextRun({ text: `  ${idx + 1}.  `, font: FONT, size: FONT_SIZE }), ...(p.children as ParagraphChild[])],
                spacing: { after: 80 },
              })
            : p
        )
      )
    case 'li':
      return processBlockNode(el.childNodes[0] || el)
    case 'hr':
      return [new Paragraph({
        children: [new TextRun({ text: '————————————————', font: FONT, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })]
    case 'br':
      return [new Paragraph({ children: [] })]
    default:
      return processBlockChildren(el)
  }
}

function processBlockChildren(el: HTMLElement): Paragraph[] {
  return Array.from(el.childNodes).flatMap(child => processBlockNode(child))
}

export function htmlToDocxChildren(html: string): Paragraph[] {
  if (!html || !html.trim()) return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return processBlockChildren(doc.body)
}
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功，无类型错误

- [ ] **Step 3: Commit**

```bash
git add src/utils/html-to-docx.ts
git commit -m "feat: add HTML to docx converter"
```

---

## Task 5: 导出逻辑封装

**Files:**
- Create: `src/utils/export-docx.ts`

- [ ] **Step 1: 创建导出函数**

新建 `src/utils/export-docx.ts`，完整内容：

```ts
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  convertInchesToTwip,
  type ParagraphChild,
} from 'docx'
import { saveAs } from 'file-saver'
import { htmlToDocxChildren } from './html-to-docx'
import type { DocNode } from '@/types'

function buildTocParagraphs(nodes: DocNode[], depth: number = 0): Paragraph[] {
  const paragraphs: Paragraph[] = []
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${indent}${node.title}`, font: 'Noto Sans SC', size: 22 })],
        spacing: { after: 40 },
      })
    )
    if (node.children.length) {
      paragraphs.push(...buildTocParagraphs(node.children, depth + 1))
    }
  }
  return paragraphs
}

function buildDocParagraphs(
  nodes: DocNode[],
  content: Record<string, string>,
  depth: number = 0,
): (Paragraph | { pageBreakBefore: true })[] {
  const result: (Paragraph | { pageBreakBefore: true })[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const headingLevel = depth === 0
      ? HeadingLevel.HEADING_1
      : depth === 1
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3

    // Page break between siblings (not before first)
    if (i > 0) {
      result.push({ pageBreakBefore: true })
    }

    result.push(
      new Paragraph({
        heading: headingLevel,
        children: [new TextRun({ text: node.title, font: 'Noto Sans SC', bold: true })],
      })
    )

    const html = content[node.id] || ''
    result.push(...htmlToDocxChildren(html))

    if (node.children.length) {
      result.push(...buildDocParagraphs(node.children, content, depth + 1))
    }
  }

  return result
}

export async function exportSingleDoc(doc: DocNode, html: string): Promise<void> {
  const children: (Paragraph | Paragraph[])[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: doc.title, font: 'Noto Sans SC', bold: true })],
    }),
    ...htmlToDocxChildren(html),
  ]

  const docObj = new Document({
    sections: [{ children: children.flat() }],
  })

  const blob = await Packer.toBlob(docObj)
  saveAs(blob, `${doc.title}.docx`)
}

export async function exportAllDocs(
  docs: DocNode[],
  content: Record<string, string>,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const titlePage = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: '小说设定文档', font: 'Noto Sans SC', bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `导出时间：${today}`, font: 'Noto Sans SC', size: 22, color: '888888' })],
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '————————————————', font: 'Noto Sans SC', size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
    }),
  ]

  const toc = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '目录', font: 'Noto Sans SC', bold: true })],
    }),
    ...buildTocParagraphs(docs),
  ]

  const body = buildDocParagraphs(docs, content)

  const docObj = new Document({
    sections: [
      { children: titlePage },
      { children: toc },
      { children: body as Paragraph[] },
    ],
  })

  const blob = await Packer.toBlob(docObj)
  saveAs(blob, `小说设定文档_${today}.docx`)
}
```

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add src/utils/export-docx.ts
git commit -m "feat: add Word export functions"
```

---

## Task 6: DocHeader 添加导出按钮

**Files:**
- Modify: `src/components/center/DocHeader.vue:7-22,47,57`

- [ ] **Step 1: 添加 Download 图标导入和 emit**

修改 `src/components/center/DocHeader.vue`：

将第 47 行：
```ts
import { Star, Trash2 } from 'lucide-vue-next'
```
改为：
```ts
import { Star, Trash2, Download } from 'lucide-vue-next'
```

将第 57 行：
```ts
defineEmits<{ toggleStar: []; delete: [] }>()
```
改为：
```ts
defineEmits<{ toggleStar: []; delete: []; export: [] }>()
```

- [ ] **Step 2: 添加导出按钮**

在 `src/components/center/DocHeader.vue` 模板中，找到删除按钮（约第 16-22 行），在其**前面**插入导出按钮：

将：
```html
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-red-400"
          @click="$emit('delete')"
          title="删除词条"
        >
          <Trash2 :size="18" />
        </button>
```
改为：
```html
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-brand-accent"
          @click="$emit('export')"
          title="导出为 Word"
        >
          <Download :size="18" />
        </button>
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-red-400"
          @click="$emit('delete')"
          title="删除词条"
        >
          <Trash2 :size="18" />
        </button>
```

- [ ] **Step 3: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add src/components/center/DocHeader.vue
git commit -m "feat: add export button to DocHeader"
```

---

## Task 7: CenterPanel 接入导出逻辑

**Files:**
- Modify: `src/components/layout/CenterPanel.vue`

需要在 CenterPanel 中监听 DocHeader 的 export 事件并调用导出函数。

- [ ] **Step 1: 读取 CenterPanel.vue 确认 DocHeader 位置**

读取 `src/components/layout/CenterPanel.vue` 确认 DocHeader 的使用位置。

- [ ] **Step 2: 添加导入和处理函数**

在 `src/components/layout/CenterPanel.vue` 的 `<script setup>` 中：

在 import 区域添加：
```ts
import { exportSingleDoc } from '@/utils/export-docx'
```

在 script 中添加处理函数：
```ts
function handleExport() {
  if (!novelStore.activeDoc) return
  const html = novelStore.docContent[novelStore.activeDocId] || ''
  exportSingleDoc(novelStore.activeDoc, html)
}
```

在模板中找到 DocHeader 组件，添加 `@export` 事件监听：
```html
<DocHeader
  v-if="novelStore.activeDoc"
  :title="novelStore.activeDoc.title"
  :tags="novelStore.activeDoc.tags"
  :type="novelStore.activeDoc.type"
  :starred="novelStore.activeDoc.starred"
  @toggle-star="novelStore.toggleStar(novelStore.activeDocId)"
  @delete="showDeleteConfirm = true"
  @export="handleExport"
/>
```

- [ ] **Step 3: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/CenterPanel.vue
git commit -m "feat: wire up single doc export in CenterPanel"
```

---

## Task 8: CommandPalette 添加操作项

**Files:**
- Modify: `src/components/common/CommandPalette.vue:99,115-118,161-168`

- [ ] **Step 1: 添加导入**

在 `src/components/common/CommandPalette.vue` 的 import 区域（约第 99 行）：

将：
```ts
import { Plus, GitBranch } from 'lucide-vue-next'
```
改为：
```ts
import { Plus, GitBranch, Download, RotateCcw } from 'lucide-vue-next'
```

在 import 区域添加：
```ts
import { exportAllDocs } from '@/utils/export-docx'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
```

- [ ] **Step 2: 添加响应式状态和操作项**

在 script 中添加：
```ts
const showResetConfirm = ref(false)
```

将 actions 数组（约第 115-118 行）：
```ts
const actions = [
  { id: 'create', label: '新建词条', icon: markRaw(Plus) },
  { id: 'graph', label: '全局关系图谱', icon: markRaw(GitBranch) },
]
```
改为：
```ts
const actions = [
  { id: 'create', label: '新建词条', icon: markRaw(Plus) },
  { id: 'graph', label: '全局关系图谱', icon: markRaw(GitBranch) },
  { id: 'export-all', label: '导出全部设定', icon: markRaw(Download) },
  { id: 'reset', label: '恢复默认数据', icon: markRaw(RotateCcw) },
]
```

- [ ] **Step 3: 修改 handleAction 函数**

将 handleAction 函数（约第 161-168 行）：
```ts
function handleAction(actionId: string) {
  uiStore.closeCommandPalette()
  if (actionId === 'create') {
    uiStore.openCreateDocModal()
  } else if (actionId === 'graph') {
    uiStore.openGlobalGraph()
  }
}
```
改为：
```ts
function handleAction(actionId: string) {
  uiStore.closeCommandPalette()
  if (actionId === 'create') {
    uiStore.openCreateDocModal()
  } else if (actionId === 'graph') {
    uiStore.openGlobalGraph()
  } else if (actionId === 'export-all') {
    exportAllDocs(novelStore.flatDocs, novelStore.docContent)
  } else if (actionId === 'reset') {
    showResetConfirm.value = true
  }
}
```

- [ ] **Step 4: 添加模板中的 ConfirmDialog**

在 `src/components/common/CommandPalette.vue` 模板的 `</Teleport>` 闭标签**之前**添加：

```html
    <!-- Reset confirm -->
    <ConfirmDialog
      v-model:visible="showResetConfirm"
      title="恢复默认数据"
      message="这将清除所有本地修改，恢复到初始种子数据。此操作不可撤销，确定继续吗？"
      confirm-text="确认恢复"
      cancel-text="取消"
      @confirm="novelStore.resetToDefaults()"
      @cancel="showResetConfirm = false"
    />
```

- [ ] **Step 5: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 6: 手动测试**

```bash
npm run dev
```

在浏览器中：
1. Ctrl+K 打开 CommandPalette → 确认看到 4 个操作项
2. 点击"导出全部设定" → 下载 .docx 文件 → 打开验证
3. 点击"恢复默认数据" → 弹出确认框 → 点确认 → 页面刷新 → 数据恢复

- [ ] **Step 7: Commit**

```bash
git add src/components/common/CommandPalette.vue
git commit -m "feat: add export-all and reset actions to CommandPalette"
```

---

## Task 9: LeftSidebar 添加导出按钮

**Files:**
- Modify: `src/components/layout/LeftSidebar.vue:34-49,64`

- [ ] **Step 1: 添加导入**

在 `src/components/layout/LeftSidebar.vue` 的 import 区域（约第 64 行）：

将：
```ts
import { Plus, GitBranch } from 'lucide-vue-next'
```
改为：
```ts
import { Plus, GitBranch, Download } from 'lucide-vue-next'
```

添加：
```ts
import { exportAllDocs } from '@/utils/export-docx'
```

- [ ] **Step 2: 添加导出按钮**

在 `src/components/layout/LeftSidebar.vue` 模板的底部操作栏中，找到全局图谱按钮（约第 43-49 行），在其**后面**插入导出按钮：

将：
```html
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="uiStore.openGlobalGraph()"
        title="全局图谱"
      >
        <GitBranch :size="14" />
      </button>
      <div class="flex-1" />
```
改为：
```html
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="uiStore.openGlobalGraph()"
        title="全局图谱"
      >
        <GitBranch :size="14" />
      </button>
      <button
        class="flex items-center gap-1 text-brand-muted/60 hover:text-brand-accent text-xs transition-colors duration-150 px-2 py-1 rounded-md hover:bg-brand-accent-light/50"
        @click="exportAllDocs(novelStore.flatDocs, novelStore.docContent)"
        title="导出全部设定"
      >
        <Download :size="14" />
      </button>
      <div class="flex-1" />
```

- [ ] **Step 3: 验证构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/LeftSidebar.vue
git commit -m "feat: add export button to LeftSidebar"
```

---

## Task 10: 最终构建验证 + 推送

- [ ] **Step 1: 完整构建**

```bash
cd "d:/网站总/小说设定网站"
npm run build
```

Expected: 构建成功，无错误

- [ ] **Step 2: 完整手动测试**

```bash
npm run dev
```

测试清单：
1. **持久化**：新建词条 → 刷新 → 词条仍在
2. **持久化**：编辑正文 → 刷新 → 内容保留
3. **持久化**：删除词条 → 刷新 → 词条已删
4. **恢复默认**：CommandPalette → "恢复默认数据" → 确认 → 回到种子数据
5. **单词条导出**：DocHeader 点导出按钮 → 下载 .docx → 打开验证
6. **全部导出**：LeftSidebar 点导出按钮 → 下载完整 .docx → 打开验证层级
7. **全部导出**：CommandPalette → "导出全部设定" → 下载 → 验证

- [ ] **Step 3: 推送**

```bash
git push
```

- [ ] **Step 4: 最终 Commit（如有遗漏修改）**

如测试中发现问题并修复，一并提交。
