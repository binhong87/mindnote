/**
 * Simple event emitter for service state changes.
 */

export type Listener<T> = (value: T) => void
export type Disposable = { dispose(): void }

export class Emitter<T> {
  private _listeners: Set<Listener<T>> = new Set()

  get event(): (listener: Listener<T>) => Disposable {
    return (listener) => {
      this._listeners.add(listener)
      return {
        dispose: () => {
          this._listeners.delete(listener)
        },
      }
    }
  }

  fire(value: T): void {
    for (const listener of this._listeners) {
      listener(value)
    }
  }

  dispose(): void {
    this._listeners.clear()
  }
}
