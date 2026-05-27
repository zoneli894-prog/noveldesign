import type { AssetDefinition } from '@/types/map'

export const ferryCrossing: AssetDefinition = {
  key: 'ferry_crossing',
  name: '渡口',
  width: 70,
  height: 50,
  elements: [
    // Water surface
    {
      type: 'line',
      points: [0, 35, 15, 32, 30, 36, 45, 33, 60, 37, 70, 35],
      stroke: '#4A7C8A',
      strokeWidth: 1,
      opacity: 0.4,
    },
    {
      type: 'line',
      points: [5, 40, 20, 37, 35, 41, 50, 38, 65, 42],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.3,
    },
    // Boat hull
    {
      type: 'line',
      points: [15, 32, 25, 28, 45, 28, 55, 32, 50, 34, 20, 34],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.25)',
    },
    // Boat mast
    {
      type: 'line',
      points: [35, 28, 35, 10],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Sail
    {
      type: 'line',
      points: [35, 12, 35, 24, 48, 20],
      stroke: '#2C2C2C',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.1)',
    },
    // Dock/pier
    {
      type: 'line',
      points: [55, 30, 65, 30, 65, 36, 55, 36],
      stroke: '#5C4033',
      strokeWidth: 1.5,
    },
    // Dock planks
    {
      type: 'line',
      points: [57, 30, 57, 36],
      stroke: '#8B7355',
      strokeWidth: 0.5,
    },
    {
      type: 'line',
      points: [61, 30, 61, 36],
      stroke: '#8B7355',
      strokeWidth: 0.5,
    },
    // Person on dock (simplified)
    {
      type: 'line',
      points: [60, 26, 60, 30],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [58, 28, 62, 28],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    // Water ripples around boat
    {
      type: 'line',
      points: [18, 36, 22, 38, 26, 36],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [44, 36, 48, 38, 52, 36],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.5,
    },
  ],
}
