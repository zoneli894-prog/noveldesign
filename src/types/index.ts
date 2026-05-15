export interface DocNode {
  id: string
  title: string
  type: 'character' | 'faction' | 'location' | 'item' | 'lore' | 'chapter'
  children: DocNode[]
  tags: string[]
  wordCount: number
  starred: boolean
  updatedAt: number
  parentId: string | null
}

export interface WikiLink {
  targetId: string
  targetTitle: string
  anchor?: string
}

export interface InfoboxField {
  key: string
  value: string
  type: 'text' | 'link' | 'list'
}

export interface DocMeta {
  id: string
  title: string
  type: DocNode['type']
  tags: string[]
  infobox: InfoboxField[]
  backlinks: { id: string; title: string }[]
  wordCount: number
}

export type ViewMode = 'tree' | 'recent' | 'starred'
