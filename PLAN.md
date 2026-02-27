# MindNotes — Personal Knowledge Management App

An Obsidian-like, local-first note-taking and knowledge management app with AI features and mind graph visualization.

## Tech Stack

- **Framework:** Tauri v2 (Desktop + Mobile)
- **Frontend:** React + TypeScript + Vite
- **Markdown:** MDXEditor / TipTap with markdown support
- **Mind Maps:** React Flow / D3.js for graph visualization
- **AI Backend:** Configurable LLM providers (OpenAI, Anthropic, Gemini, local models)
- **Storage:** Local filesystem (markdown files), SQLite for metadata/search index
- **Styling:** Tailwind CSS
- **Version Control:** Git-based commit history

## Design Principles

1. **Local First** — All data stored as markdown files on the user's filesystem
2. **User Owns Their Data** — No cloud dependency, no lock-in
3. **AI-Augmented** — AI assists but never overwrites without consent
4. **Cross-Platform** — Desktop (macOS, Windows, Linux) + Mobile (iOS, Android)

## Project Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project scaffolding (Tauri v2 + React + TypeScript + Vite)
- [ ] File tree sidebar (read local directory, display hierarchy)
- [ ] Markdown editor with live preview (TipTap or MDXEditor)
- [ ] Create, rename, delete, move notes
- [ ] Basic folder/category management
- [ ] Git integration (auto-commit on save)

### Phase 2: Rich Editing (Week 3-4)
- [ ] Full markdown rendering (headings, lists, code blocks, tables, images)
- [ ] Mermaid diagram support
- [ ] Syntax highlighting in code blocks
- [ ] Search across all notes (full-text search via SQLite FTS)
- [ ] Tags and metadata (YAML frontmatter)
- [ ] Backlinks and internal linking (`[[wiki-links]]`)

### Phase 3: AI Features (Week 5-6)
- [ ] LLM provider configuration (API key, model selection, base URL)
- [ ] AI summarize selected text / entire note
- [ ] AI rewrite / improve text
- [ ] AI-assisted note organization (suggest categories, tags)
- [ ] AI chat sidebar (ask questions about your notes)
- [ ] RAG: index notes for context-aware AI responses

### Phase 4: Mind Maps & Graphs (Week 7-8)
- [ ] Knowledge graph visualization (nodes = notes, edges = links)
- [ ] Interactive mind map editor (create/edit nodes visually)
- [ ] Auto-generate mind maps from note structure
- [ ] Personal CRM view (people as nodes, relationships as edges)
- [ ] Filter/search within graph view

### Phase 5: Polish & Mobile (Week 9-10)
- [ ] Responsive UI for mobile screens
- [ ] Tauri mobile builds (iOS + Android)
- [ ] Keyboard shortcuts and command palette
- [ ] Theming (light/dark mode)
- [ ] Settings panel (editor prefs, AI config, appearance)
- [ ] Export (PDF, HTML)

### Phase 6: Advanced (Future)
- [ ] Plugin/extension system
- [ ] Collaboration (optional, P2P sync)
- [ ] Canvas/whiteboard view
- [ ] Voice notes with transcription
- [ ] Daily notes / journal template

## Directory Structure

```
mindnotes/
├── src-tauri/          # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/   # Tauri commands (file ops, git, AI)
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── components/
│   │   ├── Sidebar/    # File tree
│   │   ├── Editor/     # Markdown editor
│   │   ├── MindMap/    # Graph visualization
│   │   ├── AI/         # AI chat & features
│   │   └── Settings/   # Configuration
│   ├── hooks/
│   ├── stores/         # State management
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```
