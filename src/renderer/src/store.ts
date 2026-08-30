import { create } from 'zustand'
import type { MetricsPayload, NavigationState, WorkspaceSnapshot } from '@shared/types'
import { activeAccount, emptySnapshot, type WorkspaceAction } from '@shared/workspace'

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
      action: WorkspaceAction | { type: 'clear-session'; accountId: string }
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
  popoverOpen: boolean
  sidebarCollapsed: boolean
  setSnapshot: (snapshot: WorkspaceSnapshot) => void
  setMetrics: (metrics: MetricsPayload) => void
  setNav: (nav: NavigationState) => void
  setUrlDraft: (value: string) => void
  setUrlFocused: (value: boolean) => void
  setDialog: (dialog: DialogKind) => void
  setMeta: (meta: { platform: NodeJS.Platform; version: string }) => void
  setFps: (fps: number) => void
  setPopoverOpen: (value: boolean) => void
  setSidebarCollapsed: (value: boolean) => void
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
  popoverOpen: false,
  sidebarCollapsed: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setMetrics: (metrics) => set({ metrics }),
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
  setPopoverOpen: (popoverOpen) => set({ popoverOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed })
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
