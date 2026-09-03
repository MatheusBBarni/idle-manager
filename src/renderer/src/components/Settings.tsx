import { useEffect, useState } from 'react'
import { Button, Tabs } from '@heroui/react'
import { LOCALE_NAME_KEY, t, type MessageKey } from '@shared/i18n'
import {
  SHORTCUT_COMMANDS,
  SHORTCUT_DEFAULTS,
  chordFromCapture,
  chordsEqual,
  commandScope,
  displayShortcutLabel,
  shortcutConflict,
  type ShortcutCommand
} from '@shared/shortcuts'
import { LOCALES } from '@shared/types'
import { dispatch, useAppStore } from '../store'
import { ShellModal } from './ShellModal'

const SHORTCUT_LABELS: Record<ShortcutCommand, MessageKey> = {
  'tab-new': 'newTab',
  'tab-reopen': 'reopenTab',
  'sidebar-toggle': 'shortcutSidebar',
  'url-focus': 'urlBar',
  'account-reload': 'reload',
  'tab-reload': 'reloadAll',
  'account-mute': 'mute',
  'account-zoom-in': 'zoomIn',
  'account-zoom-out': 'zoomOut',
  'account-zoom-reset': 'zoomReset',
  'tab-next': 'shortcutTabNext',
  'account-slot': 'shortcutAccountSlot',
  'account-create': 'shortcutCreate',
  'account-prev': 'shortcutPrev',
  'account-next': 'shortcutNext',
  'account-start': 'shortcutStart'
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const locale = useAppStore((state) => state.snapshot.locale)
  const capturing = useAppStore((state) => state.shortcutCapturing)

  useEffect(() => {
    return () => {
      useAppStore.getState().setShortcutCapturing(null)
    }
  }, [])

  return (
    <ShellModal
      title={t(locale, 'settings')}
      onClose={onClose}
      className="sm:max-w-[520px]"
      keyboardDismissDisabled={capturing !== null}
      footer={<Button onPress={onClose}>{t(locale, 'save')}</Button>}
    >
      <Tabs
        className="w-full"
        defaultSelectedKey="general"
        onSelectionChange={(key) => {
          if (String(key) !== 'shortcuts') {
            useAppStore.getState().setShortcutCapturing(null)
          }
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label={t(locale, 'settings')}>
            <Tabs.Tab id="general">
              {t(locale, 'settingsGeneral')}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="shortcuts">
              {t(locale, 'shortcuts')}
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="general" className="pt-4">
          <GeneralSettings />
        </Tabs.Panel>
        <Tabs.Panel id="shortcuts" className="pt-4">
          <ShortcutsSettings />
        </Tabs.Panel>
      </Tabs>
    </ShellModal>
  )
}

function GeneralSettings() {
  const snapshot = useAppStore((state) => state.snapshot)
  const locale = snapshot.locale
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm">{t(locale, 'language')}</p>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <Button
              key={code}
              size="sm"
              variant={locale === code ? 'primary' : 'secondary'}
              onPress={() => void dispatch({ type: 'prefs/locale', locale: code })}
            >
              {t(locale, LOCALE_NAME_KEY[code])}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm">{t(locale, 'theme')}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={snapshot.theme === 'dark' ? 'primary' : 'secondary'}
            onPress={() => void dispatch({ type: 'prefs/theme', theme: 'dark' })}
          >
            {t(locale, 'themeDark')}
          </Button>
          <Button
            size="sm"
            variant={snapshot.theme === 'light' ? 'primary' : 'secondary'}
            onPress={() => void dispatch({ type: 'prefs/theme', theme: 'light' })}
          >
            {t(locale, 'themeLight')}
          </Button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={snapshot.launchAtStartup}
          onChange={(event) =>
            void dispatch({ type: 'prefs/launchAtStartup', value: event.target.checked })
          }
        />
        {t(locale, 'launchAtStartup')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={snapshot.blockSleepWhileRunning}
          onChange={(event) =>
            void dispatch({ type: 'prefs/blockSleepWhileRunning', value: event.target.checked })
          }
        />
        {t(locale, 'blockSleepWhileRunning')}
      </label>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onPress={() => void window.opsource.exportWorkspace()}>
          {t(locale, 'exportWorkspace')}
        </Button>
        <Button size="sm" variant="secondary" onPress={() => void window.opsource.importWorkspace()}>
          {t(locale, 'importWorkspace')}
        </Button>
        <Button size="sm" variant="secondary" onPress={() => void window.opsource.exportGameList()}>
          {t(locale, 'exportGameList')}
        </Button>
        <Button size="sm" variant="secondary" onPress={() => void window.opsource.importGameList()}>
          {t(locale, 'importGameList')}
        </Button>
      </div>
      <div>
        <Button size="sm" variant="secondary" onPress={() => void window.opsource.windowControl('quit')}>
          {t(locale, 'quit')}
        </Button>
      </div>
    </div>
  )
}

function ShortcutsSettings() {
  const snapshot = useAppStore((state) => state.snapshot)
  const capturing = useAppStore((state) => state.shortcutCapturing)
  const platform = useAppStore((state) => state.platform)
  const locale = snapshot.locale
  const displayPlatform = platform === 'darwin' ? 'darwin' : 'win'
  const [taken, setTaken] = useState(false)

  const setCapturing = (command: ShortcutCommand | null) => {
    setTaken(false)
    useAppStore.getState().setShortcutCapturing(command)
  }

  useEffect(() => {
    if (!capturing) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      if (event.key === 'Escape') {
        setCapturing(null)
        return
      }
      if (event.repeat) {
        return
      }
      const chord = chordFromCapture(capturing, {
        key: event.key,
        shift: event.shiftKey,
        alt: event.altKey,
        control: event.ctrlKey,
        meta: event.metaKey
      })
      if (!chord) {
        return
      }
      if (shortcutConflict(snapshot.shortcuts, capturing, chord)) {
        setTaken(true)
        return
      }
      void dispatch({ type: 'prefs/shortcut', command: capturing, chord })
      setCapturing(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [capturing, snapshot.shortcuts])

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        {taken ? t(locale, 'shortcutTaken') : t(locale, 'shortcutPressChord')}
      </p>
      <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-1">
        {SHORTCUT_COMMANDS.map((command) => {
          const chord = snapshot.shortcuts[command]
          const isDefault = chordsEqual(chord, SHORTCUT_DEFAULTS[command])
          const active = capturing === command
          return (
            <li key={command} className="flex items-center gap-2 rounded-md px-1 py-1">
              <button
                type="button"
                className={`flex min-w-0 flex-1 items-center gap-3 text-left text-sm ${
                  active ? 'text-foreground' : 'text-muted'
                }`}
                onClick={() => setCapturing(command)}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-foreground">{t(locale, SHORTCUT_LABELS[command])}</span>
                  <span className="text-xs">
                    {t(
                      locale,
                      commandScope(command) === 'loop' ? 'shortcutScopeLoop' : 'shortcutScopeChrome'
                    )}
                  </span>
                </span>
              </button>
              <kbd className="shrink-0 font-mono text-xs leading-none text-foreground">
                {displayShortcutLabel(command, chord, displayPlatform)}
              </kbd>
              <Button
                size="sm"
                variant="secondary"
                isDisabled={isDefault}
                onPress={() => {
                  void dispatch({ type: 'prefs/shortcut', command, chord: null })
                  if (capturing === command) {
                    setCapturing(null)
                  }
                }}
              >
                {t(locale, 'shortcutReset')}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
