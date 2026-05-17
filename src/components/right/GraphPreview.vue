<template>
  <div class="bg-brand-card rounded-xl border border-brand-border/50 p-3 h-[280px] flex items-center justify-center shadow-brand-sm overflow-hidden">
    <div v-if="!hasGraphData" class="flex flex-col items-center gap-2">
      <EmptyGraph />
      <p class="text-brand-muted/50 text-xs">关系图谱</p>
      <p class="text-[10px] text-brand-muted/40">词条间的双向链接将在此可视化</p>
    </div>
    <div v-else ref="chartRef" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNovelDataStore } from '@/stores/novelData'
import { typeColors } from '@/data/seed'
import EmptyGraph from '@/assets/illustrations/EmptyGraph.vue'

const props = defineProps<{ docId: string }>()
const router = useRouter()
const novelStore = useNovelDataStore()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: any = null

const hasGraphData = computed(() => {
  const activeMeta = novelStore.docMetaMap[props.docId]
  return activeMeta && (activeMeta.backlinks.length > 0 || novelStore.activeContent.includes('wiki-link'))
})

function buildGraphOption() {
  const nodeSet = new Map<string, { id: string; name: string; type: string }>()
  const links: { source: string; target: string }[] = []

  // Add current doc
  const activeDoc = novelStore.activeDoc
  if (!activeDoc) return null
  nodeSet.set(activeDoc.id, { id: activeDoc.id, name: activeDoc.title, type: activeDoc.type })

  // Parse links from all docs
  for (const [docId, html] of Object.entries(novelStore.docContent)) {
    const linkRegex = /data-target-id="([^"]+)"/g
    let match
    while ((match = linkRegex.exec(html)) !== null) {
      const targetId = match[1]
      if (docId === props.docId || targetId === props.docId) {
        const sourceDoc = novelStore.flatDocs.find(d => d.id === docId)
        const targetDoc = novelStore.flatDocs.find(d => d.id === targetId)
        if (sourceDoc) nodeSet.set(sourceDoc.id, { id: sourceDoc.id, name: sourceDoc.title, type: sourceDoc.type })
        if (targetDoc) nodeSet.set(targetDoc.id, { id: targetDoc.id, name: targetDoc.title, type: targetDoc.type })
        links.push({ source: docId, target: targetId })
      }
    }
  }

  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-accent').trim() || '#3B6B5E'

  const nodes = Array.from(nodeSet.values()).map(n => ({
    id: n.id,
    name: n.name,
    symbolSize: n.id === props.docId ? 30 : 18,
    category: n.type,
    itemStyle: {
      color: typeColors[n.type] || '#888',
      borderWidth: n.id === props.docId ? 3 : 0,
      borderColor: n.id === props.docId ? accentColor : 'transparent',
    },
    label: { show: true, fontSize: 10 },
  }))

  const categories = [
    { name: 'character' }, { name: 'faction' }, { name: 'location' },
    { name: 'item' }, { name: 'lore' }, { name: 'chapter' },
  ]

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
      router.push(`/project/default/doc/${params.data.id}`)
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
