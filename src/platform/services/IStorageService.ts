/**
 * IStorageService — key-value persistence abstraction.
 */

import { createServiceIdentifier } from '../instantiation/ServiceCollection'

export interface IStorageService {
  get(key: string, fallback?: string): string | undefined
  getNumber(key: string, fallback?: number): number | undefined
  getBoolean(key: string, fallback?: boolean): boolean | undefined
  set(key: string, value: string | number | boolean): void
  remove(key: string): void
}

export const IStorageService = createServiceIdentifier<IStorageService>('IStorageService')
