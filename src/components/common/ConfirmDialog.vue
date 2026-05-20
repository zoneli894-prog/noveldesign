<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="$emit('cancel')"
      >
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div
            v-if="visible"
            class="relative w-full max-w-sm bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6"
          >
            <h3 class="font-serif font-semibold text-brand-text text-base mb-2">{{ title }}</h3>
            <p class="text-sm text-brand-muted leading-relaxed mb-6">{{ message }}</p>
            <div class="flex items-center justify-end gap-3">
              <button
                class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                @click="$emit('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
                @click="$emit('confirm')"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>
