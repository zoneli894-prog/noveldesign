<template>
  <div v-if="backlinks.length > 0" class="mt-10 pt-6 border-t border-brand-border/50">
    <h3 class="text-xs font-medium text-brand-muted/60 uppercase tracking-wider mb-4">
      反向链接 · {{ backlinks.length }}
    </h3>
    <div class="space-y-0.5">
      <button
        v-for="link in backlinks"
        :key="link.id"
        class="block w-full text-left px-3 py-2 rounded-lg text-sm text-brand-accent/80
               hover:bg-brand-accent/5 hover:text-brand-accent transition-all duration-150"
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
