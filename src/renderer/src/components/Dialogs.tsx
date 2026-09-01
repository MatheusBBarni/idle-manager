import { useState } from 'react'
import { Button, Input, Label, TextField } from '@heroui/react'
import { t } from '@shared/i18n'
import { isValidHttpUrl } from '@shared/urls'
import { tabById } from '@shared/workspace'
import { dispatch, runDialogCommand, useAppStore } from '../store'
import { SettingsModal } from './Settings'
import { ShellModal } from './ShellModal'

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
