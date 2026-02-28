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

## 🗺️ Roadmap
- [x] Phase 1: Foundation & file management
- [x] Phase 2: Rich editing & search
- [x] Phase 4: Mind maps & knowledge graph
- [x] Phase 3: Plugin framework & AI assistant
- [ ] Phase 5: Mobile (iOS/Android via Tauri)
- [ ] Phase 6: Canvas/whiteboard, voice notes, collaboration

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
