import { BrowserWindow, Menu, app, dialog, ipcMain, nativeImage, protocol, shell } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import iconPath from '../../assets/icon.png?asset'
import type { NavCommand, WindowCommand } from '@shared/ipc'
import type { StageReport, WorkspaceSnapshot } from '@shared/types'
import { normalizeUrl } from '@shared/urls'
import { accountIdsToWipe, applyAction, emptySnapshot, exportMetadata, snapshotFromImport, type WorkspaceAction } from '@shared/workspace'
import { attachAccountLoop, bindAccountLoop } from './accountLoop'
import { verifyIsolation } from './isolationVerify'
import { collectMetrics } from './metrics'
import { loadSnapshot, saveSnapshot } from './persistence'
import {
  applyStage,
  clearAccountSession,
  destroyAllViews,
  flushAll,
  liveViews,
  navigate,
  restartView,
  setChromeWindow,
  setViewCallbacks,
  stageChromeEditable,
  stageOverlayOpen,
  syncViews
} from './views'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'opsource-iso',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
  }
])

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.setName('Idle manager')

const verifying = process.argv.includes('--verify-isolation')
const preloadPath = fileURLToPath(new URL('../preload/index.cjs', import.meta.url))

let mainWindow: BrowserWindow | null = null
let snapshot: WorkspaceSnapshot = emptySnapshot()
let saveTimer: NodeJS.Timeout | null = null
let fps = 0

function scheduleSave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    saveSnapshot(snapshot).catch((error) => console.error('persist failed', error))
  }, 250)
}

function broadcast(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('ops:state', snapshot)
  }
}

function applyDispatchEffects(action: WorkspaceAction, before: WorkspaceSnapshot): void {
  if (action.type === 'prefs/launchAtStartup') {
    app.setLoginItemSettings({ openAtLogin: action.value })
  }
  for (const id of accountIdsToWipe(before, action)) {
    void clearAccountSession(id)
  }
}

function commitAll(actions: WorkspaceAction[]): WorkspaceSnapshot {
  if (actions.length === 0) {
    return snapshot
  }
  for (const action of actions) {
    const before = snapshot
    snapshot = applyAction(snapshot, action)
    applyDispatchEffects(action, before)
  }
  syncViews(snapshot)
  broadcast()
  scheduleSave()
  return snapshot
}

function commit(action: WorkspaceAction): WorkspaceSnapshot {
  return commitAll([action])
}

function createWindow(): void {
  const bounds = snapshot.windowBounds
  mainWindow = new BrowserWindow({
    width: bounds?.width ?? 1440,
    height: bounds?.height ?? 900,
    x: bounds?.x,
    y: bounds?.y,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    frame: false,
    title: 'Idle manager',
    icon: iconPath,
    backgroundColor: snapshot.theme === 'light' ? '#ffffff' : '#141414',
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    trafficLightPosition: { x: 14, y: 10 },
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  })

  setChromeWindow(mainWindow)
  Menu.setApplicationMenu(null)
  attachAccountLoop(mainWindow.webContents, 'chrome')

  mainWindow.on('ready-to-show', () => mainWindow?.show())
  mainWindow.on('resized', persistBounds)
  mainWindow.on('moved', persistBounds)
  mainWindow.on('closed', () => {
    setChromeWindow(null)
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).catch(() => undefined)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL).catch(() => undefined)
  } else {
    mainWindow.loadFile(join(fileURLToPath(new URL('../renderer/index.html', import.meta.url)))).catch(() => undefined)
  }
}

function persistBounds(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }
  const bounds = mainWindow.getBounds()
  commit({ type: 'window/bounds', bounds })
}

