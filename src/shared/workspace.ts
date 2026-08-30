import { newId } from './ids'
import { clampZoom, defaultFreeBounds } from './layout'
import {
  ACCOUNT_COLORS,
  type Account,
  type AccountStatus,
  type FractionRect,
  type GameTab,
  type LayoutMode,
  type Locale,
  type ThemeName,
  type WindowBounds,
  type WorkspaceSnapshot
} from './types'
import { hostnameOf, normalizeUrl } from './urls'

export type WorkspaceAction =
  | { type: 'tab/create'; name: string; baseUrl: string; id?: string }
  | { type: 'tab/rename'; id: string; name: string }
  | { type: 'tab/reorder'; orderedIds: string[] }
  | { type: 'tab/close'; id: string }
  | { type: 'tab/reopen'; id: string }
  | { type: 'tab/delete'; id: string; wipeAccounts: boolean }
  | { type: 'tab/activate'; id: string }
  | { type: 'tab/layout'; id: string; layout: LayoutMode }
  | {
      type: 'account/create'
      tabId: string
      name?: string
      color?: string
      url?: string
      id?: string
    }
  | { type: 'account/rename'; id: string; name: string }
  | { type: 'account/recolor'; id: string; color: string }
  | { type: 'account/reorder'; tabId: string; orderedIds: string[] }
  | { type: 'account/activate'; id: string }
  | { type: 'account/setStatus'; id: string; status: AccountStatus }
  | { type: 'account/setUrl'; id: string; url: string }
  | { type: 'account/setMuted'; id: string; muted: boolean }
  | { type: 'account/setZoom'; id: string; zoomFactor: number }
  | { type: 'account/setFreeBounds'; id: string; bounds: FractionRect }
  | { type: 'account/setPoppedOut'; id: string; poppedOut: boolean }
  | { type: 'account/touch'; id: string; at: number }
  | { type: 'account/delete'; id: string }
  | { type: 'prefs/locale'; locale: Locale }
  | { type: 'prefs/theme'; theme: ThemeName }
  | { type: 'prefs/launchAtStartup'; value: boolean }
  | { type: 'window/bounds'; bounds: WindowBounds }

export type WorkspaceExport = {
  version: 1
  tabs: Array<Pick<GameTab, 'id' | 'name' | 'baseUrl' | 'layout' | 'accountOrder' | 'archived'>>
  accounts: Record<string, Pick<Account, 'id' | 'tabId' | 'name' | 'color' | 'url' | 'homeUrl'>>
  locale: Locale
  theme: ThemeName
}

export function emptySnapshot(): WorkspaceSnapshot {
  return {
    version: 1,
    tabs: [],
    accounts: {},
    activeTabId: null,
    locale: 'pt',
    theme: 'dark',
    windowBounds: null,
    launchAtStartup: false
  }
}

export function visibleTabs(snapshot: WorkspaceSnapshot): GameTab[] {
  return snapshot.tabs.filter((tab) => !tab.archived)
}

export function tabById(snapshot: WorkspaceSnapshot, tabId: string | null): GameTab | null {
  if (!tabId) {
    return null
  }
  return snapshot.tabs.find((tab) => tab.id === tabId) ?? null
}

export function accountsForTab(snapshot: WorkspaceSnapshot, tabId: string): Account[] {
  const tab = tabById(snapshot, tabId)
  if (!tab) {
    return []
  }
  return tab.accountOrder
    .map((id) => snapshot.accounts[id])
    .filter((account): account is Account => Boolean(account))
}

export function activeAccount(snapshot: WorkspaceSnapshot): Account | null {
  const tab = tabById(snapshot, snapshot.activeTabId)
  if (!tab?.activeAccountId) {
    return null
  }
  return snapshot.accounts[tab.activeAccountId] ?? null
}

export function accountIdsToWipe(snapshot: WorkspaceSnapshot, action: WorkspaceAction): string[] {
  if (action.type === 'account/delete') {
    return [action.id]
  }
  if (action.type === 'tab/delete' && action.wipeAccounts) {
    return Object.values(snapshot.accounts)
      .filter((account) => account.tabId === action.id)
      .map((account) => account.id)
  }
  return []
}

function nextColor(existing: Account[]): string {
  const used = new Set(existing.map((account) => account.color))
  return ACCOUNT_COLORS.find((color) => !used.has(color)) ?? ACCOUNT_COLORS[existing.length % ACCOUNT_COLORS.length]
}

function nextAccountName(existing: Account[], locale: Locale): string {
  const n = existing.length + 1
  return locale === 'pt' ? `Conta ${n}` : `Account ${n}`
}

function replaceTab(snapshot: WorkspaceSnapshot, tabId: string, patch: Partial<GameTab>): WorkspaceSnapshot {
  return {
    ...snapshot,
    tabs: snapshot.tabs.map((tab) => (tab.id === tabId ? { ...tab, ...patch } : tab))
  }
}

