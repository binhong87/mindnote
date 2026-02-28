import { useState, useEffect } from 'react'
import PluginSettings from './PluginSettings'

export interface AppSettings {
  // Editor
  fontSize: number
  fontFamily: 'monospace' | 'sans'
  lineHeight: number
  spellCheck: boolean
  wordWrap: boolean
  // Appearance
  theme: 'dark' | 'light' | 'system'
  accentColor: string
  // Notes
  dateFormat: string
  newNoteTemplate: string
  // About
  version: string
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 16,
  fontFamily: 'sans',
  lineHeight: 1.7,
  spellCheck: false,
  wordWrap: true,
  theme: 'dark',
  accentColor: '#89b4fa',
  dateFormat: 'YYYY-MM-DD',
  newNoteTemplate: '# {{title}}\n\nCreated: {{date}}\n\n',
  version: '0.5.0',
}

export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('mindnotes-settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem('mindnotes-settings', JSON.stringify(s))
}

const TABS = ['Editor', 'Appearance', 'Notes', 'Plugins', 'AI', 'Keybindings', 'About'] as const
type Tab = typeof TABS[number]

const SHORTCUTS = [
  { key: '⌘P / Ctrl+P', action: 'Open Command Palette' },
  { key: '⌘N / Ctrl+N', action: 'New Note' },
  { key: '⌘, / Ctrl+,', action: 'Open Settings' },
  { key: '⌘G / Ctrl+G', action: 'Toggle Graph View' },
  { key: '⌘M / Ctrl+M', action: 'Toggle Mind Map' },
  { key: '⌘E / Ctrl+E', action: 'Toggle Editor/Preview' },
  { key: '⌘F / Ctrl+F', action: 'Focus Search' },
  { key: '⌘S / Ctrl+S', action: 'Save Note' },
  { key: 'Escape', action: 'Close Modal / Command Palette' },
]

interface SettingsPanelProps {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>('Editor')
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const update = (patch: Partial<AppSettings>) => setSettings(s => ({ ...s, ...patch }))

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative flex rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: '720px',
          maxWidth: '95vw',
          height: '520px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div style={{ width: '160px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border)', padding: '16px 0', flexShrink: 0 }}>
          <div style={{ padding: '0 12px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Settings
          </div>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                fontSize: '13px',
                color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
                background: tab === t ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: tab === t ? 600 : 400,
                borderLeft: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '18px', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >✕</button>

          {tab === 'Editor' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Editor</h2>
              <SettingRow label="Font Size" hint={`${settings.fontSize}px`}>
                <input type="range" min={12} max={24} value={settings.fontSize} onChange={e => update({ fontSize: +e.target.value })}
                  style={{ width: '120px' }} />
              </SettingRow>
              <SettingRow label="Font Family">
                <select value={settings.fontFamily} onChange={e => update({ fontFamily: e.target.value as 'monospace' | 'sans' })}
                  style={selectStyle}>
                  <option value="sans">Sans-serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </SettingRow>
              <SettingRow label="Line Height" hint={settings.lineHeight.toString()}>
                <input type="range" min={1.2} max={2.2} step={0.1} value={settings.lineHeight}
                  onChange={e => update({ lineHeight: +e.target.value })} style={{ width: '120px' }} />
              </SettingRow>
              <SettingRow label="Spell Check">
                <Toggle value={settings.spellCheck} onChange={v => update({ spellCheck: v })} />
              </SettingRow>
              <SettingRow label="Word Wrap">
                <Toggle value={settings.wordWrap} onChange={v => update({ wordWrap: v })} />
              </SettingRow>
            </div>
          )}

          {tab === 'Appearance' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Appearance</h2>
              <SettingRow label="Theme">
                <select value={settings.theme} onChange={e => update({ theme: e.target.value as AppSettings['theme'] })}
                  style={selectStyle}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </SettingRow>
              <SettingRow label="Accent Color">
                <input type="color" value={settings.accentColor}
                  onChange={e => {
                    update({ accentColor: e.target.value })
                    document.documentElement.style.setProperty('--accent', e.target.value)
                  }}
                  style={{ width: '40px', height: '32px', border: 'none', cursor: 'pointer', background: 'none' }} />
              </SettingRow>
            </div>
          )}

          {tab === 'Notes' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Notes</h2>
              <SettingRow label="Date Format">
                <select value={settings.dateFormat} onChange={e => update({ dateFormat: e.target.value })} style={selectStyle}>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </SettingRow>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  New Note Template
                </label>
                <textarea
                  value={settings.newNoteTemplate}
                  onChange={e => update({ newNoteTemplate: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Use {'{{title}}'} and {'{{date}}'} as placeholders</span>
              </div>
            </div>
          )}

          {tab === 'Plugins' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Plugins</h2>
              <PluginSettings />
            </div>
          )}

          {tab === 'AI' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>AI Settings</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                AI settings are managed via the AI plugin. Enable the AI plugin in the Plugins tab to configure provider, API key, and model.
              </p>
            </div>
          )}

          {tab === 'Keybindings' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {SHORTCUTS.map(s => (
                    <tr key={s.key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 0', width: '180px' }}>
                        <kbd style={{
                          fontSize: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          color: 'var(--text-primary)',
                          fontFamily: 'monospace',
                        }}>{s.key}</kbd>
                      </td>
                      <td style={{ padding: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'About' && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>About MindNotes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <AboutRow label="Version" value={`v${settings.version}`} />
                <AboutRow label="License" value="MIT" />
                <AboutRow label="GitHub">
                  <a href="https://github.com/binhong87/mindnote" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)' }}>
                    github.com/binhong87/mindnote
                  </a>
                </AboutRow>
                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                  MindNotes is a local-first note-taking app inspired by Obsidian, built with Tauri, React, and TipTap.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function AboutRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <span style={{ width: '80px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}{children}</span>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        background: value ? 'var(--accent)' : 'var(--bg-surface)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'white',
        top: '3px',
        left: value ? '21px' : '3px',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
}
