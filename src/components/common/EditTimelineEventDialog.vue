<template>
  <Teleport to="body">
    <Transition name="palette-backdrop">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="$emit('cancel')">
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('cancel')" />
        <Transition name="palette" appear>
          <div v-if="visible" class="relative w-full max-w-lg bg-brand-card-solid rounded-2xl shadow-brand-xl border border-brand-border/60 overflow-hidden">
            <!-- Header -->
            <div class="px-6 pt-5 pb-4 border-b border-brand-border/40">
              <h3 class="font-serif font-semibold text-brand-text text-base">
                {{ isEditing ? '编辑事件' : '新建事件' }}
              </h3>
            </div>

            <!-- Form -->
            <div class="p-6 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">事件标题</label>
                <input
                  ref="titleInput"
                  v-model="form.title"
                  type="text"
                  placeholder="例如：天枢城建立"
                  class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>

              <!-- Date -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">显示日期</label>
                  <input
                    v-model="form.date"
                    type="text"
                    placeholder="例如：三千年前"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-text mb-1.5">排序值（数字）</label>
                  <input
                    v-model.number="form.dateSort"
                    type="number"
                    placeholder="例如：-3000"
                    class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">分类</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(label, key) in categoryLabels"
                    :key="key"
                    type="button"
                    class="px-3 py-1.5 text-xs rounded-lg border transition-all"
                    :class="form.category === key
                      ? 'border-brand-accent bg-brand-accent-light/50 text-brand-accent'
                      : 'border-brand-border/50 text-brand-muted hover:border-brand-accent/40'"
                    @click="form.category = key as TimelineEvent['category']"
                  >
                    {{ label }}
                  </button>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">事件描述</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="简要描述这个事件..."
                  class="w-full px-3 py-2.5 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors resize-none"
                />
              </div>

              <!-- Related docs -->
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1.5">关联词条</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="doc in form.relatedDocs"
                    :key="doc.id"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-brand-accent-light/50 text-brand-accent rounded-full"
                  >
                    {{ doc.title }}
                    <button
                      type="button"
                      class="ml-0.5 hover:text-brand-text"
                      @click="removeRelatedDoc(doc.id)"
                    >
                      <X :size="12" />
                    </button>
                  </span>
                </div>
                <div class="relative" ref="docSearchRef">
                  <input
                    v-model="docSearchQuery"
                    type="text"
                    placeholder="搜索词条名称添加..."
                    class="w-full px-3 py-2 text-sm bg-brand-bg border border-brand-border/50 rounded-lg text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none transition-colors"
                    @focus="showDocDropdown = true"
                  />
                  <div
                    v-if="showDocDropdown && filteredDocs.length > 0"
                    class="absolute top-full left-0 right-0 mt-1 bg-brand-card-solid rounded-lg shadow-brand-lg border border-brand-border/60 py-1 max-h-[160px] overflow-y-auto z-10"
                  >
                    <button
                      v-for="doc in filteredDocs"
                      :key="doc.id"
                      type="button"
                      class="w-full text-left px-3 py-2 text-sm text-brand-text hover:bg-brand-bg transition-colors"
                      @click="addRelatedDoc(doc)"
                    >
                      {{ doc.title }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-5 flex items-center justify-end gap-3">
              <button
                class="px-4 py-2 text-sm rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                @click="$emit('cancel')"
              >
                取消
              </button>
              <button
                v-if="isEditing"
                class="px-4 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                @click="handleDelete"
              >
                删除
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors disabled:opacity-40"
                :disabled="!isValid"
                @click="handleConfirm"
              >
                {{ isEditing ? '保存' : '创建' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { useNovelDataStore } from '@/stores/novelData'
import type { TimelineEvent } from '@/types'

const props = defineProps<{
  visible: boolean
  event?: TimelineEvent | null
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [event: Omit<TimelineEvent, 'id'>]
  delete: [id: string]
}>()

const novelStore = useNovelDataStore()

const titleInput = ref<HTMLInputElement | null>(null)
const docSearchRef = ref<HTMLDivElement | null>(null)
const docSearchQuery = ref('')
const showDocDropdown = ref(false)

const isEditing = computed(() => !!props.event)

const categoryLabels: Record<string, string> = {
  war: '战争',
  discovery: '发现',
  political: '政治',
  personal: '个人',
  catastrophe: '灾变',
}

const form = reactive({
  title: '',
  date: '',
  dateSort: 0,
  description: '',
  category: 'personal' as TimelineEvent['category'],
  relatedDocs: [] as { id: string; title: string }[],
})

const filteredDocs = computed(() => {
  if (!docSearchQuery.value.trim()) return []
  const query = docSearchQuery.value.toLowerCase()
  return novelStore.flatDocs
    .filter(d => d.title.toLowerCase().includes(query))
    .filter(d => !form.relatedDocs.some(rd => rd.id === d.id))
    .slice(0, 10)
})

const isValid = computed(() => {
  return form.title.trim() && form.date.trim() && form.dateSort !== null
})

watch(() => props.visible, async (v) => {
  if (v) {
    if (props.event) {
      form.title = props.event.title
      form.date = props.event.date
      form.dateSort = props.event.dateSort
      form.description = props.event.description
      form.category = props.event.category
      form.relatedDocs = [...props.event.relatedDocs]
    } else {
      form.title = ''
      form.date = ''
      form.dateSort = 0
      form.description = ''
      form.category = 'personal'
      form.relatedDocs = []
    }
    docSearchQuery.value = ''
    showDocDropdown.value = false
    await nextTick()
    titleInput.value?.focus()
  }
})

function addRelatedDoc(doc: { id: string; title: string }) {
  if (!form.relatedDocs.some(d => d.id === doc.id)) {
    form.relatedDocs.push({ id: doc.id, title: doc.title })
  }
  docSearchQuery.value = ''
  showDocDropdown.value = false
}

function removeRelatedDoc(id: string) {
  form.relatedDocs = form.relatedDocs.filter(d => d.id !== id)
}

function handleConfirm() {
  if (!isValid.value) return
  emit('confirm', {
    title: form.title.trim(),
    date: form.date.trim(),
    dateSort: form.dateSort,
    description: form.description.trim(),
    category: form.category,
    relatedDocs: form.relatedDocs,
  })
}

function handleDelete() {
  if (props.event) {
    emit('delete', props.event.id)
  }
}

function handleClickOutside(e: MouseEvent) {
  if (docSearchRef.value && !docSearchRef.value.contains(e.target as Node)) {
    showDocDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
