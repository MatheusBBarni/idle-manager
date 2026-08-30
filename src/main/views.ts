import { BrowserWindow, WebContentsView, session, type WebContents } from 'electron'
import iconPath from '../../assets/icon.png?asset'
import { partitionForAccount } from '@shared/partition'
import type { Account, NavigationState, Rect, StageReport, WorkspaceSnapshot } from '@shared/types'
import { attachAccountLoop } from './accountLoop'

type LiveView = {
  accountId: string
  view: WebContentsView
  poppedOut: BrowserWindow | null
  lastActivityAt: number | null
  lastBounds: Rect | null
}

const live = new Map<string, LiveView>()

let chromeWindow: BrowserWindow | null = null
let latestStage: StageReport | null = null
let onNavigation: ((nav: NavigationState) => void) | null = null
let onActivity: ((accountId: string, at: number) => void) | null = null
let onCrash: ((accountId: string) => void) | null = null

function sameRect(a: Rect | null, b: Rect): boolean {
  if (!a) {
    return false
  }
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

function emitNav(accountId: string, contents: WebContents): void {
  onNavigation?.({
    accountId,
    url: contents.getURL(),
    title: contents.getTitle(),
    canGoBack: contents.navigationHistory.canGoBack(),
    canGoForward: contents.navigationHistory.canGoForward()
  })
}

function touch(accountId: string): void {
  const item = live.get(accountId)
  if (!item) {
    return
  }
  const at = Date.now()
  item.lastActivityAt = at
  onActivity?.(accountId, at)
}

function attachSessionHandlers(account: Account, contents: WebContents): void {
  contents.setWindowOpenHandler((details) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        parent: chromeWindow ?? undefined,
        webPreferences: {
          session: contents.session,
          sandbox: true,
          nodeIntegration: false,
          contextIsolation: true,
          backgroundThrottling: false
        },
        title: details.frameName || account.name
      }
    }
  })

  contents.on('did-navigate', () => emitNav(account.id, contents))
  contents.on('did-navigate-in-page', () => emitNav(account.id, contents))
  contents.on('page-title-updated', () => emitNav(account.id, contents))
  contents.on('did-finish-load', () => emitNav(account.id, contents))
  contents.on('before-input-event', () => touch(account.id))
  attachAccountLoop(contents, 'game')
  contents.on('media-started-playing', () => touch(account.id))
  contents.on('render-process-gone', () => {
    onCrash?.(account.id)
  })
}

function createView(account: Account): LiveView {
  const ses = session.fromPartition(partitionForAccount(account.id), { cache: true })
  const view = new WebContentsView({
    webPreferences: {
      session: ses,
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      spellcheck: false
    }
  })
  view.webContents.setBackgroundThrottling(false)
  view.webContents.setAudioMuted(account.muted)
  view.webContents.setZoomFactor(account.zoomFactor)
  attachSessionHandlers(account, view.webContents)
  const item: LiveView = {
    accountId: account.id,
    view,
    poppedOut: null,
    lastActivityAt: null,
    lastBounds: null
  }
  live.set(account.id, item)
  view.webContents.loadURL(account.url).catch(() => undefined)
  return item
}

function destroyView(accountId: string): void {
  const item = live.get(accountId)
  if (!item) {
    return
  }
  item.poppedOut?.destroy()
  if (chromeWindow && !chromeWindow.isDestroyed()) {
    chromeWindow.contentView.removeChildView(item.view)
  }
  if (!item.view.webContents.isDestroyed()) {
    item.view.webContents.close({ waitForBeforeUnload: false })
  }
  live.delete(accountId)
}

export function setChromeWindow(win: BrowserWindow | null): void {
  chromeWindow = win
}

export function setViewCallbacks(callbacks: {
  navigation?: (nav: NavigationState) => void
  activity?: (accountId: string, at: number) => void
  crash?: (accountId: string) => void
}): void {
  onNavigation = callbacks.navigation ?? null
  onActivity = callbacks.activity ?? null
  onCrash = callbacks.crash ?? null
}

export function liveViews(): Map<string, LiveView> {
  return live
}

export function applyStage(report: StageReport): void {
  latestStage = report
  for (const [accountId, item] of live) {
    if (item.poppedOut) {
      item.view.setVisible(true)
      continue
    }
    const panel = report.panels.find((entry) => entry.accountId === accountId)
    const visible = Boolean(panel) && !report.overlayOpen
    item.view.setVisible(visible)
    if (!panel || !chromeWindow || chromeWindow.isDestroyed()) {
      continue
    }
    const bounds = panel.contents
    if (bounds.width < 8 || bounds.height < 8) {
      item.view.setVisible(false)
      continue
    }
    if (!sameRect(item.lastBounds, bounds)) {
      item.view.setBounds(bounds)
      item.lastBounds = bounds
    }
    chromeWindow.contentView.addChildView(item.view)
  }
}

