export interface MapData {
  id: string
  name: string
  projectId: string
  scale: number
  gridSize: number
  background: '#F6F5F2' | '#EFE3C3'
  width: number
  height: number
  staticElements: MapElement[]
  dynamicLayers: MapLayer[]
  counters: {
    element: number
    layer: number
  }
}

export interface MapElement {
  id: string
  type: 'asset' | 'text' | 'marker'
  name?: string
  assetKey?: string
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  bindDocId?: string
  zIndex: number
  visible: boolean
  locked: boolean
}

export interface MapLayer {
  id: string
  type: 'polygon' | 'rectangle' | 'circle'
  name?: string
  points: number[][]
  bindVariantId?: string
  startYear: number
  endYear: number | null
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  zIndex: number
  visible: boolean
  locked: boolean
}

export type MapTool = 'select' | 'draw' | 'delete' | 'pan'

export type AssetKey =
  | 'ink_mountain_chain'
  | 'ink_peak'
  | 'ink_river'
  | 'city_gate'
  | 'mountain_pass'
  | 'ferry_crossing'
  | 'ink_pagoda'
  | 'ink_temple'
  | 'ink_forest'
  | 'ink_lake'
  | 'ink_desert'
  | 'ink_volcano'
  | 'ink_island'
  | 'ink_bridge'

export interface AssetElement {
  type: 'line'
  points: number[]
  stroke?: string
  strokeWidth?: number
  fill?: string
  closed?: boolean
  strokeLinecap?: string
  strokeLinejoin?: string
  opacity?: number
}

export interface AssetDefinition {
  key: AssetKey
  name: string
  width: number
  height: number
  elements: AssetElement[]
}
