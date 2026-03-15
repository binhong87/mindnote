/**
 * INotificationService — toasts and notifications.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'
import type { Emitter } from '../instantiation/Emitter'

export type NotificationSeverity = 'info' | 'warning' | 'error'

export interface Notification {
  readonly message: string
  readonly severity: NotificationSeverity
  readonly id: string
}

export interface INotificationService {
  info(message: string): void
  warn(message: string): void
  error(message: string): void

  readonly onDidNotify: Emitter<Notification>['event']
}

export const INotificationService = createServiceIdentifier<INotificationService>('INotificationService')
