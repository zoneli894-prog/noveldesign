export interface DocNode {
  id: string
  title: string
  type: 'character' | 'faction' | 'location' | 'item' | 'lore' | 'chapter' | 'chronicle'
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

export interface InfoboxSnapshot {
  chapter: string
  fields: InfoboxField[]
}

export interface DocMeta {
  id: string
  title: string
  type: DocNode['type']
  tags: string[]
  infobox: InfoboxSnapshot[]
  backlinks: { id: string; title: string }[]
  wordCount: number
}

export interface TimelineEvent {
  id: string
  date: string
  dateSort: number
  title: string
  description: string
  relatedDocs: { id: string; title: string }[]
  category: 'war' | 'discovery' | 'political' | 'personal' | 'catastrophe'
}

export type ViewMode = 'tree' | 'recent' | 'starred'
