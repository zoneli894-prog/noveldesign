# 地图与地理功能设计文档

## 概述

本设计将"中国古代舆地图美学"与"现代多用户 SaaS 的高效率架构"深度融合，为小说读者和考据党提供一个"计里画方、时空联动"的数字山河沙盘。

**核心理念：**
- 古风美学：宣纸底色、松烟墨线条、矿物色填充
- 计里画方：网格系统 + 自动吸附
- 时空联动：多版本平行时空图层 + 纪年拨盘

---

## 一、技术选型

### 1.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | Composition API | 前端框架 |
| Vite | 8.x | 构建工具 |
| TypeScript | 6.x | 类型安全 |
| Pinia | 3.x | 状态管理 |
| Tailwind CSS | 4.x | 样式系统 |

### 1.2 Canvas 渲染引擎

**选择：Konva.js + @konva/vue-konva**

**选型理由：**
- 成熟的 Canvas 库，事件绑定简单（@click、@dragstart）
- 内置分层、变换、动画支持
- 与 Vue 3 集成良好
- 社区活跃，文档完善

**依赖：**
```json
{
  "konva": "^9.x",
  "@konva/vue-konva": "^2.x"
}
```

---

## 二、数据模型设计

### 2.1 地图数据结构

```typescript
interface MapData {
  id: string
  name: string
  projectId: string
  scale: number  // 一格代表多少里（10、100、1000）
  gridSize: number  // 网格大小（像素）
  background: '#F6F5F2' | '#EFE3C3'  // 宣纸白或老绢黄
  width: number
  height: number
  
  // 静态元素（物理地貌，不随时间变化）
  staticElements: MapElement[]
  
  // 动态图层（势力疆域，绑定纪年）
  dynamicLayers: MapLayer[]
  
  // 元素计数器（用于生成唯一 ID）
  counters: {
    element: number
    layer: number
  }
}
```

### 2.2 地图元素

```typescript
interface MapElement {
  id: string
  type: 'asset' | 'text' | 'marker'
  assetKey?: string  // 图章类型
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  bindDocId?: string  // 绑定的词条 ID
  zIndex: number
  visible: boolean
  locked: boolean
}
```

### 2.3 动态图层

```typescript
interface MapLayer {
  id: string
  type: 'polygon' | 'rectangle' | 'circle'
  points: number[][]  // 多边形顶点坐标
  bindVariantId?: string  // 绑定的平行分身 ID
  startYear: number
  endYear: number | null  // null 表示至今
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  zIndex: number
  visible: boolean
  locked: boolean
}
```

### 2.4 与 Project 集成

```typescript
interface Project {
  // ... 现有字段
  mapData: MapData | null  // 新增：地图数据
}
```

---

## 三、组件架构设计

### 3.1 组件树结构

```
RightSidebar.vue
└── MapEditor.vue                    // 地图编辑器主容器
    ├── MapToolbar.vue               // 顶部工具栏
    │   ├── ToolButton.vue           // 工具按钮
    │   ├── AssetPicker.vue          // 图章选择器
    │   ├── GridToggle.vue           // 网格开关
    │   ├── SnapToggle.vue           // 吸附开关
    │   ├── ZoomControls.vue         // 缩放控制
    │   └── ExportButton.vue         // 导出按钮
    ├── MapCanvas.vue                // Konva 画布容器
    │   ├── v-stage                  // Konva Stage
    │   │   ├── v-layer[background]  // 背景层（网格）
    │   │   ├── v-layer[static]      // 静态元素层
    │   │   ├── v-layer[dynamic]     // 动态图层（疆域）
    │   │   └── v-layer[ui]          // UI 层（选择框、辅助线）
    │   └── MapTooltip.vue           // 悬浮提示
    ├── YearSlider.vue               // 纪年滑块
    └── MapProperties.vue            // 右侧属性面板
        ├── ElementProperties.vue    // 元素属性
        └── LayerProperties.vue      // 图层属性
```

### 3.2 Pinia Store

