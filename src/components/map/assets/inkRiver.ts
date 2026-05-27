import type { AssetDefinition } from '@/types/map'

export const inkRiver: AssetDefinition = {
  key: 'ink_river',
  name: '水系',
  width: 120,
  height: 40,
  elements: [
    // River body (filled)
    {
      type: 'line',
      points: [
        0, 18, 15, 12, 30, 16, 45, 10, 60, 15, 75, 11, 90, 17, 105, 13, 120, 18,
        120, 24, 105, 19, 90, 25, 75, 19, 60, 23, 45, 18, 30, 24, 15, 20, 0, 24,
      ],
      stroke: '#4A7C8A',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(74, 124, 138, 0.2)',
    },
    // Main current line
    {
      type: 'line',
      points: [0, 20, 20, 14, 40, 18, 60, 12, 80, 17, 100, 14, 120, 20],
      stroke: '#2C5F6E',
      strokeWidth: 2,
    },
    // Secondary current
    {
      type: 'line',
      points: [10, 22, 30, 17, 50, 21, 70, 16, 90, 20, 110, 18],
      stroke: '#4A7C8A',
      strokeWidth: 1,
      opacity: 0.6,
    },
    // Water ripple details
    {
      type: 'line',
      points: [25, 16, 30, 14, 35, 16],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [65, 14, 70, 12, 75, 14],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
    {
      type: 'line',
      points: [95, 17, 100, 15, 105, 17],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.5,
    },
  ],
}
