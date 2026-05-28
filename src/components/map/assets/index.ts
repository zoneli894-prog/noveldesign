import type { AssetDefinition, AssetKey } from '@/types/map'
import { inkMountainChain } from './inkMountainChain'
import { inkPeak } from './inkPeak'
import { inkRiver } from './inkRiver'
import { cityGate } from './cityGate'
import { mountainPass } from './mountainPass'
import { ferryCrossing } from './ferryCrossing'
import { inkPagoda } from './inkPagoda'
import { inkTemple } from './inkTemple'
import { inkForest } from './inkForest'
import { inkLake } from './inkLake'
import { inkDesert } from './inkDesert'
import { inkVolcano } from './inkVolcano'
import { inkIsland } from './inkIsland'
import { inkBridge } from './inkBridge'

export const assetRegistry: Record<AssetKey, AssetDefinition> = {
  ink_mountain_chain: inkMountainChain,
  ink_peak: inkPeak,
  ink_river: inkRiver,
  city_gate: cityGate,
  mountain_pass: mountainPass,
  ferry_crossing: ferryCrossing,
  ink_pagoda: inkPagoda,
  ink_temple: inkTemple,
  ink_forest: inkForest,
  ink_lake: inkLake,
  ink_desert: inkDesert,
  ink_volcano: inkVolcano,
  ink_island: inkIsland,
  ink_bridge: inkBridge,
}

export const assetCategories = [
  { name: '山川地貌', keys: ['ink_mountain_chain', 'ink_peak', 'ink_volcano', 'ink_island'] as AssetKey[] },
  { name: '水系', keys: ['ink_river', 'ink_lake', 'ink_bridge', 'ferry_crossing'] as AssetKey[] },
  { name: '建筑', keys: ['city_gate', 'mountain_pass', 'ink_pagoda', 'ink_temple'] as AssetKey[] },
  { name: '植被', keys: ['ink_forest', 'ink_desert'] as AssetKey[] },
]

export const assetList = Object.values(assetRegistry)
