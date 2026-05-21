import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import type { DocNode, DocMeta, DocVariant, InfoboxField, InfoboxSnapshot, TimelineEvent } from '@/types'
import { seedDocs, seedContent, seedInfobox, seedTimeline } from '@/data/seed'
import { extractWikiLinks } from '@/utils/wiki-links'

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

function findNode(nodes: DocNode[], id: string): DocNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

function buildMetaMap(
  docs: DocNode[],
  infobox: Record<string, InfoboxSnapshot[]>,
  content: Record<string, string>,
): Record<string, DocMeta> {
  const map: Record<string, DocMeta> = {}
  const flat = flattenTree(docs)
  for (const doc of flat) {
    const html = content[doc.id] || ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const wordCount = (tmp.textContent || '').replace(/\s/g, '').length || doc.wordCount
    map[doc.id] = {
      id: doc.id,
      title: doc.title,
      type: doc.type,
      tags: doc.tags,
      infobox: infobox[doc.id] || [],
      backlinks: [],
      wordCount,
    }
  }
  for (const [docId, html] of Object.entries(content)) {
    for (const targetId of extractWikiLinks(html)) {
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
  const infoboxData = ref<Record<string, InfoboxSnapshot[]>>({ ...seedInfobox })

  const flatDocs = computed(() => flattenTree(docTree.value))
  const docMetaMap = computed(() => buildMetaMap(docTree.value, infoboxData.value, docContent.value))

  const activeDoc = computed(() => flatDocs.value.find(d => d.id === activeDocId.value) || null)
  const activeVariantId = ref<string | null>(null)

  const activeVariant = computed(() => {
    if (!activeVariantId.value || !activeDoc.value) return null
    return activeDoc.value.variants.find(v => v.id === activeVariantId.value) || null
  })

  const activeContent = computed(() => {
    if (activeVariant.value) {
      return activeVariant.value.content
    }
    return docContent.value[activeDocId.value] || ''
  })

  const activeMeta = computed(() => {
    if (activeVariant.value) {
      return {
        id: activeVariant.value.id,
        title: activeVariant.value.title,
        type: activeDoc.value?.type || 'lore',
        tags: activeVariant.value.tags,
        infobox: activeVariant.value.infobox,
        backlinks: [],
        wordCount: activeVariant.value.wordCount,
      }
    }
    return docMetaMap.value[activeDocId.value] || null
  })

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
    activeDocId.value = id
    activeVariantId.value = null
  }

  function setActiveVariant(variantId: string | null) {
    activeVariantId.value = variantId
  }

  function updateContent(id: string, html: string) {
    docContent.value[id] = html
    const node = findNode(docTree.value, id)
    if (node) {
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      node.wordCount = (tmp.textContent || '').replace(/\s/g, '').length
    }
  }

  function toggleStar(id: string) {
    const node = findNode(docTree.value, id)
    if (node) node.starred = !node.starred
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

  // Infobox helpers

  function getInfoboxYears(docId: string): string[] {
    const snapshots = infoboxData.value[docId] || []
    return snapshots.map(s => s.year)
  }

  function getInfoboxFieldsForYear(docId: string, year: string): InfoboxField[] {
    const snapshots = infoboxData.value[docId] || []
    const snap = snapshots.find(s => s.year === year)
    return snap ? snap.fields : []
  }

  function getFieldHistory(docId: string, fieldKey: string): { year: string; value: string }[] {
    const snapshots = infoboxData.value[docId] || []
    return snapshots
      .map(s => {
        const field = s.fields.find(f => f.key === fieldKey)
        return field ? { year: s.year, value: field.value } : null
      })
      .filter(Boolean) as { year: string; value: string }[]
  }

  // CRUD methods

  function generateId(type: string): string {
    return `${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  }

  function addDoc(params: { title: string; type: DocNode['type']; parentId: string | null }): DocNode {
    const id = generateId(params.type)
    const newNode: DocNode = {
      id,
      title: params.title,
      type: params.type,
      children: [],
      variants: [],
      tags: [],
      wordCount: 0,
      starred: false,
      updatedAt: Date.now(),
      parentId: params.parentId,
    }

    const parent = params.parentId ? findNode(docTree.value, params.parentId) : null
    ;(parent?.children ?? docTree.value).push(newNode)

    docContent.value[id] = ''
    infoboxData.value[id] = []

    return newNode
  }

  function deleteDoc(id: string) {
    const collectIds = (node: DocNode): string[] => {
      const ids = [node.id]
      for (const child of node.children) {
        ids.push(...collectIds(child))
      }
      return ids
    }

    const removeNode = (nodes: DocNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          const removed = nodes.splice(i, 1)[0]
          for (const rid of collectIds(removed)) {
            delete docContent.value[rid]
            delete infoboxData.value[rid]
          }
          return true
        }
        if (removeNode(nodes[i].children)) return true
      }
      return false
    }

    removeNode(docTree.value)

    if (activeDocId.value === id) {
      const remaining = flatDocs.value
      if (remaining.length > 0) {
        activeDocId.value = remaining[0].id
      }
    }
  }

  function getParentOf(id: string): DocNode | null {
    const findParent = (nodes: DocNode[], parent: DocNode | null): DocNode | null => {
      for (const node of nodes) {
        if (node.id === id) return parent
        const found = findParent(node.children, node)
        if (found) return found
      }
      return null
    }
    return findParent(docTree.value, null)
  }

  // Infobox mutations

  function updateInfobox(docId: string, snapshots: InfoboxSnapshot[]) {
    infoboxData.value[docId] = snapshots
  }

  function addInfoboxSnapshot(docId: string, snapshot: InfoboxSnapshot) {
    if (!infoboxData.value[docId]) {
      infoboxData.value[docId] = []
    }
    infoboxData.value[docId].push(snapshot)
  }

  function removeInfoboxSnapshot(docId: string, year: string) {
    const snapshots = infoboxData.value[docId]
    if (snapshots) {
      infoboxData.value[docId] = snapshots.filter(s => s.year !== year)
    }
  }

  function addInfoboxField(docId: string, year: string, field: InfoboxField) {
    const snapshots = infoboxData.value[docId]
    if (!snapshots) return
    const snap = snapshots.find(s => s.year === year)
    if (snap) {
      snap.fields.push(field)
    }
  }

  function removeInfoboxField(docId: string, year: string, fieldKey: string) {
    const snapshots = infoboxData.value[docId]
    if (!snapshots) return
    const snap = snapshots.find(s => s.year === year)
    if (snap) {
      snap.fields = snap.fields.filter(f => f.key !== fieldKey)
    }
  }

  // Parallel entry methods

  function convertToParallel(docId: string, startYear: string, endYear: string = '') {
    const node = findNode(docTree.value, docId)
    if (!node || node.variants.length > 0) return

    const variant: DocVariant = {
      id: generateId('variant'),
      title: endYear ? `${startYear}~${endYear}` : startYear,
      startYear,
      endYear,
      content: docContent.value[docId] || '',
      infobox: infoboxData.value[docId] || [],
      tags: [...node.tags],
      wordCount: node.wordCount,
      updatedAt: Date.now(),
    }

    node.variants = [variant]
  }

  function addVariant(docId: string, startYear: string, endYear: string = '') {
    const node = findNode(docTree.value, docId)
    if (!node) return null

    const variant: DocVariant = {
      id: generateId('variant'),
      title: endYear ? `${startYear}~${endYear}` : startYear,
      startYear,
      endYear,
      content: '',
      infobox: [],
      tags: [],
      wordCount: 0,
      updatedAt: Date.now(),
    }

    node.variants.push(variant)
    sortVariants(docId)
    return variant
  }

  function deleteVariant(docId: string, variantId: string) {
    const node = findNode(docTree.value, docId)
    if (!node) return

    node.variants = node.variants.filter(v => v.id !== variantId)

    if (node.variants.length === 1) {
      const lastVariant = node.variants[0]
      docContent.value[docId] = lastVariant.content
      infoboxData.value[docId] = lastVariant.infobox
      node.variants = []
    }
  }

  function updateVariantContent(docId: string, variantId: string, html: string) {
    const node = findNode(docTree.value, docId)
    if (!node) return

    const variant = node.variants.find(v => v.id === variantId)
    if (variant) {
      variant.content = html
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      variant.wordCount = (tmp.textContent || '').replace(/\s/g, '').length
    }
  }

  function sortVariants(docId: string) {
    const node = findNode(docTree.value, docId)
    if (!node) return

    node.variants.sort((a, b) => {
      if (a.startYear !== b.startYear) {
        return a.startYear.localeCompare(b.startYear)
      }
      return a.endYear.localeCompare(b.endYear)
    })
  }

  // Reset

  function resetToDefaults() {
    localStorage.removeItem('noveldesign-data')
    window.location.reload()
  }

  return {
    docTree, docContent, activeDocId, infoboxData,
    flatDocs, docMetaMap, activeDoc, activeVariantId, activeVariant, activeContent, activeMeta,
    recentDocs, starredDocs, sortedTimelineEvents,
    setActiveDoc, setActiveVariant, updateContent, toggleStar, searchDocs, findDocPath,
    getInfoboxYears, getInfoboxFieldsForYear, getFieldHistory,
    generateId, addDoc, deleteDoc, getParentOf,
    updateInfobox, addInfoboxSnapshot, removeInfoboxSnapshot,
    addInfoboxField, removeInfoboxField,
    convertToParallel, addVariant, deleteVariant, updateVariantContent, sortVariants,
    resetToDefaults,
  }
}, {
  persist: {
    key: 'noveldesign-data',
    pick: ['docTree', 'docContent', 'infoboxData', 'timelineEvents'],
  },
})
