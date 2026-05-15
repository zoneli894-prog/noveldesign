<template>
  <div class="wiki-editor-wrapper relative" ref="wrapperRef">
    <EditorContent :editor="editor" class="prose-editor" />
    <WikiLinkPreview ref="previewRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, createApp, h } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import SuggestionPlugin from '@tiptap/suggestion'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import { WikiLink } from '@/extensions/wiki-link/WikiLinkExtension'
import { SlashCommand } from '@/extensions/slash-command/SlashCommandExtension'
import { useNovelDataStore } from '@/stores/novelData'
import { useRouter } from 'vue-router'
import WikiLinkPreview from './WikiLinkPreview.vue'
import WikiLinkSuggest from './WikiLinkSuggest.vue'
import SlashCommandList from './SlashCommandList.vue'

const props = defineProps<{
  content: string
  docId: string
}>()

const emit = defineEmits<{
  'update:content': [html: string]
}>()

const router = useRouter()
const novelStore = useNovelDataStore()
const previewRef = ref<InstanceType<typeof WikiLinkPreview> | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

let isUpdatingFromProp = false

// Wiki-link suggestion renderer
function createWikiLinkSuggestionRenderer() {
  let component: any = null
  let popup: TippyInstance | null = null

  return {
    onStart: (props: any) => {
      const container = document.createElement('div')
      const app = createApp(WikiLinkSuggest, {
        items: props.items,
        command: props.command,
      })
      component = app.mount(container)

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: container,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'light',
      })[0]
    },
    onUpdate: (props: any) => {
      if (component) {
        component.items = props.items
        component.command = props.command
      }
      popup?.setProps({ getReferenceClientRect: props.clientRect })
    },
    onKeyDown: (props: any) => {
      if (component?.onKeyDown) {
        return component.onKeyDown(props.event)
      }
      return false
    },
    onExit: () => {
      popup?.destroy()
      popup = null
      component = null
    },
  }
}

// Slash command suggestion renderer
function createSlashCommandSuggestionRenderer() {
  let component: any = null
  let popup: TippyInstance | null = null

  return {
    onStart: (props: any) => {
      const container = document.createElement('div')
      const app = createApp(SlashCommandList, {
        items: props.items,
        command: props.command,
      })
      component = app.mount(container)

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: container,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'light',
      })[0]
    },
    onUpdate: (props: any) => {
      if (component) {
        component.items = props.items
        component.command = props.command
      }
      popup?.setProps({ getReferenceClientRect: props.clientRect })
    },
    onKeyDown: (props: any) => {
      if (component?.onKeyDown) {
        return component.onKeyDown(props.event)
      }
      return false
    },
    onExit: () => {
      popup?.destroy()
      popup = null
      component = null
    },
  }
}

