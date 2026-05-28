import type { AssetDefinition } from '@/types/map'

export const inkLake: AssetDefinition = {
  key: 'ink_lake',
  name: '湖泊',
  width: 100,
  height: 60,
  elements: [
    // Lake outline (filled)
    {
      type: 'line',
      points: [
        20, 15, 35, 8, 55, 5, 75, 10, 90, 18,
        95, 30, 90, 42, 78, 50, 55, 55, 30, 52,
        12, 45, 5, 35, 10, 22, 20, 15,
      ],
      stroke: '#4A7C8A',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(74, 124, 138, 0.15)',
    },
    // Inner ripple 1
    {
      type: 'line',
      points: [30, 20, 45, 18, 60, 16, 75, 20],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.4,
    },
    // Inner ripple 2
    {
      type: 'line',
      points: [25, 30, 40, 28, 55, 26, 70, 28, 80, 30],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.3,
    },
    // Inner ripple 3
    {
      type: 'line',
      points: [20, 38, 35, 36, 50, 35, 65, 37],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.3,
    },
    // Wave detail left
    {
      type: 'line',
      points: [15, 25, 18, 22, 21, 25],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    // Wave detail center
    {
      type: 'line',
      points: [45, 22, 48, 19, 51, 22],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    // Wave detail right
    {
      type: 'line',
      points: [70, 25, 73, 22, 76, 25],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.4,
    },
    // Reeds on shore
    {
      type: 'line',
      points: [8, 38, 6, 32, 10, 34],
      stroke: '#5C4033',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [12, 42, 10, 36, 14, 38],
      stroke: '#5C4033',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
  ],
}