export function syncViews(snapshot: WorkspaceSnapshot): void {
  if (!chromeWindow || chromeWindow.isDestroyed()) {
    return
  }
  const wanted = new Set(
    Object.values(snapshot.accounts)
      .filter((account) => account.status === 'running')
      .map((account) => account.id)
  )

  for (const id of live.keys()) {
    if (!wanted.has(id)) {
      destroyView(id)
    }
  }

  for (const account of Object.values(snapshot.accounts)) {
    if (account.status !== 'running') {
      continue
    }
    let item = live.get(account.id)
    if (!item) {
      item = createView(account)
      chromeWindow.contentView.addChildView(item.view)
    }
    if (!item.view.webContents.isDestroyed()) {
      item.view.webContents.setAudioMuted(account.muted)
      item.view.webContents.setZoomFactor(account.zoomFactor)
    }
    if (account.poppedOut && !item.poppedOut) {
      popOut(account)
    }
    if (!account.poppedOut && item.poppedOut) {
      popIn(account.id)
    }
  }

  if (latestStage) {
    applyStage(latestStage)
  }
}

export function restartView(account: Account): void {
  destroyView(account.id)
  if (!chromeWindow || chromeWindow.isDestroyed()) {
    return
  }
  const item = createView(account)
  chromeWindow.contentView.addChildView(item.view)
  if (latestStage) {
    applyStage(latestStage)
  }
}

export function navigate(accountId: string, command: 'back' | 'forward' | 'reload' | 'home' | 'load', url?: string): void {
  const item = live.get(accountId)
  if (!item || item.view.webContents.isDestroyed()) {
    return
  }
  const contents = item.view.webContents
  if (command === 'back' && contents.navigationHistory.canGoBack()) {
    contents.navigationHistory.goBack()
    return
  }
  if (command === 'forward' && contents.navigationHistory.canGoForward()) {
    contents.navigationHistory.goForward()
    return
  }
  if (command === 'reload') {
    contents.reload()
    return
  }
  if (command === 'home' || command === 'load') {
    if (url) {
      contents.loadURL(url).catch(() => undefined)
    }
  }
}

export function popOut(account: Account): void {
  const item = live.get(account.id)
  if (!item || item.poppedOut) {
    return
  }
  if (chromeWindow && !chromeWindow.isDestroyed()) {
    chromeWindow.contentView.removeChildView(item.view)
  }
  const pop = new BrowserWindow({
    width: 1100,
    height: 740,
    title: `${account.name} · ${account.url}`,
    icon: iconPath,
    backgroundColor: '#161218',
    webPreferences: {
      session: item.view.webContents.session,
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  })
  pop.contentView.addChildView(item.view)
  const bounds = pop.getContentBounds()
  item.view.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height })
  item.view.setVisible(true)
  item.poppedOut = pop
  pop.on('resize', () => {
    if (pop.isDestroyed()) {
      return
    }
    const next = pop.getContentBounds()
    item.view.setBounds({ x: 0, y: 0, width: next.width, height: next.height })
  })
  pop.on('closed', () => {
    item.poppedOut = null
  })
}

export function popIn(accountId: string): void {
  const item = live.get(accountId)
  if (!item?.poppedOut) {
    return
  }
  const pop = item.poppedOut
  item.poppedOut = null
  if (!pop.isDestroyed()) {
    pop.contentView.removeChildView(item.view)
    pop.destroy()
  }
  if (chromeWindow && !chromeWindow.isDestroyed()) {
    chromeWindow.contentView.addChildView(item.view)
  }
  if (latestStage) {
    applyStage(latestStage)
  }
}

export async function clearAccountSession(accountId: string): Promise<void> {
  const item = live.get(accountId)
  const ses = item?.view.webContents.session ?? session.fromPartition(partitionForAccount(accountId))
  await ses.clearCache()
  await ses.clearStorageData()
  if (item && !item.view.webContents.isDestroyed()) {
    item.view.webContents.reload()
  }
}

export async function flushAll(): Promise<void> {
  const sessions = new Set(
    [...live.values()]
      .filter((item) => !item.view.webContents.isDestroyed())
      .map((item) => item.view.webContents.session)
  )
  await Promise.all(
    [...sessions].map(async (ses) => {
      await ses.cookies.flushStore()
    })
  )
}

export function destroyAllViews(): void {
  for (const id of [...live.keys()]) {
    destroyView(id)
  }
}

