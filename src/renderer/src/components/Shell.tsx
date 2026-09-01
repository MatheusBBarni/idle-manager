import { useEffect } from 'react'
import { t } from '@shared/i18n'
import { fromDomKeyboardEvent, isChromeCommand, matchShortcut } from '@shared/shortcuts'
import { runChromeShortcut } from '../chromeShortcuts'
import { useAppStore } from '../store'
import { Chrome } from './Chrome'
import { Dialogs } from './Dialogs'
import { Sidebar } from './Sidebar'
import { Stage } from './Stage'
import { StatusBar } from './StatusBar'

export function Shell() {
  const snapshot = useAppStore((state) => state.snapshot)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (useAppStore.getState().shortcutCapturing) {
        return
      }
      const command = matchShortcut(fromDomKeyboardEvent(event), snapshot.shortcuts, 'chrome')
      if (!isChromeCommand(command)) {
        return
      }
      event.preventDefault()
      runChromeShortcut(command, {
        snapshot,
        key: event.key,
        shiftKey: event.shiftKey
      })
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
