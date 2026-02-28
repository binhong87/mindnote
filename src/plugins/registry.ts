import type { MindNotesPlugin, AppAPI } from './types'
import { pluginManager } from './PluginManager'
import { aiPlugin } from './ai-plugin'

// Built-in plugin: Word Count
const wordCountPlugin: MindNotesPlugin = {
  id: 'builtin-word-count',
  name: 'Word Count',
  version: '1.0.0',
  description: 'Displays word count for the current note',
  author: 'MindNotes',
  onLoad(app: AppAPI) {
    app.registerCommand('word-count', 'Show Word Count', () => {
      console.log('Word count command executed')
    })
  },
  onUnload() {},
}

export function registerBuiltinPlugins() {
  pluginManager.register(wordCountPlugin)
  pluginManager.register(aiPlugin)
  // Auto-enable AI plugin
  pluginManager.enable('ai-assistant')
}

export const builtinPlugins = [wordCountPlugin, aiPlugin]
