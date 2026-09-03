import { describe, expect, it } from 'vitest'
import { keyboardCreateActions } from './accountLoop'
import { SHORTCUT_DEFAULTS } from './shortcuts'
import type { WorkspaceSnapshot } from './types'
import {
  accountIdsToWipe,
  applyAction,
  emptySnapshot,
  accountsForTab,
  exportGameList,
  exportMetadata,
  gameListImportActions,
  lastArchivedTab,
  hasRunningAccount,
  parseGameList,
  parseSnapshot,
  snapshotFromImport,
  visibleTabs,
  type WorkspaceAction
} from './workspace'

function withTab() {
  let state = emptySnapshot()
  state = applyAction(state, {
    type: 'tab/create',
    id: 'tab-gengar',
    name: 'Gengar',
    baseUrl: 'gengar.com.br'
  })
  return state
}

describe('workspace', () => {
  it('normalizes tab base URLs and activates the new tab', () => {
    const state = withTab()
    expect(state.tabs[0]?.baseUrl).toBe('https://gengar.com.br')
    expect(state.activeTabId).toBe('tab-gengar')
  })

  it('allows duplicate display names and keeps ids stable on reorder', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a', name: 'Conta 2' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-b', name: 'Conta 2' })
    const before = accountsForTab(state, 'tab-gengar').map((account) => account.id)
    expect(accountsForTab(state, 'tab-gengar').map((account) => account.name)).toEqual(['Conta 2', 'Conta 2'])
    state = applyAction(state, { type: 'account/reorder', tabId: 'tab-gengar', orderedIds: ['acc-b', 'acc-a'] })
    expect(accountsForTab(state, 'tab-gengar').map((account) => account.id)).toEqual(['acc-b', 'acc-a'])
    expect(new Set(before)).toEqual(new Set(['acc-a', 'acc-b']))
  })

  it('inherits the tab base URL on new accounts', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    expect(state.accounts['acc-a']?.url).toBe('https://gengar.com.br')
    expect(state.accounts['acc-a']?.homeUrl).toBe('https://gengar.com.br')
  })

  it('keeps accounts when a tab is closed and restores them on reopen', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    state = applyAction(state, { type: 'account/setStatus', id: 'acc-a', status: 'running' })
    state = applyAction(state, { type: 'tab/close', id: 'tab-gengar' })
    expect(visibleTabs(state)).toHaveLength(0)
    expect(state.accounts['acc-a']?.status).toBe('running')
    state = applyAction(state, { type: 'tab/reopen', id: 'tab-gengar' })
    expect(visibleTabs(state)[0]?.id).toBe('tab-gengar')
    expect(state.accounts['acc-a']?.id).toBe('acc-a')
  })

  it('wipes only the deleted account', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a', name: 'A' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-b', name: 'B' })
    state = applyAction(state, { type: 'account/delete', id: 'acc-a' })
    expect(state.accounts['acc-a']).toBeUndefined()
    expect(state.accounts['acc-b']?.name).toBe('B')
    expect(accountsForTab(state, 'tab-gengar').map((account) => account.id)).toEqual(['acc-b'])
  })

  it('navigates URL on a single account, not the whole tab', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-b' })
    state = applyAction(state, { type: 'account/setUrl', id: 'acc-a', url: 'https://gengar.com.br/login' })
    expect(state.accounts['acc-a']?.url).toBe('https://gengar.com.br/login')
    expect(state.accounts['acc-b']?.url).toBe('https://gengar.com.br')
  })

  it('does not mix accounts across tabs', () => {
    let state = withTab()
    state = applyAction(state, {
      type: 'tab/create',
      id: 'tab-other',
      name: 'Other',
      baseUrl: 'https://example.com'
    })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-other', id: 'acc-b' })
    expect(accountsForTab(state, 'tab-gengar').map((account) => account.id)).toEqual(['acc-a'])
    expect(accountsForTab(state, 'tab-other').map((account) => account.id)).toEqual(['acc-b'])
  })

  it('parses snapshots by validating tab and account records', () => {
    const parsed = parseSnapshot({
      version: 1,
      tabs: [
        { id: 'tab-1', name: 'Gengar', baseUrl: 'https://gengar.com.br', layout: 'grid', accountOrder: ['acc-1'], archived: false },
        { id: 99, name: 'bad' }
      ],
      accounts: {
        'acc-1': {
          id: 'acc-1',
          tabId: 'tab-1',
          name: 'Main',
          color: '#FF6B35',
          url: 'https://gengar.com.br'
        },
        'nope': { id: 'mismatch', tabId: 'tab-1', name: 'X', color: '#000', url: 'https://x.com' }
      },
      activeTabId: 'tab-1'
    })
    expect(parsed.tabs.map((tab) => tab.id)).toEqual(['tab-1'])
    expect(Object.keys(parsed.accounts)).toEqual(['acc-1'])
    expect(parsed.accounts['acc-1']?.status).toBe('closed')
  })

  it('rejects junk snapshots and closes imported sessions', () => {
    expect(parseSnapshot(null).tabs).toEqual([])
    const imported = snapshotFromImport({
      version: 1,
      tabs: [{ id: 'tab-1', name: 'Gengar', baseUrl: 'https://gengar.com.br', accountOrder: ['acc-1'] }],
      accounts: {
        'acc-1': {
          id: 'acc-1',
          tabId: 'tab-1',
          name: 'Main',
          color: '#FF6B35',
          url: 'https://gengar.com.br',
          status: 'running'
        }
      }
    })
    expect(imported.accounts['acc-1']?.status).toBe('closed')
  })

  it('keyboard create then activate makes the new id the start target; mouse create does not steal active', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    expect(state.tabs[0]?.activeAccountId).toBe('acc-a')
    for (const action of keyboardCreateActions('tab-gengar', 'acc-k')) {
      state = applyAction(state, action)
    }
    expect(state.tabs[0]?.activeAccountId).toBe('acc-k')
    expect(state.accounts['acc-k']?.status).toBe('closed')

    state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar' })
    expect(state.tabs[0]?.activeAccountId).toBe('acc-a')
    expect(Object.keys(state.accounts)).toHaveLength(2)
  })

  it('reopens the last archived tab', () => {
    let state = withTab()
    state = applyAction(state, { type: 'tab/close', id: 'tab-gengar' })
    expect(lastArchivedTab(state)?.id).toBe('tab-gengar')
    state = applyAction(state, { type: 'tab/reopen', id: 'tab-gengar' })
    expect(visibleTabs(state)[0]?.id).toBe('tab-gengar')
  })
})

