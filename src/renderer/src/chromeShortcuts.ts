import type { ChromeCommand } from '@shared/shortcuts'
import type { WorkspaceSnapshot } from '@shared/types'
import { activeAccount, lastArchivedTab, visibleTabs } from '@shared/workspace'
import { dispatch, useAppStore } from './store'

type ChromeShortcutContext = {
  snapshot: WorkspaceSnapshot
  key: string
  shiftKey: boolean
}

const CHROME_ACTIONS: Record<ChromeCommand, (ctx: ChromeShortcutContext) => void> = {
  'tab-new': () => {
    useAppStore.getState().setDialog({ id: 'tab-create' })
  },
  'tab-reopen': ({ snapshot }) => {
    const closed = lastArchivedTab(snapshot)
    if (closed) {
      void dispatch({ type: 'tab/reopen', id: closed.id })
    }
  },
  'sidebar-toggle': () => {
    const store = useAppStore.getState()
    store.setSidebarCollapsed(!store.sidebarCollapsed)
  },
  'url-focus': () => {
    document.getElementById('url-bar')?.focus()
  },
  'account-reload': ({ snapshot }) => {
    const account = activeAccount(snapshot)
    if (account) {
      void window.opsource.navigate({ kind: 'reload', accountId: account.id })
    }
  },
  'tab-reload': ({ snapshot }) => {
    const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId)
    if (tab) {
      void window.opsource.navigate({ kind: 'reload-tab', tabId: tab.id })
    }
  },
  'account-mute': ({ snapshot }) => {
    const account = activeAccount(snapshot)
    if (account) {
      void dispatch({ type: 'account/setMuted', id: account.id, muted: !account.muted })
    }
  },
  'account-zoom-in': ({ snapshot }) => {
    const account = activeAccount(snapshot)
    if (account) {
      void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor + 0.1 })
    }
  },
  'account-zoom-out': ({ snapshot }) => {
    const account = activeAccount(snapshot)
    if (account) {
      void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor - 0.1 })
    }
  },
  'account-zoom-reset': ({ snapshot }) => {
    const account = activeAccount(snapshot)
    if (account) {
      void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: 1 })
    }
  },
  'tab-next': ({ snapshot, shiftKey }) => {
    const tabs = visibleTabs(snapshot)
    const index = tabs.findIndex((item) => item.id === snapshot.activeTabId)
    const delta = shiftKey === snapshot.shortcuts['tab-next'].shift ? 1 : -1
    const next = tabs[(index + delta + tabs.length) % Math.max(tabs.length, 1)]
    if (next) {
      void dispatch({ type: 'tab/activate', id: next.id })
    }
  },
  'account-slot': ({ snapshot, key }) => {
    const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId)
    const digit = Number(key)
    const target = tab?.accountOrder[digit - 1]
    if (target) {
      void dispatch({ type: 'account/activate', id: target })
    }
  }
}

export function runChromeShortcut(command: ChromeCommand, ctx: ChromeShortcutContext): void {
  CHROME_ACTIONS[command](ctx)
}
