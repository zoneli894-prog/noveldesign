# 多项目管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade from single-project to multi-project architecture, each novel as an independent project with isolated data.

**Architecture:** Add `Project` type wrapping all per-project data (docTree, content, infobox, timeline). Store holds `projects[]` and `activeProjectId`. All existing computed properties derive from `activeProject`. Router adds `/project/:pid` for project homepage.

**Tech Stack:** Vue 3, TypeScript, Pinia, pinia-plugin-persistedstate v4, Vue Router 5, Tailwind CSS v4

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/index.ts` | Modify | Add `Project` interface |
| `src/stores/novelData.ts` | Modify | Restructure to project-scoped data |
| `src/router/index.ts` | Modify | Add project routes |
| `src/components/project/ProjectHome.vue` | Create | Project homepage with card grid |
| `src/components/project/ProjectCard.vue` | Create | Individual project card |
| `src/components/project/CreateProjectDialog.vue` | Create | New project dialog |
| `src/components/project/EditProjectDialog.vue` | Create | Edit/delete project dialog |
| `src/components/layout/LeftSidebar.vue` | Modify | Show project name, link to homepage |
| `src/components/center/Breadcrumbs.vue` | Modify | Show project name as first level |
| `src/App.vue` | Modify | Read pid from route |

---

### Task 1: Add Project Type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add Project interface**

Add after the `ViewMode` type (around line 63):

```ts
export interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  docTree: DocNode[]
  docContent: Record<string, string>
  infoboxData: Record<string, InfoboxSnapshot[]>
  timelineEvents: TimelineEvent[]
}
```

- [ ] **Step 2: Verify type compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Project type definition"
```

---

### Task 2: Restructure Store to Project-Scoped Data

**Files:**
- Modify: `src/stores/novelData.ts`

This is the core refactoring task. The store changes from top-level data refs to project-scoped computed properties.

- [ ] **Step 1: Add imports and Project type**

Add `Project` to the type imports:

```ts
import type { DocNode, DocMeta, DocVariant, InfoboxField, InfoboxSnapshot, TimelineEvent, Project } from '@/types'
```

- [ ] **Step 2: Replace top-level data refs with project state**

Replace lines 64-68:

```ts
// Before:
const docTree = ref<DocNode[]>(seedDocs)
const docContent = ref<Record<string, string>>({ ...seedContent })
const activeDocId = ref<string>('char-mc')
const timelineEvents = ref<TimelineEvent[]>([...seedTimeline])
const infoboxData = ref<Record<string, InfoboxSnapshot[]>>({ ...seedInfobox })

// After:
const projects = ref<Project[]>([])
const activeProjectId = ref<string>('')
const activeDocId = ref<string>('')
const activeVariantId = ref<string | null>(null)
```

- [ ] **Step 3: Add activeProject computed and initialize default project**

After the refs, add:

```ts
// Initialize default project from seed data if no projects exist
function initializeDefaultProject() {
  if (projects.value.length === 0) {
    const defaultProject: Project = {
      id: 'default',
      name: '苍穹志',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      docTree: seedDocs,
      docContent: { ...seedContent },
      infoboxData: { ...seedInfobox },
      timelineEvents: [...seedTimeline],
    }
    projects.value = [defaultProject]
    activeProjectId.value = 'default'
    activeDocId.value = 'char-mc'
  }
}

initializeDefaultProject()

const activeProject = computed(() =>
  projects.value.find(p => p.id === activeProjectId.value) || null
)
```

- [ ] **Step 4: Convert data refs to computed**

Replace the old computed properties (lines 70-71) and add new ones:

```ts
const docTree = computed(() => activeProject.value?.docTree || [])
const docContent = computed(() => activeProject.value?.docContent || {})
const infoboxData = computed(() => activeProject.value?.infoboxData || {})
const timelineEvents = computed(() => activeProject.value?.timelineEvents || [])

const flatDocs = computed(() => flattenTree(docTree.value))
const docMetaMap = computed(() => buildMetaMap(docTree.value, infoboxData.value, docContent.value))
```

- [ ] **Step 5: Update all mutation methods**

Every method that previously mutated `docTree.value`, `docContent.value`, `infoboxData.value`, or `timelineEvents.value` must now mutate the active project's data. Here's the pattern:

