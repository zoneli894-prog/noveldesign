import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import type { DocNode, DocMeta, InfoboxField } from '@/types'
import { seedDocs, seedContent, seedInfobox } from '@/data/seed'

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

function buildMetaMap(docs: DocNode[], infobox: Record<string, InfoboxField[]>): Record<string, DocMeta> {
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
          map[targetId].backlinks.push({ id: docId, title: sourceDoc.title })
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

  const flatDocs = computed(() => flattenTree(docTree.value))
  const docMetaMap = computed(() => buildMetaMap(docTree.value, seedInfobox))

  const activeDoc = computed(() => flatDocs.value.find(d => d.id === activeDocId.value) || null)
  const activeContent = computed(() => docContent.value[activeDocId.value] || '')
  const activeMeta = computed(() => docMetaMap.value[activeDocId.value] || null)

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

  return {
    docTree, docContent, activeDocId,
    flatDocs, docMetaMap, activeDoc, activeContent, activeMeta,
    recentDocs, starredDocs,
    setActiveDoc, updateContent, toggleStar, searchDocs, findDocPath,
  }
})
