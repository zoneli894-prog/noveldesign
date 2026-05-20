<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div
        v-if="uiStore.globalGraphOpen"
        class="fixed inset-0 z-50 flex"
        @click.self="close"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="close" />
        <Transition name="palette" appear>
          <div
            v-if="uiStore.globalGraphOpen"
            class="relative m-3 flex-1 bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden flex"
          >
            <!-- Filter sidebar -->
            <div class="w-[240px] shrink-0 border-r border-brand-border/50 flex flex-col">
              <div class="px-4 py-3 border-b border-brand-border/50">
                <h3 class="font-serif font-semibold text-sm text-brand-text">全局关系图谱</h3>
                <p class="text-[10px] text-brand-muted mt-0.5">{{ nodeCount }} 个词条 · {{ linkCount }} 条关系</p>
              </div>
              <div class="flex-1 overflow-y-auto p-3 space-y-1">
                <label
                  v-for="cat in categories"
                  :key="cat.type"
                  class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-brand-bg"
                >
                  <input
                    type="checkbox"
                    v-model="cat.visible"
                    class="accent-[var(--color-brand-accent)]"
                  />
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: typeColors[cat.type] }"
                  />
                  <span class="text-xs text-brand-text flex-1">{{ typeLabels[cat.type] }}</span>
                  <span class="text-[10px] text-brand-muted/50">{{ cat.count }}</span>
                </label>
              </div>
              <div class="px-3 py-2 border-t border-brand-border/50">
                <button
                  class="w-full text-[10px] text-brand-muted/60 hover:text-brand-accent transition-colors"
                  @click="toggleAllCategories"
                >
                  {{ allVisible ? '取消全选' : '全选' }}
                </button>
              </div>
            </div>

            <!-- Graph area -->
            <div class="flex-1 flex flex-col min-w-0">
              <!-- Top bar -->
              <div class="px-4 py-2.5 border-b border-brand-border/50 flex items-center gap-3">
                <div class="flex-1" />
                <div class="relative">
                  <Search :size="13" class="absolute left-2 top-1/2 -translate-y-1/2 text-brand-muted/50" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索词条..."
                    class="w-48 text-xs bg-brand-bg border border-brand-border/50 rounded-lg pl-7 pr-3 py-1.5
                           text-brand-text placeholder:text-brand-muted/40
                           focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
                <button
                  class="text-brand-muted/60 hover:text-brand-text transition-colors"
                  @click="close"
                >
                  <X :size="18" />
                </button>
              </div>

              <!-- Chart -->
              <div ref="chartRef" class="flex-1 min-h-0" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import { typeLabels, typeColors } from '@/data/seed'
import Fuse from 'fuse.js'

const router = useRouter()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: any = null
const searchQuery = ref('')

// Build categories with visibility and counts
const categories = reactive(
  Object.keys(typeLabels).map(type => ({
    type,
    label: typeLabels[type],
    visible: true,
    count: 0,
  }))
)

const allVisible = computed(() => categories.every(c => c.visible))

function toggleAllCategories() {
  const target = !allVisible.value
  categories.forEach(c => c.visible = target)
}

// Compute graph data
const nodeCount = computed(() => {
  const visibleTypes = new Set(categories.filter(c => c.visible).map(c => c.type))
  return graphNodes.value.filter(n => visibleTypes.has(n.type)).length
})

const linkCount = computed(() => {
  const visibleTypes = new Set(categories.filter(c => c.visible).map(c => c.type))
  return graphLinks.value.filter(l => {
    const sourceNode = graphNodes.value.find(n => n.id === l.source)
    const targetNode = graphNodes.value.find(n => n.id === l.target)
    return sourceNode && targetNode && visibleTypes.has(sourceNode.type) && visibleTypes.has(targetNode.type)
  }).length
})

const graphNodes = computed(() => {
  const nodes: { id: string; name: string; type: string; degree: number }[] = []
  const degreeMap = new Map<string, number>()

  // Count degrees
  for (const html of Object.values(novelStore.docContent)) {
    const regex = /data-target-id="([^"]+)"/g
    let match
    while ((match = regex.exec(html)) !== null) {
      const target = match[1]
      degreeMap.set(target, (degreeMap.get(target) || 0) + 1)
    }
  }

  // Also count reverse (being linked to)
  for (const [docId, html] of Object.entries(novelStore.docContent)) {
    const regex = /data-target-id="([^"]+)"/g
    let match
    while ((match = regex.exec(html)) !== null) {
      degreeMap.set(docId, (degreeMap.get(docId) || 0) + 1)
    }
  }

  for (const doc of novelStore.flatDocs) {
    nodes.push({
      id: doc.id,
      name: doc.title,
      type: doc.type,
      degree: degreeMap.get(doc.id) || 0,
    })
  }

  // Update category counts
  for (const cat of categories) {
    cat.count = nodes.filter(n => n.type === cat.type).length
  }

  return nodes
})

