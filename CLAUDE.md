# 小说设定库 — 项目文档

## 项目概述

一个为读者量身定制的"高效率考据型"小说整理平台前端。核心理念：结构化知识库 + 沉浸式阅读美学，定位为"数字档案馆"。数据结构以时间为 Z 轴，支持属性随章节变化的快照系统和编年大事记时间轴。

运行命令：`npm run dev` (开发) / `npm run build` (生产构建)

GitHub 仓库：`noveldesign`，部署路径 `/noveldesign/`（GitHub Pages）

---

## 设计规范

### 色彩体系
| 用途 | 色值 | CSS 变量 |
|------|------|----------|
| 背景色 | `#F7F7F5` (带极弱暖意的高级灰白) | `--color-brand-bg` |
| 主文本 | `#2C2C2C` (深碳灰) | `--color-brand-text` |
| 辅助文本 | `#8A8A8A` | `--color-brand-muted` |
| 强调/链接 | `#3B6B5E` (远山黛/墨绿) | `--color-brand-accent` |
| 强调浅色 | `#e8f0ed` | `--color-brand-accent-light` |
| 边框 | `#e5e5e3` | `--color-brand-border` |
| 卡片背景 | `rgba(255, 255, 255, 0.6)` | `--color-brand-card` |
| 暖灰背景 | `#F0EDE8` | `--color-brand-bg-warm` |

额外设计 token：阴影系统（`shadow-brand-sm/md/lg/xl`）、过渡曲线（`transition-brand` 200ms / `transition-brand-slow` 350ms）

### 字体排印
- **标题/模块抬头：** Noto Serif SC (思源宋体) — `font-serif`，赋予书籍庄重感
- **正文/界面UI：** Noto Sans SC (思源黑体) — `font-sans`，保障小字号检索效率
- **行距：** `line-height: 1.7`，段间距 `1.5em`
- **原则：** "内容为王，减少视觉噪音"，大面积留白替代实线边框

### 布局架构
经典 **"左-中-右" 三栏弹性布局** (Flexbox)：
- 左栏 ~250px：导航与全局检索
- 中栏 flex-1，最大阅读宽度 800px：沉浸式阅读/编辑
- 右栏 ~300px：属性与图谱面板，可折叠

### 视觉细节
- 自定义极细滚动条（5px，半透明圆角）
- 纸张纹理背景（SVG noise，opacity 0.025）
- 内容入场动画（staggered fade-up，0.4s）
- 侧栏滑入/滑出动画、命令面板缩放动画
- focus-visible 使用品牌强调色边框
- 文本选中高亮使用 `--color-brand-accent-light`

---

## 技术栈

- **框架：** Vue 3 (Composition API) + Vite 8 + TypeScript 6.0
- **样式：** Tailwind CSS v4（通过 `@tailwindcss/vite` 插件集成）
- **状态管理：** Pinia（Composition API 风格 store）
- **路由：** Vue Router 5（Hash 模式，动态路由 `/project/:pid/doc/:docId`）
- **编辑器：** TipTap v3（ProseMirror 封装）
- **图谱：** ECharts 6 + vue-echarts
- **搜索：** Fuse.js（模糊搜索，threshold 0.3）
- **弹窗定位：** tippy.js（TipTap suggestion 配套）
- **图标：** lucide-vue-next
- **构建：** Vite 8（rolldown），生产构建约 1s

---

## 文件夹结构

