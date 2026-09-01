import { Button } from '@heroui/react'
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
  const version = useAppStore((state) => state.version)
  const updateStatus = useAppStore((state) => state.updateStatus)
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
        {running} {t(locale, 'runningCount')}
      </span>
      <span>
        {t(locale, 'cpu')} {formatCpu(metrics?.aggregate.cpu ?? 0)}
      </span>
      <span>
        {t(locale, 'ram')} {formatBytes(metrics?.aggregate.memoryBytes ?? 0)}
      </span>
      {metrics?.aggregate.gpuCpu != null && metrics.aggregate.gpuMemoryBytes != null ? (
        <span>
          {t(locale, 'gpu')} {formatCpu(metrics.aggregate.gpuCpu)}{' '}
          {formatBytes(metrics.aggregate.gpuMemoryBytes)}
        </span>
      ) : null}
      <span>
        {t(locale, 'uptime')} {formatUptime(metrics?.aggregate.uptimeMs ?? 0)}
      </span>
      {updateStatus.phase === 'getting' ? <span>{t(locale, 'updateGetting')}</span> : null}
      {updateStatus.phase === 'ready' ? (
        <>
          <span>
            {t(locale, 'version')}
            {updateStatus.version}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 min-h-0 px-2 text-xs text-signal"
            onPress={() => void window.opsource.updateCommand('apply')}
          >
            {t(locale, 'updateApply')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 min-h-0 px-2 text-xs"
            onPress={() => void window.opsource.updateCommand('later')}
          >
            {t(locale, 'updateLater')}
          </Button>
        </>
      ) : null}
      <span>
        {t(locale, 'version')}
        {version}
      </span>
    </footer>
  )
}

