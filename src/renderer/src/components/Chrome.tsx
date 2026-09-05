import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  LayoutGrid,
  Columns2,
  Rows2,
  Square,
  Move,
  Minus,
  History,
  Plus,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X
} from 'lucide-react'
import { Button, Dropdown, Label } from '@heroui/react'
import { t } from '@shared/i18n'
import type { LayoutMode, Locale } from '@shared/types'
import { activeAccount, archivedTabs, visibleTabs } from '@shared/workspace'
import { dispatch, useAppStore } from '../store'

function IconButton({
  label,
  onPress,
  disabled,
  children
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={label}
      isDisabled={disabled}
      onPress={onPress}
      className="app-no-drag rounded-full text-muted hover:text-foreground"
    >
      {children}
    </Button>
  )
}


function RecentlyClosed({ locale }: { locale: Locale }) {
  const snapshot = useAppStore((state) => state.snapshot)
  const closed = archivedTabs(snapshot)
  return (
    <Dropdown className="app-no-drag h-full justify-center">
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        isDisabled={closed.length === 0}
        aria-label={t(locale, 'recentlyClosed')}
        className="chrome-tab-new"
      >
        <History className="size-4" />
      </Button>
      <Dropdown.Popover placement="bottom start" className="w-52">
        <Dropdown.Menu
          onAction={(key) => {
            void dispatch({ type: 'tab/reopen', id: String(key) })
          }}
        >
          {closed.map((item) => (
            <Dropdown.Item key={item.id} id={item.id} textValue={item.name}>
              <Label>{item.name}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

export function Chrome() {
  const snapshot = useAppStore((state) => state.snapshot)
  const nav = useAppStore((state) => state.nav)
  const urlDraft = useAppStore((state) => state.urlDraft)
  const platform = useAppStore((state) => state.platform)
  const locale = snapshot.locale
  const tabs = visibleTabs(snapshot)
  const tab = tabs.find((item) => item.id === snapshot.activeTabId) ?? null
  const account = activeAccount(snapshot)
  const accountNav = account ? nav[account.id] : undefined

  const go = (kind: 'back' | 'forward' | 'reload' | 'home') => {
    if (!account) {
      return
    }
    void window.opsource.navigate({ kind, accountId: account.id })
  }

  const setLayout = (layout: LayoutMode) => {
    if (!tab) {
      return
    }
    void dispatch({ type: 'tab/layout', id: tab.id, layout })
  }

  return (
    <header className="bg-tab-strip">
      <div className="app-drag flex h-9 items-stretch">
        {platform === 'darwin' ? <div className="w-[72px] shrink-0" /> : null}
        <div className="chrome-tabstrip min-w-0 flex-1">
        {tabs.map((item) => {
          const active = item.id === snapshot.activeTabId
          return (
            <div
              key={item.id}
              className={`chrome-tab ${active ? 'is-active' : ''}`}
              onClick={() => void dispatch({ type: 'tab/activate', id: item.id })}
              onDoubleClick={() => useAppStore.getState().setDialog({ id: 'tab-rename', tabId: item.id })}
            >
              <span className="chrome-tab-surface" />
              <span className="chrome-tab-label">{item.name}</span>
              <button
                type="button"
                className="chrome-tab-close"
                aria-label={t(locale, 'closeTab')}
                onClick={(event) => {
                  event.stopPropagation()
                  void dispatch({ type: 'tab/close', id: item.id })
                }}
              >
                <X className="size-3" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          className="chrome-tab-new"
          aria-label={t(locale, 'newTab')}
          onClick={() => useAppStore.getState().setDialog({ id: 'tab-create' })}
        >
          <Plus className="size-4" />
        </button>
        <RecentlyClosed locale={locale} />
        <div className="min-w-2 flex-1" />
        </div>
        <div className="app-no-drag flex shrink-0 items-center gap-1 pr-2">
          <IconButton label={t(locale, 'settings')} onPress={() => useAppStore.getState().setDialog({ id: 'settings' })}>
            <Settings className="size-4" />
          </IconButton>
          {platform !== 'darwin' ? (
            <>
              <IconButton label={t(locale, 'minimize')} onPress={() => void window.opsource.windowControl('min')}>
                <Minus className="size-4" />
              </IconButton>
              <IconButton label={t(locale, 'maximize')} onPress={() => void window.opsource.windowControl('max')}>
                <Square className="size-3.5" />
              </IconButton>
              <IconButton label={t(locale, 'closeWindow')} onPress={() => void window.opsource.windowControl('close')}>
                <X className="size-4" />
              </IconButton>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex h-11 items-center gap-1 bg-canvas px-2">
        <IconButton label={t(locale, 'back')} disabled={!accountNav?.canGoBack} onPress={() => go('back')}>
          <ArrowLeft className="size-4" />
        </IconButton>
        <IconButton label={t(locale, 'forward')} disabled={!accountNav?.canGoForward} onPress={() => go('forward')}>
          <ArrowRight className="size-4" />
        </IconButton>
        <IconButton label={t(locale, 'reload')} disabled={!account} onPress={() => go('reload')}>
          <RotateCw className="size-4" />
        </IconButton>
        <IconButton label={t(locale, 'home')} disabled={!account} onPress={() => go('home')}>
          <Home className="size-4" />
        </IconButton>
        <input
          id="url-bar"
          value={urlDraft}
          disabled={!account}
          aria-label={t(locale, 'urlBar')}
          className="h-8 flex-1 rounded-full border-0 bg-field px-3 font-mono text-xs text-foreground outline-none ring-0 focus:ring-2 focus:ring-ink"
          onFocus={() => useAppStore.getState().setUrlFocused(true)}
          onBlur={() => useAppStore.getState().setUrlFocused(false)}
          onChange={(event) => useAppStore.getState().setUrlDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && account) {
              void window.opsource.navigate({ kind: 'load', accountId: account.id, url: urlDraft })
            }
          }}
        />
        <IconButton
          label={account?.muted ? t(locale, 'unmute') : t(locale, 'mute')}
          disabled={!account}
          onPress={() => account && void dispatch({ type: 'account/setMuted', id: account.id, muted: !account.muted })}
        >
          {account?.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </IconButton>
        <IconButton
          label={t(locale, 'reloadAll')}
          disabled={!tab}
          onPress={() => tab && void window.opsource.navigate({ kind: 'reload-tab', tabId: tab.id })}
        >
          <RotateCw className="size-4" />
        </IconButton>
        <div className="mx-1 h-5 w-px bg-hairline" />
        <IconButton label={t(locale, 'layoutGrid')} onPress={() => setLayout('grid')}>
          <LayoutGrid className={`size-4 ${tab?.layout === 'grid' ? 'text-signal' : ''}`} />
        </IconButton>
        <IconButton label={t(locale, 'layoutSingle')} onPress={() => setLayout('single')}>
          <Square className={`size-4 ${tab?.layout === 'single' ? 'text-signal' : ''}`} />
        </IconButton>
        <IconButton label={t(locale, 'layoutColumns')} onPress={() => setLayout('columns')}>
          <Columns2 className={`size-4 ${tab?.layout === 'columns' ? 'text-signal' : ''}`} />
        </IconButton>
        <IconButton label={t(locale, 'layoutRows')} onPress={() => setLayout('rows')}>
          <Rows2 className={`size-4 ${tab?.layout === 'rows' ? 'text-signal' : ''}`} />
        </IconButton>
        <IconButton label={t(locale, 'layoutFree')} onPress={() => setLayout('free')}>
          <Move className={`size-4 ${tab?.layout === 'free' ? 'text-signal' : ''}`} />
        </IconButton>
      </div>
    </header>
  )
}
