<template>
  <div class="mb-8 animate-content-enter">
    <div class="flex items-start justify-between gap-4">
      <h1 class="text-[1.85rem] font-serif font-semibold text-brand-text leading-snug tracking-tight">
        {{ activeVariant ? `${doc.title}（${activeVariant.title}）` : doc.title }}
      </h1>
      <div class="flex items-center gap-1 mt-1.5 shrink-0">
        <button
          class="transition-all duration-200 hover:scale-110"
          :class="doc.starred ? 'text-amber-400' : 'text-brand-border/60 hover:text-amber-400'"
          @click="$emit('toggleStar')"
          :title="doc.starred ? '取消收藏' : '添加收藏'"
        >
          <Star :size="20" :fill="doc.starred ? 'currentColor' : 'none'" />
        </button>
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-brand-accent"
          @click="$emit('export')"
          title="导出为 Word"
        >
          <Download :size="18" />
        </button>
        <button
          class="transition-all duration-200 hover:scale-110 text-brand-muted/40 hover:text-red-400"
          @click="$emit('delete')"
          title="删除词条"
        >
          <Trash2 :size="18" />
        </button>
        <button
          v-if="doc.variants.length === 0"
          class="transition-all duration-200 hover:scale-110 text-brand-muted/60 hover:text-brand-accent"
          @click="$emit('convertToParallel')"
          title="转为平行词条"
        >
          <GitBranch :size="16" />
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span
        class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
        :style="{
          backgroundColor: typeColors[doc.type] ? typeColors[doc.type] + '18' : '#88888818',
          color: typeColors[doc.type] || '#888'
        }"
      >
        {{ typeLabels[doc.type] }}
      </span>
      <span
        v-for="tag in doc.tags"
        :key="tag"
        class="inline-block px-2 py-0.5 rounded-md text-[10px] text-brand-muted/70 bg-brand-bg/80 hover:bg-brand-accent-light hover:text-brand-accent transition-colors duration-150 cursor-default"
      >
        #{{ tag }}
      </span>
    </div>
    <!-- Variant tabs -->
    <div
      v-if="doc.variants.length > 0"
      class="flex items-center gap-1 mt-3 pb-2 border-b border-brand-border/40"
    >
      <button
        class="px-3 py-1 text-xs rounded-md transition-colors"
        :class="[
          !activeVariantId
            ? 'bg-brand-accent/10 text-brand-accent font-medium'
            : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg',
        ]"
        @click="$emit('selectVariant', null)"
      >
        当前版本
      </button>
      <button
        v-for="variant in doc.variants"
        :key="variant.id"
        class="px-3 py-1 text-xs rounded-md transition-colors"
        :class="[
          activeVariantId === variant.id
            ? 'bg-brand-accent/10 text-brand-accent font-medium'
            : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg',
        ]"
        @click="$emit('selectVariant', variant.id)"
      >
        {{ variant.title }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Star, Trash2, Download, GitBranch } from 'lucide-vue-next'
import type { DocNode, DocMeta } from '@/types'
import { typeLabels, typeColors } from '@/data/seed'

const props = defineProps<{
  doc: DocNode
  meta: DocMeta | null
  activeVariantId?: string | null
}>()

defineEmits<{
  toggleStar: []
  delete: []
  export: []
  convertToParallel: []
  selectVariant: [variantId: string | null]
}>()

const activeVariant = computed(() => {
  if (!props.activeVariantId || !props.doc.variants.length) return null
  return props.doc.variants.find(v => v.id === props.activeVariantId) || null
})
</script>
