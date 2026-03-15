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

### Step 1: DI Container + Service Interfaces ✅
- ServiceCollection (simple DI container)
- Core service interfaces: IWorkspaceService, IEditorService, ICommandService, IViewService, IThemeService, IStorageService, INotificationService, IFileService
- React context provider for service access

### Step 2: Workbench Shell + Layout Components ✅
- Workbench.tsx (main shell — layout grid)
- ActivityBar, Sidebar, EditorArea, Panel, AuxSidebar, StatusBar
- SplitView, TabBar common components

### Step 3: Editor Groups & Tabs ✅
- EditorService with open/close/pin/active editor management
- EditorTabs, EditorPane components
- Editor inputs by typeId: note, mindmap, graph, welcome
- Preview tab (single click) vs pinned tab (double click) model

### Step 4: Command Registry + Keybindings ✅
- CommandService (register/execute commands)
- KeybindingService (parse keybinding strings, dispatch to CommandService)
- All existing keyboard shortcuts migrated to commands

### Step 5: Activity Bar + View System ✅
- ViewService (register views with id/label/icon/order/location)
- ViewContainer + registerViewComponent for dynamic sidebar rendering
- Built-in views: Explorer, Search, Graph, Mind Map, AI
- Activity bar driven by ViewService.getViews()

### Step 6: Migrate Existing Components ✅
- Sidebar registered as Explorer view component
- Editor wrapped in EditorPane with typeId-based routing
- MetaPanel → AuxSidebar
- KnowledgeGraph → EditorPane typeId='graph'
- MindMapEditor → EditorPane typeId='mindmap'
- All services implemented: TauriFileService, ThemeService, LocalStorageService, NotificationService, WorkspaceService
- ServiceCollection built and provided via ServiceProvider context
- appStore kept as compatibility layer (not removed, to preserve existing component behavior)

### Step 7: Plugin Contribution Points ✅
- PluginContribution interface (commands, views, statusBarItems)
- ContributingPlugin interface extends MindNotesPlugin
- AI plugin updated with contribution points: sidebar view, commands, status bar item
- Legacy onLoad/onUnload still supported alongside contributions

### Step 8: Status Bar, Panels, Polish ✅
- Status bar with word count, file path, theme toggle, settings
- Panel component with resizable drag handle (100-600px)
- Panel tab bar support
- App.tsx fully unused (Workbench.tsx is the new entry point)
- Final cleanup complete

## What We Keep
- ✅ Tauri v2
- ✅ React + TypeScript + Vite
- ✅ TipTap editor
- ✅ React Flow for mind maps
- ✅ Tailwind CSS
- ✅ All existing features

## What Changes
- ✅ Flat component tree → Workbench shell with zones
- ✅ Single Zustand store → Service-based architecture (appStore kept as compat layer)
- ✅ Single editor view → Multi-tab editor groups
- ✅ Hardcoded keyboard shortcuts → Command registry
- ✅ Basic plugin system → Contribution-point extensions
