# 目录树右键菜单与内联编辑设计方案

## 概述

为小说设定库的目录树增加 VSCode 风格的右键上下文菜单，支持新建词条（子级/同级）、内联重命名、删除操作。核心理念：减少模态弹窗打断，在目录树内完成大部分 CRUD 操作。

---

## 功能清单

| 功能 | 触发方式 | 交互 |
|------|----------|------|
| 新建子词条 | 右键菜单 → 新建子词条 | TreeNode 内显示类型下拉 + 标题输入 |
| 新建同级词条 | 右键菜单 → 新建同级词条 | TreeNode 下方显示类型下拉 + 标题输入 |
| 重命名 | 右键菜单 → 重命名 | 标题区域变为 input，原地编辑 |
| 删除 | 右键菜单 → 删除 / DocHeader 垃圾桶 | 弹出 ConfirmDialog 确认 |

---

## 组件设计

### 1. ContextMenu.vue（新增）

**职责：** 通用右键菜单组件，接收坐标和菜单项列表，在指定位置渲染浮动菜单。

**接口：**

```ts
interface MenuItem {
  label: string
  icon?: Component        // lucide 图标组件
  danger?: boolean        // 红色文字（用于删除）
  divided?: boolean       // 上方显示分隔线
  action: () => void
}

// Props
interface ContextMenuProps {
  visible: boolean
  x: number               // 鼠标 X 坐标（px）
  y: number               // 鼠标 Y 坐标（px）
  items: MenuItem[]
}
```

**行为：**
- `position: fixed`，根据 x/y 定位
- 点击菜单外部（click-outside）自动关闭
- 按 Esc 自动关闭
- 超出窗口边界时自动调整位置（上移/左移）
- 菜单项 hover 高亮，点击执行 action 后关闭
- 过渡动画：fade + scale（与 CommandPalette 一致）

**视觉：**
- 圆角 8px，品牌阴影 `shadow-brand-lg`
- 背景 `bg-brand-card-solid`，边框 `border-brand-border/60`
- 内边距 4px，菜单项 padding 6px 10px
- danger 项文字 `text-red-500`
- 分隔线 margin 4px 8px，颜色 `border-brand-border/40`

### 2. TreeNode.vue（修改）

**新增状态：**

```ts
type TreeNodeMode = 'idle' | 'creating' | 'creating-sibling' | 'renaming'
```

每个 TreeNode 实例维护自己的 `mode` 状态。

**右键菜单触发：**
- 在节点行上绑定 `@contextmenu.prevent`
- 记录鼠标坐标，打开 ContextMenu
- 菜单项根据节点类型动态生成

**菜单项配置：**

```ts
[
  { label: '新建子词条', icon: FilePlus, action: () => mode = 'creating' },
  { label: '新建同级词条', icon: FilePlus, action: () => mode = 'creating-sibling' },
  { label: '重命名', icon: Pencil, divided: true, action: () => mode = 'renaming' },
  { label: '删除', icon: Trash2, danger: true, action: () => emit('delete', node.id) },
]
```

**内联创建表单（creating / creating-sibling）：**
- 类型下拉：继承父节点类型作为默认值，可切换
- 标题输入：自动聚焦，Enter 提交，Esc 取消
- `creating`：表单插入为当前节点的子节点位置
- `creating-sibling`：表单插入为当前节点的同级之后位置
- 提交后 emit 对应事件，mode 回到 idle

**内联重命名（renaming）：**
- 标题 `<span>` 变为 `<input>`，预填当前标题
- 选中全部文本，方便覆盖输入
- Enter 提交修改，Esc 取消
- 输入为空或与原标题相同时禁止提交

**新增 emit 事件：**

```ts
defineEmits<{
  select: [id: string]
  createChild: [{ parentId: string; title: string; type: DocNode['type'] }]
  createSibling: [{ parentId: string | null; title: string; type: DocNode['type']; afterId: string }]
  rename: [{ id: string; newTitle: string }]
  delete: [id: string]
  selectVariant: [{ docId: string; variantId: string }]
  createVariant: [docId: string]
}>()
```

### 3. TreeView.vue（修改）

- 透传新增的 `createSibling`、`rename`、`delete` 事件到父组件
- 无其他逻辑变更

### 4. LeftSidebar.vue（修改）

**新增事件处理：**

```ts
function handleCreateSibling({ parentId, title, type, afterId }) {
  const newNode = novelStore.addDoc({ title, type, parentId, afterId })
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id))
}

function handleRename({ id, newTitle }) {
  novelStore.renameDoc(id, newTitle)
}

function handleDelete(id: string) {
  deleteTargetId.value = id
}
```

**删除处理方案：** 在 LeftSidebar 内部维护一个 `deleteTargetId` 状态，右键删除时设置它，然后显示 ConfirmDialog。确认后调用 `novelStore.deleteDoc()`。这样删除逻辑集中在 LeftSidebar，不需要跨组件传递。

---

## Store 变更

### 新增方法

| 方法 | 签名 | 作用 |
|------|------|------|
| `renameDoc` | `(id: string, newTitle: string) => void` | 修改节点标题，同步更新 updatedAt |

### 修改方法

| 方法 | 变更 | 作用 |
|------|------|------|
| `addDoc` | 新增可选参数 `afterId?: string` | 指定插入位置（afterId 之后），不指定则追加到末尾 |

### 实现

```ts
function renameDoc(id: string, newTitle: string) {
  const node = findNode(docTree.value, id)
  if (node) {
    node.title = newTitle
    node.updatedAt = Date.now()
  }
}
```

---

## 保留不变的部分

- 左栏底部"新建"按钮 → 调用现有 CreateDocModal
- DocHeader 删除按钮 → 保留作为第二个删除入口
- CreateDocModal 向导 → 保留作为完整向导的备用入口
- ConfirmDialog 确认弹窗 → 复用

---

## 边界情况

1. **根节点右键**：根节点没有"新建同级词条"选项（不能在根级创建同级）
2. **chronicle 节点右键**：chronicle 类型节点不显示"新建子词条"（编年大事记不支持子词条）
3. **变体节点右键**：变体节点不显示右键菜单（变体操作通过变体列表底部按钮）
4. **快速连续创建**：创建完成后自动聚焦到新节点，可继续输入下一个标题
5. **空标题提交**：Enter 时不处理空标题，保持 creating 状态

---

## 实施范围

### 包含
- ContextMenu.vue 组件
- TreeNode 右键菜单 + 内联创建 + 内联重命名
- TreeView 事件透传
- LeftSidebar 事件处理 + 删除确认
- Store renameDoc 方法

### 不包含
- 拖拽排序节点
- 批量选择/删除
- 撤销/重做
- 键盘快捷键导航（如方向键移动焦点）
