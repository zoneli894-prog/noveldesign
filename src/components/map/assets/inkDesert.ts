import type { AssetDefinition } from '@/types/map'

export const inkDesert: AssetDefinition = {
  key: 'ink_desert',
  name: '沙丘',
  width: 100,
  height: 50,
  elements: [
    // Sand dune 1 (large)
    {
      type: 'line',
      points: [0, 45, 15, 35, 30, 25, 45, 15, 55, 12, 65, 18, 70, 25, 75, 35, 80, 45],
      stroke: '#C4A35A',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(196, 163, 90, 0.15)',
    },
    // Sand dune 2 (background)
    {
      type: 'line',
      points: [50, 45, 65, 35, 80, 28, 90, 22, 95, 20, 100, 25, 100, 45],
      stroke: '#C4A35A',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(196, 163, 90, 0.08)',
      opacity: 0.6,
    },
    // Wind ripple lines
    {
      type: 'line',
      points: [20, 38, 30, 36, 40, 38],
      stroke: '#C4A35A',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    {
      type: 'line',
      points: [25, 42, 35, 40, 45, 42],
      stroke: '#C4A35A',
      strokeWidth: 0.6,
      opacity: 0.3,
    },
    // Dune ridge line
    {
      type: 'line',
      points: [15, 35, 30, 25, 45, 15, 55, 12],
      stroke: '#B8943E',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
    // Sparse grass
    {
      type: 'line',
      points: [38, 30, 37, 26, 39, 28],
      stroke: '#8B7355',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    {
      type: 'line',
      points: [62, 32, 61, 28, 63, 30],
      stroke: '#8B7355',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    // Caravan silhouette (tiny)
    {
      type: 'line',
      points: [85, 30, 87, 26, 89, 28, 91, 24, 93, 26],
      stroke: '#8B7355',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
  ],
}
