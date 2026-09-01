import { describe, expect, it } from 'vitest'
import {
  CHROME_COMMANDS,
  LOOP_COMMANDS,
  SHORTCUT_DEFAULTS,
  chordFromCapture,
  chordIdentity,
  chordsEqual,
  cloneShortcutMap,
  displayShortcut,
  displayShortcutLabel,
  matchShortcut,
  normalizeShortcutMap,
  shortcutConflict,
  type ShortcutKeyInput
} from './shortcuts'

function key(
  partial: Partial<ShortcutKeyInput> & Pick<ShortcutKeyInput, 'key'>
): ShortcutKeyInput {
  return {
    type: 'keyDown',
    control: false,
    meta: false,
    shift: false,
    alt: false,
    isAutoRepeat: false,
    ...partial
  }
}

function mod(partial: Partial<ShortcutKeyInput> & Pick<ShortcutKeyInput, 'key'>): ShortcutKeyInput {
  return key({ meta: true, ...partial })
}

describe('matchShortcut defaults', () => {
  it('matches each loop default with mod in loop scope and ignores chrome defaults there', () => {
    const map = SHORTCUT_DEFAULTS
    expect(matchShortcut(mod({ key: 'n', shift: true }), map, 'loop')).toBe('account-create')
    expect(matchShortcut(mod({ key: 'N', shift: true, control: true, meta: false }), map, 'loop')).toBe(
      'account-create'
    )
    expect(matchShortcut(mod({ key: '[', shift: true }), map, 'loop')).toBe('account-prev')
    expect(matchShortcut(mod({ key: '{', shift: true, control: true, meta: false }), map, 'loop')).toBe(
      'account-prev'
    )
    expect(matchShortcut(mod({ key: ']', shift: true }), map, 'loop')).toBe('account-next')
    expect(matchShortcut(mod({ key: '}', shift: true }), map, 'loop')).toBe('account-next')
    expect(matchShortcut(mod({ key: 'Enter' }), map, 'loop')).toBe('account-start')

    expect(matchShortcut(mod({ key: 't' }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 'Tab' }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: '1' }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 'r' }), map, 'loop')).toBeNull()
  })

  it('matches chrome defaults in chrome scope and ignores loop defaults there', () => {
    const map = SHORTCUT_DEFAULTS
    expect(matchShortcut(mod({ key: 't' }), map, 'chrome')).toBe('tab-new')
    expect(matchShortcut(mod({ key: 't', shift: true }), map, 'chrome')).toBe('tab-reopen')
    expect(matchShortcut(mod({ key: 'b' }), map, 'chrome')).toBe('sidebar-toggle')
    expect(matchShortcut(mod({ key: 'l' }), map, 'chrome')).toBe('url-focus')
    expect(matchShortcut(mod({ key: 'r' }), map, 'chrome')).toBe('account-reload')
    expect(matchShortcut(mod({ key: 'r', shift: true }), map, 'chrome')).toBe('tab-reload')
    expect(matchShortcut(mod({ key: 'm' }), map, 'chrome')).toBe('account-mute')
    expect(matchShortcut(mod({ key: '=' }), map, 'chrome')).toBe('account-zoom-in')
    expect(matchShortcut(mod({ key: '+' }), map, 'chrome')).toBe('account-zoom-in')
    expect(matchShortcut(mod({ key: '-' }), map, 'chrome')).toBe('account-zoom-out')
    expect(matchShortcut(mod({ key: '0' }), map, 'chrome')).toBe('account-zoom-reset')
    expect(matchShortcut(mod({ key: 'Tab' }), map, 'chrome')).toBe('tab-next')
    expect(matchShortcut(mod({ key: 'n', shift: true }), map, 'chrome')).toBeNull()
    expect(matchShortcut(mod({ key: 'Enter' }), map, 'chrome')).toBeNull()
  })

  it('returns null without platform mod, on keyUp, and on repeat', () => {
    const map = SHORTCUT_DEFAULTS
    expect(matchShortcut(key({ key: 'n', shift: true }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 'n', shift: true, type: 'keyUp' }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 'n', shift: true, isAutoRepeat: true }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 't', type: 'keyUp' }), map, 'chrome')).toBeNull()
    expect(matchShortcut(mod({ key: 't', isAutoRepeat: true }), map, 'chrome')).toBeNull()
  })

  it('matches account-slot for keys 1-9 at the stored shift/alt', () => {
    const map = SHORTCUT_DEFAULTS
    for (const digit of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(matchShortcut(mod({ key: digit }), map, 'chrome')).toBe('account-slot')
    }
    expect(matchShortcut(mod({ key: '1', shift: true }), map, 'chrome')).toBeNull()
    expect(matchShortcut(mod({ key: '1', alt: true }), map, 'chrome')).toBeNull()
    expect(matchShortcut(mod({ key: '1' }), map, 'loop')).toBeNull()
  })

  it('still matches tab-next when shift is inverted', () => {
    const map = SHORTCUT_DEFAULTS
    expect(matchShortcut(mod({ key: 'Tab', shift: true }), map, 'chrome')).toBe('tab-next')
    expect(matchShortcut(mod({ key: 'Tab', shift: true }), map, 'loop')).toBeNull()
  })
})

