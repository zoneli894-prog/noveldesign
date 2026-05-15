import { Mark, mergeAttributes } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, any>
  suggestion: any
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikiLink: {
      setWikiLink: (attributes: { targetId: string; targetTitle: string }) => ReturnType
      unsetWikiLink: () => ReturnType
    }
  }
}

export const WikiLink = Mark.create<WikiLinkOptions>({
  name: 'wikiLink',

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        char: '[',
        startOfLine: false,
        command: () => {},
        items: () => [],
        render: () => ({}),
        allow: () => true,
      },
    }
  },

  addAttributes() {
    return {
      targetId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-target-id'),
        renderHTML: (attributes: any) => {
          if (!attributes.targetId) return {}
          return { 'data-target-id': attributes.targetId }
        },
      },
      targetTitle: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-target-title'),
        renderHTML: (attributes: any) => {
          if (!attributes.targetTitle) return {}
          return { 'data-target-title': attributes.targetTitle }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-wiki-link]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(
        {
          class: 'wiki-link text-brand-accent underline decoration-brand-accent/40 cursor-pointer',
          'data-wiki-link': '',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ]
  },

  addCommands() {
    return {
      setWikiLink:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      unsetWikiLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
