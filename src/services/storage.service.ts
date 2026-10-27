/**
 * Camada de persistência desacoplada da UI.
 * Cada chave guarda um envelope { version, data } para permitir migrações.
 */
export const STORAGE_PREFIX = 'meumercado:v1:'
export const SCHEMA_VERSION = 1

export const StorageKeys = {
  lists: `${STORAGE_PREFIX}lists`,
  customProducts: `${STORAGE_PREFIX}custom-products`,
  customCategories: `${STORAGE_PREFIX}custom-categories`,
  favorites: `${STORAGE_PREFIX}favorites`,
  settings: `${STORAGE_PREFIX}settings`,
  activeList: `${STORAGE_PREFIX}active-list`,
} as const

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys]

interface Envelope<T> {
  version: number
  data: T
}

export type LoadResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'empty' }
  | { status: 'corrupted'; raw: string }

type Migration = (data: unknown) => unknown
/** Migrações por versão de origem: migrations[1] converte v1 -> v2 */
const migrations: Record<number, Migration> = {}

function migrate(envelope: Envelope<unknown>): unknown {
  let { version, data } = envelope
  while (version < SCHEMA_VERSION) {
    const fn = migrations[version]
    if (!fn) break
    data = fn(data)
    version++
  }
  return data
}

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export const storageService = {
  /**
   * Carrega e valida. Dados corrompidos são preservados em uma chave de backup
   * (`<chave>:corrupted`) em vez de serem descartados silenciosamente.
   */
  load<T>(key: StorageKey, validate: (v: unknown) => v is T): LoadResult<T> {
    const storage = getStorage()
    if (!storage) return { status: 'empty' }
    const raw = storage.getItem(key)
    if (raw === null) return { status: 'empty' }
    try {
      const parsed: unknown = JSON.parse(raw)
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'version' in parsed &&
        'data' in parsed &&
        typeof (parsed as Envelope<unknown>).version === 'number'
      ) {
        const data = migrate(parsed as Envelope<unknown>)
        if (validate(data)) return { status: 'ok', data }
      }
    } catch {
      /* cai para corrompido */
    }
    try {
      storage.setItem(`${key}:corrupted`, raw)
    } catch {
      /* sem espaço: ignorar */
    }
    return { status: 'corrupted', raw }
  },

  /** Retorna true se salvou; false em caso de quota excedida ou storage indisponível */
  save<T>(key: StorageKey, data: T): boolean {
    const storage = getStorage()
    if (!storage) return false
    try {
      const envelope: Envelope<T> = { version: SCHEMA_VERSION, data }
      storage.setItem(key, JSON.stringify(envelope))
      return true
    } catch (err) {
      console.warn('[MeuMercado] Falha ao salvar no localStorage', err)
      return false
    }
  },

  remove(key: StorageKey): void {
    getStorage()?.removeItem(key)
  },

  clearAll(): void {
    const storage = getStorage()
    if (!storage) return
    Object.keys(storage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => storage.removeItem(k))
  },
}
