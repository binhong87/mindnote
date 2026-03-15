# MindNote Refactor: VS Code Architecture

## Overview

Refactoring MindNote from a flat component tree to a VS Code-inspired workbench architecture with service-oriented design, multi-tab editing, command registry, and contribution-point plugins.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│ Title Bar                                            │
├────┬─────────────┬───────────────────────┬───────────┤
│    │             │  Tab Bar              │           │
│ A  │  Sidebar    ├───────────────────────┤  Aux      │
│ c  │  (changes   │                       │  Sidebar  │
│ t  │  based on   │  Editor Area          │  (meta    │
│ i  │  activity)  │  (tabs, split view)   │  panel,   │
│ v  │             │                       │  AI chat) │
│ i  │             │                       │           │
│ t  │             ├───────────────────────┤           │
│ y  │             │  Bottom Panel         │           │
│    │             │  (AI chat, search     │           │
│ B  │             │   results, console)   │           │
│ a  │             │                       │           │
│ r  │             │                       │           │
├────┴─────────────┴───────────────────────┴───────────┤
│ Status Bar                                           │
└──────────────────────────────────────────────────────┘
```

## Migration Steps

### Step 1: DI Container + Service Interfaces ⬜
- ServiceCollection (simple DI container)
- Core service interfaces: IWorkspaceService, IEditorService, ICommandService, IViewService, IThemeService, IStorageService, INotificationService, IFileService
- React context provider for service access

### Step 2: Workbench Shell + Layout Components ⬜
- Workbench.tsx (main shell — layout grid)
- ActivityBar, Sidebar, EditorArea, Panel, AuxSidebar, StatusBar
- SplitView, TabBar common components

### Step 3: Editor Groups & Tabs ⬜
- EditorGroup, EditorTab, EditorPane
- Editor inputs: NoteEditorInput, MindMapEditorInput, GraphEditorInput, WelcomeEditorInput
- EditorRegistry (file type → editor input mapping)

### Step 4: Command Registry + Keybindings ⬜
- CommandRegistry (register/execute commands)
- KeybindingService (parse keybinding rules, dispatch)
- Migrate all keyboard shortcuts to commands

### Step 5: Activity Bar + View System ⬜
- ViewRegistry (register sidebar views)
- Activity bar items: Explorer, Search, Graph, Mind Map, AI, Settings
- View containers and view switching

### Step 6: Migrate Existing Components ⬜
- Move Sidebar → Explorer view
- Move Editor → NoteEditorInput
- Move MetaPanel → AuxSidebar content
- Move KnowledgeGraph → Graph view / editor input
- Move MindMapEditor → MindMap editor input
- Move Settings → Settings view / overlay

### Step 7: Plugin Contribution Points ⬜
- PluginContributions interface (commands, views, editors, statusBar, menus, keybindings, themes)
- Upgrade AI plugin to use contribution points
- Plugin lifecycle integration with services

### Step 8: Status Bar, Panels, Polish ⬜
- Status bar items (word count, file info, git status, AI model)
- Bottom panel (search results, AI chat alternate location)
- Resizable panels
- Final cleanup

## What We Keep
- ✅ Tauri v2
- ✅ React + TypeScript + Vite
- ✅ TipTap editor
- ✅ React Flow for mind maps
- ✅ Tailwind CSS
- ✅ All existing features

## What Changes
- 🔄 Flat component tree → Workbench shell with zones
- 🔄 Single Zustand store → Service-based architecture
- 🔄 Single editor view → Multi-tab editor groups
- 🔄 Hardcoded keyboard shortcuts → Command registry
- 🔄 Basic plugin system → Contribution-point extensions
