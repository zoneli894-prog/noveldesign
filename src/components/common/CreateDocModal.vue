<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div
        v-if="uiStore.createDocModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="close"
      >
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="close" />
        <Transition name="palette" appear>
          <div
            v-if="uiStore.createDocModalOpen"
            class="relative w-full max-w-md bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden"
          >
            <!-- Step indicator -->
            <div class="flex items-center justify-center gap-2 pt-5 pb-2">
              <div
                v-for="s in 3" :key="s"
                class="w-2 h-2 rounded-full transition-colors duration-200"
                :class="step >= s ? 'bg-brand-accent' : 'bg-brand-border'"
              />
            </div>

            <!-- Step 1: Title -->
            <div v-if="step === 1" class="p-6">
              <h3 class="font-serif font-semibold text-brand-text text-base mb-4">输入词条名称</h3>
              <input
                ref="titleInput"
                v-model="title"
                type="text"
                placeholder="例如：凌夜寒、天剑宗..."
                class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg
                       text-brand-text placeholder:text-brand-muted/50
                       focus:border-brand-accent focus:outline-none transition-colors"
                @keydown.enter="step = 2"
                @keydown.escape="close"
              />
            </div>

            <!-- Step 2: Type -->
            <div v-else-if="step === 2" class="p-6">
              <h3 class="font-serif font-semibold text-brand-text text-base mb-4">选择词条类型</h3>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="t in types" :key="t.value"
                  class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150"
                  :class="selectedType === t.value
                    ? 'border-brand-accent bg-brand-accent-light/50'
                    : 'border-brand-border/40 hover:border-brand-accent/40 bg-brand-bg/50'"
                  @click="selectedType = t.value"
                >
                  <TypeIcon :type="t.value" :size="24" :color="typeColors[t.value]" />
                  <span class="text-[11px] font-medium text-brand-text">{{ t.label }}</span>
                </button>
              </div>
            </div>

            <!-- Step 3: Parent -->
            <div v-else-if="step === 3" class="p-6">
              <h3 class="font-serif font-semibold text-brand-text text-base mb-4">选择放置位置</h3>
              <div class="max-h-[240px] overflow-y-auto space-y-0.5 pr-1">
                <!-- Root option -->
                <label
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  :class="selectedParent === null ? 'bg-brand-accent-light/50' : 'hover:bg-brand-bg'"
                >
                  <input
                    type="radio"
                    :checked="selectedParent === null"
                    class="accent-[var(--color-brand-accent)]"
                    @change="selectedParent = null"
                  />
                  <span class="text-sm text-brand-text">根目录</span>
                </label>
                <!-- Tree nodes -->
                <ParentTreeNode
                  v-for="node in novelStore.docTree"
                  :key="node.id"
                  :node="node"
                  :depth="0"
                  :selected-id="selectedParent"
                  @select="selectedParent = $event"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-5 flex items-center justify-between">
              <button
                v-if="step > 1"
                class="text-sm text-brand-muted hover:text-brand-text transition-colors"
                @click="step--"
              >
                上一步
              </button>
              <span v-else />
              <div class="flex items-center gap-2">
                <button
                  class="text-sm text-brand-muted hover:text-brand-text transition-colors px-3 py-1.5"
                  @click="close"
                >
                  取消
                </button>
                <button
                  v-if="step < 3"
                  class="text-sm text-white bg-brand-accent hover:bg-brand-accent/90 rounded-lg px-4 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!canNext"
                  @click="step++"
                >
                  下一步
                </button>
                <button
                  v-else
                  class="text-sm text-white bg-brand-accent hover:bg-brand-accent/90 rounded-lg px-4 py-1.5 transition-colors"
                  @click="finish"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useNovelDataStore } from '@/stores/novelData'
import { docRoute } from '@/utils/routes'
import { typeLabels, typeColors } from '@/data/seed'
import type { DocNode } from '@/types'
import TypeIcon from '@/components/common/TypeIcon.vue'
import ParentTreeNode from '@/components/common/ParentTreeNode.vue'

const router = useRouter()
const uiStore = useUiStore()
const novelStore = useNovelDataStore()

const step = ref(1)
const title = ref('')
const selectedType = ref<DocNode['type']>('character')
const selectedParent = ref<string | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)

const types = Object.entries(typeLabels).map(([value, label]) => ({ value: value as DocNode['type'], label }))

const canNext = computed(() => {
  if (step.value === 1) return title.value.trim().length > 0
  if (step.value === 2) return !!selectedType.value
  return true
})

watch(() => uiStore.createDocModalOpen, async (open) => {
  if (open) {
    step.value = 1
    title.value = ''
    selectedType.value = 'character'
    selectedParent.value = null
    await nextTick()
    titleInput.value?.focus()
  }
})

function close() {
  uiStore.closeCreateDocModal()
}

function finish() {
  const newNode = novelStore.addDoc({
    title: title.value.trim(),
    type: selectedType.value,
    parentId: selectedParent.value,
  })
  close()
  novelStore.setActiveDoc(newNode.id)
  router.push(docRoute(newNode.id))
}
</script>
