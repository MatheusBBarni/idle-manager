import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_LOOP_SHORTCUTS,
  keyboardCreateActions,
  matchAccountLoopChord,
  nextAccountId,
  type AccountLoopKeyInput
} from './accountLoop'

function key(partial: Partial<AccountLoopKeyInput> & Pick<AccountLoopKeyInput, 'key'>): AccountLoopKeyInput {
  return {
    type: 'keyDown',
    code: '',
    control: false,
    meta: false,
    shift: false,
    alt: false,
    isAutoRepeat: false,
    ...partial
  }
}

describe('matchAccountLoopChord', () => {
  it('matches Mod+Shift+N as account-create for meta or control', () => {
    expect(matchAccountLoopChord(key({ key: 'n', meta: true, shift: true }))).toBe('account-create')
    expect(matchAccountLoopChord(key({ key: 'N', control: true, shift: true }))).toBe('account-create')
  })

  it('returns null for n without mod, keyUp, repeat, and alt', () => {
    expect(matchAccountLoopChord(key({ key: 'n' }))).toBeNull()
    expect(matchAccountLoopChord(key({ key: 'n', meta: true, shift: true, type: 'keyUp' }))).toBeNull()
    expect(matchAccountLoopChord(key({ key: 'n', meta: true, shift: true, isAutoRepeat: true }))).toBeNull()
    expect(matchAccountLoopChord(key({ key: 'n', meta: true, shift: true, alt: true }))).toBeNull()
  })

  it('matches Mod+Shift+[ / ] and shifted { / } as prev/next', () => {
    expect(matchAccountLoopChord(key({ key: '[', meta: true, shift: true }))).toBe('account-prev')
    expect(matchAccountLoopChord(key({ key: '{', control: true, shift: true }))).toBe('account-prev')
    expect(matchAccountLoopChord(key({ key: ']', meta: true, shift: true }))).toBe('account-next')
    expect(matchAccountLoopChord(key({ key: '}', control: true, shift: true }))).toBe('account-next')
  })

  it('matches Mod+Enter without shift as account-start', () => {
    expect(matchAccountLoopChord(key({ key: 'Enter', meta: true }))).toBe('account-start')
    expect(matchAccountLoopChord(key({ key: 'Enter', control: true }))).toBe('account-start')
    expect(matchAccountLoopChord(key({ key: 'Enter', meta: true, shift: true }))).toBeNull()
  })

  it('returns null for non-mod and unmatched keys', () => {
    expect(matchAccountLoopChord(key({ key: 'Enter' }))).toBeNull()
    expect(matchAccountLoopChord(key({ key: 't', meta: true }))).toBeNull()
  })
})

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
  it('exposes the four frozen display chords', () => {
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
