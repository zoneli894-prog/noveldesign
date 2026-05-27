import type { AssetDefinition } from '@/types/map'
import { inkMountainChain } from './inkMountainChain'
import { inkPeak } from './inkPeak'
import { inkRiver } from './inkRiver'
import { cityGate } from './cityGate'
import { mountainPass } from './mountainPass'
import { ferryCrossing } from './ferryCrossing'

export const assets: Record<string, AssetDefinition> = {
  ink_mountain_chain: inkMountainChain,
  ink_peak: inkPeak,
  ink_river: inkRiver,
  city_gate: cityGate,
  mountain_pass: mountainPass,
  ferry_crossing: ferryCrossing,
}

export const assetList = Object.values(assets)
