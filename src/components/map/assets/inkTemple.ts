import type { AssetDefinition } from '@/types/map'

export const inkTemple: AssetDefinition = {
  key: 'ink_temple',
  name: '宗门',
  width: 90,
  height: 65,
  elements: [
    // Main hall roof
    {
      type: 'line',
      points: [5, 35, 20, 20, 45, 15, 70, 20, 85, 35],
      stroke: '#2C2C2C',
      strokeWidth: 2,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.1)',
    },
    // Main hall walls
    {
      type: 'line',
      points: [15, 35, 15, 55, 75, 55, 75, 35],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.12)',
    },
    // Roof ridge
    {
      type: 'line',
      points: [10, 35, 45, 30, 80, 35],
      stroke: '#5C4033',
      strokeWidth: 1,
    },
    // Main gate
    {
      type: 'line',
      points: [35, 55, 35, 42, 40, 38, 45, 36, 50, 38, 55, 42, 55, 55],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.15)',
    },
    // Left side building
    {
      type: 'line',
      points: [0, 55, 0, 45, 15, 42, 15, 55],
      stroke: '#5C4033',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.08)',
    },
    // Right side building
    {
      type: 'line',
      points: [75, 55, 75, 45, 90, 42, 90, 55],
      stroke: '#5C4033',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.08)',
    },
    // Steps
    {
      type: 'line',
      points: [30, 55, 30, 58, 60, 58, 60, 55],
      stroke: '#8B7355',
      strokeWidth: 1,
    },
    // Flag on roof
    {
      type: 'line',
      points: [45, 15, 45, 5, 55, 8],
      stroke: '#8B4513',
      strokeWidth: 1,
    },
  ],
}
