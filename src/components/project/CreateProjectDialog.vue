<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-sm bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6">
            <h3 class="font-serif font-semibold text-brand-text text-base mb-4">新建项目</h3>
            <input
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="输入项目名称..."
              class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
              @keydown.enter="handleConfirm"
              @keydown.escape="$emit('cancel')"
            />
            <div class="flex items-center justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors" @click="$emit('cancel')">
                取消
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                :disabled="!name.trim()"
                @click="handleConfirm"
              >
                创建
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ cancel: []; confirm: [name: string] }>()

const name = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(() => props.visible, async (v) => {
  if (v) {
    name.value = ''
    await nextTick()
    nameInput.value?.focus()
  }
})

function handleConfirm() {
  const trimmed = name.value.trim()
  if (trimmed) {
    emit('confirm', trimmed)
    name.value = ''
  }
}
</script>
