import type { AssetDefinition } from '@/types/map'

export const inkBridge: AssetDefinition = {
  key: 'ink_bridge',
  name: '石桥',
  width: 80,
  height: 45,
  elements: [
    // Water under bridge
    {
      type: 'line',
      points: [0, 38, 15, 36, 30, 38, 45, 36, 60, 38, 75, 36, 80, 38],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.4,
    },
    // Bridge arch
    {
      type: 'line',
      points: [5, 35, 15, 28, 25, 22, 35, 18, 45, 16, 55, 18, 65, 22, 75, 28, 80, 35],
      stroke: '#2C2C2C',
      strokeWidth: 2,
    },
    // Bridge deck
    {
      type: 'line',
      points: [5, 30, 25, 20, 45, 16, 65, 20, 80, 30],
      stroke: '#5C4033',
      strokeWidth: 1.5,
    },
    // Bridge railing posts
    {
      type: 'line',
      points: [15, 28, 15, 24],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [25, 22, 25, 18],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [45, 16, 45, 12],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [65, 22, 65, 18],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [75, 28, 75, 24],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    // Railing top rail
    {
      type: 'line',
      points: [12, 24, 25, 18, 45, 12, 65, 18, 78, 24],
      stroke: '#5C4033',
      strokeWidth: 0.8,
    },
    // Left abutment
    {
      type: 'line',
      points: [0, 35, 0, 28, 5, 25, 10, 28, 10, 35],
      stroke: '#8B7355',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(139, 115, 85, 0.15)',
    },
    // Right abutment
    {
      type: 'line',
      points: [70, 35, 70, 28, 75, 25, 80, 28, 80, 35],
      stroke: '#8B7355',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(139, 115, 85, 0.15)',
    },
    // Water ripple under arch
    {
      type: 'line',
      points: [20, 35, 30, 33, 40, 35, 50, 33, 60, 35],
      stroke: '#4A7C8A',
      strokeWidth: 0.6,
      opacity: 0.3,
    },
  ],
}
