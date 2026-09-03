import { Menu, Tray, app, nativeImage, type BrowserWindow } from 'electron'
import { t } from '@shared/i18n'
import { runningAccountCount, shouldDismissToTray, trayTooltip } from '@shared/trayPolicy'
import type { Locale, WorkspaceSnapshot } from '@shared/types'

let quitting = false
let trayReady = false
let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let iconPath = ''
let getSnapshot: () => WorkspaceSnapshot = () => {
  throw new Error('appSession not bound')
}

export function noteTrayReady(ok: boolean): void {
  trayReady = ok
}

export function allowClose(): void {
  quitting = true
  destroyTray()
}

export function beginQuit(): void {
  allowClose()
  app.quit()
}

export function bindAppSession(options: {
  getSnapshot: () => WorkspaceSnapshot
  iconPath: string
}): void {
  getSnapshot = options.getSnapshot
  iconPath = options.iconPath
  noteTrayReady(process.platform === 'win32')
}

export function attachMainWindow(win: BrowserWindow): void {
  mainWindow = win
  win.on('close', (event) => {
    if (dismissToTray()) {
      event.preventDefault()
    }
  })
}

export function detachMainWindow(): void {
  mainWindow = null
}

export function restoreMainWindow(): void {
  destroyTray()
  const win = liveWindow()
  if (!win) {
    return
  }
  win.setSkipTaskbar(false)
  win.show()
  win.focus()
}

export function focusOrRestoreMainWindow(): void {
  const win = liveWindow()
  if (!win) {
    return
  }
  if (!win.isVisible()) {
    restoreMainWindow()
    return
  }
  if (win.isMinimized()) {
    win.restore()
  }
  win.focus()
}

export function syncDismissedSession(snapshot: WorkspaceSnapshot): void {
  if (!tray || tray.isDestroyed()) {
    return
  }
  if (runningAccountCount(snapshot) === 0) {
    restoreMainWindow()
    return
  }
  decorateTray(snapshot)
}

function liveWindow(): BrowserWindow | null {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return null
  }
  return mainWindow
}

function dismissToTray(): boolean {
  const snapshot = getSnapshot()
  if (
    !shouldDismissToTray({
      platform: process.platform,
      isQuitting: quitting,
      trayReady,
      runningCount: runningAccountCount(snapshot)
    })
  ) {
    return false
  }
  const win = liveWindow()
  if (!win) {
    return false
  }
  if (!ensureTray(snapshot)) {
    noteTrayReady(false)
    return false
  }
  win.hide()
  win.setSkipTaskbar(true)
  return true
}

function ensureTray(snapshot: WorkspaceSnapshot): boolean {
  if (tray && !tray.isDestroyed()) {
    decorateTray(snapshot)
    return true
  }
  try {
    const image = nativeImage.createFromPath(iconPath)
    if (image.isEmpty()) {
      console.error('tray construct failed')
      return false
    }
    tray = new Tray(image)
    tray.on('click', () => restoreMainWindow())
    decorateTray(snapshot)
    noteTrayReady(true)
    return true
  } catch (error) {
    console.error('tray construct failed', error)
    tray = null
    return false
  }
}

function decorateTray(snapshot: WorkspaceSnapshot): void {
  if (!tray || tray.isDestroyed()) {
    return
  }
  const runningCount = runningAccountCount(snapshot)
  tray.setToolTip(trayTooltip(snapshot.locale, runningCount))
  tray.setContextMenu(buildMenu(snapshot.locale))
}

function buildMenu(locale: Locale): Menu {
  return Menu.buildFromTemplate([
    { label: t(locale, 'trayRestore'), click: () => restoreMainWindow() },
    { label: t(locale, 'quit'), click: () => beginQuit() }
  ])
}

function destroyTray(): void {
  if (!tray) {
    return
  }
  if (!tray.isDestroyed()) {
    tray.destroy()
  }
  tray = null
}
