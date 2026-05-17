<template>
  <div class="bg-brand-card rounded-xl border border-brand-border/50 p-3 h-[280px] flex items-center justify-center shadow-brand-sm overflow-hidden">
    <div v-if="!hasGraphData" class="text-center text-brand-muted/50 text-xs">
      <svg class="w-6 h-6 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" stroke-width="1.5" />
        <circle cx="5" cy="6" r="2" stroke-width="1.5" />
        <circle cx="19" cy="6" r="2" stroke-width="1.5" />
        <circle cx="5" cy="18" r="2" stroke-width="1.5" />
        <circle cx="19" cy="18" r="2" stroke-width="1.5" />
        <path d="M7 7l3 3M14 10l3-3M7 17l3-3M14 14l3 3" stroke-width="1" opacity="0.4" />
      </svg>
      <p>关系图谱</p>
      <p class="mt-1 text-[10px] opacity-60">词条间的双向链接将在此可视化</p>
    </div>
    <div v-else ref="chartRef" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNovelDataStore } from '@/stores/novelData'
import { typeColors } from '@/data/seed'

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
