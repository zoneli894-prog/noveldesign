# 持久化 + Word 导出设计方案

## 背景

当前小说设定库的所有数据（文档树、正文、信息卡、时间轴）均存储在 `seed.ts` 中，以 Pinia ref 初始化到内存。用户在 UI 中的编辑（新建/删除词条、编辑正文、修改信息卡）仅存在于内存，刷新页面即丢失。

**目标**：
1. 编辑结果自动持久化，刷新/关闭浏览器后不丢失
2. 支持将设定内容导出为 Word (.docx) 文档

---

## 一、持久化层

### 方案

使用 `pinia-plugin-persistedstate`，Pinia 官方推荐的持久化插件。声明式配置，自动同步 store state 到 localStorage。

### 存储策略

**localStorage key**: `noveldesign-data`

**存储内容**（仅可变数据）：
| 字段 | 类型 | 说明 |
|------|------|------|
| `docTree` | `DocNode[]` | 文档树结构（含新建/删除后的状态） |
| `docContent` | `Record<string, string>` | 词条 HTML 正文 |
| `infoboxData` | `Record<string, InfoboxSnapshot[]>` | 信息卡快照 |
| `timelineEvents` | `TimelineEvent[]` | 时间轴事件 |

**不存储**：`activeDocId`（每次打开首页重置为 `char-mc`）

### 初始化逻辑

- 首次访问（localStorage 无数据）：使用 `seed.ts` 种子数据
- 非首次访问（localStorage 有数据）：`pinia-plugin-persistedstate` 自动从 localStorage 读取并覆盖 ref
- 每次 ref 变化时自动写入 localStorage（由插件 watch 触发）

### 新增依赖

```bash
npm install pinia-plugin-persistedstate
```

### 代码变更

**`src/main.ts`**：
```ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

**`src/stores/novelData.ts`**：
- `defineStore` 添加第三个参数 persist 配置：
  ```ts
  export const useNovelDataStore = defineStore('novelData', () => {
    // ... 不变
  }, {
    persist: {
      key: 'noveldesign-data',
      pick: ['docTree', 'docContent', 'infoboxData', 'timelineEvents'],
    },
  })
  ```
- store 内部逻辑不变

### 重置功能

新增 `resetToDefaults()` 方法：
```ts
function resetToDefaults() {
  localStorage.removeItem('noveldesign-data')
  window.location.reload()
}
```

UI 入口：CommandPalette 中添加"恢复默认数据"操作项，点击后弹出确认对话框。

---

## 二、Word 导出

### 方案

使用 `docx` 库在客户端构建 .docx 文档，使用 `file-saver` 触发浏览器下载。

### 新增依赖

```bash
npm install docx file-saver
npm install -D @types/file-saver
```

### HTML → docx 转换器

**新建 `src/utils/html-to-docx.ts`**

使用 `DOMParser` 将 TipTap 输出的 HTML 解析为 DOM 树，递归遍历生成 docx 元素。

**标签映射表**：

| HTML 标签 | docx 元素 | 样式 |
|-----------|-----------|------|
| `<h1>` | `Paragraph` + `HeadingLevel.HEADING_1` | 22pt, 加粗 |
| `<h2>` | `Paragraph` + `HeadingLevel.HEADING_2` | 16pt, 加粗 |
| `<h3>` | `Paragraph` + `HeadingLevel.HEADING_3` | 13pt, 加粗 |
| `<p>` | `Paragraph` | 12pt, 宋体 |
| `<strong>` | `TextRun` + `bold: true` | 加粗 |
| `<em>` | `TextRun` + `italics: true` | 斜体 |
| `<a>` | `ExternalHyperlink` | 蓝色，显示链接文本 |
| `<ul>/<ol>` | 嵌套 `Paragraph` + 缩进 | |
| `<li>` | `Paragraph` + bullet/number | |
| `<blockquote>` | `Paragraph` + 左缩进 + 灰色 | |
| `<pre><code>` | `Paragraph` + 等宽字体 | |
| `<br>` | 段落内换行 | |
| `[[wiki-link]]` 的 `<a data-wiki-link>` | 纯 `TextRun`（提取文本，去掉链接标签） | |
| 其他内联标签 | `TextRun`（提取 textContent） | |

**转换流程**：
1. `new DOMParser().parseFromString(html, 'text/html')` 解析
2. 递归遍历 `body.childNodes`，按 `nodeName` 分发处理
3. 内联元素（strong/em/a/span 等）合并为单个 `TextRun`
4. 块级元素（p/h1-h3/ul/ol/blockquote/pre）生成 `Paragraph`
5. 返回 `docx` 的 `Section` children 数组

### 导出函数

**新建 `src/utils/export-docx.ts`**

```ts
import { exportSingleDoc, exportAllDocs } from '@/utils/export-docx'

