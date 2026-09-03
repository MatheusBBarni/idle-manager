import { t } from './i18n'
import type { Locale, WorkspaceSnapshot } from './types'

export function runningAccountCount(snapshot: WorkspaceSnapshot): number {
  return Object.values(snapshot.accounts).filter((account) => account.status === 'running').length
}

export function shouldDismissToTray(input: {
  platform: string
  isQuitting: boolean
  trayReady: boolean
  runningCount: number
}): boolean {
  return input.platform === 'win32' && !input.isQuitting && input.trayReady && input.runningCount > 0
}

export function trayTooltip(locale: Locale, runningCount: number): string {
  return `${runningCount} ${t(locale, 'runningCount')}`
}
