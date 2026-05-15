# 小说设定库 — 项目文档

## 项目概述

一个为读者量身定制的"高效率考据型"小说整理平台前端。核心理念：结构化知识库 + 沉浸式阅读美学，定位为"数字档案馆"。

运行命令：`npm run dev` (开发) / `npm run build` (生产构建)

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

---

## 技术栈

- **框架：** Vue 3 (Composition API) + Vite 8 + TypeScript
- **样式：** Tailwind CSS v4（通过 `@tailwindcss/vite` 插件集成）
- **状态管理：** Pinia
- **路由：** Vue Router 5（动态路由 `/project/:pid/doc/:docId`）
- **编辑器：** TipTap（ProseMirror 封装）
- **图谱：** ECharts 6 + vue-echarts
- **搜索：** Fuse.js（模糊搜索）
- **弹窗定位：** tippy.js

---

## 文件夹结构

```
d:/小说设定网站/
├── index.html                          # 入口 HTML，加载 Google Fonts (Noto Serif/Sans SC)
├── vite.config.ts                      # Vite 配置：vue 插件、tailwindcss 插件、@ 路径别名
├── tsconfig.app.json                   # TS 配置：@/* → src/* 路径映射
├── package.json                        # 依赖清单
│
├── src/
│   ├── main.ts                         # 应用入口：创建 Vue app，挂载 Pinia + Router
│   ├── App.vue                         # 根组件：三栏 flex 布局 + 路由参数监听
│   ├── env.d.ts                        # Vite 类型声明
│   │
│   ├── assets/styles/main.css          # Tailwind v4 入口 + @theme 品牌变量 + 全局样式
│   │
│   ├── types/index.ts                  # 类型定义：DocNode, WikiLink, InfoboxField, DocMeta, ViewMode
│   ├── data/seed.ts                    # 种子数据：10 个词条（含树结构、HTML 内容、反向链接、信息卡）
│   │
│   ├── router/index.ts                 # Vue Router：/ → /project/default/doc/char-mc，/:pid/doc/:docId
│   │
│   ├── stores/
│   │   ├── ui.ts                       # UI 状态：侧栏开关、分屏、夜间模式、视图模式、命令面板
│   │   └── novelData.ts                # 数据状态：文档树、内容、活跃词条、搜索（Fuse.js）、面包屑路径
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LeftSidebar.vue         # 左栏：搜索框 + 视图切换 + 目录/近期/收藏
│   │   │   ├── CenterPanel.vue         # 中栏：面包屑 + 标题 + 编辑器 + 反向链接
│   │   │   └── RightSidebar.vue        # 右栏：信息卡 + 关系图谱
│   │   │
│   │   ├── sidebar/
│   │   │   ├── SearchBar.vue           # 搜索输入框，显示 Ctrl+K 提示，点击打开命令面板
│   │   │   ├── ViewSwitcher.vue        # 三个视图切换按钮：目录/近期/收藏
│   │   │   ├── TreeView.vue            # 树状目录入口
│   │   │   ├── TreeNode.vue            # 递归树节点：可折叠、类型图标、悬停显示字数
│   │   │   ├── RecentView.vue          # 近期修改列表，显示相对时间
│   │   │   └── StarredView.vue         # 星标收藏列表
│   │   │
│   │   ├── editor/
│   │   │   ├── WikiEditor.vue          # TipTap 编辑器核心：无工具栏、wiki-link、/命令、悬停预览
│   │   │   ├── WikiLinkSuggest.vue     # [[ 触发的词条下拉候选列表
│   │   │   ├── SlashCommandList.vue    # / 触发的命令下拉列表
│   │   │   └── WikiLinkPreview.vue     # wiki-link 悬停预览卡片（Teleport）
│   │   │
│   │   ├── center/
│   │   │   ├── Breadcrumbs.vue         # 面包屑导航：显示当前词条路径
│   │   │   ├── DocHeader.vue           # 文档标题（大号宋体）+ 类型标签 + 标签 + 收藏星标
│   │   │   ├── Backlinks.vue           # 反向链接列表：哪些页面引用了当前词条
│   │   │   └── SplitView.vue           # 分屏对照组件（左50%/右50%）
│   │   │
│   │   ├── right/
│   │   │   ├── Infobox.vue             # 结构化属性信息卡（键值对表格）
│   │   │   └── GraphPreview.vue        # ECharts 力导向关系图谱预览
│   │   │
│   │   └── common/
│   │       ├── CommandPalette.vue      # Ctrl+K 命令面板：模糊搜索 + 键盘导航
│   │       └── ThemeToggle.vue         # 夜间模式切换按钮（日/月图标）
│   │
│   └── extensions/
│       ├── wiki-link/
│       │   └── WikiLinkExtension.ts    # TipTap Mark 扩展：wiki-link 渲染 + [[ 触发建议
│       └── slash-command/
│           └── SlashCommandExtension.ts # TipTap Extension：/ 命令触发建议
```

---

## 种子数据

`src/data/seed.ts` 包含 10 个互相交叉引用的词条：

| ID | 标题 | 类型 | 父级 |
|----|------|------|------|
| `world` | 世界观总览 | lore | null |
| `map` | 地图与地理 | lore | world |
| `loc-north` | 北境·寒渊山脉 | location | map |
| `loc-capital` | 中州·天枢城 | location | map |
| `chars` | 人物志 | lore | null |
| `char-mc` | 凌夜寒 | character | chars |
| `char-villain` | 殷无殇 | character | chars |
| `factions` | 势力与门派 | lore | null |
| `faction-sword` | 天剑宗 | faction | factions |
| `items` | 法宝与灵物 | lore | null |
| `item-sword` | 霜华剑 | item | items |
| `chapters` | 章节纲要 | lore | null |
| `ch-1` | 第一章·寒渊初醒 | chapter | chapters |

每个词条 HTML 内容中包含 `[[wiki-links]]`（以 `<a data-wiki-link data-target-id="...">` 渲染），形成双向链接网络。

### 类型颜色映射
- character: `#E8A87C` (暖橙)
- faction: `#85CDCA` (青绿)
- location: `#D5A6BD` (粉紫)
- item: `#C9B1FF` (淡紫)
- lore: `#87CEEB` (天蓝)
- chapter: `#FFD700` (金黄)

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
- [x] Vue Router URL 路由（/project/:pid/doc/:docId）
- [x] Ctrl+K 命令面板（模糊搜索 + 键盘导航）
- [x] 信息卡（Infobox）：结构化键值对展示
- [x] ECharts 力导向关系图谱（右栏预览，点击节点导航）
- [x] 夜间模式切换（ThemeToggle，切换 dark class）
- [x] 右栏折叠
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
- [ ] **GraphPreview 点击导航：** 图表节点点击已绑定，但 router.push 在 onMounted 回调中使用需验证
- [ ] **TipTap Suggestion 插件版本：** 当前使用 `@tiptap/suggestion` v3，API 可能与 v2 的 `Suggestion` 导出方式不同，需测试
- [ ] **生产 favicon：** 当前使用 Vite 默认 SVG，需替换为自定义图标
- [ ] **package.json name：** 当前为 `"-"`，应改为有意义的项目名

---

## 用户偏好记录

- 语言：中文交流
- 审美偏好：克制优雅、内容优先、去线框化、大面积留白
- 习惯：在 VS Code 中编写纯文本设定，偏好 wiki 风格的双向链接工作流
- 命名：项目目录和 UI 文本均使用中文
