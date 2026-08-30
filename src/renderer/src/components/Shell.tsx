import { useEffect } from 'react'
import { t } from '@shared/i18n'
import { activeAccount, visibleTabs } from '@shared/workspace'
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
      const meta = event.metaKey || event.ctrlKey
      if (!meta) {
        return
      }
      const account = activeAccount(snapshot)
      const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId)
      if (event.key === 't') {
        event.preventDefault()
        useAppStore.getState().setDialog({ id: 'tab-create' })
      }
      if (event.key.toLowerCase() === 'b') {
        event.preventDefault()
        const collapsed = useAppStore.getState().sidebarCollapsed
        useAppStore.getState().setSidebarCollapsed(!collapsed)
      }
      if (event.key === 'l') {
        event.preventDefault()
        document.getElementById('url-bar')?.focus()
      }
      if (event.key === 'r') {
        event.preventDefault()
        if (!account) {
          return
        }
        if (event.shiftKey && tab) {
          void window.opsource.navigate({ kind: 'reload-tab', tabId: tab.id })
        } else {
          void window.opsource.navigate({ kind: 'reload', accountId: account.id })
        }
      }
      if (event.key.toLowerCase() === 'm' && account) {
        event.preventDefault()
        void dispatch({ type: 'account/setMuted', id: account.id, muted: !account.muted })
      }
      if ((event.key === '=' || event.key === '+') && account) {
        event.preventDefault()
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor + 0.1 })
      }
      if (event.key === '-' && account) {
        event.preventDefault()
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor - 0.1 })
      }
      if (event.key === '0' && account) {
        event.preventDefault()
        void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: 1 })
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        const tabs = visibleTabs(snapshot)
        const index = tabs.findIndex((item) => item.id === snapshot.activeTabId)
        const next = tabs[(index + (event.shiftKey ? -1 : 1) + tabs.length) % Math.max(tabs.length, 1)]
        if (next) {
          void dispatch({ type: 'tab/activate', id: next.id })
        }
      }
      const digit = Number(event.key)
      if (digit >= 1 && digit <= 9 && tab) {
        const target = tab.accountOrder[digit - 1]
        if (target) {
          event.preventDefault()
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
