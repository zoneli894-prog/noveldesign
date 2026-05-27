import type { AssetDefinition } from '@/types/map'

export const inkPeak: AssetDefinition = {
  key: 'ink_peak',
  name: '奇峰',
  width: 50,
  height: 90,
  elements: [
    // Mountain shadow/base
    {
      type: 'line',
      points: [25, 85, 10, 60, 15, 45, 20, 30, 25, 5, 30, 30, 35, 45, 40, 60, 25, 85],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.2)',
    },
    // Main peak outline
    {
      type: 'line',
      points: [25, 85, 8, 58, 12, 42, 18, 25, 25, 2, 32, 25, 38, 42, 42, 58, 25, 85],
      stroke: '#2C2C2C',
      strokeWidth: 2,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.12)',
    },
    // Peak ridge line
    {
      type: 'line',
      points: [25, 5, 24, 15, 26, 25, 25, 35],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    // Left face detail
    {
      type: 'line',
      points: [15, 48, 18, 42, 16, 52],
      stroke: '#8B7355',
      strokeWidth: 0.8,
    },
    // Right face detail
    {
      type: 'line',
      points: [35, 48, 32, 42, 34, 52],
      stroke: '#8B7355',
      strokeWidth: 0.8,
    },
    // Cloud/mist at base
    {
      type: 'line',
      points: [5, 75, 15, 72, 25, 76, 35, 73, 45, 75],
      stroke: '#8B7355',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
  ],
}
