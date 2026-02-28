# MindNotes 🧠

> A local-first, AI-powered personal knowledge management app

## ✨ Features

### 📝 Rich Note Taking
- Full markdown editor with live preview
- Syntax highlighting in code blocks
- Tables, task lists, images, links
- YAML frontmatter & tags
- Internal wiki links `[[note-name]]`
- Backlinks panel

### 🔍 Smart Search
- Full-text search across all notes
- Tag-based filtering
- Quick open (command palette)

### 🕸️ Knowledge Graph
- Visual graph of all notes and connections
- Interactive mind map editor
- Auto-generate mind maps from note structure
- Personal CRM view

### 🤖 AI Assistant (Plugin)
- Multiple LLM providers: OpenAI, Anthropic, Gemini, Ollama, OpenRouter
- Summarize, rewrite, improve selected text
- AI chat sidebar with note context
- Auto-suggest tags
- RAG-powered responses from your notes (TF-IDF indexing)

### 🎨 Phase 5: Polish
- **Command Palette** (`Cmd+P`) — Obsidian-style fuzzy search for notes and commands
- **Light/Dark Theme** — toggle with `☀️/🌙` button, persisted in localStorage
- **Comprehensive Settings Panel** — Editor, Appearance, Notes, Plugins, AI, Keybindings, About
- **Export Notes** — HTML (standalone), PDF (print), or all notes as ZIP
- **Responsive UI** — mobile-friendly layout with hamburger menu, bottom nav, floating action button
- **Keyboard Shortcuts** — full set of shortcuts throughout the app

### 🔌 Plugin System
- Extensible plugin architecture
- Enable/disable plugins with one click
- Plugin settings & configuration
- Full AppAPI for plugin developers

### 💾 Local First
- All data stored as markdown files on your filesystem
- No cloud required, you own your data
- Git-based version history

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust (for Tauri desktop builds)

### Development
```bash
git clone https://github.com/binhong87/mindnote.git
cd mindnote
npm install
npm run dev
```

### Desktop App (Tauri)
```bash
npm run tauri dev     # development
npm run tauri build   # production build
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+P` / `Ctrl+P` | Open Command Palette |
| `Cmd+N` / `Ctrl+N` | New Note |
| `Cmd+,` / `Ctrl+,` | Open Settings |
| `Cmd+G` / `Ctrl+G` | Toggle Graph View |
| `Cmd+M` / `Ctrl+M` | Toggle Mind Map |
| `Cmd+S` / `Ctrl+S` | Save Note (toast confirmation) |
| `Cmd+F` / `Ctrl+F` | Focus Search |
| `Escape` | Close Modal / Command Palette |

## 🗺️ Roadmap
- [x] Phase 1: Foundation & file management
- [x] Phase 2: Rich editing & search
- [x] Phase 3: Plugin framework & AI assistant
- [x] Phase 4: Mind maps & knowledge graph
- [x] Phase 5: Polish — command palette, themes, settings, export, responsive UI, keyboard shortcuts
- [ ] Phase 6: Mobile (iOS/Android via Tauri), Canvas/whiteboard, voice notes, collaboration

## 🛠️ Tech Stack
- **Framework:** Tauri v2 (desktop + mobile)
- **Frontend:** React 18 + TypeScript + Vite
- **Editor:** TipTap
- **Graph:** React Flow
- **Styling:** Tailwind CSS
- **State:** Zustand
- **AI:** Configurable LLM providers

## 📄 License
MIT