For methods that read data, replace `docTree.value` with `activeProject.value?.docTree || []`.
For methods that write data, replace `docContent.value[id] = ...` with `activeProject.value!.docContent[id] = ...`.

**Key methods to update:**

`updateContent` (line 134):
```ts
function updateContent(id: string, html: string) {
  const project = activeProject.value
  if (!project) return
  project.docContent[id] = html
  const node = findNode(project.docTree, id)
  if (node) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    node.wordCount = (tmp.textContent || '').replace(/\s/g, '').length
  }
}
```

`toggleStar` (line 144):
```ts
function toggleStar(id: string) {
  const node = findNode(docTree.value, id)
  if (node) node.starred = !node.starred
}
```
(This one uses the computed `docTree` which already reads from activeProject, so no change needed.)

`addDoc` (line 197):
```ts
function addDoc(params: { title: string; type: DocNode['type']; parentId: string | null; afterId?: string }): DocNode {
  const project = activeProject.value
  if (!project) throw new Error('No active project')

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

  const parent = params.parentId ? findNode(project.docTree, params.parentId) : null
  const siblings = parent?.children ?? project.docTree

  if (params.afterId) {
    const idx = siblings.findIndex(n => n.id === params.afterId)
    if (idx !== -1) {
      siblings.splice(idx + 1, 0, newNode)
    } else {
      siblings.push(newNode)
    }
  } else {
    siblings.push(newNode)
  }

  project.docContent[id] = ''
  project.infoboxData[id] = []
  project.updatedAt = Date.now()

  return newNode
}
```

`deleteDoc` (line 232):
```ts
function deleteDoc(id: string) {
  const project = activeProject.value
  if (!project) return

  const collectIds = (node: DocNode): string[] => {
    const ids = [node.id]
    for (const child of node.children) {
      ids.push(...collectIds(child))
    }
    return ids
  }

  const removeNode = (nodes: DocNode[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        const removed = nodes.splice(i, 1)[0]
        for (const rid of collectIds(removed)) {
          delete project.docContent[rid]
          delete project.infoboxData[rid]
        }
        return true
      }
      if (removeNode(nodes[i].children)) return true
    }
    return false
  }

  removeNode(project.docTree)
  project.updatedAt = Date.now()

  if (activeDocId.value === id) {
    const remaining = flatDocs.value
    if (remaining.length > 0) {
      activeDocId.value = remaining[0].id
    }
  }
}
```

`renameDoc` (line 266):
```ts
function renameDoc(id: string, newTitle: string) {
  const node = findNode(docTree.value, id)
  if (node) {
    node.title = newTitle
    node.updatedAt = Date.now()
    if (activeProject.value) activeProject.value.updatedAt = Date.now()
  }
}
```

`findDocPath` (line 154): No change needed (uses computed `docTree`).

`getParentOf` (line 274): No change needed (uses computed `docTree`).

Infobox methods (`updateInfobox`, `addInfoboxSnapshot`, etc.): These use `infoboxData.value[id]` which now comes from computed. For mutations, use `activeProject.value!.infoboxData[id]`:

```ts
function updateInfobox(docId: string, snapshots: InfoboxSnapshot[]) {
  const project = activeProject.value
  if (project) project.infoboxData[docId] = snapshots
}

function addInfoboxSnapshot(docId: string, snapshot: InfoboxSnapshot) {
  const project = activeProject.value
  if (!project) return
  if (!project.infoboxData[docId]) {
    project.infoboxData[docId] = []
  }
  project.infoboxData[docId].push(snapshot)
}

function removeInfoboxSnapshot(docId: string, year: string) {
  const project = activeProject.value
  if (!project) return
  const snapshots = project.infoboxData[docId]
  if (snapshots) {
    project.infoboxData[docId] = snapshots.filter(s => s.year !== year)
  }
}

function addInfoboxField(docId: string, year: string, field: InfoboxField) {
  const project = activeProject.value
  if (!project) return
  const snapshots = project.infoboxData[docId]
  if (!snapshots) return
  const snap = snapshots.find(s => s.year === year)
  if (snap) snap.fields.push(field)
}

function removeInfoboxField(docId: string, year: string, fieldKey: string) {
  const project = activeProject.value
  if (!project) return
  const snapshots = project.infoboxData[docId]
  if (!snapshots) return
  const snap = snapshots.find(s => s.year === year)
  if (snap) snap.fields = snap.fields.filter(f => f.key !== fieldKey)
}
```

