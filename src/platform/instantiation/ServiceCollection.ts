/**
 * Lightweight Dependency Injection container inspired by VS Code's instantiation service.
 *
 * Services are identified by ServiceIdentifier tokens created with `createServiceIdentifier`.
 * Implementations are registered as either singletons (instances) or factories.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ServiceIdentifier<T = any> {
  readonly id: string
  readonly _brand: T // phantom type for type safety
}

/**
 * Create a typed service identifier token.
 */
export function createServiceIdentifier<T>(id: string): ServiceIdentifier<T> {
  return { id } as ServiceIdentifier<T>
}

type Factory<T> = (collection: ServiceCollection) => T

interface ServiceEntry<T = unknown> {
  instance?: T
  factory?: Factory<T>
}

export class ServiceCollection {
  private readonly _entries = new Map<string, ServiceEntry>()

  /**
   * Register a singleton instance for a service identifier.
   */
  set<T>(id: ServiceIdentifier<T>, instance: T): void {
    this._entries.set(id.id, { instance })
  }

  /**
   * Register a lazy factory. The factory is called once on first `get()`,
   * and the result is cached as a singleton.
   */
  setFactory<T>(id: ServiceIdentifier<T>, factory: Factory<T>): void {
    this._entries.set(id.id, { factory })
  }

  /**
   * Retrieve a service. Throws if not registered.
   */
  get<T>(id: ServiceIdentifier<T>): T {
    const entry = this._entries.get(id.id)
    if (!entry) {
      throw new Error(`Service not found: ${id.id}`)
    }

    if (entry.instance !== undefined) {
      return entry.instance as T
    }

    if (entry.factory) {
      const instance = entry.factory(this)
      entry.instance = instance
      entry.factory = undefined // GC the factory
      return instance as T
    }

    throw new Error(`Service has no instance or factory: ${id.id}`)
  }

  /**
   * Check if a service is registered.
   */
  has<T>(id: ServiceIdentifier<T>): boolean {
    return this._entries.has(id.id)
  }
}
