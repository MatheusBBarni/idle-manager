import { describe, expect, it } from 'vitest'
import { t } from './i18n'
import { runningAccountCount, shouldDismissToTray, trayTooltip } from './trayPolicy'
import { applyAction, emptySnapshot } from './workspace'

const live = {
  platform: 'win32',
  isQuitting: false,
  trayReady: true,
  runningCount: 3
}

function withAccounts() {
  let state = emptySnapshot()
  state = applyAction(state, {
    type: 'tab/create',
    id: 'tab-gengar',
    name: 'Gengar',
    baseUrl: 'gengar.com.br'
  })
  state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-run', name: 'Run' })
  state = applyAction(state, { type: 'account/create', tabId: 'tab-gengar', id: 'acc-closed', name: 'Closed' })
  state = applyAction(state, { type: 'account/setStatus', id: 'acc-run', status: 'running' })
  return state
}

describe('shouldDismissToTray', () => {
  it('is true on win32 with running accounts, tray ready, and not quitting', () => {
    expect(shouldDismissToTray(live)).toBe(true)
  })

  it('is false on darwin or linux with the same other flags', () => {
    expect(shouldDismissToTray({ ...live, platform: 'darwin' })).toBe(false)
    expect(shouldDismissToTray({ ...live, platform: 'linux' })).toBe(false)
  })

  it('is false when runningCount is 0, quitting, or tray is not ready', () => {
    expect(shouldDismissToTray({ ...live, runningCount: 0 })).toBe(false)
    expect(shouldDismissToTray({ ...live, isQuitting: true })).toBe(false)
    expect(shouldDismissToTray({ ...live, trayReady: false })).toBe(false)
  })
})

describe('runningAccountCount', () => {
  it('counts only accounts with status running', () => {
    const state = withAccounts()
    expect(state.accounts['acc-run']?.status).toBe('running')
    expect(state.accounts['acc-closed']?.status).toBe('closed')
    expect(runningAccountCount(state)).toBe(1)
    expect(runningAccountCount(emptySnapshot())).toBe(0)
  })
})

describe('trayTooltip', () => {
  it('includes the count and runningCount copy for en', () => {
    expect(trayTooltip('en', 4)).toContain('4')
    expect(trayTooltip('en', 4)).toContain(t('en', 'runningCount'))
  })
})
