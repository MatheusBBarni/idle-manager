import { app, safeStorage } from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { emptySnapshot, parseSnapshot } from '@shared/workspace'
import type { WorkspaceSnapshot } from '@shared/types'

function plainPath(): string {
  return join(app.getPath('userData'), 'workspace.json')
}

function encryptedPath(): string {
  return join(app.getPath('userData'), 'workspace.enc')
}

export async function loadSnapshot(): Promise<WorkspaceSnapshot> {
  try {
    const encrypted = await readFile(encryptedPath())
    if (safeStorage.isEncryptionAvailable()) {
      const json = safeStorage.decryptString(encrypted)
      return parseSnapshot(JSON.parse(json))
    }
  } catch {
    // fall through to plaintext
  }
  try {
    const json = await readFile(plainPath(), 'utf8')
    return parseSnapshot(JSON.parse(json))
  } catch {
    return emptySnapshot()
  }
}

export async function saveSnapshot(snapshot: WorkspaceSnapshot): Promise<void> {
  const json = JSON.stringify(snapshot, null, 2)
  await mkdir(dirname(plainPath()), { recursive: true })
  if (safeStorage.isEncryptionAvailable()) {
    const payload = safeStorage.encryptString(json)
    await writeFile(encryptedPath(), payload)
    return
  }
  await writeFile(plainPath(), json, 'utf8')
}
