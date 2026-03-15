/**
 * StorageService — IStorageService backed by localStorage.
 */

import type { IStorageService } from '../../platform/services/IStorageService'

export class LocalStorageService implements IStorageService {
  private readonly _prefix = 'mindnotes.'

  get(key: string, fallback?: string): string | undefined {
    return localStorage.getItem(this._prefix + key) ?? fallback
  }

  getNumber(key: string, fallback?: number): number | undefined {
    const v = localStorage.getItem(this._prefix + key)
    if (v === null) return fallback
    const n = Number(v)
    return isNaN(n) ? fallback : n
  }

  getBoolean(key: string, fallback?: boolean): boolean | undefined {
    const v = localStorage.getItem(this._prefix + key)
    if (v === null) return fallback
    return v === 'true'
  }

  set(key: string, value: string | number | boolean): void {
    localStorage.setItem(this._prefix + key, String(value))
  }

  remove(key: string): void {
    localStorage.removeItem(this._prefix + key)
  }
}
