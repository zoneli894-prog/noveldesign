# 地图编辑器修复设计文档

## 概述

修复地图编辑器的 4 个核心问题：画布不自适应屏幕、无法拖动图章、点击图章无响应/不能绑定词条、绘制功能不能填充。

---

## 问题 1：画布不自适应屏幕

### 根因
`MapCanvas.vue` 中 `containerWidth` 和 `containerHeight` 硬编码为 800/600，从未更新。已有的 `useMapCanvas.ts` 有 resize 逻辑但未被使用。

### 修复方案
- 在 `MapCanvas.vue` 的 `onMounted` 中使用 `ResizeObserver` 监听 `containerRef` 尺寸变化
- 将实际宽度/高度更新到 `containerWidth` / `containerHeight`
- `stageConfig` 的 `width/height` 已绑定这两个变量，无需额外改动
- 删除未使用的 `useMapCanvas.ts` 死代码

### 涉及文件
- `src/components/map/MapCanvas.vue` — 添加 ResizeObserver
- `src/components/map/composables/useMapCanvas.ts` — 删除

---

## 问题 2：无法拖动移动图章

### 根因
所有 `v-group` 元素的 `draggable` 属性硬编码为 `false`，没有拖动结束后的坐标更新逻辑。

### 修复方案
- 在元素 `v-group` 的 `config` 中，根据当前工具动态设置 `draggable`：仅当 `currentTool === 'select'` 时为 `true`
- 为每个元素 `v-group` 添加 `@dragend` 事件处理器
- 在 `dragend` 回调中，读取 Konva 节点的新 `x`/`y` 坐标，调用 `store.updateElement(id, { x, y })`
- 注意：Konva 拖动时自动更新节点位置，无需手动设置

### 涉及文件
- `src/components/map/MapCanvas.vue` — 修改元素 v-group config 和添加 dragend 事件

---

## 问题 3：点击图章没反应 / 不能绑定词条

### 根因
1. `screenToCanvas` 手动计算 `(clientX - rect.left - position.x) / scale`，但 Konva 的 `stage.getPointerPosition()` 已经应用了 stage transform，导致双重转换，坐标错误
2. 元素 `v-group` 没有点击事件，无法选中
3. 属性面板仅在 `selectedElementId` 不为 null 时显示，但选中机制坏了

### 修复方案
- 将 `screenToCanvas` 改为使用 `stageRef.value.getStage().getPointerPosition()`，直接获取画布坐标
- 为每个元素 `v-group` 添加 `@click` / `@tap` 事件，点击时设置 `store.selectedElementId = element.id`
- 属性面板已有绑定词条功能（`MapProperties.vue` 中的 `DocSearchPicker`），选中后即可使用
- 注意：点击元素时需 `e.cancelBubble = true` 防止事件冒泡到 stage 的点击处理

### 涉及文件
- `src/components/map/MapCanvas.vue` — 修复坐标转换，添加元素点击事件

---

## 问题 4：绘制功能不能填充（多边形区域）

### 根因
1. 坐标转换 bug 导致多边形顶点位置错误（同问题 3）
2. 双击关闭时，第一次点击（dblclick 事件的第一个 click）会通过 `handleStageClick` 多添加一个点
3. 绘制的多边形没有点击事件，无法选中编辑

### 修复方案
- 修复坐标转换（同问题 3）
- 在 `handleStageDblClick` 中，先移除最后一个点（双击产生的重复点），再调用 `finishDraw()`
- 为动态图层的 `v-polygon` 添加 `@click` / `@tap` 事件，点击时设置 `store.selectedLayerId = layer.id`
- 属性面板已有图层编辑功能（`MapProperties.vue` 中的图层属性），选中后即可修改

### 涉及文件
- `src/components/map/MapCanvas.vue` — 修复坐标，修复双击关闭，添加图层点击事件

---

## 额外修复

### 种子数据浅拷贝
- `mapEditor.ts` 的 `initMap` 中 `{ ...seedMap }` 只做浅拷贝，编辑时会污染原始种子数据
- 改为 `JSON.parse(JSON.stringify(seedMap))` 深拷贝

### 涉及文件
- `src/stores/mapEditor.ts` — 修改 initMap 中的拷贝方式

---

## 实施顺序

1. 修复 `MapCanvas.vue` 的 ResizeObserver（问题 1）
2. 修复坐标转换 + 元素点击选中（问题 3）—— 这是其他修复的基础
3. 添加元素拖动支持（问题 2）
4. 修复绘制工具 + 图层点击选中（问题 4）
5. 修复种子数据深拷贝（额外修复）
6. 删除 `useMapCanvas.ts` 死代码

---

## 成功标准

- 画布随窗口大小自动调整
- 可以拖动已放置的图章到新位置
- 点击图章后右侧属性面板显示属性，可以绑定词条
- 绘制工具可以正常创建多边形区域
- 可以点击已绘制的多边形进行编辑
- 撤销/重做功能正常工作
