import { app } from 'electron'
import type { WebContentsView } from 'electron'
import { summarizeAppMetrics } from '@shared/metricsAggregate'
import type { AccountMetrics, MetricsPayload } from '@shared/types'

const startedAt = Date.now()

export function collectMetrics(
  views: Map<string, { view: WebContentsView; lastActivityAt: number | null }>,
  _fps?: number
): MetricsPayload {
  const appMetrics = app.getAppMetrics()
  const byPid = new Map(appMetrics.map((item) => [item.pid, item]))
  const perAccount: Record<string, AccountMetrics> = {}

  for (const [accountId, live] of views) {
    const pid = live.view.webContents.getOSProcessId()
    const match = byPid.get(pid)
    perAccount[accountId] = {
      cpu: match?.cpu.percentCPUUsage ?? 0,
      memoryBytes: (match?.memory.workingSetSize ?? 0) * 1024,
      lastActivityAt: live.lastActivityAt
    }
  }

  const totals = summarizeAppMetrics(appMetrics)

  return {
    at: Date.now(),
    perAccount,
    aggregate: {
      ...totals,
      fps: null,
      uptimeMs: Date.now() - startedAt
    }
  }
}
