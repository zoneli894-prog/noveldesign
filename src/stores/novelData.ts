import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import type { DocNode, DocMeta, InfoboxField, InfoboxSnapshot, TimelineEvent } from '@/types'
import { seedDocs, seedContent, seedInfobox, seedTimeline } from '@/data/seed'

function flattenTree(nodes: DocNode[]): DocNode[] {
  const result: DocNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children.length) {
      result.push(...flattenTree(node.children))
    }
  }
  return result
}

function buildMetaMap(docs: DocNode[], infobox: Record<string, InfoboxSnapshot[]>): Record<string, DocMeta> {
  const map: Record<string, DocMeta> = {}
  const flat = flattenTree(docs)
  for (const doc of flat) {
    map[doc.id] = {
      id: doc.id,
      title: doc.title,
      type: doc.type,
      tags: doc.tags,
      infobox: infobox[doc.id] || [],
      backlinks: [],
      wordCount: doc.wordCount,
    }
  }
  // compute backlinks
  for (const [docId, html] of Object.entries(seedContent)) {
    const linkRegex = /data-target-id="([^"]+)"/g
    let match
    while ((match = linkRegex.exec(html)) !== null) {
      const targetId = match[1]
      if (map[targetId] && docId !== targetId) {
        const sourceDoc = flat.find(d => d.id === docId)
        if (sourceDoc && !map[targetId].backlinks.find(b => b.id === docId)) {
          map[targetId].backlinks.push({ id: docId, title: sourceDoc.title, type: sourceDoc.type })
        }
      }
    }
  }
  return map
}

export const useNovelDataStore = defineStore('novelData', () => {
  const docTree = ref<DocNode[]>(seedDocs)
  const docContent = ref<Record<string, string>>({ ...seedContent })
  const activeDocId = ref<string>('char-mc')
  const timelineEvents = ref<TimelineEvent[]>([...seedTimeline])

  const flatDocs = computed(() => flattenTree(docTree.value))
  const docMetaMap = computed(() => buildMetaMap(docTree.value, seedInfobox))

  const activeDoc = computed(() => flatDocs.value.find(d => d.id === activeDocId.value) || null)
  const activeContent = computed(() => docContent.value[activeDocId.value] || '')
  const activeMeta = computed(() => docMetaMap.value[activeDocId.value] || null)

  const sortedTimelineEvents = computed(() =>
    [...timelineEvents.value].sort((a, b) => a.dateSort - b.dateSort)
  )

  const recentDocs = computed(() =>
    flatDocs.value
      .filter(d => d.children.length === 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10)
  )

  const starredDocs = computed(() =>
    flatDocs.value.filter(d => d.starred)
  )

  const fuseInstance = computed(() =>
    new Fuse(flatDocs.value, {
      keys: ['title', 'tags'],
      threshold: 0.3,
    })
  )

  function setActiveDoc(id: string) {
    if (flatDocs.value.find(d => d.id === id)) {
      activeDocId.value = id
    }
  }

  function updateContent(id: string, html: string) {
    docContent.value[id] = html
  }

  function toggleStar(id: string) {
    const findAndToggle = (nodes: DocNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) { node.starred = !node.starred; return true }
        if (findAndToggle(node.children)) return true
      }
      return false
    }
    findAndToggle(docTree.value)
  }

  function searchDocs(query: string): DocMeta[] {
    if (!query.trim()) return []
    return fuseInstance.value.search(query).map(r => docMetaMap.value[r.item.id]).filter(Boolean)
  }

  function findDocPath(id: string): DocNode[] {
    const path: DocNode[] = []
    const find = (nodes: DocNode[], parents: DocNode[]): boolean => {
      for (const node of nodes) {
        const currentPath = [...parents, node]
        if (node.id === id) { path.push(...currentPath); return true }
        if (find(node.children, currentPath)) return true
      }
      return false
    }
    find(docTree.value, [])
    return path
  }

  // Infobox 快照辅助函数
  function getInfoboxYears(docId: string): string[] {
    const snapshots = seedInfobox[docId] || []
    return snapshots.map(s => s.year)
  }

  function getInfoboxFieldsForYear(docId: string, year: string): InfoboxField[] {
    const snapshots = seedInfobox[docId] || []
    const snap = snapshots.find(s => s.year === year)
    return snap ? snap.fields : []
  }

  function getFieldHistory(docId: string, fieldKey: string): { year: string; value: string }[] {
    const snapshots = seedInfobox[docId] || []
    return snapshots
      .map(s => {
        const field = s.fields.find(f => f.key === fieldKey)
        return field ? { year: s.year, value: field.value } : null
      })
      .filter(Boolean) as { year: string; value: string }[]
  }

  return {
    docTree, docContent, activeDocId,
    flatDocs, docMetaMap, activeDoc, activeContent, activeMeta,
    recentDocs, starredDocs, sortedTimelineEvents,
    setActiveDoc, updateContent, toggleStar, searchDocs, findDocPath,
    getInfoboxYears, getInfoboxFieldsForYear, getFieldHistory,
  }
})
