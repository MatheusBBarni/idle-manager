import { useEffect } from 'react'
import { t } from '@shared/i18n'
import { matchShortcut } from '@shared/shortcuts'
import { activeAccount, lastArchivedTab, visibleTabs } from '@shared/workspace'
import { dispatch, useAppStore } from '../store'
import { Chrome } from './Chrome'
import { Dialogs } from './Dialogs'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'
import { StatusBar } from './StatusBar'

export function Shell() {
  const snapshot = useAppStore((state) => state.snapshot)
  const setFps = useAppStore((state) => state.setFps)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      frames += 1
      if (now - last >= 1000) {
        const next = Math.round((frames * 1000) / (now - last))
        setFps(next)
        window.opsource.reportFps(next)
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [setFps])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const command = matchShortcut(
        {
          type: 'keyDown',
          key: event.key,
          control: event.ctrlKey,
          meta: event.metaKey,
          shift: event.shiftKey,
          alt: event.altKey,
          isAutoRepeat: event.repeat
        },
        snapshot.shortcuts,
        'chrome'
      )
      if (!command) {
        return
      }
      event.preventDefault()
      const account = activeAccount(snapshot)
      const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId)
      if (command === 'tab-new') {
        useAppStore.getState().setDialog({ id: 'tab-create' })
        return
      }
      if (command === 'tab-reopen') {
        const closed = lastArchivedTab(snapshot)
        if (closed) {
          void dispatch({ type: 'tab/reopen', id: closed.id })
        }
        return
      }
      if (command === 'sidebar-toggle') {
        const collapsed = useAppStore.getState().sidebarCollapsed
        useAppStore.getState().setSidebarCollapsed(!collapsed)
        return
      }
      if (command === 'url-focus') {
        document.getElementById('url-bar')?.focus()
        return
      }
      if (command === 'account-reload') {
        if (account) {
          void window.opsource.navigate({ kind: 'reload', accountId: account.id })
        }
        return
      }
      if (command === 'tab-reload') {
        if (tab) {
          void window.opsource.navigate({ kind: 'reload-tab', tabId: tab.id })
        }
        return
      }
      if (command === 'account-mute' && account) {
        void dispatch({ type: 'account/setMuted', id: account.id, muted: !account.muted })
        return
      }
      if (command === 'account-zoom-in' && account) {
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor + 0.1 })
        return
      }
      if (command === 'account-zoom-out' && account) {
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor - 0.1 })
        return
      }
      if (command === 'account-zoom-reset' && account) {
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: 1 })
        return
      }
      if (command === 'tab-next') {
        const tabs = visibleTabs(snapshot)
        const index = tabs.findIndex((item) => item.id === snapshot.activeTabId)
        const delta = event.shiftKey === snapshot.shortcuts['tab-next'].shift ? 1 : -1
        const next = tabs[(index + delta + tabs.length) % Math.max(tabs.length, 1)]
        if (next) {
          void dispatch({ type: 'tab/activate', id: next.id })
        }
        return
      }
      if (command === 'account-slot' && tab) {
        const digit = Number(event.key)
        const target = tab.accountOrder[digit - 1]
        if (target) {
          void dispatch({ type: 'account/activate', id: target })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [snapshot])

  return (
    <div className="flex h-full flex-col bg-canvas text-foreground">
      <Chrome />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative min-w-0 flex-1" aria-label={t(snapshot.locale, 'appName')}>
          <Stage />
        </main>
      </div>
      <StatusBar />
      <Dialogs />
    </div>
  )
}
