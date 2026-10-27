import type { BackupData } from '@/models'
import { SCHEMA_VERSION } from './storage.service'
import { isBackup } from './validators'

export type BackupPayload = Omit<BackupData, 'app' | 'schemaVersion' | 'exportedAt'>

export function createBackup(payload: BackupPayload): BackupData {
  return {
    app: 'meumercado',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    // JSON clone: structuredClone falha com proxies reativos do Vue
    ...(JSON.parse(JSON.stringify(payload)) as BackupPayload),
  }
}

export function serializeBackup(backup: BackupData): string {
  return JSON.stringify(backup, null, 2)
}

export type ParseResult = { ok: true; data: BackupData } | { ok: false; error: string }

export function parseBackup(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' }
  }
  if (!isBackup(parsed)) return { ok: false, error: 'O arquivo não é um backup válido do MeuMercado.' }
  if (parsed.schemaVersion > SCHEMA_VERSION)
    return { ok: false, error: 'Backup gerado por uma versão mais nova do aplicativo.' }
  // Garante IDs de lista únicos
  const ids = new Set(parsed.lists.map((l) => l.id))
  if (ids.size !== parsed.lists.length) return { ok: false, error: 'Backup contém listas com IDs duplicados.' }
  return { ok: true, data: parsed }
}

export function downloadBackup(backup: BackupData): void {
  const blob = new Blob([serializeBackup(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `meumercado-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
