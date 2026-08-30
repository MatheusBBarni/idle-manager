import { contextBridge, ipcRenderer } from 'electron'
import type { OpsourceAPI } from '@shared/ipc'
import type { NavCommand, WindowCommand } from '@shared/ipc'
import type { MetricsPayload, NavigationState, StageReport, WorkspaceSnapshot } from '@shared/types'
import type { WorkspaceAction } from '@shared/workspace'

const api: OpsourceAPI = {
  getState: () => ipcRenderer.invoke('ops:getState'),
  dispatch: (action: WorkspaceAction) => ipcRenderer.invoke('ops:dispatch', action),
  navigate: (command: NavCommand) => ipcRenderer.invoke('ops:navigate', command),
  clearSession: (accountId: string) => ipcRenderer.invoke('ops:clearSession', accountId),
  reportStage: (report: StageReport) => {
    ipcRenderer.send('ops:reportStage', report)
  },
  windowControl: (command: WindowCommand) => ipcRenderer.invoke('ops:window', command),
  exportWorkspace: () => ipcRenderer.invoke('ops:export'),
  importWorkspace: () => ipcRenderer.invoke('ops:import'),
  getVersion: () => ipcRenderer.invoke('ops:version'),
  getPlatform: () => ipcRenderer.invoke('ops:platform'),
  onState: (handler) => {
    const listen = (_event: unknown, snapshot: WorkspaceSnapshot) => handler(snapshot)
    ipcRenderer.on('ops:state', listen)
    return () => ipcRenderer.removeListener('ops:state', listen)
  },
  onMetrics: (handler) => {
    const listen = (_event: unknown, metrics: MetricsPayload) => handler(metrics)
    ipcRenderer.on('ops:metrics', listen)
    return () => ipcRenderer.removeListener('ops:metrics', listen)
  },
  onNavigation: (handler) => {
    const listen = (_event: unknown, nav: NavigationState) => handler(nav)
    ipcRenderer.on('ops:navigation', listen)
    return () => ipcRenderer.removeListener('ops:navigation', listen)
  },
  reportFps: (value: number) => {
    ipcRenderer.send('ops:fps', value)
  }
}

contextBridge.exposeInMainWorld('opsource', api)