const graphLinks = computed(() => {
  const links: { source: string; target: string }[] = []
  const seen = new Set<string>()

  for (const [docId, html] of Object.entries(novelStore.docContent)) {
    const regex = /data-target-id="([^"]+)"/g
    let match
    while ((match = regex.exec(html)) !== null) {
      const targetId = match[1]
      const key = `${docId}->${targetId}`
      if (!seen.has(key) && novelStore.flatDocs.find(d => d.id === targetId)) {
        seen.add(key)
        links.push({ source: docId, target: targetId })
      }
    }
  }

  return links
})

// Search highlighting
const searchFuse = computed(() => {
  return new Fuse(graphNodes.value, {
    keys: ['name'],
    threshold: 0.4,
  })
})

const highlightedIds = computed(() => {
  if (!searchQuery.value.trim()) return null
  const results = searchFuse.value.search(searchQuery.value)
  return new Set(results.map(r => r.item.id))
})

function buildGraphOption() {
  const visibleTypes = new Set(categories.filter(c => c.visible).map(c => c.type))
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-accent').trim() || '#3B6B5E'
  const isSearching = highlightedIds.value !== null

  const nodes = graphNodes.value
    .filter(n => visibleTypes.has(n.type))
    .map(n => {
      const isHighlighted = !isSearching || highlightedIds.value!.has(n.id)
      return {
        id: n.id,
        name: n.name,
        symbolSize: isSearching
          ? (isHighlighted ? Math.max(16, Math.min(36, 12 + n.degree * 5)) : 8)
          : Math.max(12, Math.min(36, 10 + n.degree * 5)),
        category: n.type,
        itemStyle: {
          color: typeColors[n.type] || '#888',
          opacity: isSearching ? (isHighlighted ? 1 : 0.15) : 1,
          borderWidth: n.id === novelStore.activeDocId ? 3 : 0,
          borderColor: n.id === novelStore.activeDocId ? accentColor : 'transparent',
        },
        label: {
          show: isSearching ? isHighlighted : true,
          fontSize: isSearching && isHighlighted ? 12 : 10,
          opacity: isSearching ? (isHighlighted ? 1 : 0.1) : 1,
        },
      }
    })

  const visibleLinks = graphLinks.value.filter(l => {
    const sourceNode = graphNodes.value.find(n => n.id === l.source)
    const targetNode = graphNodes.value.find(n => n.id === l.target)
    return sourceNode && targetNode && visibleTypes.has(sourceNode.type) && visibleTypes.has(targetNode.type)
  })

  // Dynamic categories
  const typeSet = new Set(nodes.map(n => n.category))
  const cats = Array.from(typeSet).map(t => ({ name: t }))

  return {
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = graphNodes.value.find(n => n.id === params.data.id)
          if (!node) return ''
          return `<div style="font-size:12px;line-height:1.6">
            <b>${node.name}</b><br/>
            <span style="color:${typeColors[node.type] || '#888'}">${typeLabels[node.type] || node.type}</span><br/>
            <span style="color:#888">连接数: ${node.degree}</span>
          </div>`
        }
        return ''
      },
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links: visibleLinks,
      categories: cats,
      roam: true,
      force: {
        repulsion: Math.max(200, nodes.length * 15),
        edgeLength: 80,
        gravity: 0.1,
      },
      emphasis: { focus: 'adjacency' },
      animationDuration: 300,
      animationEasingUpdate: 'quinticInOut',
    }],
  }
}

async function initChart() {
  if (!chartRef.value) return
  const echarts = await import('echarts')
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(buildGraphOption())

  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      close()
      novelStore.setActiveDoc(params.data.id)
      router.push(`/project/default/doc/${params.data.id}`)
    }
  })
}

watch(() => uiStore.globalGraphOpen, async (open) => {
  if (open) {
    searchQuery.value = ''
    categories.forEach(c => c.visible = true)
    await nextTick()
    if (!chartInstance) {
      await initChart()
    } else {
      chartInstance.resize()
      chartInstance.setOption(buildGraphOption(), true)
    }
  }
})

watch([() => categories.map(c => c.visible).join(','), searchQuery], () => {
  if (chartInstance) {
    chartInstance.setOption(buildGraphOption(), true)
  }
})

function close() {
  uiStore.closeGlobalGraph()
}

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>
