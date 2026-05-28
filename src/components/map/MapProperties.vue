<template>
  <div class="w-64 border-l border-brand-border/40 bg-brand-card/50 overflow-y-auto">
    <div v-if="selectedElement" class="p-4 border-b border-brand-border/40">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">元素属性</h3>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-brand-muted mb-1">名称</label>
          <input
            type="text"
            :value="selectedElement.name || ''"
            placeholder="为图章命名..."
            class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
            @input="store.updateElement(selectedElement.id, { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="block text-xs text-brand-muted mb-1">类型</label>
          <span class="text-sm text-brand-text">{{ selectedElement.type }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-brand-muted mb-1">X</label>
            <input
              type="number"
              :value="selectedElement.x"
              class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateElementProp('x', $event)"
            />
          </div>
          <div>
            <label class="block text-xs text-brand-muted mb-1">Y</label>
            <input
              type="number"
              :value="selectedElement.y"
              class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateElementProp('y', $event)"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs text-brand-muted mb-1">缩放</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            :value="selectedElement.scale"
            class="w-full"
            @input="updateElementProp('scale', $event)"
          />
        </div>

        <div>
          <label class="block text-xs text-brand-muted mb-1">绑定词条</label>
          <DocSearchPicker
            :model-value="selectedElement.bindDocId || ''"
            placeholder="搜索并绑定词条..."
            :clearable="true"
            @update:model-value="updateElementBindDoc($event)"
          />
        </div>

        <button
          class="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="store.deleteElement(selectedElement.id)"
        >
          删除元素
        </button>
      </div>
    </div>

    <div v-else-if="selectedLayer" class="p-4 border-b border-brand-border/40">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">图层属性</h3>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-brand-muted mb-1">名称</label>
          <input
            type="text"
            :value="selectedLayer.name || ''"
            placeholder="为区域命名..."
            class="w-full px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
            @input="store.updateLayer(selectedLayer.id, { name: ($event.target as HTMLInputElement).value })"
          />
        </div>

        <div>
          <label class="block text-xs text-brand-muted mb-1">纪年范围</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              :value="selectedLayer.startYear"
              class="w-20 px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateLayerProp('startYear', $event)"
            />
            <span class="text-xs text-brand-muted">-</span>
            <input
              type="number"
              :value="selectedLayer.endYear"
              placeholder="至今"
              class="w-20 px-2 py-1 text-sm bg-brand-bg border border-brand-border/50 rounded"
              @change="updateLayerProp('endYear', $event)"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs text-brand-muted mb-1">填充颜色</label>
          <div class="flex gap-2">
            <button
              v-for="color in fillColorOptions"
              :key="color.value"
              class="w-8 h-8 rounded border-2 transition-colors"
              :class="selectedLayer.fillColor === color.value
                ? 'border-brand-accent'
                : 'border-transparent'"
              :style="{ backgroundColor: color.value }"
              @click="store.updateLayer(selectedLayer.id, { fillColor: color.value })"
            />
          </div>
        </div>

        <button
          class="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
          @click="store.deleteLayer(selectedLayer.id)"
        >
          删除图层
        </button>
      </div>
    </div>

    <div class="p-4">
      <h3 class="font-serif font-semibold text-sm text-brand-text mb-3">图层列表</h3>

      <div class="space-y-2">
        <div
          v-for="layer in mapData?.dynamicLayers"
          :key="layer.id"
          class="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors"
          :class="store.selectedLayerId === layer.id
            ? 'bg-brand-accent-light'
            : 'hover:bg-brand-bg'"
          @click="store.selectedLayerId = layer.id"
        >
          <div
            class="w-4 h-4 rounded"
            :style="{ backgroundColor: layer.fillColor }"
          />
          <span class="text-xs text-brand-text flex-1 truncate">
            {{ layer.name || `天历 ${layer.startYear}-${layer.endYear || '至今'}` }}
          </span>
          <button
            class="text-brand-muted hover:text-brand-text"
            @click.stop="store.updateLayer(layer.id, { visible: !layer.visible })"
          >
            <Eye v-if="layer.visible" :size="12" />
            <EyeOff v-else :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useMapEditorStore } from '@/stores/mapEditor'
import DocSearchPicker from './DocSearchPicker.vue'

const store = useMapEditorStore()

const mapData = computed(() => store.currentMapData)

const selectedElement = computed(() => {
  if (!store.selectedElementId || !mapData.value) return null
  return mapData.value.staticElements.find(e => e.id === store.selectedElementId) || null
})

const selectedLayer = computed(() => {
  if (!store.selectedLayerId || !mapData.value) return null
  return mapData.value.dynamicLayers.find(l => l.id === store.selectedLayerId) || null
})

const fillColorOptions = [
  { value: 'rgba(111, 153, 129, 0.25)', label: '浅石绿' },
  { value: 'rgba(70, 130, 180, 0.25)', label: '靛青' },
  { value: 'rgba(192, 72, 81, 0.25)', label: '朱砂红' },
  { value: 'rgba(180, 150, 100, 0.25)', label: '土黄' },
  { value: 'rgba(120, 80, 120, 0.25)', label: '紫檀' },
]

function updateElementProp(prop: string, e: Event) {
  const target = e.target as HTMLInputElement
  const value = Number(target.value)
  store.updateElement(store.selectedElementId!, { [prop]: value })
}

function updateElementBindDoc(docId: string) {
  store.updateElement(store.selectedElementId!, { bindDocId: docId || undefined })
}

function updateLayerProp(prop: string, e: Event) {
  const target = e.target as HTMLInputElement
  let value: any = target.value ? Number(target.value) : null
  if (prop === 'bindVariantId') value = target.value || undefined
  store.updateLayer(store.selectedLayerId!, { [prop]: value })
}
</script>
