import electronUpdater, { type AppUpdater } from 'electron-updater'
import {
  reduceUpdateStatus,
  type UpdateCommand,
  type UpdateEvent,
  type UpdateStatus
} from '@shared/updateStatus'

export type UpdaterHost = {
  isPackaged: boolean
  platform: NodeJS.Platform
  send: (status: UpdateStatus) => void
  persist: () => Promise<void>
}

function getAutoUpdater(): AppUpdater {
  // electron-updater is CJS; destructure from the default export for ESM (electron-builder#7976).
  const { autoUpdater } = electronUpdater
  return autoUpdater
}

let host: UpdaterHost | null = null
let status: UpdateStatus = { phase: 'idle' }
let wired = false

function emit(event: UpdateEvent): void {
  status = reduceUpdateStatus(status, event)
  host?.send(status)
}

export function registerUpdater(next: UpdaterHost): void {
  host = next
  if (wired) {
    return
  }
  wired = true
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
}

export function startUpdater(): void {
  if (!host?.isPackaged || host.platform !== 'win32') {
    return
  }
  console.log('updater start')
  void getAutoUpdater()
    .checkForUpdates()
    .catch((error: unknown) => {
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
  try {
    await host?.persist()
    getAutoUpdater().quitAndInstall()
  } catch (error) {
    console.error('updater apply failed', error)
  }
}