```typescript
// stores/mapEditor.ts
export const useMapEditorStore = defineStore('mapEditor', () => {
  const activeMapId = ref<string | null>(null)
  const currentYear = ref(1)
  const currentTool = ref<'select' | 'draw' | 'delete'>('select')
  const selectedElementId = ref<string | null>(null)
  const gridVisible = ref(true)
  const snapToGrid = ref(true)
  const scale = ref(1)
  const position = ref({ x: 0, y: 0 })
  
  const activeLayers = computed(() => {
    const mapData = getCurrentMapData()
    if (!mapData) return []
    return mapData.dynamicLayers.filter(layer => {
      const startMatch = layer.startYear <= currentYear.value
      const endMatch = layer.endYear === null || layer.endYear >= currentYear.value
      return startMatch && endMatch && layer.visible
    })
  })
  
  // CRUD 方法
  function addElement(element: Omit<MapElement, 'id'>) { ... }
  function updateElement(id: string, updates: Partial<MapElement>) { ... }
  function deleteElement(id: string) { ... }
  
  function addLayer(layer: Omit<MapLayer, 'id'>) { ... }
  function updateLayer(id: string, updates: Partial<MapLayer>) { ... }
  function deleteLayer(id: string) { ... }
  
  // 撤销/重做
  const history = ref<any[]>([])
  const historyIndex = ref(-1)
  function undo() { ... }
  function redo() { ... }
  
  return { ... }
}, {
  persist: {
    key: 'noveldesign-map-editor',
    pick: ['currentYear', 'gridVisible', 'snapToGrid', 'scale'],
  }
})
```

---

## 四、交互流程设计

### 4.1 地图编辑流程

**步骤 1：进入地图编辑模式**
- 用户在 RightSidebar 点击"地图"标签
- 加载当前项目的地图数据
- 显示空白画布（或预设基础地貌）

**步骤 2：放置物理地貌**
- 用户在工具栏选择"图章"工具
- 在 AssetPicker 中选择图章类型
- 在画布上点击放置
- 图章自动吸附到网格（如果开启）

**步骤 3：勾勒势力边界**
- 用户在工具栏选择"绘制"工具
- 在画布上点击绘制多边形顶点
- 双击或点击起点闭合区域
- 弹出"绑定词条"对话框

**步骤 4：绑定词条**
- 用户选择要绑定的词条
- 选择要绑定的平行分身（可选）
- 设置纪年范围（起始年、结束年）
- 选择填充颜色

**步骤 5：切换纪年查看**
- 用户拖动纪年滑块
- 地图自动显示/隐藏对应纪年的疆域
- 右侧属性面板显示当前纪年的信息

### 4.2 快捷键映射

| 快捷键 | 功能 |
|--------|------|
| `V` | 选择工具 |
| `P` | 绘制工具 |
| `D` | 删除工具 |
| `G` | 切换网格显示 |
| `S` | 切换吸附 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+S` | 保存 |
| `Ctrl+E` | 导出 PNG |
| `+` / `-` | 缩放 |
| `Space` + 拖动 | 平移画布 |
| `Delete` | 删除选中元素 |

---

## 五、视觉风格设计

### 5.1 色彩体系

**画布底色：**
- 宣纸白：`#F6F5F2`（默认）
- 老绢黄：`#EFE3C3`

**线条墨色：**
- 松烟墨：`#2C2C2C`（主边界、图章轮廓）
- 淡墨：`#7F7F7F`（辅助线、网格）

**疆域填充色（透明度 0.25）：**
- 正道/中立：浅石绿 `rgba(111, 153, 129, 0.25)`
- 正道/中立：靛青 `rgba(70, 130, 180, 0.25)`
- 魔道/敌对：朱砂红 `rgba(192, 72, 81, 0.25)`
- 中立：土黄 `rgba(180, 150, 100, 0.25)`
- 神秘：紫檀 `rgba(120, 80, 120, 0.25)`

### 5.2 计里画方网格

**网格样式：**
- 线条颜色：淡墨 `#7F7F7F`
- 线条宽度：1px
- 透明度：0.3
- 网格大小：可切换（每方十里 / 每方百里）

### 5.3 图章视觉规范

**群山图章（ink_mountain_chain）：**
- 参考明代舆地图"鱼脊骨"画法
- SVG 路径，可自适应缩放
- 颜色：松烟墨 `#2C2C2C`