Parallel entry methods (`convertToParallel`, `addVariant`, `deleteVariant`, etc.): These use `findNode(docTree.value, id)` which works via computed. Mutations on the node itself work because they mutate the object in the project's docTree array. No changes needed for these methods.

- [ ] **Step 6: Add project CRUD methods**

Add after the parallel entry methods:

```ts
// Project methods

function createProject(name: string): Project {
  const id = `project-${Date.now().toString(36)}`
  const project: Project = {
    id,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    docTree: [],
    docContent: {},
    infoboxData: {},
    timelineEvents: [],
  }
  projects.value.push(project)
  return project
}

function deleteProject(id: string) {
  if (projects.value.length <= 1) return // Don't delete last project
  projects.value = projects.value.filter(p => p.id !== id)
  if (activeProjectId.value === id) {
    activeProjectId.value = projects.value[0]?.id || ''
  }
}

function renameProject(id: string, name: string) {
  const project = projects.value.find(p => p.id === id)
  if (project) {
    project.name = name
    project.updatedAt = Date.now()
  }
}

function setActiveProject(id: string) {
  activeProjectId.value = id
  // Reset active doc when switching projects
  const project = projects.value.find(p => p.id === id)
  if (project) {
    const flat = flattenTree(project.docTree)
    activeDocId.value = flat[0]?.id || ''
    activeVariantId.value = null
  }
}

function getProjectStats(id: string) {
  const project = projects.value.find(p => p.id === id)
  if (!project) return { docCount: 0, updatedAt: 0 }
  return {
    docCount: flattenTree(project.docTree).length,
    updatedAt: project.updatedAt,
  }
}
```

- [ ] **Step 7: Update resetToDefaults**

```ts
function resetToDefaults() {
  localStorage.removeItem('noveldesign-projects')
  window.location.reload()
}
```

- [ ] **Step 8: Update return object and persist config**

Replace the return object and persist config:

```ts
return {
  projects, activeProjectId, activeDocId, activeVariantId,
  activeProject, flatDocs, docMetaMap, activeDoc, activeVariant, activeContent, activeMeta,
  recentDocs, starredDocs, sortedTimelineEvents,
  setActiveDoc, setActiveVariant, updateContent, toggleStar, searchDocs, findDocPath,
  getInfoboxYears, getInfoboxFieldsForYear, getFieldHistory,
  generateId, addDoc, deleteDoc, renameDoc, getParentOf,
  updateInfobox, addInfoboxSnapshot, removeInfoboxSnapshot,
  addInfoboxField, removeInfoboxField,
  convertToParallel, addVariant, deleteVariant, updateVariantContent, updateVariantInfobox, sortVariants,
  createProject, deleteProject, renameProject, setActiveProject, getProjectStats,
  resetToDefaults,
}
```

```ts
persist: {
  key: 'noveldesign-projects',
  pick: ['projects', 'activeProjectId', 'activeDocId'],
},
```

- [ ] **Step 9: Add data migration**

