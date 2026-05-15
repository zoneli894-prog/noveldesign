<template>
  <div class="flex h-full">
    <div class="flex-1 overflow-y-auto border-r border-brand-border">
      <slot name="left" />
    </div>
    <div class="flex-1 overflow-y-auto relative">
      <button
        class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded
               text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors text-sm"
        @click="$emit('close')"
      >
        ✕
      </button>
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>
