import { create } from 'zustand'
import type { ShortcutCommand } from '@shared/shortcuts'
import type { MetricsPayload, NavigationState, WorkspaceSnapshot } from '@shared/types'
import type { UpdateStatus } from '@shared/updateStatus'
import { activeAccount, emptySnapshot, type WorkspaceAction } from '@shared/workspace'

export type DialogCommand =
  | { type: 'workspace'; action: WorkspaceAction }
  | { type: 'clear-session'; accountId: string }

export type DialogKind =
  | { id: 'none' }
  | { id: 'tab-create' }
  | { id: 'tab-rename'; tabId: string }
  | { id: 'account-create' }
  | { id: 'account-rename'; accountId: string }
  | { id: 'settings' }
  | {
      id: 'confirm'
      title: string
      body: string
      danger?: boolean
      command: DialogCommand
    }

type AppStore = {
  snapshot: WorkspaceSnapshot
  metrics: MetricsPayload | null
  nav: Record<string, NavigationState>
  urlDraft: string
  urlFocused: boolean
  dialog: DialogKind
  platform: NodeJS.Platform
  version: string
  fps: number
  sidebarCollapsed: boolean
  shortcutCapturing: ShortcutCommand | null
  updateStatus: UpdateStatus
  setSnapshot: (snapshot: WorkspaceSnapshot) => void
  setMetrics: (metrics: MetricsPayload) => void
  setUpdateStatus: (updateStatus: UpdateStatus) => void
  setNav: (nav: NavigationState) => void
  setUrlDraft: (value: string) => void
  setUrlFocused: (value: boolean) => void
  setDialog: (dialog: DialogKind) => void
  setMeta: (meta: { platform: NodeJS.Platform; version: string }) => void
  setFps: (fps: number) => void
  setSidebarCollapsed: (value: boolean) => void
  setShortcutCapturing: (value: ShortcutCommand | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  snapshot: emptySnapshot(),
  metrics: null,
  nav: {},
  urlDraft: '',
  urlFocused: false,
  dialog: { id: 'none' },
  platform: 'darwin',
  version: '0.1.0',
  fps: 0,
  sidebarCollapsed: false,
  shortcutCapturing: null,
  updateStatus: { phase: 'idle' },
  setSnapshot: (snapshot) => set({ snapshot }),
  setMetrics: (metrics) => set({ metrics }),
  setUpdateStatus: (updateStatus) => set({ updateStatus }),
  setNav: (nav) =>
    set((state) => ({
      nav: { ...state.nav, [nav.accountId]: nav },
      urlDraft: state.urlFocused ? state.urlDraft : nav.url
    })),
  setUrlDraft: (urlDraft) => set({ urlDraft }),
  setUrlFocused: (urlFocused) => set({ urlFocused }),
  setDialog: (dialog) => set({ dialog }),
  setMeta: (meta) => set(meta),
  setFps: (fps) => set({ fps }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setShortcutCapturing: (shortcutCapturing) => set({ shortcutCapturing })
}))

export async function dispatch(action: WorkspaceAction): Promise<WorkspaceSnapshot> {
  const snapshot = await window.opsource.dispatch(action)
  const store = useAppStore.getState()
  store.setSnapshot(snapshot)
  if (!store.urlFocused) {
    const account = activeAccount(snapshot)
    const currentNav = account ? store.nav[account.id] : undefined
    store.setUrlDraft(currentNav?.url ?? account?.url ?? '')
  }
  return snapshot
}

export async function runDialogCommand(command: DialogCommand): Promise<void> {
  if (command.type === 'clear-session') {
    await window.opsource.clearSession(command.accountId)
    return
  }
  await dispatch(command.action)
}
