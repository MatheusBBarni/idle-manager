import { app } from 'electron'
import type { WebContentsView } from 'electron'
import type { AccountMetrics, MetricsPayload } from '@shared/types'

const startedAt = Date.now()

export function collectMetrics(
  views: Map<string, { view: WebContentsView; lastActivityAt: number | null }>,
  fps: number
): MetricsPayload {
  const appMetrics = app.getAppMetrics()
  const byPid = new Map(appMetrics.map((item) => [item.pid, item]))
  const perAccount: Record<string, AccountMetrics> = {}
  let cpu = 0
  let memoryBytes = 0

  for (const [accountId, live] of views) {
    const pid = live.view.webContents.getOSProcessId()
    const match = byPid.get(pid)
    const accountCpu = match?.cpu.percentCPUUsage ?? 0
    const accountMem = (match?.memory.workingSetSize ?? 0) * 1024
    cpu += accountCpu
    memoryBytes += accountMem
    perAccount[accountId] = {
      cpu: accountCpu,
      memoryBytes: accountMem,
      lastActivityAt: live.lastActivityAt
    }
  }

  return {
    at: Date.now(),
    perAccount,
    aggregate: {
      cpu,
      memoryBytes,
      fps,
      uptimeMs: Date.now() - startedAt
    }
  }
}