function replaceAccount(
  snapshot: WorkspaceSnapshot,
  accountId: string,
  patch: Partial<Account>
): WorkspaceSnapshot {
  const current = snapshot.accounts[accountId]
  if (!current) {
    return snapshot
  }
  return {
    ...snapshot,
    accounts: {
      ...snapshot.accounts,
      [accountId]: { ...current, ...patch }
    }
  }
}

function firstVisibleId(tabs: GameTab[], except?: string): string | null {
  return tabs.find((tab) => !tab.archived && tab.id !== except)?.id ?? null
}

function reorderIds(current: string[], orderedIds: string[]): string[] {
  const allowed = new Set(current)
  const next: string[] = []
  for (const id of orderedIds) {
    if (allowed.delete(id)) {
      next.push(id)
    }
  }
  for (const id of current) {
    if (allowed.has(id)) {
      next.push(id)
    }
  }
  return next
}

function seedFreeBounds(snapshot: WorkspaceSnapshot, tab: GameTab): WorkspaceSnapshot {
  const running = accountsForTab(snapshot, tab.id).filter(
    (account) => account.status === 'running' && !account.poppedOut
  )
  let next = snapshot
  running.forEach((account, index) => {
    if (!account.freeBounds) {
      next = replaceAccount(next, account.id, {
        freeBounds: defaultFreeBounds(index, running.length)
      })
    }
  })
  return next
}

export function applyAction(snapshot: WorkspaceSnapshot, action: WorkspaceAction): WorkspaceSnapshot {
  switch (action.type) {
    case 'tab/create': {
      const id = action.id ?? newId()
      const baseUrl = normalizeUrl(action.baseUrl)
      const name = action.name.trim() || hostnameOf(baseUrl) || 'Game'
      const tab: GameTab = {
        id,
        name,
        baseUrl,
        layout: 'grid',
        accountOrder: [],
        activeAccountId: null,
        archived: false
      }
      return {
        ...snapshot,
        tabs: [...snapshot.tabs, tab],
        activeTabId: id
      }
    }
    case 'tab/rename': {
      const current = tabById(snapshot, action.id)
      if (!current) {
        return snapshot
      }
      return replaceTab(snapshot, action.id, { name: action.name.trim() || current.name })
    }
    case 'tab/reorder':
      return {
        ...snapshot,
        tabs: reorderIds(
          snapshot.tabs.map((tab) => tab.id),
          action.orderedIds
        )
          .map((id) => tabById(snapshot, id))
          .filter((tab): tab is GameTab => Boolean(tab))
      }
    case 'tab/close': {
      const next = replaceTab(snapshot, action.id, { archived: true })
      if (next.activeTabId === action.id) {
        return { ...next, activeTabId: firstVisibleId(next.tabs, action.id) }
      }
      return next
    }
    case 'tab/reopen':
      return {
        ...replaceTab(snapshot, action.id, { archived: false }),
        activeTabId: action.id
      }
    case 'tab/delete': {
      const remainingAccounts = action.wipeAccounts
        ? Object.fromEntries(
            Object.entries(snapshot.accounts).filter(([, account]) => account.tabId !== action.id)
          )
        : snapshot.accounts
      const tabs = snapshot.tabs.filter((tab) => tab.id !== action.id)
      return {
        ...snapshot,
        tabs,
        accounts: remainingAccounts,
        activeTabId: snapshot.activeTabId === action.id ? firstVisibleId(tabs) : snapshot.activeTabId
      }
    }
    case 'tab/activate': {
      const tab = tabById(snapshot, action.id)
      if (!tab || tab.archived) {
        return snapshot
      }
      return { ...snapshot, activeTabId: action.id }
    }
    case 'tab/layout': {
      const tab = tabById(snapshot, action.id)
      if (!tab) {
        return snapshot
      }
      const withLayout = replaceTab(snapshot, action.id, { layout: action.layout })
      return action.layout === 'free' ? seedFreeBounds(withLayout, { ...tab, layout: action.layout }) : withLayout
    }
    case 'account/create': {
      const tab = tabById(snapshot, action.tabId)
      if (!tab || tab.archived) {
        return snapshot
      }
      const existing = accountsForTab(snapshot, tab.id)
      const id = action.id ?? newId()
      const url = normalizeUrl(action.url ?? tab.baseUrl) || tab.baseUrl
      const account: Account = {
        id,
        tabId: tab.id,
        name: action.name?.trim() || nextAccountName(existing, snapshot.locale),
        color: action.color ?? nextColor(existing),
        url,
        homeUrl: url,
        status: 'closed',
        muted: false,
        zoomFactor: 1,
        lastActivityAt: null,
        poppedOut: false,
        freeBounds: null
      }
      return {
        ...snapshot,
        accounts: { ...snapshot.accounts, [id]: account },
        tabs: snapshot.tabs.map((item) =>
          item.id === tab.id
            ? {
                ...item,
                accountOrder: [...item.accountOrder, id],
                activeAccountId: item.activeAccountId ?? id
              }
            : item
        )
      }
    }
    case 'account/rename': {
      const current = snapshot.accounts[action.id]
      if (!current) {
        return snapshot
      }
      return replaceAccount(snapshot, action.id, { name: action.name.trim() || current.name })
    }
    case 'account/recolor':
      return replaceAccount(snapshot, action.id, { color: action.color })
    case 'account/reorder': {
      const tab = tabById(snapshot, action.tabId)
      if (!tab) {
        return snapshot
      }
      return replaceTab(snapshot, tab.id, { accountOrder: reorderIds(tab.accountOrder, action.orderedIds) })
    }
    case 'account/activate': {
      const account = snapshot.accounts[action.id]
      if (!account) {
        return snapshot
      }
      return {
        ...replaceTab(snapshot, account.tabId, { activeAccountId: account.id }),
        activeTabId: account.tabId
      }
    }
    case 'account/setStatus': {
      const poppedOut = action.status === 'closed' ? false : snapshot.accounts[action.id]?.poppedOut ?? false
      return replaceAccount(snapshot, action.id, { status: action.status, poppedOut })
    }
    case 'account/setUrl':
      return replaceAccount(snapshot, action.id, { url: normalizeUrl(action.url) })
    case 'account/setMuted':
      return replaceAccount(snapshot, action.id, { muted: action.muted })
    case 'account/setZoom':
      return replaceAccount(snapshot, action.id, { zoomFactor: clampZoom(action.zoomFactor) })
    case 'account/setFreeBounds':
      return replaceAccount(snapshot, action.id, { freeBounds: action.bounds })
    case 'account/setPoppedOut':
      return replaceAccount(snapshot, action.id, { poppedOut: action.poppedOut })
    case 'account/touch':
      return replaceAccount(snapshot, action.id, { lastActivityAt: action.at })
    case 'account/delete': {
      const account = snapshot.accounts[action.id]
      if (!account) {
        return snapshot
      }
      const accounts = { ...snapshot.accounts }
      delete accounts[action.id]
      return {
        ...snapshot,
        accounts,
        tabs: snapshot.tabs.map((tab) => {
          if (tab.id !== account.tabId) {
            return tab
          }
          const accountOrder = tab.accountOrder.filter((id) => id !== action.id)
          return {
            ...tab,
            accountOrder,
            activeAccountId: tab.activeAccountId === action.id ? accountOrder[0] ?? null : tab.activeAccountId
          }
        })
      }
    }
    case 'prefs/locale':
      return { ...snapshot, locale: action.locale }
    case 'prefs/theme':
      return { ...snapshot, theme: action.theme }
    case 'prefs/launchAtStartup':
      return { ...snapshot, launchAtStartup: action.value }
    case 'window/bounds':
      return { ...snapshot, windowBounds: action.bounds }
    default:
      return snapshot
  }
}