```
d:/小说设定网站/
├── index.html                          # 入口 HTML，加载 Google Fonts (Noto Serif/Sans SC)
├── vite.config.ts                      # Vite 配置：vue/tailwindcss 插件、@ 路径别名、base: /noveldesign/
├── tsconfig.json                       # TS 项目引用配置
├── tsconfig.app.json                   # TS 应用配置：@/* → src/* 路径映射
├── tsconfig.node.json                  # TS Node 配置：vite.config.ts
├── package.json                        # 依赖清单
│
├── .github/workflows/deploy.yml        # GitHub Actions：push main → build → deploy to Pages
│
├── src/
│   ├── main.ts                         # 应用入口：创建 Vue app，挂载 Pinia + Router
│   ├── App.vue                         # 根组件：三栏 flex 布局 + 路由参数监听 → setActiveDoc
│   ├── env.d.ts                        # Vite 类型声明 + .vue 模块声明
│   │
│   ├── assets/
│   │   ├── styles/main.css             # Tailwind v4 入口 + @theme 品牌变量 + 全局样式 + 动画
│   │   ├── icons/types.ts              # 图标类型定义
│   │   └── illustrations/              # 空状态 SVG 插画组件
│   │       ├── EmptyCollection.vue     # 空收藏状态
│   │       ├── EmptyGraph.vue          # 空图谱状态
│   │       ├── EmptyReading.vue        # 空阅读状态
│   │       └── EmptySearch.vue         # 空搜索结果状态
│   │
│   ├── types/index.ts                  # 类型定义
│   │   ├── DocNode                     # 文档树节点（id, title, type, children, tags, wordCount, starred, updatedAt）
│   │   ├── WikiLink                    # 双向链接（targetId, targetTitle）
│   │   ├── InfoboxField                # 信息卡字段（key, value, type: text/link/list）
│   │   ├── InfoboxSnapshot             # 快照（chapter + fields[]），支持属性随章节变化
│   │   ├── DocMeta                     # 文档元数据（id, title, type, tags, infobox: Snapshot[], backlinks, wordCount）
│   │   ├── TimelineEvent               # 时间线事件（id, date, dateSort, title, description, relatedDocs, category）
│   │   └── ViewMode                    # 'tree' | 'recent' | 'starred'
│   │
│   ├── data/seed.ts                    # 种子数据
│   │   ├── seedDocs                    # 文档树：13 个节点（含 chronicle 大事记）
│   │   ├── seedContent                 # HTML 内容：各词条正文，含 wiki-link 交叉引用
│   │   ├── seedInfobox                 # 快照式信息卡：char-mc 有 3 个卷章快照，其他单快照
│   │   ├── seedTimeline                # 8 个编年大事（上古纪→天历元年）
│   │   ├── typeLabels                  # 类型中文标签映射
│   │   └── typeColors                  # 类型颜色映射
│   │
│   ├── router/index.ts                 # Vue Router：Hash 模式
│   │   ├── / → 重定向 /project/default/doc/char-mc
│   │   └── /project/:pid/doc/:docId → App.vue
│   │
│   ├── stores/
│   │   ├── ui.ts                       # UI 状态：leftSidebarOpen, rightSidebarOpen, splitViewOpen,
│   │   │                               #   nightMode, viewMode, commandPaletteOpen
│   │   └── novelData.ts                # 数据状态：docTree, docContent, activeDocId, timelineEvents
│   │                                   #   计算属性：flatDocs, docMetaMap, activeDoc/Content/Meta,
│   │                                   #   recentDocs, starredDocs, sortedTimelineEvents
│   │                                   #   方法：setActiveDoc, updateContent, toggleStar, searchDocs,
│   │                                   #   findDocPath, getInfoboxChapters, getInfoboxFieldsForChapter,
│   │                                   #   getFieldHistory
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LeftSidebar.vue         # 左栏：SearchBar + ViewSwitcher + 目录/近期/收藏视图
│   │   │   ├── CenterPanel.vue         # 中栏：Breadcrumbs + DocHeader + WikiEditor/TimelineView + Backlinks
│   │   │   └── RightSidebar.vue        # 右栏：Infobox + GraphPreview（可折叠）
│   │   │
│   │   ├── sidebar/
│   │   │   ├── SearchBar.vue           # 搜索框，显示 Ctrl+K 提示，点击打开命令面板
│   │   │   ├── ViewSwitcher.vue        # 三个视图切换按钮：目录/近期/收藏（图标 + 文字）
│   │   │   ├── TreeView.vue            # 树状目录容器
│   │   │   ├── TreeNode.vue            # 递归树节点：可折叠、类型图标、悬停显示字数
│   │   │   ├── RecentView.vue          # 近期修改列表，相对时间显示（刚刚/N分钟前/N小时前/N天前）
│   │   │   └── StarredView.vue         # 星标收藏列表
│   │   │
│   │   ├── editor/
│   │   │   ├── WikiEditor.vue          # TipTap 编辑器核心：StarterKit + Placeholder + CharacterCount
│   │   │   │                           #   + WikiLink 扩展（[[ 触发建议）+ SlashCommand 扩展（/ 触发命令）
│   │   │   │                           #   无工具栏，纯内容编辑区，wiki-link 悬停预览 + 点击导航
│   │   │   ├── WikiLinkSuggest.vue     # [[ 触发的词条下拉候选列表（TypeIcon + 键盘导航）
│   │   │   ├── SlashCommandList.vue    # / 触发的命令下拉列表（图标 + 标题 + 键盘导航）
│   │   │   └── WikiLinkPreview.vue     # wiki-link 悬停预览卡片（Teleport 浮窗，类型标签 + 摘要）
│   │   │
│   │   ├── center/
│   │   │   ├── Breadcrumbs.vue         # 面包屑导航：显示从根到当前词条的路径，可点击导航
│   │   │   ├── DocHeader.vue           # 文档标题（font-serif 大号）+ 类型标签 + tags + 收藏星标
│   │   │   ├── Backlinks.vue           # 反向链接列表：哪些词条引用了当前页面
│   │   │   ├── TimelineView.vue        # 垂直时间轴：事件卡片（分类标签 + 日期 + 标题 + 描述 + 关联词条）
│   │   │   └── SplitView.vue           # 分屏对照组件（左50%/右50%，X 关闭按钮）
│   │   │
│   │   ├── right/
│   │   │   ├── Infobox.vue             # 结构化属性信息卡：章节快照选择器 + 键值对 + 字段历史展开
│   │   │   └── GraphPreview.vue        # ECharts 力导向关系图谱预览（点击节点导航）
│   │   │
│   │   └── common/
│   │       ├── CommandPalette.vue      # Ctrl+K 命令面板：模糊搜索 + 键盘导航 + 底部快捷键提示
│   │       ├── ThemeToggle.vue         # 夜间模式切换按钮（lucide Sun/Moon 图标）
│   │       └── TypeIcon.vue            # 词条类型图标组件（lucide 图标，按类型映射）
│   │
│   └── extensions/
│       ├── wiki-link/
│       │   └── WikiLinkExtension.ts    # TipTap Mark 扩展：wiki-link 渲染 + Suggestion 插件集成
│       └── slash-command/
│           └── SlashCommandExtension.ts # TipTap Extension：/ 命令 + Suggestion 插件集成
```

