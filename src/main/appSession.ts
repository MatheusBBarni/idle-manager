import { Menu, Tray, app, nativeImage, type BrowserWindow } from 'electron'
import { t } from '@shared/i18n'
import { runningAccountCount, shouldDismissToTray, trayTooltip } from '@shared/trayPolicy'
import type { Locale, WorkspaceSnapshot } from '@shared/types'

let quitting = false
let trayReady = false
let tray: Tray | null = null
let iconPath = ''
let getWindow: () => BrowserWindow | null = () => null
let getSnapshot: () => WorkspaceSnapshot | null = () => null

export function isQuitting(): boolean {
  return quitting
}

export function noteTrayReady(ok: boolean): void {
  trayReady = ok
}

export function beginQuit(): void {
  quitting = true
  destroyTray()
  app.quit()
}

export function bindAppSession(options: {
  getWindow: () => BrowserWindow | null
  getSnapshot: () => WorkspaceSnapshot
  iconPath: string
}): void {
  getWindow = options.getWindow
  getSnapshot = options.getSnapshot
  iconPath = options.iconPath
  noteTrayReady(process.platform === 'win32')
}

export function interceptClose(): boolean {
  const snapshot = getSnapshot()
  if (!snapshot) {
    return false
  }
  const runningCount = runningAccountCount(snapshot)
  if (
    !shouldDismissToTray({
      platform: process.platform,
      isQuitting: quitting,
      trayReady,
      runningCount
    })
  ) {
    return false
  }
  if (!showTray(snapshot)) {
    noteTrayReady(false)
    return false
  }
  const win = getWindow()
  if (!win || win.isDestroyed()) {
    return false
  }
  win.hide()
  win.setSkipTaskbar(true)
  return true
}

export function restoreMainWindow(): void {
  destroyTray()
  const win = getWindow()
  if (!win || win.isDestroyed()) {
    return
  }
  win.setSkipTaskbar(false)
  win.show()
  win.focus()
}

export function syncDismissedSession(snapshot: WorkspaceSnapshot): void {
  if (!tray || tray.isDestroyed()) {
    return
  }
  const runningCount = runningAccountCount(snapshot)
  if (runningCount === 0) {
    restoreMainWindow()
    return
  }
  tray.setToolTip(trayTooltip(snapshot.locale, runningCount))
  tray.setContextMenu(buildMenu(snapshot.locale))
}

function showTray(snapshot: WorkspaceSnapshot): boolean {
  if (tray && !tray.isDestroyed()) {
    syncDismissedSession(snapshot)
    return true
  }
  try {
    const image = nativeImage.createFromPath(iconPath)
    if (image.isEmpty()) {
      console.error('tray construct failed')
      return false
    }
    tray = new Tray(image)
    tray.setToolTip(trayTooltip(snapshot.locale, runningAccountCount(snapshot)))
    tray.setContextMenu(buildMenu(snapshot.locale))
    tray.on('click', () => restoreMainWindow())
    noteTrayReady(true)
    return true
  } catch (error) {
    console.error('tray construct failed', error)
    tray = null
    return false
  }
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