export function parseSnapshot(raw: unknown): WorkspaceSnapshot {
  const fallback = emptySnapshot()
  if (!raw || typeof raw !== 'object') {
    return fallback
  }
  const data = raw as Partial<WorkspaceSnapshot>
  if (data.version !== 1 || !Array.isArray(data.tabs) || typeof data.accounts !== 'object' || data.accounts === null) {
    return fallback
  }
  return {
    version: 1,
    tabs: data.tabs,
    accounts: data.accounts,
    activeTabId: data.activeTabId ?? firstVisibleId(data.tabs),
    locale: data.locale === 'en' ? 'en' : 'pt',
    theme: data.theme === 'light' ? 'light' : 'dark',
    windowBounds: data.windowBounds ?? null,
    launchAtStartup: Boolean(data.launchAtStartup)
  }
}

export function exportMetadata(snapshot: WorkspaceSnapshot): WorkspaceExport {
  return {
    version: snapshot.version,
    tabs: snapshot.tabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      baseUrl: tab.baseUrl,
      layout: tab.layout,
      accountOrder: tab.accountOrder,
      archived: tab.archived
    })),
    accounts: Object.fromEntries(
      Object.values(snapshot.accounts).map((account) => [
        account.id,
        {
          id: account.id,
          tabId: account.tabId,
          name: account.name,
          color: account.color,
          url: account.url,
          homeUrl: account.homeUrl
        }
      ])
    ),
    locale: snapshot.locale,
    theme: snapshot.theme
  }
}

export function snapshotFromImport(raw: unknown): WorkspaceSnapshot {
  const imported = parseSnapshot({
    ...(raw && typeof raw === 'object' ? raw : {}),
    version: 1
  })
  return {
    ...imported,
    accounts: Object.fromEntries(
      Object.values(imported.accounts).map((account) => [
        account.id,
        {
          ...account,
          status: 'closed',
          poppedOut: false,
          muted: false,
          zoomFactor: account.zoomFactor ?? 1,
          lastActivityAt: null,
          freeBounds: account.freeBounds ?? null
        }
      ])
    )
  }
}
