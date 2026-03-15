/**
 * NotificationService — INotificationService implementation.
 */

import { Emitter } from '../../platform/instantiation/Emitter'
import type { INotificationService, Notification, NotificationSeverity } from '../../platform/services/INotificationService'

let _id = 0

export class NotificationService implements INotificationService {
  private readonly _onDidNotify = new Emitter<Notification>()
  readonly onDidNotify = this._onDidNotify.event

  private _notify(message: string, severity: NotificationSeverity): void {
    this._onDidNotify.fire({ message, severity, id: String(++_id) })
  }

  info(message: string): void { this._notify(message, 'info') }
  warn(message: string): void { this._notify(message, 'warning') }
  error(message: string): void { this._notify(message, 'error') }
}