function applyAll(state: WorkspaceSnapshot, actions: WorkspaceAction[]): WorkspaceSnapshot {
  return actions.reduce((next, action) => applyAction(next, action), state)
}

describe('game list pack', () => {
  it('exports only in-bar name+URL rows and omits account keys', () => {
    let state = emptySnapshot()
    state = applyAction(state, {
      type: 'tab/create',
      id: 'tab-a',
      name: 'Alpha',
      baseUrl: 'https://alpha.example'
    })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-a', id: 'acc-a', name: 'Jar A' })
    state = applyAction(state, {
      type: 'tab/create',
      id: 'tab-b',
      name: 'Beta',
      baseUrl: 'https://beta.example'
    })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-b', id: 'acc-b', name: 'Jar B' })
    state = applyAction(state, {
      type: 'tab/create',
      id: 'tab-arch',
      name: 'Archived',
      baseUrl: 'https://arch.example'
    })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-arch', id: 'acc-arch', name: 'Jar Arch' })
    state = applyAction(state, { type: 'tab/close', id: 'tab-arch' })

    const pack = exportGameList(state)
    expect(pack.kind).toBe('game-list')
    expect(pack.version).toBe(1)
    expect(pack.tabs).toEqual([
      { name: 'Alpha', baseUrl: 'https://alpha.example' },
      { name: 'Beta', baseUrl: 'https://beta.example' }
    ])
    expect(JSON.stringify(pack)).not.toMatch(/account/i)
  })

  it('parses only valid game-list documents and rejects workspace-shaped or junk input', () => {
    const validRow = { name: 'Alpha', baseUrl: 'https://alpha.example' }
    expect(
      parseGameList({ version: 1, tabs: [validRow], accounts: {} })
    ).toEqual([])
    expect(parseGameList({ version: 1, tabs: [validRow] })).toEqual([])
    expect(
      parseGameList({ version: 1, kind: 'game-list', tabs: [validRow], accounts: {} })
    ).toEqual([])
    expect(
      parseGameList({ version: 1, kind: 'game-list', tabs: [validRow], accounts: [] })
    ).toEqual([])
    expect(parseGameList(null)).toEqual([])
    expect(parseGameList([])).toEqual([])
    expect(parseGameList({ version: 1, kind: 'game-list', tabs: [] })).toEqual([])
  })

  it('skips javascript: and empty URLs while keeping http(s) rows', () => {
    expect(
      parseGameList({
        version: 1,
        kind: 'game-list',
        tabs: [
          { name: 'xss', baseUrl: 'javascript:alert(1)' },
          { name: 'blank', baseUrl: '' },
          { name: 'ok', baseUrl: 'https://ok.example' }
        ]
      })
    ).toEqual([{ name: 'ok', baseUrl: 'https://ok.example' }])
  })

  it('adds pack tabs without accounts and restores prior in-bar active', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a', name: 'Main' })
    const accountKeys = Object.keys(state.accounts)
    const priorActive = state.activeTabId
    const priorTabCount = state.tabs.length

    state = applyAll(
      state,
      gameListImportActions(state, [
        { name: 'Pack One', baseUrl: 'https://one.example' },
        { name: 'Pack Two', baseUrl: 'https://two.example' }
      ])
    )

    expect(state.tabs).toHaveLength(priorTabCount + 2)
    expect(Object.keys(state.accounts)).toEqual(accountKeys)
    expect(state.activeTabId).toBe(priorActive)
    expect(state.tabs.filter((tab) => tab.archived)).toHaveLength(0)
  })

  it('leaves the created tab active when no in-bar active tab existed', () => {
    const state = applyAll(
      emptySnapshot(),
      gameListImportActions(emptySnapshot(), [{ name: 'Solo', baseUrl: 'https://solo.example' }])
    )
    expect(state.tabs).toHaveLength(1)
    expect(state.activeTabId).toBe(state.tabs[0]?.id)
    expect(Object.keys(state.accounts)).toEqual([])
  })

  it('duplicates name/URL tabs with new ids on re-apply and still creates no accounts', () => {
    const pack = [{ name: 'Dup', baseUrl: 'https://dup.example' }]
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a' })
    const accountKeys = Object.keys(state.accounts)
    state = applyAll(state, gameListImportActions(state, pack))
    state = applyAll(state, gameListImportActions(state, pack))
    const dups = state.tabs.filter((tab) => tab.name === 'Dup' && tab.baseUrl === 'https://dup.example')
    expect(dups).toHaveLength(2)
    expect(new Set(dups.map((tab) => tab.id)).size).toBe(2)
    expect(Object.keys(state.accounts)).toEqual(accountKeys)
  })

  it('emits no actions for an empty pack so apply mutates nothing', () => {
    const state = withTab()
    expect(gameListImportActions(state, [])).toEqual([])
    expect(applyAll(state, gameListImportActions(state, parseGameList({
      version: 1,
      kind: 'game-list',
      tabs: []
    })))).toBe(state)
  })
})