// 单词条导出
exportSingleDoc(doc: DocNode, html: string): void
// → 生成 {title}.docx 并下载

// 全部导出
exportAllDocs(docs: DocNode[], content: Record<string, string>): void
// → 生成 {小说名}_设定文档_{日期}.docx 并下载
```

**全部导出文档结构**：

```
[标题页]
标题：「小说设定文档」
副标题：「导出时间：2026-05-21」
分隔线

[目录]
按树形层级缩进列出所有词条标题（纯文本）

[正文]
按 docTree 递归遍历，每个词条：
  - 标题层级由树深度决定（depth 0 → Heading1，depth 1 → Heading2，depth 2+ → Heading3）
  - 词条标题作为标题文本
  - 正文 HTML 转换为 docx 段落
  - 同级词条之间插入分页符
```

**单词条导出**：单个 Section，Heading1 标题 + 正文段落。

### 文件命名

- 全部导出：`小说设定文档_2026-05-21.docx`
- 单词条导出：`{词条标题}.docx`

### UI 入口

| 位置 | 组件 | 触发方式 | 导出范围 |
|------|------|----------|----------|
| DocHeader 标题右侧 | `DocHeader.vue` | 导出按钮（Download 图标） | 当前词条 |
| CommandPalette 空查询 | `CommandPalette.vue` | 操作项"导出全部设定" | 全部词条 |
| LeftSidebar 底部栏 | `LeftSidebar.vue` | 导出按钮（Download 图标） | 全部词条 |

---

## 三、文件变更清单

### 新增文件
| 文件 | 说明 |
|------|------|
| `src/utils/html-to-docx.ts` | HTML → docx 转换器 |
| `src/utils/export-docx.ts` | 导出逻辑封装 |
| `docs/superpowers/specs/2026-05-21-persistence-and-export-design.md` | 本设计文档 |

### 修改文件
| 文件 | 变更 |
|------|------|
| `package.json` | 新增 pinia-plugin-persistedstate, docx, file-saver 依赖 |
| `src/main.ts` | 注册 pinia-plugin-persistedstate |
| `src/stores/novelData.ts` | 添加 persist 配置 + resetToDefaults 方法 |
| `src/components/common/CommandPalette.vue` | 添加"恢复默认数据"和"导出全部设定"操作项 |
| `src/components/center/DocHeader.vue` | 添加导出按钮 |
| `src/components/layout/LeftSidebar.vue` | 添加导出按钮 |

### 不变的文件
- `src/data/seed.ts` — 种子数据保持不变，作为 localStorage 为空时的默认值
- 所有现有编辑功能（新建/删除/信息卡编辑） — store 接口不变

---

## 四、验证方式

1. `npm install` 安装新依赖
2. `npm run build` 确保无构建错误
3. `npm run dev` 启动开发服务器
4. 测试持久化：
   - 新建一个词条 → 刷新页面 → 词条仍在
   - 编辑正文 → 刷新 → 内容保留
   - 删除词条 → 刷新 → 词条已删
   - CommandPalette 点"恢复默认数据" → 刷新 → 回到种子数据
5. 测试 Word 导出：
   - DocHeader 点导出 → 下载 {标题}.docx → 打开验证格式
   - CommandPalette 点"导出全部设定" → 下载完整文档 → 打开验证层级结构
6. 测试边界情况：
   - 空词条导出 → 正常生成（仅标题）
   - localStorage 满/禁用 → seed.ts 数据正常加载
