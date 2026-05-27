import type { AssetDefinition } from '@/types/map'

export const mountainPass: AssetDefinition = {
  key: 'mountain_pass',
  name: '关隘',
  width: 70,
  height: 60,
  elements: [
    // Left mountain
    {
      type: 'line',
      points: [0, 55, 10, 30, 18, 20, 25, 12, 28, 25, 22, 35, 15, 45, 0, 55],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.2)',
    },
    // Right mountain
    {
      type: 'line',
      points: [70, 55, 60, 30, 52, 20, 45, 12, 42, 25, 48, 35, 55, 45, 70, 55],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.2)',
    },
    // Pass gate structure
    {
      type: 'line',
      points: [25, 45, 25, 28, 28, 24, 35, 22, 42, 24, 45, 28, 45, 45],
      stroke: '#2C2C2C',
      strokeWidth: 2,
    },
    // Gate wall fill
    {
      type: 'line',
      points: [27, 45, 27, 30, 30, 26, 35, 24, 40, 26, 43, 30, 43, 45],
      stroke: '#2C2C2C',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.2)',
    },
    // Gate arch
    {
      type: 'line',
      points: [30, 45, 30, 34, 32, 30, 35, 28, 38, 30, 40, 34, 40, 45],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Left mountain ridge
    {
      type: 'line',
      points: [23, 15, 25, 12, 27, 16],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    // Right mountain ridge
    {
      type: 'line',
      points: [43, 15, 45, 12, 47, 16],
      stroke: '#2C2C2C',
      strokeWidth: 1,
    },
    // Flag on gate
    {
      type: 'line',
      points: [35, 22, 35, 14, 40, 16],
      stroke: '#8B4513',
      strokeWidth: 1,
    },
    // Ground line
    {
      type: 'line',
      points: [5, 55, 25, 55, 45, 55, 65, 55],
      stroke: '#8B7355',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
  ],
}
