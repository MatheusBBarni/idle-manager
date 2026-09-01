import { useEffect, useState, type ReactNode } from 'react'
import { Button, Input, Label, Modal, Tabs, TextField } from '@heroui/react'
import { LOCALE_NAME_KEY, t, type MessageKey } from '@shared/i18n'
import {
  SHORTCUT_COMMANDS,
  SHORTCUT_DEFAULTS,
  canonicalizeShortcutChord,
  commandScope,
  displayShortcutLabel,
  parseShortcutChord,
  shortcutConflict,
  type ShortcutCommand
} from '@shared/shortcuts'
import { LOCALES } from '@shared/types'
import { isValidHttpUrl } from '@shared/urls'
import { tabById } from '@shared/workspace'
import { dispatch, runDialogCommand, useAppStore } from '../store'

export function Dialogs() {
  const dialog = useAppStore((state) => state.dialog)
  const snapshot = useAppStore((state) => state.snapshot)
  const locale = snapshot.locale
  const close = () => useAppStore.getState().setDialog({ id: 'none' })

  if (dialog.id === 'none') {
    return null
  }

  if (dialog.id === 'confirm') {
    return (
      <ShellModal
        title={dialog.title}
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onPress={close}>
              {t(locale, 'cancel')}
            </Button>
            <Button
              variant={dialog.danger ? 'danger' : 'primary'}
              onPress={() => {
                void runDialogCommand(dialog.command).then(close)
              }}
            >
              {t(locale, 'confirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">{dialog.body}</p>
      </ShellModal>
    )
  }

  if (dialog.id === 'settings') {
    return <SettingsModal onClose={close} />
  }

  if (dialog.id === 'tab-create') {
    return <TabModal onClose={close} />
  }

  if (dialog.id === 'tab-rename') {
    const tab = tabById(snapshot, dialog.tabId)
    return (
      <PromptModal
        title={t(locale, 'renameTab')}
        label={t(locale, 'createTabName')}
        initial={tab?.name ?? ''}
        submitLabel={t(locale, 'save')}
        onClose={close}
        onSubmit={(name) => {
          if (tab) {
            void dispatch({ type: 'tab/rename', id: tab.id, name })
          }
          close()
        }}
      />
    )
  }

  if (dialog.id === 'account-create') {
    return <AccountModal onClose={close} />
  }

  if (dialog.id === 'account-rename') {
    const account = snapshot.accounts[dialog.accountId]
    return (
      <PromptModal
        title={t(locale, 'renameAccount')}
        label={t(locale, 'createAccountName')}
        initial={account?.name ?? ''}
        submitLabel={t(locale, 'save')}
        onClose={close}
        onSubmit={(name) => {
          if (account) {
            void dispatch({ type: 'account/rename', id: account.id, name })
          }
          close()
        }}
      />
    )
  }

  return null
}

function ShellModal({
  title,
  onClose,
  children,
  footer,
  className = 'sm:max-w-[400px]',
  keyboardDismissDisabled = false
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  className?: string
  keyboardDismissDisabled?: boolean
}) {
  return (
    <Modal.Backdrop
      isOpen
      isKeyboardDismissDisabled={keyboardDismissDisabled}
      onOpenChange={(open) => !open && onClose()}
    >
      <Modal.Container>
        <Modal.Dialog className={className}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>{footer}</Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function PromptModal({
  title,
  label,
  initial,
  submitLabel,
  onClose,
  onSubmit
}: {
  title: string
  label: string
  initial: string
  submitLabel: string
  onClose: () => void
  onSubmit: (value: string) => void
}) {
  const [value, setValue] = useState(initial)
  const locale = useAppStore((state) => state.snapshot.locale)
  return (
    <ShellModal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            {t(locale, 'cancel')}
          </Button>
          <Button onPress={() => onSubmit(value)}>{submitLabel}</Button>
        </>
      }
    >
      <TextField value={value} onChange={setValue} autoFocus>
        <Label>{label}</Label>
        <Input />
      </TextField>
    </ShellModal>
  )
}

function TabModal({ onClose }: { onClose: () => void }) {
  const locale = useAppStore((state) => state.snapshot.locale)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('https://gengar.com.br/')
  const valid = isValidHttpUrl(url)
  return (
    <ShellModal
      title={t(locale, 'createTabTitle')}
      onClose={onClose}
      className="sm:max-w-[440px]"
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            {t(locale, 'cancel')}
          </Button>
          <Button
            isDisabled={!valid}
            onPress={() => {
              void dispatch({ type: 'tab/create', name, baseUrl: url })
              onClose()
            }}
          >
            {t(locale, 'create')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField value={name} onChange={setName}>
          <Label>{t(locale, 'createTabName')}</Label>
          <Input placeholder="Gengar" />
        </TextField>
        <TextField value={url} onChange={setUrl} isInvalid={!valid}>
          <Label>{t(locale, 'createTabUrl')}</Label>
          <Input placeholder={t(locale, 'urlPlaceholder')} />
        </TextField>
      </div>
    </ShellModal>
  )
}

function AccountModal({ onClose }: { onClose: () => void }) {
  const snapshot = useAppStore((state) => state.snapshot)
  const locale = snapshot.locale
  const [name, setName] = useState('')
  const tabId = snapshot.activeTabId
  return (
    <ShellModal
      title={t(locale, 'createAccountTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onPress={onClose}>
            {t(locale, 'cancel')}
          </Button>
          <Button
            isDisabled={!tabId}
            onPress={() => {
              if (!tabId) {
                return
              }
              void dispatch({ type: 'account/create', tabId, name })
              onClose()
            }}
          >
            {t(locale, 'create')}
          </Button>
        </>
      }
    >
      <TextField value={name} onChange={setName} autoFocus>
        <Label>{t(locale, 'createAccountName')}</Label>
        <Input />
      </TextField>
    </ShellModal>
  )
}

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

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'OS'])

function SettingsModal({ onClose }: { onClose: () => void }) {
  const snapshot = useAppStore((state) => state.snapshot)
  const locale = snapshot.locale
  const [capturing, setCapturingCommand] = useState<ShortcutCommand | null>(null)
  const [taken, setTaken] = useState(false)

  const setCapturing = (command: ShortcutCommand | null) => {
    setCapturingCommand(command)
    setTaken(false)
    useAppStore.getState().setShortcutCapturing(command !== null)
  }

  useEffect(() => {
    return () => {
      useAppStore.getState().setShortcutCapturing(false)
    }
  }, [])

  return (
    <ShellModal
      title={t(locale, 'settings')}
      onClose={onClose}
      className="sm:max-w-[520px]"
      keyboardDismissDisabled={capturing !== null}
      footer={
        <Button onPress={onClose}>{t(locale, 'save')}</Button>
      }
    >
      <Tabs
        className="w-full"
        defaultSelectedKey="general"
        onSelectionChange={(key) => {
          if (String(key) !== 'shortcuts') {
            setCapturing(null)
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
          <ShortcutsSettings capturing={capturing} taken={taken} setCapturing={setCapturing} setTaken={setTaken} />
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
    </div>
  )
}

function ShortcutsSettings({
  capturing,
  taken,
  setCapturing,
  setTaken
}: {
  capturing: ShortcutCommand | null
  taken: boolean
  setCapturing: (command: ShortcutCommand | null) => void
  setTaken: (taken: boolean) => void
}) {
  const snapshot = useAppStore((state) => state.snapshot)
  const platform = useAppStore((state) => state.platform)
  const locale = snapshot.locale
  const displayPlatform = platform === 'darwin' ? 'darwin' : 'win'

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
      if (event.repeat || MODIFIER_KEYS.has(event.key)) {
        return
      }
      if (!(event.metaKey || event.ctrlKey)) {
        return
      }
      const parsed = parseShortcutChord({
        key: event.key,
        shift: event.shiftKey,
        alt: event.altKey
      })
      const canonical = parsed ? canonicalizeShortcutChord(capturing, parsed) : null
      if (!canonical) {
        return
      }
      if (shortcutConflict(snapshot.shortcuts, capturing, canonical)) {
        setTaken(true)
        return
      }
      void dispatch({ type: 'prefs/shortcut', command: capturing, chord: canonical })
      setCapturing(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [capturing, snapshot.shortcuts, setCapturing, setTaken])

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        {taken ? t(locale, 'shortcutTaken') : t(locale, 'shortcutPressChord')}
      </p>
      <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-1">
        {SHORTCUT_COMMANDS.map((command) => {
          const chord = snapshot.shortcuts[command]
          const isDefault =
            chord.key === SHORTCUT_DEFAULTS[command].key &&
            chord.shift === SHORTCUT_DEFAULTS[command].shift &&
            chord.alt === SHORTCUT_DEFAULTS[command].alt
          const active = capturing === command
          return (
            <li key={command} className="flex items-center gap-2 rounded-md px-1 py-1">
              <button
                type="button"
                className={`flex min-w-0 flex-1 items-baseline justify-between gap-3 text-left text-sm ${
                  active ? 'text-foreground' : 'text-muted'
                }`}
                onClick={() => setCapturing(command)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-foreground">{t(locale, SHORTCUT_LABELS[command])}</span>
                  <span className="text-xs">
                    {t(
                      locale,
                      commandScope(command) === 'loop' ? 'shortcutScopeLoop' : 'shortcutScopeChrome'
                    )}
                  </span>
                </span>
                <kbd className="shrink-0 font-mono text-xs text-foreground">
                  {active
                    ? t(locale, 'shortcutPressChord')
                    : displayShortcutLabel(command, chord, displayPlatform)}
                </kbd>
              </button>
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
