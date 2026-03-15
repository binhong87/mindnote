// Platform barrel exports

// Instantiation
export { ServiceCollection, createServiceIdentifier } from './instantiation/ServiceCollection'
export type { ServiceIdentifier } from './instantiation/ServiceCollection'
export { Emitter } from './instantiation/Emitter'
export type { Disposable } from './instantiation/Emitter'
export { ServiceProvider, useService, useServiceState } from './instantiation/react'

// Service interfaces
export { IFileService } from './services/IFileService'
export type { FileChange } from './services/IFileService'
export { IWorkspaceService } from './services/IWorkspaceService'
export type { FileNode } from './services/IWorkspaceService'
export { IEditorService } from './services/IEditorService'
export type { EditorInput } from './services/IEditorService'
export { ICommandService } from './services/ICommandService'
export type { Command } from './services/ICommandService'
export { IViewService } from './services/IViewService'
export type { ViewDescriptor } from './services/IViewService'
export { IThemeService } from './services/IThemeService'
export type { ThemeKind } from './services/IThemeService'
export { IStorageService } from './services/IStorageService'
export { INotificationService } from './services/INotificationService'
export type { Notification, NotificationSeverity } from './services/INotificationService'
