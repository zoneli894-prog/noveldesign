# 平行词条（Parallel Era Entries）设计方案

## 概述

为小说设定库增加"平行词条"功能——支持同一个词条拥有多个时间线版本（变体），每个变体拥有独立的内容和信息卡。适用于角色随剧情成长、地点随时间变迁、势力兴衰等场景。

**核心理念**：主词条 = 词条本体，变体 = 时间线快照。所有变体可独立编辑。

---

## 数据模型

### 新增类型：`DocVariant`

```ts
interface DocVariant {
  id: string                    // 变体唯一 ID
  title: string                 // 变体名称，如"天历元年~天历十二年"
  startYear: string             // 起始纪年，如"天历元年"
  endYear: string               // 结束纪年（可选，空表示"至今"）
  content: string               // HTML 正文内容
  infobox: InfoboxSnapshot[]    // 变体独立的信息卡快照
  tags: string[]                // 变体标签
  wordCount: number
  updatedAt: number
}
```

### 修改类型：`DocNode`

```ts
interface DocNode {
  // ... 现有字段不变
  children: DocNode[]           // 层级子词条（不变）
  variants: DocVariant[]        // 新增：时间线变体数组
}
```

### 设计要点

- `children` 和 `variants` 是两个独立概念：
  - `children` = 层级子词条（如"人物志" → "凌夜寒"）
  - `variants` = 同一词条的时间线版本（如"凌夜寒" → "天历元年~天历十二年"、"天历十二年~天历十五年"）
- 变体按 `startYear` 升序排列（时间顺序）
- 普通词条 `variants` 为空数组 `[]`
- 转换为平行词条时，原内容成为第一个变体

### 数据迁移

现有种子数据无需修改。转换逻辑在运行时处理：
- `char-mc`（凌夜寒）已有 4 个 infobox 快照（天历元年/十二年/十五年/十八年），可转换为 4 个变体，每个变体对应一个纪年区间
- 其他词条保持普通模式（`variants: []`）

---

## UI 设计

### 1. 目录树（TreeView / TreeNode）

**平行词条节点**：
- 类型图标旁显示分支图标（GitBranch 或 Layers），标识该词条有变体
- 点击展开/折叠变体列表（默认折叠）
- 变体作为子节点显示，缩进一层
- 每个变体显示：变体名称 + 时间范围（如"天历元年~天历十二年"）
- 变体按 `startYear` 升序排列

**视觉区分**：
- 主词条：正常样式
- 变体节点：稍小字号 + 时间范围灰色辅助文字 + 左侧竖线装饰

### 2. 编辑器（CenterPanel / DocHeader）

**标题显示**：
- 普通词条：显示原标题（如"凌夜寒"）
- 变体词条：显示 "主名（时间范围）"（如"凌夜寒（天历元年 ~ 天历十二年）"）

**变体切换**：
- DocHeader 下方显示变体标签栏（Tab 样式）
- 标签：主词条 + 各变体名称
- 点击切换当前编辑的变体
- 当前变体高亮显示

**编辑权限**：
- 所有变体均可独立编辑
- 切换变体时保存当前变体内容，加载目标变体内容

### 3. 信息卡（Infobox）

- 查看变体时，信息卡显示该变体独立的 `infobox` 数据
- 变体的信息卡编辑逻辑与普通词条一致
- 主词条本身不显示信息卡（内容已分散到各变体）

### 4. 转换操作

**从普通词条转换**：
- DocHeader 右侧加"转为平行词条"按钮（GitBranch 图标）
- 点击后弹出转换对话框：
  - 输入变体名称（默认"初始版本"或留空自动生成）
  - 输入起始纪年（必填）
  - 输入结束纪年（可选）
- 确认后：原内容成为第一个变体，主词条 content 清空或保留摘要

**从平行词条恢复**：
- 如果只有一个变体，可选择"恢复为普通词条"
- 删除所有变体时自动恢复为普通词条

### 5. 新建变体

- 平行词条的变体列表底部显示"+ 新建变体"按钮
- 点击后弹出对话框：输入起始纪年 + 结束纪年（可选）
- 新变体初始内容为空

---

## Store 方法

### 新增方法

| 方法 | 签名 | 作用 |
|------|------|------|
| `convertToParallel` | `(docId: string, variant: Omit<DocVariant, 'id'>) => void` | 将普通词条转为平行词条，原内容成为第一个变体 |
| `convertFromParallel` | `(docId: string) => void` | 将平行词条恢复为普通词条（仅当变体数 ≤ 1） |
| `addVariant` | `(docId: string, variant: Omit<DocVariant, 'id'>) => DocVariant` | 向平行词条添加新变体 |
| `deleteVariant` | `(docId: string, variantId: string) => void` | 删除变体（最后一个变体时自动恢复为普通词条） |
| `updateVariantContent` | `(docId: string, variantId: string, html: string) => void` | 更新变体内容 |
| `updateVariantInfobox` | `(docId: string, variantId: string, snapshots: InfoboxSnapshot[]) => void` | 更新变体信息卡 |
| `getActiveVariant` | `(docId: string, variantId: string) => DocVariant \| null` | 获取当前变体 |
| `sortVariants` | `(docId: string) => void` | 按 startYear 升序排列变体 |

### 修改方法

- `addDoc`：新增节点时初始化 `variants: []`
- `deleteDoc`：递归删除时清理变体数据
- `buildMetaMap`：变体的 backlinks 也需计入
- `updateContent`：需要区分主词条内容和变体内容

### 持久化

- `variants` 数组需加入 persist 的 `pick` 列表
- 变体的 `content` 和 `infobox` 需持久化

---

## Wiki-Link 处理

**不做时空自动匹配**。Wiki-Link 行为保持不变：
- 链接始终指向主词条（docId）
- 变体内容中的 Wiki-Link 也指向主词条
- 用户手动在变体中添加指向其他词条的链接

---

## 边界情况

1. **空变体**：新建变体时内容为空，编辑器显示 placeholder
2. **变体排序**：`startYear` 相同时按 `endYear` 排序，仍相同则按创建顺序
3. **删除最后一个变体**：自动恢复为普通词条
4. **导出**：导出时包含所有变体内容，按时间顺序排列
5. **搜索**：变体内容也纳入搜索索引
6. **反向链接**：变体中的 Wiki-Link 也计入反向链接

---

## 实施范围

### 包含
- 数据模型扩展（DocNode + DocVariant）
- 目录树 UI（变体展开/折叠、时间范围显示）
- 编辑器变体切换（Tab 栏、独立内容）
- 信息卡变体绑定
- 转换操作（普通 ↔ 平行）
- 新建/删除变体
- Store 方法和持久化
- 种子数据迁移（char-mc 转为平行词条示例）

### 不包含
- Wiki-Link 时空自动匹配
- 变体间的差异对比（diff view）
- 变体的历史版本（version history）
- 拖拽排序变体
