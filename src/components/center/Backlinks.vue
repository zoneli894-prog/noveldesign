<template>
  <div v-if="backlinks.length > 0" class="mt-8 pt-6 border-t border-brand-border">
    <h3 class="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">
      反向链接 · {{ backlinks.length }}
    </h3>
    <div class="space-y-1">
      <button
        v-for="link in backlinks"
        :key="link.id"
        class="block w-full text-left px-3 py-2 rounded text-sm text-brand-accent
               hover:bg-brand-accent/5 transition-colors"
        @click="$emit('navigate', link.id)"
      >
        {{ link.title }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ backlinks: { id: string; title: string }[] }>()
defineEmits<{ navigate: [id: string] }>()
</script>
