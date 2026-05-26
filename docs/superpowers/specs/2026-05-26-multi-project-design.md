# 多项目管理设计方案

## 概述

将小说设定库从单项目架构升级为多项目架构，支持每本小说作为独立项目管理。每个项目拥有独立的文档树、时间线、信息卡数据，项目间完全隔离。

**核心理念：** 项目 = 数据容器，切换项目 = 切换数据上下文。

---

## 数据模型

### 新增类型：`Project`

```ts
interface Project {
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

### Store 结构变更

```ts
// Before: 全局数据
const docTree = ref<DocNode[]>(seedDocs)
const docContent = ref<Record<string, string>>({ ...seedContent })
const infoboxData = ref<Record<string, InfoboxSnapshot[]>>({ ...seedInfobox })
const timelineEvents = ref<TimelineEvent[]>([...seedTimeline])

// After: 项目化数据
const projects = ref<Project[]>([])
const activeProjectId = ref<string>('')

// 活跃项目 computed
const activeProject = computed(() =>
  projects.value.find(p => p.id === activeProjectId.value) || null
)

// 所有现有 computed 基于 activeProject
const docTree = computed(() => activeProject.value?.docTree || [])
const docContent = computed(() => activeProject.value?.docContent || {})
const infoboxData = computed(() => activeProject.value?.infoboxData || {})
const timelineEvents = computed(() => activeProject.value?.timelineEvents || [])
```

### 数据迁移

- 现有种子数据包装为第一个项目 `default`（名称"苍穹志"）
- localStorage 键从 `noveldesign-data` 变为 `noveldesign-projects`
- 首次加载时检测旧格式，自动迁移

### 持久化

```ts
persist: {
  key: 'noveldesign-projects',
  pick: ['projects', 'activeProjectId'],
}
```

---

## 路由结构

```ts
const routes = [
  { path: '/', redirect: '/project/default' },
  { path: '/project/:pid', component: ProjectHome },
  { path: '/project/:pid/doc/:docId', component: App },
]
```

**导航流程：**
1. 打开应用 → 检查 localStorage → 有项目？重定向到第一个项目首页
2. 项目首页点击卡片 → push(`/project/:pid/doc/:第一个词条`)
3. 项目内 → 左栏顶部项目名 click → push(`/project/:pid`)
4. 面包屑第一级 click → push(`/project/:pid`)

---

## UI 设计

### 1. 项目首页（ProjectHome.vue）

**路由：** `/project/:pid`

**布局：**
- 顶部：标题 "我的小说项目" + "新建项目" 按钮
- 主体：卡片网格（3列），每张卡片显示项目名称、词条数、最后修改时间
- 卡片右上角 `⋯` 按钮：编辑项目名、删除项目
- 虚线卡片：点击创建新项目

**空状态：** 无项目时显示引导创建

### 2. 项目卡片（ProjectCard.vue）

- 项目图标（彩色圆形背景 + 书本 emoji）
- 项目名称（粗体）
- 词条数量（灰色小字）
- 最后修改时间（相对时间）
- 操作按钮（⋯）

### 3. 新建项目弹窗（CreateProjectDialog.vue）

- 输入项目名称
- 确认后创建空项目，自动进入

### 4. 编辑项目弹窗（EditProjectDialog.vue）

- 修改项目名称
- 删除项目（需确认）

### 5. 左栏导航变更

- 左栏顶部显示当前项目名称（可点击返回项目首页）
- 项目名称样式：font-serif，品牌色

### 6. 面包屑变更

- 第一级显示项目名称（可点击返回）
- 路径：项目名 > 文档路径

---

## Store 方法

### 新增方法

| 方法 | 签名 | 作用 |
|------|------|------|
| `createProject` | `(name: string) => Project` | 创建新空项目 |
| `deleteProject` | `(id: string) => void` | 删除项目 |
| `renameProject` | `(id: string, name: string) => void` | 重命名项目 |
| `setActiveProject` | `(id: string) => void` | 切换活跃项目 |
| `getProjectStats` | `(id: string) => { docCount: number; updatedAt: number }` | 获取项目统计 |

### 修改方法

所有现有数据操作方法改为操作 `activeProject` 的数据。由于 `docTree` 等变为 computed，需要直接修改 `activeProject.value` 上的数据：

```ts
// 示例：addDoc 改造
function addDoc(params: { ... }) {
  const project = activeProject.value
  if (!project) return null
  
  // 原有逻辑不变，但 target 数组来自 project.docTree
  const parent = params.parentId ? findNode(project.docTree, params.parentId) : null
  const target = parent?.children ?? project.docTree
  // ... 创建节点并 push
}
```

同理，`deleteDoc`、`updateContent`、`renameDoc` 等方法都需要将 `docTree.value` 替换为 `activeProject.value?.docTree`。

---

## 边界情况

1. **删除最后一个项目**：不允许删除（删除按钮禁用）
2. **切换项目时的未保存数据**：当前项目数据已实时持久化到 Pinia persist，无丢失风险
3. **URL 中的 pid 无效**：重定向到第一个项目
4. **新项目无词条**：显示空状态引导
5. **项目名称重复**：允许重复（项目靠 id 区分）

---

## 实施范围

### 包含
- 数据模型扩展（Project 类型）
- Store 重构（项目化数据）
- 路由更新（两级路由）
- 项目首页（卡片网格）
- 项目卡片组件
- 新建/编辑项目弹窗
- 左栏项目名显示
- 面包屑项目名
- 数据迁移（旧格式 → 新格式）

### 不包含
- 项目模板（预设词条结构）
- 跨项目复制/移动词条
- 项目共享/协作
- 项目分类/标签