describe('matchShortcut remaps', () => {
  it('honors a custom loop chord only in loop scope', () => {
    const map = cloneShortcutMap(SHORTCUT_DEFAULTS)
    map['account-create'] = { key: 'q', shift: true, alt: false }
    expect(matchShortcut(mod({ key: 'q', shift: true }), map, 'loop')).toBe('account-create')
    expect(matchShortcut(mod({ key: 'q', shift: true }), map, 'chrome')).toBeNull()
    expect(matchShortcut(mod({ key: 'n', shift: true }), map, 'loop')).toBeNull()
  })

  it('honors a custom chrome chord only in chrome scope', () => {
    const map = cloneShortcutMap(SHORTCUT_DEFAULTS)
    map['tab-new'] = { key: 'e', shift: false, alt: false }
    expect(matchShortcut(mod({ key: 'e' }), map, 'chrome')).toBe('tab-new')
    expect(matchShortcut(mod({ key: 'e' }), map, 'loop')).toBeNull()
    expect(matchShortcut(mod({ key: 't' }), map, 'chrome')).toBeNull()
  })
})

describe('shortcutConflict', () => {
  it('reports account-slot occupancy for Ctrl+1 when another command wants that chord', () => {
    expect(
      shortcutConflict(SHORTCUT_DEFAULTS, 'tab-new', { key: '1', shift: false, alt: false })
    ).toBe('account-slot')
    expect(
      shortcutConflict(SHORTCUT_DEFAULTS, 'account-create', { key: '5', shift: false, alt: false })
    ).toBe('account-slot')
  })

  it('reports occupancy when account-slot would cover an existing 1-9 bind', () => {
    const map = cloneShortcutMap(SHORTCUT_DEFAULTS)
    map['tab-new'] = { key: '2', shift: true, alt: false }
    expect(
      shortcutConflict(map, 'account-slot', { key: '1', shift: true, alt: false })
    ).toBe('tab-new')
  })

  it('ignores the command being assigned and unused chords', () => {
    expect(
      shortcutConflict(SHORTCUT_DEFAULTS, 'tab-new', { key: 't', shift: false, alt: false })
    ).toBeNull()
    expect(
      shortcutConflict(SHORTCUT_DEFAULTS, 'tab-new', { key: 'q', shift: true, alt: false })
    ).toBeNull()
  })
})

