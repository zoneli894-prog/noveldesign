import type { AssetDefinition } from '@/types/map'

export const inkVolcano: AssetDefinition = {
  key: 'ink_volcano',
  name: '火山',
  width: 70,
  height: 75,
  elements: [
    // Volcano base
    {
      type: 'line',
      points: [0, 70, 15, 50, 25, 35, 30, 25, 35, 20, 40, 25, 45, 35, 55, 50, 70, 70],
      stroke: '#5C4033',
      strokeWidth: 2,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.25)',
    },
    // Inner crater
    {
      type: 'line',
      points: [25, 25, 30, 18, 35, 15, 40, 18, 45, 25],
      stroke: '#8B4513',
      strokeWidth: 1.5,
    },
    // Crater fill (dark)
    {
      type: 'line',
      points: [28, 25, 30, 18, 35, 15, 40, 18, 42, 25],
      stroke: '#8B4513',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(139, 69, 19, 0.3)',
    },
    // Lava flow 1
    {
      type: 'line',
      points: [32, 20, 28, 30, 22, 45, 18, 55],
      stroke: '#C0392B',
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    // Lava flow 2
    {
      type: 'line',
      points: [38, 20, 42, 30, 48, 45, 52, 55],
      stroke: '#C0392B',
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    // Smoke/ash plumes
    {
      type: 'line',
      points: [30, 15, 28, 8, 32, 3, 36, 8, 34, 15],
      stroke: '#7F7F7F',
      strokeWidth: 1,
      opacity: 0.4,
      closed: true,
      fill: 'rgba(127, 127, 127, 0.1)',
    },
    // Rock texture left
    {
      type: 'line',
      points: [10, 60, 15, 55, 12, 62],
      stroke: '#8B7355',
      strokeWidth: 0.6,
      opacity: 0.5,
    },
    // Rock texture right
    {
      type: 'line',
      points: [55, 58, 60, 52, 57, 60],
      stroke: '#8B7355',
      strokeWidth: 0.6,
      opacity: 0.5,
    },
  ],
}
