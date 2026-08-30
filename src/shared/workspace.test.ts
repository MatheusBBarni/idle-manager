import { describe, expect, it } from 'vitest'
import { applyAction, emptySnapshot, accountsForTab, lastArchivedTab, parseSnapshot, snapshotFromImport, visibleTabs } from './workspace'

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

  it('reopens the last archived tab', () => {
    let state = withTab()
    state = applyAction(state, { type: 'tab/close', id: 'tab-gengar' })
    expect(lastArchivedTab(state)?.id).toBe('tab-gengar')
    state = applyAction(state, { type: 'tab/reopen', id: 'tab-gengar' })
    expect(visibleTabs(state)[0]?.id).toBe('tab-gengar')
  })
})
