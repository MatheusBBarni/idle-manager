import { newId } from './ids'
import { clampZoom, defaultFreeBounds } from './layout'
import {
  ACCOUNT_COLORS,
  type Account,
  type AccountStatus,
  type FractionRect,
  type GameTab,
  type LayoutMode,
  isLocale,
  type Locale,
  type ThemeName,
  type WindowBounds,
  type WorkspaceSnapshot
} from './types'
import {
  canonicalizeShortcutChord,
  cloneShortcutMap,
  isShortcutCommand,
  normalizeShortcutMap,
  parseShortcutChord,
  SHORTCUT_DEFAULTS,
  shortcutConflict,
  type ShortcutChord,
  type ShortcutCommand,
  type ShortcutMap
} from './shortcuts'
import { hostnameOf, isValidHttpUrl, normalizeUrl } from './urls'

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
  | { type: 'prefs/shortcut'; command: ShortcutCommand; chord: ShortcutChord | null }
  | { type: 'window/bounds'; bounds: WindowBounds }

export type WorkspaceExport = {
  version: 1
  tabs: Array<Pick<GameTab, 'id' | 'name' | 'baseUrl' | 'layout' | 'accountOrder' | 'archived'>>
  accounts: Record<string, Pick<Account, 'id' | 'tabId' | 'name' | 'color' | 'url' | 'homeUrl'>>
  locale: Locale
  theme: ThemeName
  shortcuts: ShortcutMap
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
    launchAtStartup: false,
    shortcuts: cloneShortcutMap(SHORTCUT_DEFAULTS)
  }
}

export function visibleTabs(snapshot: WorkspaceSnapshot): GameTab[] {
  return snapshot.tabs.filter((tab) => !tab.archived)
}

export function archivedTabs(snapshot: WorkspaceSnapshot): GameTab[] {
  return snapshot.tabs.filter((tab) => tab.archived)
}