const slashCommands = [
  { title: '一级标题', icon: 'H1', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run() },
  { title: '二级标题', icon: 'H2', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run() },
  { title: '三级标题', icon: 'H3', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run() },
  { title: '无序列表', icon: '•', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: '有序列表', icon: '1.', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: '引用', icon: '“', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
  { title: '代码块', icon: '<>', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
  { title: '分割线', icon: '—', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
]

const editor = useEditor({
  content: props.content,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({
      placeholder: '输入 / 查看命令列表...',
    }),
    CharacterCount,
    SuggestionPlugin.configure({
      char: '[',
      startOfLine: false,
      items: ({ query }: { query: string }) => {
        if (query) {
          return novelStore.flatDocs
            .filter(d => d.children.length === 0 && d.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
            .map(d => ({ id: d.id, title: d.title, type: d.type }))
        }
        return novelStore.flatDocs
          .filter(d => d.children.length === 0)
          .slice(0, 8)
          .map(d => ({ id: d.id, title: d.title, type: d.type }))
      },
      command: ({ editor, range, props }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'text',
            text: props.title,
            marks: [{ type: 'wikiLink', attrs: { targetId: props.id, targetTitle: props.title } }],
          })
          .run()
      },
      render: createWikiLinkSuggestionRenderer,
    }),
    SlashCommand.configure({
      suggestion: {
        char: '/',
        items: ({ query }: { query: string }) => {
          if (!query) return slashCommands
          return slashCommands.filter(c => c.title.includes(query))
        },
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
        render: createSlashCommandSuggestionRenderer,
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    if (!isUpdatingFromProp) {
      emit('update:content', editor.getHTML())
    }
  },
  editorProps: {
    attributes: {
      class: 'min-h-[200px] outline-none text-brand-text leading-relaxed',
    },
  },
})

// Wiki-link hover preview and click navigation
function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement
  const link = target?.classList?.contains('wiki-link') ? target : target?.closest?.('.wiki-link')
  if (link) {
    const targetId = link.getAttribute('data-target-id')
    if (targetId && previewRef.value) {
      previewRef.value.show(targetId, link.getBoundingClientRect())
    }
  }
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement
  const link = target?.classList?.contains('wiki-link') ? target : target?.closest?.('.wiki-link')
  if (link) {
    previewRef.value?.hide()
  }
}

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const link = target?.classList?.contains('wiki-link') ? target : target?.closest?.('.wiki-link')
  if (link) {
    const targetId = link.getAttribute('data-target-id')
    if (targetId) {
      e.preventDefault()
      novelStore.setActiveDoc(targetId)
      router.push(`/project/default/doc/${targetId}`)
    }
  }
}

onMounted(() => {
  if (wrapperRef.value) {
    wrapperRef.value.addEventListener('mouseover', handleMouseOver)
    wrapperRef.value.addEventListener('mouseout', handleMouseOut)
    wrapperRef.value.addEventListener('click', handleClick)
  }
})

onUnmounted(() => {
  if (wrapperRef.value) {
    wrapperRef.value.removeEventListener('mouseover', handleMouseOver)
    wrapperRef.value.removeEventListener('mouseout', handleMouseOut)
    wrapperRef.value.removeEventListener('click', handleClick)
  }
  editor.value?.destroy()
})

// Update editor content when doc changes
watch(
  () => [props.docId, props.content],
  () => {
    if (editor.value && props.content !== editor.value.getHTML()) {
      isUpdatingFromProp = true
      editor.value.commands.setContent(props.content, false)
      isUpdatingFromProp = false
    }
  }
)
</script>

<style>
.wiki-editor-wrapper .ProseMirror {
  min-height: 200px;
  outline: none;
}

.wiki-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #8A8A8A;
  pointer-events: none;
  height: 0;
}

.wiki-editor-wrapper .ProseMirror h1 {
  font-family: "Noto Serif SC", serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.wiki-editor-wrapper .ProseMirror h2 {
  font-family: "Noto Serif SC", serif;
  font-size: 1.375rem;
  font-weight: 600;
  margin-top: 1.3em;
  margin-bottom: 0.4em;
  line-height: 1.35;
}

.wiki-editor-wrapper .ProseMirror h3 {
  font-family: "Noto Serif SC", serif;
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.2em;
  margin-bottom: 0.3em;
  line-height: 1.4;
}

.wiki-editor-wrapper .ProseMirror p {
  margin-bottom: 1.5em;
  line-height: 1.7;
}

.wiki-editor-wrapper .ProseMirror a.wiki-link {
  color: #3B6B5E;
  text-decoration: underline;
  text-decoration-color: rgba(59, 107, 94, 0.4);
  cursor: pointer;
  transition: background-color 0.15s;
  border-radius: 2px;
}

.wiki-editor-wrapper .ProseMirror a.wiki-link:hover {
  background-color: rgba(59, 107, 94, 0.08);
  text-decoration-color: #3B6B5E;
}

.wiki-editor-wrapper .ProseMirror blockquote {
  border-left: 3px solid #3B6B5E;
  padding-left: 1em;
  margin-left: 0;
  color: #8A8A8A;
  font-style: italic;
}

.wiki-editor-wrapper .ProseMirror pre {
  background: #f5f5f4;
  border-radius: 6px;
  padding: 0.75em 1em;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.875em;
}

.wiki-editor-wrapper .ProseMirror code {
  background: #f5f5f4;
  border-radius: 3px;
  padding: 0.15em 0.3em;
  font-size: 0.875em;
}

.wiki-editor-wrapper .ProseMirror hr {
  border: none;
  border-top: 1px solid #e5e5e3;
  margin: 2em 0;
}

.wiki-editor-wrapper .ProseMirror ul,
.wiki-editor-wrapper .ProseMirror ol {
  padding-left: 1.5em;
  margin-bottom: 1.5em;
}

.wiki-editor-wrapper .ProseMirror li {
  margin-bottom: 0.3em;
}
</style>
