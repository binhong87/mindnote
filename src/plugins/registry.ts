import type { MindNotesPlugin, AppAPI } from './types'
import { pluginManager } from './PluginManager'

// Example built-in plugin: Word Count
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
  onUnload() {
    console.log('Word count plugin unloaded')
  },
}

// Register built-in plugins
export function registerBuiltinPlugins() {
  pluginManager.register(wordCountPlugin)
}

export const builtinPlugins = [wordCountPlugin]
