import { useState, type ReactNode } from 'react'
import { Button, Input, Label, Modal, TextField } from '@heroui/react'
import { ACCOUNT_LOOP_SHORTCUTS } from '@shared/accountLoop'
import { t } from '@shared/i18n'
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
  className = 'sm:max-w-[400px]'
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  className?: string
}) {
  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
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

const SHORTCUT_LABELS = {
  'account-create': 'shortcutCreate',
  'account-prev': 'shortcutPrev',
  'account-next': 'shortcutNext',
  'account-start': 'shortcutStart'
} as const

function SettingsModal({ onClose }: { onClose: () => void }) {
  const snapshot = useAppStore((state) => state.snapshot)
  const platform = useAppStore((state) => state.platform)
  const locale = snapshot.locale
  const mac = platform === 'darwin'
  return (
    <ShellModal
      title={t(locale, 'settings')}
      onClose={onClose}
      className="sm:max-w-[440px]"
      footer={
        <Button onPress={onClose}>{t(locale, 'save')}</Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm">{t(locale, 'language')}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={locale === 'pt' ? 'primary' : 'secondary'}
              onPress={() => void dispatch({ type: 'prefs/locale', locale: 'pt' })}
            >
              {t(locale, 'localePt')}
            </Button>
            <Button
              size="sm"
              variant={locale === 'en' ? 'primary' : 'secondary'}
              onPress={() => void dispatch({ type: 'prefs/locale', locale: 'en' })}
            >
              {t(locale, 'localeEn')}
            </Button>
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
        <div>
          <p className="mb-2 text-sm">{t(locale, 'shortcuts')}</p>
          <ul className="flex flex-col gap-1.5 text-sm text-muted">
            {ACCOUNT_LOOP_SHORTCUTS.map((row) => (
              <li key={row.command} className="flex items-baseline justify-between gap-3">
                <span>{t(locale, SHORTCUT_LABELS[row.command])}</span>
                <kbd className="font-mono text-xs text-foreground">{mac ? row.mac : row.win}</kbd>
              </li>
            ))}
          </ul>
        </div>
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
    </ShellModal>
  )
}
