import type { AssetDefinition } from '@/types/map'

export const inkForest: AssetDefinition = {
  key: 'ink_forest',
  name: '密林',
  width: 100,
  height: 70,
  elements: [
    // Back trees (lighter, smaller)
    {
      type: 'line',
      points: [15, 65, 15, 40, 10, 45, 15, 30, 20, 45, 15, 40],
      stroke: '#8B7355',
      strokeWidth: 1,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [35, 65, 35, 35, 28, 42, 35, 25, 42, 42, 35, 35],
      stroke: '#8B7355',
      strokeWidth: 1,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [55, 65, 55, 38, 48, 44, 55, 28, 62, 44, 55, 38],
      stroke: '#8B7355',
      strokeWidth: 1,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [75, 65, 75, 42, 70, 47, 75, 33, 80, 47, 75, 42],
      stroke: '#8B7355',
      strokeWidth: 1,
      opacity: 0.5,
    },
    // Front trees (darker, larger)
    {
      type: 'line',
      points: [5, 65, 5, 38, 0, 44, 5, 22, 10, 44, 5, 38],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    {
      type: 'line',
      points: [25, 65, 25, 32, 18, 40, 25, 18, 32, 40, 25, 32],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    {
      type: 'line',
      points: [45, 65, 45, 35, 38, 42, 45, 20, 52, 42, 45, 35],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      opacity: 0.8,
    },
    {
      type: 'line',
      points: [65, 65, 65, 30, 58, 38, 65, 15, 72, 38, 65, 30],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      opacity: 0.8,
    },
    {
      type: 'line',
      points: [85, 65, 85, 38, 78, 44, 85, 25, 92, 44, 85, 38],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    // Ground line
    {
      type: 'line',
      points: [0, 65, 25, 64, 50, 66, 75, 64, 100, 65],
      stroke: '#8B7355',
      strokeWidth: 0.8,
      opacity: 0.4,
    },
  ],
}
