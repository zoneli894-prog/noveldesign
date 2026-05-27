import type { AssetDefinition } from '@/types/map'

export const inkMountainChain: AssetDefinition = {
  key: 'ink_mountain_chain',
  name: '群山',
  width: 120,
  height: 70,
  elements: [
    {
      type: 'line',
      points: [0, 65, 15, 45, 25, 55, 40, 30, 55, 48, 70, 25, 85, 42, 100, 35, 115, 50, 120, 65],
      stroke: '#8B7355',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(139, 115, 85, 0.15)',
    },
    {
      type: 'line',
      points: [5, 65, 20, 38, 35, 52, 50, 22, 65, 40, 80, 18, 95, 38, 110, 45, 120, 65],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.25)',
    },
    {
      type: 'line',
      points: [10, 65, 30, 32, 45, 50, 60, 15, 75, 35, 90, 28, 105, 42, 120, 65],
      stroke: '#2C2C2C',
      strokeWidth: 2,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.35)',
    },
    {
      type: 'line',
      points: [58, 18, 62, 22, 60, 28],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [28, 35, 32, 40, 30, 45],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [88, 30, 92, 35, 90, 40],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
  ],
}