Add at the top of the store (after `initializeDefaultProject` is defined but before it's called):

```ts
function migrateFromLegacyFormat() {
  const legacyData = localStorage.getItem('noveldesign-data')
  if (legacyData && projects.value.length === 0) {
    try {
      const parsed = JSON.parse(legacyData)
      const migratedProject: Project = {
        id: 'default',
        name: '苍穹志',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        docTree: parsed.docTree || seedDocs,
        docContent: parsed.docContent || seedContent,
        infoboxData: parsed.infoboxData || seedInfobox,
        timelineEvents: parsed.timelineEvents || seedTimeline,
      }
      projects.value = [migratedProject]
      activeProjectId.value = 'default'
      activeDocId.value = 'char-mc'
      localStorage.removeItem('noveldesign-data')
    } catch {
      // If parse fails, use defaults
    }
  }
}

migrateFromLegacyFormat()
initializeDefaultProject()
```

- [ ] **Step 10: Verify store compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 11: Commit**

```bash
git add src/stores/novelData.ts
git commit -m "feat: restructure store to project-scoped data model"
```

---

### Task 3: Update Router

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: Add routes**

Replace the routes array:

```ts
import ProjectHome from '@/components/project/ProjectHome.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/project/default',
    },
    {
      path: '/project/:pid',
      component: ProjectHome,
    },
    {
      path: '/project/:pid/doc/:docId',
      component: App,
    },
  ],
})

// Guard: validate pid exists
router.beforeEach((to) => {
  if (to.params.pid && !to.params.docId) {
    // Project homepage - let component handle validation
  }
})
```

- [ ] **Step 2: Verify router compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: add project routes to router"
```

---

### Task 4: Create ProjectCard Component

**Files:**
- Create: `src/components/project/ProjectCard.vue`

- [ ] **Step 1: Create ProjectCard.vue**

```vue
<template>
  <div
    class="bg-brand-card rounded-xl border border-brand-border/60 p-5 cursor-pointer transition-all duration-200 hover:shadow-brand-md group"
    @click="$emit('open', project.id)"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" :style="{ backgroundColor: stringToColor(project.name) + '18' }">
        📖
      </div>
      <div class="relative">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-md text-brand-muted/40 opacity-0 group-hover:opacity-100 hover:text-brand-text hover:bg-brand-bg transition-all"
          @click.stop="showMenu = !showMenu"
        >
          <MoreHorizontal :size="16" />
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 top-8 z-10 w-32 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 py-1"
        >
          <button
            class="w-full text-left px-3 py-1.5 text-sm text-brand-text hover:bg-brand-bg transition-colors"
            @click.stop="$emit('edit', project); showMenu = false"
          >
            编辑
          </button>
          <button
            class="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            :disabled="projectsCount <= 1"
            :class="{ 'opacity-40 cursor-not-allowed': projectsCount <= 1 }"
            @click.stop="projectsCount > 1 && ($emit('delete', project.id), showMenu = false)"
          >
            删除
          </button>
        </div>
      </div>
    </div>
    <h3 class="font-serif font-semibold text-brand-text text-sm mb-1 truncate">{{ project.name }}</h3>
    <div class="flex items-center justify-between">
      <span class="text-[11px] text-brand-muted">{{ docCount }} 个词条</span>
      <span class="text-[11px] text-brand-muted">{{ relativeTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoreHorizontal } from 'lucide-vue-next'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
  docCount: number
  projectsCount: number
}>()

defineEmits<{
  open: [id: string]
  edit: [project: Project]
  delete: [id: string]
}>()

const showMenu = ref(false)

const relativeTime = computed(() => {
  const diff = Date.now() - props.project.updatedAt
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return `${Math.floor(days / 30)} 个月前`
})

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 45%, 55%)`
}
</script>
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/components/project
git add src/components/project/ProjectCard.vue
git commit -m "feat: add ProjectCard component"
```

---

### Task 5: Create CreateProjectDialog

**Files:**
- Create: `src/components/project/CreateProjectDialog.vue`

- [ ] **Step 1: Create CreateProjectDialog.vue**

```vue
<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-sm bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6">
            <h3 class="font-serif font-semibold text-brand-text text-base mb-4">新建项目</h3>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="输入项目名称..."
              class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
              @keydown.enter="handleConfirm"
              @keydown.escape="$emit('cancel')"
            />
            <div class="flex items-center justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors" @click="$emit('cancel')">
                取消
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                :disabled="!name.trim()"
                @click="handleConfirm"
              >
                创建
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ cancel: []; confirm: [name: string] }>()

const name = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(() => props.visible, async (v) => {
  if (v) {
    name.value = ''
    await nextTick()
    nameInput.value?.focus()
  }
})

import { watch as watchImport } from 'vue'
const props = defineProps<{ visible: boolean }>()

function handleConfirm() {
  const trimmed = name.value.trim()
  if (trimmed) {
    emit('confirm', trimmed)
    name.value = ''
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/CreateProjectDialog.vue
git commit -m "feat: add CreateProjectDialog component"
```

---

### Task 6: Create EditProjectDialog

**Files:**
- Create: `src/components/project/EditProjectDialog.vue`

- [ ] **Step 1: Create EditProjectDialog.vue**

