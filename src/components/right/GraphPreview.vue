<template>
  <div class="bg-brand-card rounded-xl border border-brand-border/50 p-3 h-[280px] flex flex-col shadow-brand-sm overflow-hidden">
    <div v-if="!hasGraphData" class="flex-1 flex flex-col items-center justify-center gap-2">
      <EmptyGraph />
      <p class="text-brand-muted/50 text-xs">关系图谱</p>
      <p class="text-[10px] text-brand-muted/40">词条间的双向链接将在此可视化</p>
    </div>
    <template v-else>
      <div ref="chartRef" class="flex-1 min-h-0" />
      <button
        class="mt-2 text-[10px] text-brand-muted/50 hover:text-brand-accent transition-colors text-center"
        @click="uiStore.openGlobalGraph()"
      >
        展开全局图谱 →
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useNovelDataStore } from '@/stores/novelData'
import { useUiStore } from '@/stores/ui'
import { typeColors } from '@/data/seed'
import { extractWikiLinks } from '@/utils/wiki-links'
import EmptyGraph from '@/assets/illustrations/EmptyGraph.vue'

const props = defineProps<{ docId: string }>()
const novelStore = useNovelDataStore()
const uiStore = useUiStore()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: any = null

const hasGraphData = computed(() => {
  const activeMeta = novelStore.docMetaMap[props.docId]
  return activeMeta && (activeMeta.backlinks.length > 0 || novelStore.activeContent.includes('wiki-link'))
})

const accentColor = (() => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-accent').trim()
  return raw || '#3B6B5E'
})()

function buildGraphOption() {
  const nodeSet = new Map<string, { id: string; name: string; type: string }>()
  const links: { source: string; target: string }[] = []

  const activeDoc = novelStore.activeDoc
  if (!activeDoc) return null
  nodeSet.set(activeDoc.id, { id: activeDoc.id, name: activeDoc.title, type: activeDoc.type })

  for (const [docId, html] of Object.entries(novelStore.docContent)) {
    for (const targetId of extractWikiLinks(html)) {
      if (docId === props.docId || targetId === props.docId) {
        const sourceDoc = novelStore.flatDocs.find(d => d.id === docId)
        const targetDoc = novelStore.flatDocs.find(d => d.id === targetId)
        if (sourceDoc && targetDoc) {
          nodeSet.set(sourceDoc.id, { id: sourceDoc.id, name: sourceDoc.title, type: sourceDoc.type })
          nodeSet.set(targetDoc.id, { id: targetDoc.id, name: targetDoc.title, type: targetDoc.type })
          links.push({ source: docId, target: targetId })
        }
      }
    }
  }

  const degreeMap = new Map<string, number>()
  for (const link of links) {
    degreeMap.set(link.source, (degreeMap.get(link.source) || 0) + 1)
    degreeMap.set(link.target, (degreeMap.get(link.target) || 0) + 1)
  }

  const nodes = Array.from(nodeSet.values()).map(n => ({
    id: n.id,
    name: n.name,
    symbolSize: n.id === props.docId
      ? 30
      : Math.max(12, Math.min(30, 10 + (degreeMap.get(n.id) || 0) * 4)),
    category: n.type,
    itemStyle: {
      color: typeColors[n.type] || '#888',
      borderWidth: n.id === props.docId ? 3 : 0,
      borderColor: n.id === props.docId ? accentColor : 'transparent',
    },
    label: { show: true, fontSize: 10 },
  }))

  const typeSet = new Set(nodes.map(n => n.category))
  const categories = Array.from(typeSet).map(t => ({ name: t }))

  return {
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes,
      links,
      categories,
      roam: true,
      force: { repulsion: 200, edgeLength: 60 },
      emphasis: { focus: 'adjacency' },
    }],
  }
}

onMounted(async () => {
  if (!chartRef.value || !hasGraphData.value) return
  const echarts = await import('echarts')
  chartInstance = echarts.init(chartRef.value)
  const option = buildGraphOption()
  if (option) chartInstance.setOption(option)

  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      novelStore.setActiveDoc(params.data.id)
    }
  })
})

watch(() => props.docId, async () => {
  if (!chartInstance || !hasGraphData.value) return
  const option = buildGraphOption()
  if (option) chartInstance.setOption(option, true)
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>