---

## 种子数据

### 文档树（13 个节点）

| ID | 标题 | 类型 | 父级 | 说明 |
|----|------|------|------|------|
| `chronicle` | 编年大事记 | chronicle | null | 特殊词条：渲染时间轴视图 |
| `world` | 世界观总览 | lore | null | |
| `map` | 地图与地理 | lore | world | |
| `loc-north` | 北境·寒渊山脉 | location | map | |
| `loc-capital` | 中州·天枢城 | location | map | |
| `chars` | 人物志 | lore | null | |
| `char-mc` | 凌夜寒 | character | chars | 3 卷快照（身份/境界随卷变化） |
| `char-villain` | 殷无殇 | character | chars | |
| `factions` | 势力与门派 | lore | null | |
| `faction-sword` | 天剑宗 | faction | factions | |
| `items` | 法宝与灵物 | lore | null | |
| `item-sword` | 霜华剑 | item | items | |
| `chapters` | 章节纲要 | lore | null | |
| `ch-1` | 第一章·寒渊初醒 | chapter | chapters | |

每个词条 HTML 内容中包含 `[[wiki-links]]`（以 `<a data-wiki-link data-target-id="...">` 渲染），形成双向链接网络。

### 类型颜色映射
- character: `#E8A87C` (暖橙)
- faction: `#85CDCA` (青绿)
- location: `#D5A6BD` (粉紫)
- item: `#C9B1FF` (淡紫)
- lore: `#87CEEB` (天蓝)
- chapter: `#FFD700` (金黄)
- chronicle: `#E07A5F` (陶土红)

### 信息卡快照
凌夜寒（char-mc）有 3 个快照：
- 第一卷：炼气期、天剑宗外门弟子
- 第二卷：筑基后期、天剑宗内门弟子
- 第三卷：金丹中期、魔道散修