function diskJson(locale: unknown) {
  return {
    version: 1,
    tabs: [],
    accounts: {},
    locale
  }
}

describe('chrome locale allowlist', () => {
  it('parses Spanish locale from disk JSON', () => {
    expect(parseSnapshot(diskJson('es')).locale).toBe('es')
  })

  it('keeps English locale from disk JSON', () => {
    expect(parseSnapshot(diskJson('en')).locale).toBe('en')
  })

  it('parses Simplified Chinese locale from disk JSON', () => {
    expect(parseSnapshot(diskJson('zh-Hans')).locale).toBe('zh-Hans')
  })

  it('maps unknown disk locales including zh and es-419 to Portuguese', () => {
    expect(parseSnapshot(diskJson('zh')).locale).toBe('pt')
    expect(parseSnapshot(diskJson('es-419')).locale).toBe('pt')
    expect(parseSnapshot({ version: 1, tabs: [], accounts: {} }).locale).toBe('pt')
  })

  it('patches only locale for Spanish and does not wipe sessions', () => {
    let state = withTab()
    state = applyAction(state, {
      type: 'account/create',
      tabId: 'tab-gengar',
      id: 'acc-run',
      name: 'Keep Run'
    })
    state = applyAction(state, {
      type: 'account/create',
      tabId: 'tab-gengar',
      id: 'acc-closed',
      name: 'Keep Closed'
    })
    state = applyAction(state, { type: 'account/setStatus', id: 'acc-run', status: 'running' })
    const before = state
    const next = applyAction(state, { type: 'prefs/locale', locale: 'es' })
    expect(next.locale).toBe('es')
    expect(next.accounts['acc-run']?.status).toBe('running')
    expect(next.accounts['acc-closed']?.status).toBe('closed')
    expect(next.accounts['acc-run']?.name).toBe('Keep Run')
    expect(next.accounts['acc-closed']?.name).toBe('Keep Closed')
    expect(next.tabs).toEqual(before.tabs)
    expect(next.accounts).toEqual(before.accounts)
    expect(accountIdsToWipe(before, { type: 'prefs/locale', locale: 'es' })).toEqual([])
  })

  it('patches only locale for Simplified Chinese and does not wipe sessions', () => {
    let state = withTab()
    state = applyAction(state, {
      type: 'account/create',
      tabId: 'tab-gengar',
      id: 'acc-run',
      name: 'Keep Run'
    })
    const next = applyAction(state, { type: 'prefs/locale', locale: 'zh-Hans' })
    expect(next.locale).toBe('zh-Hans')
    expect(next.accounts['acc-run']?.status).toBe('closed')
    expect(next.accounts['acc-run']?.name).toBe('Keep Run')
    expect(accountIdsToWipe(state, { type: 'prefs/locale', locale: 'zh-Hans' })).toEqual([])
  })

  it('no-ops invalid locale dispatch', () => {
    const state = withTab()
    const junk = { type: 'prefs/locale', locale: 'nope' } as unknown as WorkspaceAction
    expect(applyAction(state, junk)).toEqual(state)
    expect(applyAction(state, junk)).toBe(state)
  })

  it('names a nameless third account Cuenta 3 when Spanish is selected', () => {
    let state = withTab()
    state = applyAction(state, { type: 'prefs/locale', locale: 'es' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-1', name: 'A' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-2', name: 'B' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-3' })
    expect(state.accounts['acc-3']?.name).toBe('Cuenta 3')
  })

  it('names a nameless third account 账号 3 when Simplified Chinese is selected', () => {
    let state = withTab()
    state = applyAction(state, { type: 'prefs/locale', locale: 'zh-Hans' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-1', name: 'A' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-2', name: 'B' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-3' })
    expect(state.accounts['acc-3']?.name).toBe('账号 3')
  })

  it('keeps Conta and Account default names for Portuguese and English', () => {
    let pt = withTab()
    pt = applyAction(pt, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-pt' })
    expect(pt.accounts['acc-pt']?.name).toBe('Conta 1')

    let en = applyAction(withTab(), { type: 'prefs/locale', locale: 'en' })
    en = applyAction(en, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-en' })
    expect(en.accounts['acc-en']?.name).toBe('Account 1')
  })
})

describe('hasRunningAccount', () => {
  it('is false on an empty snapshot', () => {
    expect(hasRunningAccount(emptySnapshot())).toBe(false)
  })

  it('is true when one account is running', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-run', name: 'Run' })
    state = applyAction(state, { type: 'account/setStatus', id: 'acc-run', status: 'running' })
    expect(hasRunningAccount(state)).toBe(true)
  })

  it('is true when the running account is popped out', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-run', name: 'Run' })
    state = applyAction(state, { type: 'account/setStatus', id: 'acc-run', status: 'running' })
    state = applyAction(state, { type: 'account/setPoppedOut', id: 'acc-run', poppedOut: true })
    expect(state.accounts['acc-run']?.poppedOut).toBe(true)
    expect(hasRunningAccount(state)).toBe(true)
  })

  it('is false when every account is closed', () => {
    let state = withTab()
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-a', name: 'A' })
    state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-b', name: 'B' })
    expect(state.accounts['acc-a']?.status).toBe('closed')
    expect(state.accounts['acc-b']?.status).toBe('closed')
    expect(hasRunningAccount(state)).toBe(false)
  })
})

describe('shortcut map persistence', () => {
  it('puts shipped defaults on empty snapshots and v1 files without shortcuts', () => {
    expect(emptySnapshot().version).toBe(1)
    expect(emptySnapshot().shortcuts).toEqual(SHORTCUT_DEFAULTS)
    expect(parseSnapshot({ version: 1, tabs: [], accounts: {} }).shortcuts).toEqual(SHORTCUT_DEFAULTS)
  })

  it('sets one unused legal chord and keeps the rest of the map', () => {
    const before = emptySnapshot()
    const next = applyAction(before, {
      type: 'prefs/shortcut',
      command: 'tab-new',
      chord: { key: 'q', shift: true, alt: false }
    })
    expect(next.shortcuts['tab-new']).toEqual({ key: 'q', shift: true, alt: false })
    expect(next.shortcuts['sidebar-toggle']).toEqual(SHORTCUT_DEFAULTS['sidebar-toggle'])
    expect(next.version).toBe(1)
  })

  it('no-ops duplicate and illegal chords without changing the snapshot', () => {
    const state = emptySnapshot()
    expect(
      applyAction(state, {
        type: 'prefs/shortcut',
        command: 'tab-new',
        chord: { key: 'b', shift: false, alt: false }
      })
    ).toBe(state)
    expect(
      applyAction(state, {
        type: 'prefs/shortcut',
        command: 'tab-new',
        chord: { key: '1', shift: false, alt: false }
      })
    ).toBe(state)
    expect(
      applyAction(state, {
        type: 'prefs/shortcut',
        command: 'tab-new',
        chord: { key: '', shift: false, alt: false }
      })
    ).toBe(state)
  })

  it('resets a remapped command to the shipped default while still storing it', () => {
    let state = emptySnapshot()
    state = applyAction(state, {
      type: 'prefs/shortcut',
      command: 'account-create',
      chord: { key: 'q', shift: true, alt: false }
    })
    expect(state.shortcuts['account-create']).toEqual({ key: 'q', shift: true, alt: false })
    state = applyAction(state, { type: 'prefs/shortcut', command: 'account-create', chord: null })
    expect(state.shortcuts['account-create']).toEqual(SHORTCUT_DEFAULTS['account-create'])
    expect(state.shortcuts['account-create']).toEqual({ key: 'n', shift: true, alt: false })
  })

  it('exports the full map on workspace metadata and omits it from game-list packs', () => {
    let state = emptySnapshot()
    state = applyAction(state, {
      type: 'prefs/shortcut',
      command: 'tab-new',
      chord: { key: 'q', shift: true, alt: false }
    })
    const meta = exportMetadata(state)
    expect(meta.version).toBe(1)
    expect(meta.shortcuts['tab-new']).toEqual({ key: 'q', shift: true, alt: false })
    expect(meta.shortcuts['account-start']).toEqual(SHORTCUT_DEFAULTS['account-start'])
    const pack = exportGameList(state)
    expect(pack).not.toHaveProperty('shortcuts')
    expect(JSON.stringify(pack)).not.toMatch(/shortcuts/)
  })
})
