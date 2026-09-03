import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, Play, Plus, Square } from 'lucide-react'
import { Button, Dropdown, Label } from '@heroui/react'
import { ACCOUNT_COLORS, type Account } from '@shared/types'
import { formatAge, formatBytes, formatCpu, t } from '@shared/i18n'
import { accountsForTab, visibleTabs } from '@shared/workspace'
import { dispatch, useAppStore } from '../store'

function AccountRow({ account, active }: { account: Account; active: boolean }) {
  const snapshot = useAppStore((state) => state.snapshot)
  const metrics = useAppStore((state) => state.metrics)
  const locale = snapshot.locale
  const live = metrics?.perAccount[account.id]
  const running = account.status === 'running'

  return (
    <div
      className={`group relative flex items-start gap-2 rounded-2xl px-3 py-2 ${
        active ? 'bg-canvas-soft' : 'hover:bg-canvas-soft/70'
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-2 text-left"
        onClick={() => void dispatch({ type: 'account/activate', id: account.id })}
        onDoubleClick={() =>
          void dispatch({
            type: 'account/setStatus',
            id: account.id,
            status: running ? 'closed' : 'running'
          })
        }
      >
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: account.color }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{account.name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className={running ? 'text-signal' : 'text-faint'}>
              {running ? t(locale, 'online') : t(locale, 'closed')}
            </span>
            {running && live ? (
              <>
                <span>
                  {t(locale, 'cpu')} {formatCpu(live.cpu)}
                </span>
                <span>
                  {t(locale, 'ram')} {formatBytes(live.memoryBytes)}
                </span>
                <span>{formatAge(live.lastActivityAt ?? account.lastActivityAt, Date.now())}</span>
              </>
            ) : null}
            {account.poppedOut ? <span>{t(locale, 'poppedOut')}</span> : null}
          </span>
        </span>
      </button>
      <Dropdown>
        <Button isIconOnly size="sm" variant="ghost" aria-label={account.name} className="text-muted">
          <EllipsisVertical className="size-4" />
        </Button>
        <Dropdown.Popover placement="bottom end" className="w-48">
          <div className="flex justify-center gap-1.5 px-2 pt-3.5 pb-1.5" aria-label={t(locale, 'recolor')}>
            {ACCOUNT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={color}
                className={`size-4 rounded-full ${account.color === color ? 'ring-1 ring-ink ring-offset-1 ring-offset-overlay' : ''}`}
                style={{ background: color }}
                onClick={() => void dispatch({ type: 'account/recolor', id: account.id, color })}
              />
            ))}
          </div>
          <Dropdown.Menu
            onAction={(key) => {
              const id = String(key)
              if (id === 'start') {
                void dispatch({ type: 'account/setStatus', id: account.id, status: 'running' })
              }
              if (id === 'stop') {
                void dispatch({ type: 'account/setStatus', id: account.id, status: 'closed' })
              }
              if (id === 'rename') {
                useAppStore.getState().setDialog({ id: 'account-rename', accountId: account.id })
              }
              if (id === 'pop') {
                void dispatch({ type: 'account/setPoppedOut', id: account.id, poppedOut: !account.poppedOut })
              }
              if (id === 'clear') {
                useAppStore.getState().setDialog({
                  id: 'confirm',
                  title: t(locale, 'clearSession'),
                  body: t(locale, 'confirmClearSession'),
                  command: { type: 'clear-session', accountId: account.id }
                })
              }
              if (id === 'delete') {
                useAppStore.getState().setDialog({
                  id: 'confirm',
                  title: t(locale, 'deleteAccount'),
                  body: t(locale, 'confirmDeleteAccount'),
                  danger: true,
                  command: { type: 'workspace', action: { type: 'account/delete', id: account.id } }
                })
              }
            }}
          >
            <Dropdown.Item id="start" textValue={t(locale, 'startAccount')}>
              <Label>{t(locale, 'startAccount')}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="stop" textValue={t(locale, 'stopAccount')}>
              <Label>{t(locale, 'stopAccount')}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="rename" textValue={t(locale, 'renameAccount')}>
              <Label>{t(locale, 'renameAccount')}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="pop" textValue={t(locale, 'popOut')}>
              <Label>{account.poppedOut ? t(locale, 'popIn') : t(locale, 'popOut')}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="clear" textValue={t(locale, 'clearSession')}>
              <Label>{t(locale, 'clearSession')}</Label>
            </Dropdown.Item>
            <Dropdown.Item id="delete" textValue={t(locale, 'deleteAccount')} variant="danger">
              <Label>{t(locale, 'deleteAccount')}</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  )
}

function AccountBubble({ account, active }: { account: Account; active: boolean }) {
  const running = account.status === 'running'
  return (
    <button
      type="button"
      title={account.name}
      aria-label={account.name}
      aria-current={active ? 'true' : undefined}
      className="relative flex size-7 shrink-0 items-center justify-center"
      onClick={() => void dispatch({ type: 'account/activate', id: account.id })}
      onDoubleClick={() =>
        void dispatch({
          type: 'account/setStatus',
          id: account.id,
          status: running ? 'closed' : 'running'
        })
      }
    >
      <span
        className={`size-5 rounded-full ${
          active ? 'ring-1 ring-ink ring-offset-1 ring-offset-canvas' : 'opacity-80 hover:opacity-100'
        }`}
        style={{ background: account.color }}
      />
      {running ? (
        <span className="absolute right-0.5 bottom-0.5 size-1.5 rounded-full bg-signal ring-1 ring-canvas" />
      ) : null}
    </button>
  )
}

export function Sidebar() {
  const snapshot = useAppStore((state) => state.snapshot)
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const locale = snapshot.locale
  const tabs = visibleTabs(snapshot)
  const tab = tabs.find((item) => item.id === snapshot.activeTabId) ?? null
  const accounts = tab ? accountsForTab(snapshot, tab.id) : []

  if (collapsed) {
    return (
      <aside className="relative z-20 flex w-11 shrink-0 flex-col items-center border-r border-hairline bg-canvas py-2">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={t(locale, 'expandSidebar')}
          className="mb-2 text-muted"
          onPress={() => useAppStore.getState().setSidebarCollapsed(false)}
        >
          <PanelLeftOpen className="size-4" />
        </Button>
        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden py-1">
          {accounts.map((account) => (
            <AccountBubble
              key={account.id}
              account={account}
              active={tab?.activeAccountId === account.id}
            />
          ))}
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={t(locale, 'addAccount')}
          className="mt-2 text-muted"
          isDisabled={!tab}
          onPress={() => useAppStore.getState().setDialog({ id: 'account-create' })}
        >
          <Plus className="size-4" />
        </Button>
      </aside>
    )
  }

  return (
    <aside className="relative z-20 flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas">
      <div className="flex items-center gap-2 px-3 py-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{tab ? tab.name : t(locale, 'appName')}</p>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={t(locale, 'collapseSidebar')}
          className="text-muted"
          onPress={() => useAppStore.getState().setSidebarCollapsed(true)}
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-auto px-2 pb-2">
        {accounts.map((account) => (
          <AccountRow key={account.id} account={account} active={tab?.activeAccountId === account.id} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-hairline p-3">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          isDisabled={!tab}
          onPress={() => useAppStore.getState().setDialog({ id: 'account-create' })}
        >
          <Plus className="size-4" />
          {t(locale, 'addAccount')}
        </Button>
        <Button
          isIconOnly
          size="sm"
          aria-label={t(locale, 'startAll')}
          isDisabled={!tab}
          onPress={() => {
            if (!tab) {
              return
            }
            for (const account of accounts) {
              if (account.status === 'closed') {
                void dispatch({ type: 'account/setStatus', id: account.id, status: 'running' })
              }
            }
          }}
        >
          <Play className="size-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          aria-label={t(locale, 'stopTab')}
          isDisabled={!tab}
          onPress={() => {
            if (!tab) {
              return
            }
            void dispatch({ type: 'account/stopTab', tabId: tab.id })
          }}
        >
          <Square className="size-4" />
        </Button>
      </div>
    </aside>
  )
}
