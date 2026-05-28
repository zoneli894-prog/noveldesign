<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-md bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden p-6">
            <h3 class="font-serif font-semibold text-brand-text text-base mb-4">绑定词条</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">选择词条</label>
                <DocSearchPicker
                  v-model="selectedDocId"
                  placeholder="搜索并选择词条..."
                />
              </div>

              <div v-if="selectedDocId && variants.length > 0">
                <label class="block text-sm font-medium text-brand-text mb-1.5">选择平行分身（可选）</label>
                <select
                  v-model="selectedVariantId"
                  class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                >
                  <option value="">无</option>
                  <option v-for="variant in variants" :key="variant.id" :value="variant.id">
                    {{ variant.title }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">起始年</label>
                  <input
                    v-model.number="startYear"
                    type="number"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">结束年（空=至今）</label>
                  <input
                    v-model.number="endYear"
                    type="number"
                    placeholder="至今"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">填充颜色</label>
                <div class="flex gap-2">
                  <button
                    v-for="color in fillColorOptions"
                    :key="color.value"
                    class="w-8 h-8 rounded border-2 transition-colors"
                    :class="selectedFillColor === color.value
                      ? 'border-brand-accent'
                      : 'border-transparent'"
                    :style="{ backgroundColor: color.value }"
                    @click="selectedFillColor = color.value"
                  />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                @click="$emit('cancel')"
              >
                取消
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                :disabled="!isValid"
                @click="handleConfirm"
              >
                确认
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNovelDataStore } from '@/stores/novelData'
import DocSearchPicker from './DocSearchPicker.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [data: { docId: string; variantId?: string; startYear: number; endYear: number | null; fillColor: string }]
}>()

const novelStore = useNovelDataStore()
const flatDocs = computed(() => novelStore.flatDocs)

const selectedDocId = ref('')
const selectedVariantId = ref('')
const startYear = ref(1)
const endYear = ref<number | null>(null)
const selectedFillColor = ref('rgba(111, 153, 129, 0.25)')

const variants = computed(() => {
  const doc = flatDocs.value.find(d => d.id === selectedDocId.value)
  return doc?.variants || []
})

const isValid = computed(() => {
  return selectedDocId.value && startYear.value
})

const fillColorOptions = [
  { value: 'rgba(111, 153, 129, 0.25)', label: '浅石绿' },
  { value: 'rgba(70, 130, 180, 0.25)', label: '靛青' },
  { value: 'rgba(192, 72, 81, 0.25)', label: '朱砂红' },
  { value: 'rgba(180, 150, 100, 0.25)', label: '土黄' },
  { value: 'rgba(120, 80, 120, 0.25)', label: '紫檀' },
]

watch(() => props.visible, (v) => {
  if (v) {
    selectedDocId.value = ''
    selectedVariantId.value = ''
    startYear.value = 1
    endYear.value = null
    selectedFillColor.value = 'rgba(111, 153, 129, 0.25)'
  }
})

function handleConfirm() {
  if (!isValid.value) return
  emit('confirm', {
    docId: selectedDocId.value,
    variantId: selectedVariantId.value || undefined,
    startYear: startYear.value,
    endYear: endYear.value,
    fillColor: selectedFillColor.value,
  })
}
</script>