function registerIpc(): void {
  ipcMain.handle('ops:getState', () => snapshot)
  ipcMain.handle('ops:dispatch', (_event, action: WorkspaceAction) => commit(action))
  ipcMain.handle('ops:navigate', (_event, command: NavCommand) => {
    if (command.kind === 'reload-tab') {
      const ids = Object.values(snapshot.accounts)
        .filter((account) => account.tabId === command.tabId && account.status === 'running')
        .map((account) => account.id)
      for (const id of ids) {
        navigate(id, 'reload')
      }
      return
    }
    if (command.kind === 'load') {
      const url = normalizeUrl(command.url)
      commit({ type: 'account/setUrl', id: command.accountId, url })
      navigate(command.accountId, 'load', url)
      return
    }
    if (command.kind === 'home') {
      const account = snapshot.accounts[command.accountId]
      if (account) {
        navigate(command.accountId, 'home', account.homeUrl)
      }
      return
    }
    navigate(command.accountId, command.kind)
  })
  ipcMain.handle('ops:clearSession', async (_event, accountId: string) => {
    await clearAccountSession(accountId)
  })
  ipcMain.on('ops:reportStage', (_event, report: StageReport) => {
    applyStage(report)
  })
  ipcMain.handle('ops:window', (_event, command: WindowCommand) => {
    if (!mainWindow) {
      return false
    }
    if (command === 'min') {
      mainWindow.minimize()
    }
    if (command === 'max') {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
    if (command === 'close') {
      mainWindow.close()
    }
    return mainWindow.isMaximized()
  })
  ipcMain.handle('ops:export', async () => {
    if (!mainWindow) {
      return false
    }
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export workspace',
      defaultPath: 'idle-manager-workspace.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) {
      return false
    }
    await writeFile(result.filePath, JSON.stringify(exportMetadata(snapshot), null, 2), 'utf8')
    return true
  })
  ipcMain.handle('ops:import', async () => {
    if (!mainWindow) {
      return false
    }
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import workspace',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    const file = result.filePaths[0]
    if (result.canceled || !file) {
      return false
    }
    snapshot = snapshotFromImport(JSON.parse(await readFile(file, 'utf8')))
    syncViews(snapshot)
    broadcast()
    scheduleSave()
    return true
  })
  ipcMain.handle('ops:version', () => app.getVersion())
  ipcMain.handle('ops:platform', () => process.platform)
  ipcMain.on('ops:fps', (_event, value: number) => {
    fps = Number.isFinite(value) ? value : 0
  })
}

app.whenReady().then(async () => {
  if (verifying) {
    const code = await verifyIsolation()
    app.exit(code)
    return
  }

  if (process.platform === 'darwin') {
    app.dock?.setIcon(nativeImage.createFromPath(iconPath))
  }

  snapshot = await loadSnapshot()
  if (snapshot.launchAtStartup) {
    app.setLoginItemSettings({ openAtLogin: true })
  }

  const lastTouch = new Map<string, number>()
  setViewCallbacks({
    navigation: (nav) => mainWindow?.webContents.send('ops:navigation', nav),
    activity: (accountId, at) => {
      const previous = lastTouch.get(accountId) ?? 0
      if (at - previous < 4000) {
        return
      }
      lastTouch.set(accountId, at)
      commit({ type: 'account/touch', id: accountId, at })
    },
    crash: (accountId) => {
      const account = snapshot.accounts[accountId]
      if (account?.status === 'running') {
        restartView(account)
      }
    }
  })

  bindAccountLoop({
    commitAll,
    getSnapshot: () => snapshot,
    overlayOpen: stageOverlayOpen,
    chromeEditable: stageChromeEditable
  })

  registerIpc()
  createWindow()
  syncViews(snapshot)

  setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return
    }
    const payload = collectMetrics(liveViews(), fps)
    mainWindow.webContents.send('ops:metrics', payload)
  }, 1000)
})

app.on('before-quit', () => {
  void flushAll()
  void saveSnapshot(snapshot)
})

app.on('window-all-closed', () => {
  destroyAllViews()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    syncViews(snapshot)
  }
})