```vue
<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-sm bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6">
            <h3 class="font-serif font-semibold text-brand-text text-base mb-4">编辑项目</h3>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="项目名称"
              class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
              @keydown.enter="handleSave"
              @keydown.escape="$emit('cancel')"
            />
            <div class="flex items-center justify-between mt-6">
              <button
                class="px-4 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                :disabled="projectsCount <= 1"
                @click="$emit('delete')"
              >
                删除项目
              </button>
              <div class="flex items-center gap-3">
                <button class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors" @click="$emit('cancel')">
                  取消
                </button>
                <button
                  class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                  :disabled="!name.trim() || name.trim() === project?.name"
                  @click="handleSave"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Project } from '@/types'

const props = defineProps<{
  visible: boolean
  project: Project | null
  projectsCount: number
}>()

const emit = defineEmits<{
  cancel: []
  save: [name: string]
  delete: []
}>()

const name = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(() => props.visible, async (v) => {
  if (v && props.project) {
    name.value = props.project.name
    await nextTick()
    nameInput.value?.focus()
    nameInput.value?.select()
  }
})

function handleSave() {
  const trimmed = name.value.trim()
  if (trimmed && trimmed !== props.project?.name) {
    emit('save', trimmed)
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/EditProjectDialog.vue
git commit -m "feat: add EditProjectDialog component"
```

---

### Task 7: Create ProjectHome Page

**Files:**
- Create: `src/components/project/ProjectHome.vue`

- [ ] **Step 1: Create ProjectHome.vue**

```vue
<template>
  <div class="min-h-screen bg-brand-bg">
    <div class="max-w-5xl mx-auto px-8 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-serif font-semibold text-brand-text">我的小说项目</h1>
          <p class="text-sm text-brand-muted mt-1">管理你的所有小说设定</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors text-sm font-medium"
          @click="showCreateDialog = true"
        >
          <Plus :size="16" />
          新建项目
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="novelStore.projects.length === 0" class="flex flex-col items-center justify-center py-20 text-brand-muted/40 gap-4">
        <BookOpen :size="48" />
        <span class="text-sm">还没有项目，点击上方按钮创建第一个</span>
      </div>

      <!-- Cards grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard
          v-for="project in novelStore.projects"
          :key="project.id"
          :project="project"
          :doc-count="novelStore.getProjectStats(project.id).docCount"
          :projects-count="novelStore.projects.length"
          @open="openProject"
          @edit="openEditDialog"
          @delete="handleDelete"
        />
        <!-- Add card -->
        <div
          class="border-2 border-dashed border-brand-border/60 rounded-xl p-5 flex flex-col items-center justify-center min-h-[120px] text-brand-muted/50 cursor-pointer hover:border-brand-accent/40 hover:text-brand-accent transition-colors"
          @click="showCreateDialog = true"
        >
          <Plus :size="24" class="mb-2" />
          <span class="text-sm">新建项目</span>
        </div>
      </div>
    </div>

    <CreateProjectDialog
      :visible="showCreateDialog"
      @cancel="showCreateDialog = false"
      @confirm="handleCreate"
    />
    <EditProjectDialog
      :visible="showEditDialog"
      :project="editingProject"
      :projects-count="novelStore.projects.length"
      @cancel="showEditDialog = false"
      @save="handleRename"
      @delete="handleDeleteFromEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, BookOpen } from 'lucide-vue-next'
import { useNovelDataStore } from '@/stores/novelData'
import type { Project } from '@/types'
import ProjectCard from './ProjectCard.vue'
import CreateProjectDialog from './CreateProjectDialog.vue'
import EditProjectDialog from './EditProjectDialog.vue'

const router = useRouter()
const novelStore = useNovelDataStore()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingProject = ref<Project | null>(null)

// Set active project from route param on mount
onMounted(() => {
  // Router guard handles pid validation
})

function openProject(id: string) {
  novelStore.setActiveProject(id)
  const stats = novelStore.getProjectStats(id)
  if (stats.docCount > 0) {
    const flat = novelStore.flatDocs
    if (flat.length > 0) {
      router.push(`/project/${id}/doc/${flat[0].id}`)
    }
  } else {
    router.push(`/project/${id}/doc/new`)
  }
}

function handleCreate(name: string) {
  const project = novelStore.createProject(name)
  showCreateDialog.value = false
  openProject(project.id)
}

function openEditDialog(project: Project) {
  editingProject.value = project
  showEditDialog.value = true
}

function handleRename(name: string) {
  if (editingProject.value) {
    novelStore.renameProject(editingProject.value.id, name)
  }
  showEditDialog.value = false
}

function handleDelete(id: string) {
  novelStore.deleteProject(id)
}

function handleDeleteFromEdit() {
  if (editingProject.value) {
    novelStore.deleteProject(editingProject.value.id)
  }
  showEditDialog.value = false
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/project/ProjectHome.vue
git commit -m "feat: add ProjectHome page with card grid"
```