describe('normalizeShortcutMap', () => {
  it('returns shipped defaults when the field is missing or not a map', () => {
    expect(normalizeShortcutMap(undefined)).toEqual(SHORTCUT_DEFAULTS)
    expect(normalizeShortcutMap(null)).toEqual(SHORTCUT_DEFAULTS)
    expect(normalizeShortcutMap('nope')).toEqual(SHORTCUT_DEFAULTS)
  })

  it('falls the later catalog command back to its default on duplicate identity', () => {
    const raw = {
      ...SHORTCUT_DEFAULTS,
      'tab-new': { key: 'x', shift: false, alt: false },
      'sidebar-toggle': { key: 'x', shift: false, alt: false }
    }
    const normalized = normalizeShortcutMap(raw)
    expect(normalized['tab-new']).toEqual({ key: 'x', shift: false, alt: false })
    expect(normalized['sidebar-toggle']).toEqual(SHORTCUT_DEFAULTS['sidebar-toggle'])
  })

  it('ignores unknown commands and invalid chords per command', () => {
    const normalized = normalizeShortcutMap({
      ...SHORTCUT_DEFAULTS,
      'tab-new': { key: '', shift: false, alt: false },
      'not-a-command': { key: 'z', shift: false, alt: false },
      'url-focus': { key: 'l', shift: true, alt: false }
    })
    expect(normalized['tab-new']).toEqual(SHORTCUT_DEFAULTS['tab-new'])
    expect(normalized['url-focus']).toEqual({ key: 'l', shift: true, alt: false })
    expect(normalized).not.toHaveProperty('not-a-command')
  })

  it('canonicalizes account-slot digits to key 1', () => {
    const normalized = normalizeShortcutMap({
      ...SHORTCUT_DEFAULTS,
      'account-slot': { key: '7', shift: true, alt: false }
    })
    expect(normalized['account-slot']).toEqual({ key: '1', shift: true, alt: false })
  })
})

describe('chordIdentity and displayShortcut', () => {
  it('folds key case into identity', () => {
    expect(chordIdentity({ key: 'N', shift: true, alt: false })).toBe(
      chordIdentity({ key: 'n', shift: true, alt: false })
    )
  })

  it('renders win and darwin modifier chords', () => {
    expect(displayShortcut({ key: 'n', shift: true, alt: false }, 'win')).toBe('Ctrl+Shift+N')
    expect(displayShortcut({ key: 'n', shift: true, alt: false }, 'darwin')).toBe('⌘⇧N')
    expect(displayShortcut({ key: 'Enter', shift: false, alt: false }, 'win')).toBe('Ctrl+Enter')
    expect(displayShortcut({ key: 'Enter', shift: false, alt: false }, 'darwin')).toBe('⌘↩')
    expect(
      displayShortcutLabel('account-slot', { key: '1', shift: false, alt: false }, 'win')
    ).toBe('Ctrl+1…9')
    expect(displayShortcutLabel('tab-new', { key: 't', shift: false, alt: false }, 'win')).toBe(
      'Ctrl+T'
    )
  })
})

describe('catalog scopes', () => {
  it('partitions every catalog command into exactly one scope', () => {
    const loop = new Set<string>(LOOP_COMMANDS)
    const chrome = new Set<string>(CHROME_COMMANDS)
    expect(loop.size + chrome.size).toBe(Object.keys(SHORTCUT_DEFAULTS).length)
    for (const command of loop) {
      expect(chrome.has(command)).toBe(false)
    }
  })
})

describe('cloneShortcutMap', () => {
  it('does not share chord object identity with the source map', () => {
    const cloned = cloneShortcutMap(SHORTCUT_DEFAULTS)
    cloned['tab-new'].key = 'z'
    expect(SHORTCUT_DEFAULTS['tab-new'].key).toBe('t')
  })
})

describe('chordFromCapture', () => {
  it('requires a platform mod and a real key, then canonicalizes slot digits', () => {
    expect(
      chordFromCapture('tab-new', { key: 'q', shift: true, alt: false, control: false, meta: false })
    ).toBeNull()
    expect(
      chordFromCapture('tab-new', {
        key: 'Control',
        shift: false,
        alt: false,
        control: true,
        meta: false
      })
    ).toBeNull()
    expect(
      chordFromCapture('tab-new', { key: 'q', shift: true, alt: false, control: true, meta: false })
    ).toEqual({ key: 'q', shift: true, alt: false })
    expect(
      chordFromCapture('account-slot', {
        key: '7',
        shift: true,
        alt: false,
        control: true,
        meta: false
      })
    ).toEqual({ key: '1', shift: true, alt: false })
  })
})

describe('chordsEqual', () => {
  it('treats case-folded keys as the same chord', () => {
    expect(chordsEqual({ key: 'N', shift: true, alt: false }, { key: 'n', shift: true, alt: false })).toBe(
      true
    )
    expect(chordsEqual({ key: 'n', shift: true, alt: false }, { key: 'n', shift: false, alt: false })).toBe(
      false
    )
  })
})