其他词条均为单快照（chapter: '全部'）。

### 编年大事记（8 个事件）
1. 天地灵气复苏（上古纪）— discovery
2. 上古冰帝陨落（上古纪）— catastrophe
3. 天枢城建立（三千年前）— political
4. 天剑宗崛起（千年前）— political
5. 天枢城外大战（百年前）— war
6. 凌夜寒寒渊初醒（天历元年·开篇）— personal
7. 殷无殇出关（天历元年）— personal
8. 凌夜寒突破金丹（天历元年·第一卷末）— personal

---

## 已完成的功能

- [x] Vite + Vue 3 + TypeScript 项目脚手架
- [x] Tailwind CSS v4 集成（@tailwindcss/vite 插件）
- [x] 三栏布局（左导航 / 中编辑器 / 右属性栏）
- [x] 树状目录：递归折叠展开，悬停显示字数
- [x] 近期修改视图（按时间排序，相对时间显示）
- [x] 星标收藏视图
- [x] 视图切换器（目录/近期/收藏）
- [x] 面包屑导航（从根到当前词条的路径）
- [x] 文档头部：大号宋体标题、类型标签、标签、收藏星标
- [x] TipTap WYSIWYG 编辑器（无工具栏，纯内容编辑区）
- [x] `/` 斜杠命令菜单（标题1-3、列表、引用、代码块、分割线）
- [x] `[[` 双向链接自动补全（Fuse.js 模糊搜索）
- [x] wiki-link 悬停预览卡片（Teleport 浮窗）
- [x] wiki-link 点击导航（跳转到目标词条）
- [x] 反向链接自动汇总
- [x] Pinia 状态管理（uiStore + novelDataStore）
- [x] Vue Router URL 路由（Hash 模式，/project/:pid/doc/:docId）
- [x] Ctrl+K 命令面板（模糊搜索 + 键盘导航 + 底部提示条）
- [x] 信息卡（Infobox）：结构化键值对展示 + 章节快照切换 + 字段历史展开
- [x] ECharts 力导向关系图谱（右栏预览，点击节点导航）
- [x] 夜间模式切换（ThemeToggle，切换 dark class）
- [x] 编年大事记：垂直时间轴视图 + 8 个事件 + 分类颜色 + 关联词条导航
- [x] 空状态插画（EmptyReading / EmptySearch / EmptyGraph / EmptyCollection）
- [x] 类型图标组件（TypeIcon，lucide 图标）
- [x] 纸张纹理背景 + 入场动画 + 侧栏滑入动画
- [x] 右栏折叠
- [x] GitHub Actions 部署到 Pages
- [x] 生产构建通过（~1s，无报错）

---

## 未完成 / 待改进

- [ ] **分屏编辑（SplitView）：** 组件已创建但未集成到 CenterPanel 的实际使用流程中
- [ ] **夜间模式暗色主题：** ThemeToggle 可切换 class，但 Tailwind dark: 变体的具体颜色尚未定义
- [ ] **左侧栏折叠：** 可以隐藏，但尚未实现"图标栏"精简模式（60px rail）
- [ ] **搜索框本地过滤：** SearchBar 点击直接打开命令面板，尚未实现输入时实时过滤树目录
- [ ] **标签筛选：** 点击 DocHeader 中的标签应可过滤树状目录
- [ ] **滚动位置记忆：** 切换词条后滚动位置未保留
- [ ] **编辑器内容持久化：** 编辑内容仅存于 Pinia 内存中，刷新丢失（无后端）
- [ ] **生产 favicon：** 当前使用 Vite 默认 SVG，需替换为自定义图标
- [ ] **package.json name：** 当前为 `"-"`，应改为有意义的项目名

---

## 用户偏好记录

- 语言：中文交流
- 审美偏好：克制优雅、内容优先、去线框化、大面积留白
- 习惯：在 VS Code 中编写纯文本设定，偏好 wiki 风格的双向链接工作流
- 命名：项目目录和 UI 文本均使用中文
- 数据理念：以时间为 Z 轴的立体数据库，属性随章节变化，历史事件与人物关系双向绑定