---

### Task 8: Update LeftSidebar

**Files:**
- Modify: `src/components/layout/LeftSidebar.vue`

- [ ] **Step 1: Add project name header**

Add at the top of the template, before the SearchBar section:

```vue
<!-- Project name -->
<div class="px-3 pt-3 pb-2 border-b border-brand-border/40">
  <button
    class="flex items-center gap-1.5 text-brand-text hover:text-brand-accent transition-colors group"
    @click="goToProjectHome"
  >
    <BookOpen :size="14" class="text-brand-muted/60 group-hover:text-brand-accent" />
    <span class="font-serif text-sm font-medium truncate">{{ novelStore.activeProject?.name || '项目' }}</span>
  </button>
</div>
```

- [ ] **Step 2: Add import and handler**

Add import:
```ts
import { BookOpen } from 'lucide-vue-next'
```

Add handler:
```ts
function goToProjectHome() {
  if (novelStore.activeProject) {
    router.push(`/project/${novelStore.activeProject.id}`)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/LeftSidebar.vue
git commit -m "feat: add project name header to LeftSidebar"
```

---

### Task 9: Update Breadcrumbs

**Files:**
- Modify: `src/components/center/Breadcrumbs.vue`

- [ ] **Step 1: Add project name as first breadcrumb**

Read the current Breadcrumbs.vue file first. Then add project name as the first item in the breadcrumb path.

The exact change depends on the current implementation. The key idea is:
- Import `useNovelDataStore`
- Get `activeProject` from the store
- Prepend project name to the breadcrumb path
- Make project name clickable to navigate to `/project/:pid`

- [ ] **Step 2: Commit**

```bash
git add src/components/center/Breadcrumbs.vue
git commit -m "feat: add project name to breadcrumbs"
```

---

### Task 10: Update App.vue

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Read pid from route and set active project**

Add route watcher to sync active project with URL:

```ts
import { useRoute } from 'vue-router'

const route = useRoute()

// Watch for project changes in URL
watch(() => route.params.pid, (pid) => {
  if (pid && typeof pid === 'string') {
    novelStore.setActiveProject(pid)
  }
}, { immediate: true })
```

- [ ] **Step 2: Handle invalid pid**

Add redirect logic for invalid project IDs:

```ts
watch(() => novelStore.activeProject, (project) => {
  if (!project && route.params.pid) {
    // Invalid project, redirect to first project
    const firstProject = novelStore.projects[0]
    if (firstProject) {
      router.replace(`/project/${firstProject.id}`)
    }
  }
}, { immediate: true })
```

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: sync active project with route params"
```

---

### Task 11: Final Integration Test

**Files:**
- None (verification only)

- [ ] **Step 1: Build verification**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Full regression test**

Run: `npm run dev`

Test all existing features still work:
1. Navigate to a doc → editor works
2. Right-click context menu → create/rename/delete work
3. Variant operations → create/switch variants work
4. Search → Command Palette works
5. All sidebar views (tree/recent/starred) work

- [ ] **Step 3: Test multi-project features**

1. Open project homepage → card grid shows
2. Click "新建项目" → create a project → navigates to it
3. Verify empty project shows empty state
4. Click project card → enters project
5. Left sidebar shows project name → click → returns to homepage
6. Breadcrumbs show project name → click → returns to homepage
7. Edit project → rename works
8. Delete project → works (can't delete last one)
9. Switch between projects → data is isolated

- [ ] **Step 4: Commit final fixes (if any)**

```bash
git add -A
git commit -m "fix: integration test fixes for multi-project feature"
```
