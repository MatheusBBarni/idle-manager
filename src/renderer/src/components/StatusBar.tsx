import { formatBytes, formatCpu, formatUptime, t, type MessageKey } from '@shared/i18n'
import type { LayoutMode } from '@shared/types'
import { activeAccount, visibleTabs } from '@shared/workspace'
import { useAppStore } from '../store'

const layoutLabel: Record<LayoutMode, MessageKey> = {
  grid: 'layoutGrid',
  single: 'layoutSingle',
  columns: 'layoutColumns',
  rows: 'layoutRows',
  free: 'layoutFree'
}

export function StatusBar() {
  const snapshot = useAppStore((state) => state.snapshot)
  const metrics = useAppStore((state) => state.metrics)
  const fps = useAppStore((state) => state.fps)
  const version = useAppStore((state) => state.version)
  const locale = snapshot.locale
  const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId)
  const account = activeAccount(snapshot)
  const running = Object.values(snapshot.accounts).filter((item) => item.status === 'running').length

  return (
    <footer className="flex h-8 items-center gap-3 border-t border-hairline bg-canvas px-4 font-mono text-xs text-muted">
      <span className="text-signal">{t(locale, 'statusReady')}</span>
      <span>{tab?.name ?? '-'}</span>
      <span>{tab ? t(locale, layoutLabel[tab.layout]) : '-'}</span>
      <span>{account?.name ?? '-'}</span>
      <span className="flex-1" />
      <span>
        {running} {locale === 'pt' ? 'contas' : 'live'}
      </span>
      <span>
        {t(locale, 'cpu')} {formatCpu(metrics?.aggregate.cpu ?? 0)}
      </span>
      <span>
        {t(locale, 'ram')} {formatBytes(metrics?.aggregate.memoryBytes ?? 0)}
      </span>
      <span>
        {t(locale, 'fps')} {metrics?.aggregate.fps || fps}
      </span>
      <span>
        {t(locale, 'uptime')} {formatUptime(metrics?.aggregate.uptimeMs ?? 0)}
      </span>
      <span>
        {t(locale, 'version')}
        {version}
      </span>
    </footer>
  )
}