export function lastArchivedTab(snapshot: WorkspaceSnapshot): GameTab | null {
  const closed = archivedTabs(snapshot)
  return closed[closed.length - 1] ?? null
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

const ACCOUNT_NAME_PREFIX = {
  pt: 'Conta',
  en: 'Account',
  es: 'Cuenta',
  'zh-Hans': '账号'
} as const satisfies Record<Locale, string>

function nextAccountName(existing: Account[], locale: Locale): string {
  return `${ACCOUNT_NAME_PREFIX[locale]} ${existing.length + 1}`
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

function applyShortcutPref(
  snapshot: WorkspaceSnapshot,
  command: ShortcutCommand,
  chord: ShortcutChord | null
): WorkspaceSnapshot {
  if (!isShortcutCommand(command)) {
    return snapshot
  }
  if (chord === null) {
    return {
      ...snapshot,
      shortcuts: {
        ...snapshot.shortcuts,
        [command]: { ...SHORTCUT_DEFAULTS[command] }
      }
    }
  }
  const parsed = parseShortcutChord(chord)
  const canonical = parsed ? canonicalizeShortcutChord(command, parsed) : null
  if (!canonical || shortcutConflict(snapshot.shortcuts, command, canonical)) {
    return snapshot
  }
  return {
    ...snapshot,
    shortcuts: {
      ...snapshot.shortcuts,
      [command]: canonical
    }
  }
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
      return isLocale(action.locale) ? { ...snapshot, locale: action.locale } : snapshot
    case 'prefs/theme':
      return { ...snapshot, theme: action.theme }
    case 'prefs/launchAtStartup':
      return { ...snapshot, launchAtStartup: action.value }
    case 'prefs/shortcut':
      return applyShortcutPref(snapshot, action.command, action.chord)
    case 'window/bounds':
      return { ...snapshot, windowBounds: action.bounds }
    default:
      return snapshot
  }
}

const LAYOUT_MODES = new Set<LayoutMode>(['grid', 'single', 'columns', 'rows', 'free'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGameListDocument(raw: unknown): raw is { version: 1; kind: 'game-list'; tabs: unknown[] } {
  return (
    isRecord(raw) &&
    raw.version === 1 &&
    raw.kind === 'game-list' &&
    Array.isArray(raw.tabs) &&
    !Object.hasOwn(raw, 'accounts')
  )
}

function asFinite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function asGameListTab(value: unknown): GameListTab | null {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.baseUrl !== 'string') {
    return null
  }
  if (!isValidHttpUrl(value.baseUrl)) {
    return null
  }
  return { name: value.name, baseUrl: value.baseUrl }
}

function asTab(value: unknown): GameTab | null {
  if (!isRecord(value)) {
    return null
  }
  const id = asString(value.id)
  const name = asString(value.name)
  const baseUrl = asString(value.baseUrl)
  if (!id || !name || !baseUrl) {
    return null
  }
  const layout = LAYOUT_MODES.has(value.layout as LayoutMode) ? (value.layout as LayoutMode) : 'grid'
  const accountOrder = Array.isArray(value.accountOrder)
    ? value.accountOrder.filter((item): item is string => typeof item === 'string')
    : []
  const activeAccountId = asString(value.activeAccountId)
  return {
    id,
    name,
    baseUrl,
    layout,
    accountOrder,
    activeAccountId,
    archived: value.archived === true
  }
}

function asFractionRect(value: unknown): FractionRect | null {
  if (!isRecord(value)) {
    return null
  }
  const x = asFinite(value.x)
  const y = asFinite(value.y)
  const w = asFinite(value.w)
  const h = asFinite(value.h)
  if (x === null || y === null || w === null || h === null) {
    return null
  }
  return { x, y, w, h }
}

function asAccount(value: unknown): Account | null {
  if (!isRecord(value)) {
    return null
  }
  const id = asString(value.id)
  const tabId = asString(value.tabId)
  const name = asString(value.name)
  const color = asString(value.color)
  const url = asString(value.url)
  if (!id || !tabId || !name || !color || !url) {
    return null
  }
  const zoom = asFinite(value.zoomFactor)
  return {
    id,
    tabId,
    name,
    color,
    url,
    homeUrl: asString(value.homeUrl) ?? url,
    status: value.status === 'running' ? 'running' : 'closed',
    muted: value.muted === true,
    zoomFactor: zoom === null ? 1 : zoom,
    lastActivityAt: asFinite(value.lastActivityAt),
    poppedOut: value.poppedOut === true,
    freeBounds: asFractionRect(value.freeBounds)
  }
}

function asWindowBounds(value: unknown): WindowBounds | null {
  if (!isRecord(value)) {
    return null
  }
  const x = asFinite(value.x)
  const y = asFinite(value.y)
  const width = asFinite(value.width)
  const height = asFinite(value.height)
  if (x === null || y === null || width === null || height === null) {
    return null
  }
  return { x, y, width, height }
}

export function parseSnapshot(raw: unknown): WorkspaceSnapshot {
  const fallback = emptySnapshot()
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.tabs) || !isRecord(raw.accounts)) {
    return fallback
  }
  const tabs = raw.tabs.map(asTab).filter((tab): tab is GameTab => tab !== null)
  const accounts: Record<string, Account> = {}
  for (const [key, value] of Object.entries(raw.accounts)) {
    const account = asAccount(value)
    if (account && account.id === key) {
      accounts[key] = account
    }
  }
  const activeTabId = asString(raw.activeTabId)
  return {
    version: 1,
    tabs,
    accounts,
    activeTabId: activeTabId && tabs.some((tab) => tab.id === activeTabId && !tab.archived)
      ? activeTabId
      : firstVisibleId(tabs),
    locale: isLocale(raw.locale) ? raw.locale : 'pt',
    theme: raw.theme === 'light' ? 'light' : 'dark',
    windowBounds: asWindowBounds(raw.windowBounds),
    launchAtStartup: raw.launchAtStartup === true,
    shortcuts: normalizeShortcutMap(raw.shortcuts)
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
    theme: snapshot.theme,
    shortcuts: cloneShortcutMap(snapshot.shortcuts)
  }
}

export type GameListTab = { name: string; baseUrl: string }

export type GameListExport = {
  version: 1
  kind: 'game-list'
  tabs: GameListTab[]
}

export function exportGameList(snapshot: WorkspaceSnapshot): GameListExport {
  return {
    version: 1,
    kind: 'game-list',
    tabs: visibleTabs(snapshot).map((tab) => ({ name: tab.name, baseUrl: tab.baseUrl }))
  }
}

export function parseGameList(raw: unknown): GameListTab[] {
  if (!isGameListDocument(raw)) {
    return []
  }
  return raw.tabs.map(asGameListTab).filter((tab): tab is GameListTab => tab !== null)
}

export function gameListImportActions(
  snapshot: WorkspaceSnapshot,
  tabs: GameListTab[]
): WorkspaceAction[] {
  if (tabs.length === 0) {
    return []
  }
  const actions: WorkspaceAction[] = tabs.map((tab) => ({
    type: 'tab/create',
    name: tab.name,
    baseUrl: tab.baseUrl
  }))
  const prior = tabById(snapshot, snapshot.activeTabId)
  if (prior && !prior.archived) {
    actions.push({ type: 'tab/activate', id: prior.id })
  }
  return actions
}

export function snapshotFromImport(raw: unknown): WorkspaceSnapshot {
  const imported = parseSnapshot(raw)
  return {
    ...imported,
    accounts: Object.fromEntries(
      Object.values(imported.accounts).map((account) => [
        account.id,
        {
          ...account,
          status: 'closed',
          poppedOut: false
        }
      ])
    )
  }
}
