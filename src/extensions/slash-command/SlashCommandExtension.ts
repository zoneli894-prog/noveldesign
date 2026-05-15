import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export interface SlashCommandOptions {
  suggestion: any
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: () => {},
        items: () => [],
        render: () => ({}),
        allow: () => true,
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