**奇峰图章（ink_peak）：**
- 高耸突兀的工笔单峰
- 用于标记仙山、禁地

**水系笔刷（ink_river）：**
- 双线工笔画法
- 内侧自动填充古风折带波浪纹

**城池图章（city_gate）：**
- 四方向城门和防御角楼
- 闭合正方形城墙

**关隘图章（mountain_pass）：**
- 两山夹一关的隘口符号

**渡口图章（ferry_crossing）：**
- 孤舟停泊符号

---

## 六、性能优化策略

### 6.1 Canvas 离屏渲染

**原理：**
- 将不常变化的元素（如网格、静态图章）渲染到离屏 Canvas
- 主 Canvas 只绘制需要更新的部分
- 减少每帧的绘制开销

### 6.2 虚拟化渲染

**原理：**
- 只渲染视口内的元素
- 视口外的元素不绘制，节省性能

### 6.3 性能监控

**监控指标：**
- FPS（目标：60fps）
- 每帧绘制时间（目标：< 16ms）
- 内存使用（目标：< 100MB）
- 元素数量（目标：< 1000）

---

## 七、功能清单

### 7.1 核心功能

- [ ] Canvas 画布（Konva.js）
- [ ] 计里画方网格（可切换十里/百里）
- [ ] 网格吸附（可开关）
- [ ] 6 种基础图章（群山、奇峰、水系、城池、关隘、渡口）
- [ ] 多边形区域绘制（点击 + 拖动双模式）
- [ ] 多版本平行时空图层
- [ ] 词条/平行分身绑定
- [ ] 纪年滑块联动
- [ ] 图层面板（显示/隐藏、锁定）
- [ ] 撤销/重做
- [ ] 元素搜索
- [ ] PNG 导出
- [ ] JSON 导入
- [ ] 交互式教程
- [ ] 示例地图

### 7.2 辅助功能

- [ ] 快捷键支持
- [ ] 详细工具提示
- [ ] 性能监控
- [ ] 自动备份
- [ ] 数据恢复
- [ ] 友好错误处理
- [ ] 日志记录

### 7.3 暂不支持

- [ ] 协作功能
- [ ] 版本控制
- [ ] 离线编辑
- [ ] 打印功能
- [ ] 移动端支持

---

## 八、约束与限制

### 8.1 性能约束

- 支持 1000+ 个元素
- 60fps 渲染
- < 100MB 内存使用

### 8.2 浏览器兼容

- Chrome、Firefox、Safari、Edge 最新版本
- 仅桌面端

### 8.3 部署

- 与现有项目一起部署到 GitHub Pages
- 仅支持中文

---

## 九、依赖清单

### 9.1 新增依赖

```json
{
  "konva": "^9.x",
  "@konva/vue-konva": "^2.x"
}
```

### 9.2 现有依赖（复用）

- Vue 3
- Pinia
- Tailwind CSS
- lucide-vue-next（图标）

---

## 十、风险与缓解

### 10.1 性能风险

**风险：** 大量元素时渲染卡顿
**缓解：** 离屏渲染 + 虚拟化 + 性能监控

### 10.2 依赖风险

**风险：** Konva.js 更新导致兼容性问题
**缓解：** 锁定版本 + 定期更新测试

### 10.3 复杂度风险

**风险：** 功能过多导致开发周期过长
**缓解：** 分阶段实现，优先核心功能

---

## 十一、成功标准

### 11.1 功能标准

- 用户可以放置 6 种图章
- 用户可以绘制多边形区域
- 用户可以绑定词条/平行分身
- 纪年滑块可以切换时空图层
- 可以导出 PNG 图片

### 11.2 性能标准

- 1000+ 元素时 60fps
- 响应时间 < 100ms
- 内存使用 < 100MB

### 11.3 用户体验标准

- 古风美学风格一致
- 交互流畅自然
- 工具提示清晰
- 错误处理友好

---

## 十二、后续迭代

### 12.1 Phase 2

- 更多图章类型（宗门大殿、祭坛、旗帜等）
- 图章自定义（颜色、大小）
- 地图模板库

### 12.2 Phase 3

- 协作功能
- 版本控制
- 离线编辑

### 12.3 Phase 4

- 移动端支持
- 3D 地图
- AI 辅助绘图
