import { describe, expect, it } from 'vitest'
import { ACCOUNT_LOOP_SHORTCUTS, keyboardCreateActions, nextAccountId } from './accountLoop'

describe('nextAccountId', () => {
  it('wraps next from the last item and prev from the first', () => {
    expect(nextAccountId(['a', 'b', 'c'], 'c', 1)).toBe('a')
    expect(nextAccountId(['a', 'b', 'c'], 'a', -1)).toBe('c')
  })

  it('returns the same id for a single-item order and null for empty', () => {
    expect(nextAccountId(['a'], 'a', 1)).toBe('a')
    expect(nextAccountId([], 'a', 1)).toBeNull()
  })

  it('treats unknown active as index 0 then applies delta', () => {
    expect(nextAccountId(['a', 'b', 'c'], 'missing', 1)).toBe('b')
    expect(nextAccountId(['a', 'b', 'c'], null, -1)).toBe('c')
  })
})

describe('ACCOUNT_LOOP_SHORTCUTS', () => {
  it('exposes the four frozen display chords from shipped defaults', () => {
    expect(ACCOUNT_LOOP_SHORTCUTS.map((row) => row.win)).toEqual([
      'Ctrl+Shift+N',
      'Ctrl+Shift+[',
      'Ctrl+Shift+]',
      'Ctrl+Enter'
    ])
  })
})

describe('keyboardCreateActions', () => {
  it('emits create then activate with the supplied id', () => {
    expect(keyboardCreateActions('tab-gengar', 'acc-new')).toEqual([
      { type: 'account/create', tabId: 'tab-gengar', id: 'acc-new' },
      { type: 'account/activate', id: 'acc-new' }
    ])
  })
})
