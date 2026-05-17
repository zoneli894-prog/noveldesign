<template>
  <span
    class="inline-flex items-center justify-center type-icon"
    :style="{ width: `${size}px`, height: `${size}px`, color }"
    v-html="typeIconsSvg[type]"
  />
</template>

<script setup lang="ts">
import { typeIconsSvg } from '@/assets/icons/types'

withDefaults(defineProps<{
  type: string
  size?: number
  color?: string
}>(), {
  size: 16,
  color: 'currentColor',
})
</script>

<style scoped>
.type-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
