import electronUpdater, { type AppUpdater } from 'electron-updater'
import { allowClose } from './appSession'
import {
  reduceUpdateStatus,
  type UpdateCommand,
  type UpdateEvent,
  type UpdateStatus
} from '@shared/updateStatus'

function getAutoUpdater(): AppUpdater {
  // electron-updater is CJS; destructure from the default export for ESM (electron-builder#7976).
  const { autoUpdater } = electronUpdater
  return autoUpdater
}

let status: UpdateStatus = { phase: 'idle' }
let send: ((next: UpdateStatus) => void) | null = null
let persist: (() => Promise<void>) | null = null

function emit(event: UpdateEvent): void {
  status = reduceUpdateStatus(status, event)
  send?.(status)
}

export function startUpdater(options: {
  isPackaged: boolean
  platform: NodeJS.Platform
  send: (next: UpdateStatus) => void
  persist: () => Promise<void>
}): void {
  send = options.send
  persist = options.persist
  if (!options.isPackaged || options.platform !== 'win32') {
    return
  }

  const updater = getAutoUpdater()
  updater.autoDownload = true
  updater.autoInstallOnAppQuit = false
  updater.on('checking-for-update', () => {
    console.log('updater checking')
    emit({ type: 'checking' })
  })
  updater.on('update-available', (info) => {
    emit({ type: 'available', version: info.version })
  })
  updater.on('update-not-available', () => {
    emit({ type: 'not-available' })
  })
  updater.on('download-progress', () => {
    emit({ type: 'progress' })
  })
  updater.on('update-downloaded', (info) => {
    emit({ type: 'downloaded', version: info.version })
  })
  updater.on('error', (error) => {
    console.error('updater error', error)
    emit({ type: 'error' })
  })

  console.log('updater start')
  void updater.checkForUpdates().catch((error: unknown) => {
    console.error('updater check failed', error)
    emit({ type: 'error' })
  })
}

export async function handleUpdateCommand(command: UpdateCommand): Promise<void> {
  if (command !== 'apply' && command !== 'later') {
    return
  }
  if (status.phase !== 'ready') {
    return
  }
  if (command === 'later') {
    emit({ type: 'later' })
    return
  }
  if (!persist) {
    return
  }
  try {
    await persist()
    allowClose()
    getAutoUpdater().quitAndInstall()
  } catch (error) {
    console.error('updater apply failed', error)
  }
}
