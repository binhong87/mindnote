import { useState } from 'react'
import { pluginManager } from '../../plugins/PluginManager'
import type { PluginRegistryEntry } from '../../plugins/types'

export default function PluginSettings() {
  const [plugins, setPlugins] = useState<PluginRegistryEntry[]>(pluginManager.getAll())
  const [, forceUpdate] = useState(0)

  const toggle = (id: string, enabled: boolean) => {
    if (enabled) {
      pluginManager.disable(id)
    } else {
      pluginManager.enable(id)
    }
    setPlugins(pluginManager.getAll())
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">🧩 Plugins</h2>
      {plugins.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">No plugins installed</p>
      ) : (
        <div className="space-y-3">
          {plugins.map(({ plugin, enabled }) => (
            <div
              key={plugin.id}
              className="flex items-center justify-between bg-[var(--bg-surface)] rounded-lg p-3"
            >
              <div>
                <div className="font-medium text-[var(--text-primary)]">{plugin.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {plugin.description} — v{plugin.version} by {plugin.author}
                </div>
              </div>
              <button
                onClick={() => toggle(plugin.id, enabled)}
                className={`px-3 py-1 text-xs rounded font-semibold ${
                  enabled
                    ? 'bg-[#a6e3a1] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]'
                }`}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
