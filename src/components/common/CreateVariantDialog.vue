<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <div class="bg-brand-card rounded-xl shadow-brand-lg w-[400px] p-6 border border-brand-border/60">
        <h3 class="text-lg font-serif font-semibold text-brand-text mb-4">新建变体</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-xs text-brand-muted mb-1">起始纪年 *</label>
            <input
              v-model="startYear"
              type="text"
              placeholder="如：天历元年"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>

          <div>
            <label class="block text-xs text-brand-muted mb-1">结束纪年（可选）</label>
            <input
              v-model="endYear"
              type="text"
              placeholder="留空表示至今"
              class="w-full text-sm bg-brand-bg border border-brand-border/60 rounded-lg px-3 py-2 outline-none focus:border-brand-accent transition-colors text-brand-text"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            class="px-4 py-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
            @click="$emit('cancel')"
          >
            取消
          </button>
          <button
            class="px-4 py-2 text-sm bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
            :disabled="!startYear.trim()"
            @click="handleConfirm"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  cancel: []
  confirm: [{ startYear: string; endYear: string }]
}>()

const startYear = ref('')
const endYear = ref('')

function handleConfirm() {
  emit('confirm', {
    startYear: startYear.value.trim(),
    endYear: endYear.value.trim(),
  })
  startYear.value = ''
  endYear.value = ''
}
</script>
