import type { AssetDefinition } from '@/types/map'

export const inkPagoda: AssetDefinition = {
  key: 'ink_pagoda',
  name: '宝塔',
  width: 50,
  height: 80,
  elements: [
    // Base platform
    {
      type: 'line',
      points: [5, 78, 45, 78, 48, 74, 2, 74],
      stroke: '#5C4033',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(92, 64, 51, 0.2)',
    },
    // First floor
    {
      type: 'line',
      points: [8, 74, 8, 62, 42, 62, 42, 74],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.08)',
    },
    // First floor eave
    {
      type: 'line',
      points: [4, 62, 25, 58, 46, 62],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Second floor
    {
      type: 'line',
      points: [12, 58, 12, 48, 38, 48, 38, 58],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.06)',
    },
    // Second floor eave
    {
      type: 'line',
      points: [8, 48, 25, 44, 42, 48],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Third floor
    {
      type: 'line',
      points: [16, 44, 16, 36, 34, 36, 34, 44],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.04)',
    },
    // Third floor eave
    {
      type: 'line',
      points: [12, 36, 25, 32, 38, 36],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Fourth floor
    {
      type: 'line',
      points: [19, 32, 19, 26, 31, 26, 31, 32],
      stroke: '#2C2C2C',
      strokeWidth: 1.2,
      closed: true,
    },
    // Spire
    {
      type: 'line',
      points: [25, 26, 25, 10],
      stroke: '#2C2C2C',
      strokeWidth: 1.5,
    },
    // Spire ornament
    {
      type: 'line',
      points: [22, 14, 25, 10, 28, 14],
      stroke: '#8B7355',
      strokeWidth: 1,
    },
    // Door on first floor
    {
      type: 'line',
      points: [21, 74, 21, 66, 25, 64, 29, 66, 29, 74],
      stroke: '#2C2C2C',
      strokeWidth: 1,
      closed: true,
      fill: 'rgba(44, 44, 44, 0.15)',
    },
    // Window on second floor
    {
      type: 'line',
      points: [22, 55, 22, 51, 28, 51, 28, 55],
      stroke: '#2C2C2C',
      strokeWidth: 0.8,
      closed: true,
    },
  ],
}
