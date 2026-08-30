import type { WorkspaceAction } from './workspace'
import type { MetricsPayload, NavigationState, StageReport, WorkspaceSnapshot } from './types'

export type NavCommand =
  | { kind: 'back'; accountId: string }
  | { kind: 'forward'; accountId: string }
  | { kind: 'reload'; accountId: string }
  | { kind: 'reload-tab'; tabId: string }
  | { kind: 'home'; accountId: string }
  | { kind: 'load'; accountId: string; url: string }

export type WindowCommand = 'min' | 'max' | 'close' | 'isMaximized'

export type OpsourceAPI = {
  getState: () => Promise<WorkspaceSnapshot>
  dispatch: (action: WorkspaceAction) => Promise<WorkspaceSnapshot>
  navigate: (command: NavCommand) => Promise<void>
  clearSession: (accountId: string) => Promise<void>
  reportStage: (report: StageReport) => void
  windowControl: (command: WindowCommand) => Promise<boolean>
  exportWorkspace: () => Promise<boolean>
  importWorkspace: () => Promise<boolean>
  getVersion: () => Promise<string>
  getPlatform: () => Promise<NodeJS.Platform>
  onState: (handler: (snapshot: WorkspaceSnapshot) => void) => () => void
  onMetrics: (handler: (metrics: MetricsPayload) => void) => () => void
  onNavigation: (handler: (nav: NavigationState) => void) => () => void
  reportFps: (fps: number) => void
}

declare global {
  interface Window {
    opsource: OpsourceAPI
  }
}

export {}
