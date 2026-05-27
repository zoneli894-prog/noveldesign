import type { AssetDefinition } from '@/types/map'

export const cityGate: AssetDefinition = {
  key: 'city_gate',
  name: '城池',
  width: 60,
  height: 60,
  elements: [
    // City wall body (filled)
    {
      type: 'line',
      points: [8, 12, 52, 12, 52, 48, 8, 48],
      stroke: '#5C4033',
      strokeWidth: 2,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.15)',
    },
    // Wall top battlements
    {
      type: 'line',
      points: [8, 12, 12, 6, 16, 12, 20, 6, 24, 12, 28, 6, 32, 12, 36, 6, 40, 12, 44, 6, 48, 12, 52, 6, 52, 12],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Gate arch
    {
      type: 'line',
      points: [22, 48, 22, 32, 24, 28, 30, 26, 36, 28, 38, 32, 38, 48],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Gate inner arch (darker)
    {
      type: 'line',
      points: [24, 48, 24, 34, 26, 30, 30, 28, 34, 30, 36, 34, 36, 48],
      stroke: '#2C2C2C',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.25)',
    },
    // Watchtower left
    {
      type: 'line',
      points: [5, 8, 5, 12, 12, 12, 12, 8, 10, 4, 8, 8],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Watchtower right
    {
      type: 'line',
      points: [48, 8, 48, 12, 55, 12, 55, 8, 53, 4, 51, 8],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Wall detail lines
    {
      type: 'line',
      points: [8, 20, 22, 20],
      stroke: '#8B7355',
      strokeWidth: 0.5,
      opacity: 0.6,
    },
    {
      type: 'line',
      points: [38, 20, 52, 20],
      stroke: '#8B7355',
      strokeWidth: 0.5,
      opacity: 0.6,
    },
    {
      type: 'line',
      points: [8, 30, 22, 30],
      stroke: '#8B7355',
      strokeWidth: 0.5,
      opacity: 0.6,
    },
    {
      type: 'line',
      points: [38, 30, 52, 30],
      stroke: '#8B7355',
      strokeWidth: 0.5,
      opacity: 0.6,
    },
  ],
}
