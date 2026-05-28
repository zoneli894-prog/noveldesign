import type { AssetDefinition } from '@/types/map'

export const inkIsland: AssetDefinition = {
  key: 'ink_island',
  name: '仙岛',
  width: 90,
  height: 65,
  elements: [
    // Island landmass (filled)
    {
      type: 'line',
      points: [
        15, 50, 10, 42, 8, 35, 12, 28, 20, 22,
        30, 18, 45, 15, 60, 18, 70, 22,
        78, 28, 82, 35, 80, 42, 75, 50,
      ],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.12)',
    },
    // Central peak
    {
      type: 'line',
      points: [45, 50, 38, 35, 42, 25, 45, 15, 48, 25, 52, 35, 45, 50],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.1)',
    },
    // Small pavilion on peak
    {
      type: 'line',
      points: [42, 18, 45, 14, 48, 18],
      stroke: '#8B4513',
      strokeWidth: 1,
    },
    {
      type: 'line',
      points: [43, 18, 43, 15, 45, 14, 47, 15, 47, 18],
      stroke: '#8B4513',
      strokeWidth: 0.8,
    },
    // Cloud/mist at island base
    {
      type: 'line',
      points: [5, 48, 15, 45, 25, 48, 35, 46, 45, 48, 55, 46, 65, 48, 75, 46, 85, 48],
      stroke: '#8B7355',
      strokeWidth: 0.8,
      opacity: 0.4,
    },
    // Water ripples around island
    {
      type: 'line',
      points: [0, 55, 15, 52, 30, 55, 45, 53, 60, 55, 75, 53, 90, 55],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.3,
    },
    // Small tree on left slope
    {
      type: 'line',
      points: [25, 30, 23, 24, 27, 26, 25, 20, 29, 26, 27, 24, 25, 30],
      stroke: '#5C4033',
      strokeWidth: 0.8,
      opacity: 0.6,
    },
    // Waterfall suggestion
    {
      type: 'line',
      points: [60, 25, 62, 30, 60, 35, 62, 40],
      stroke: '#4A7C8A',
      strokeWidth: 0.8,
      opacity: 0.4,
    },
  ],
}
