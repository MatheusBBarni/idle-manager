export type ShortcutCommand =
  | 'tab-new'
  | 'tab-reopen'
  | 'sidebar-toggle'
  | 'url-focus'
  | 'account-reload'
  | 'tab-reload'
  | 'account-mute'
  | 'account-zoom-in'
  | 'account-zoom-out'
  | 'account-zoom-reset'
  | 'tab-next'
  | 'account-slot'
  | 'account-create'
  | 'account-prev'
  | 'account-next'
  | 'account-start'

export type ShortcutScope = 'loop' | 'chrome'

export type ShortcutChord = { key: string; shift: boolean; alt: boolean }

export type ShortcutMap = Record<ShortcutCommand, ShortcutChord>

export type ShortcutKeyInput = {
  type: string
  key: string
  control: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  isAutoRepeat: boolean
}

export const SHORTCUT_COMMANDS = [
  'tab-new',
  'tab-reopen',
  'sidebar-toggle',
  'url-focus',
  'account-reload',
  'tab-reload',
  'account-mute',
  'account-zoom-in',
  'account-zoom-out',
  'account-zoom-reset',
  'tab-next',
  'account-slot',
  'account-create',
  'account-prev',
  'account-next',
  'account-start'
] as const satisfies readonly ShortcutCommand[]

export const LOOP_COMMANDS = [
  'account-create',
  'account-prev',
  'account-next',
  'account-start'
] as const satisfies readonly ShortcutCommand[]

export const CHROME_COMMANDS = [
  'tab-new',
  'tab-reopen',
  'sidebar-toggle',
  'url-focus',
  'account-reload',
  'tab-reload',
  'account-mute',
  'account-zoom-in',
  'account-zoom-out',
  'account-zoom-reset',
  'tab-next',
  'account-slot'
] as const satisfies readonly ShortcutCommand[]

const COMMAND_SET = new Set<string>(SHORTCUT_COMMANDS)
const LOOP_SET = new Set<string>(LOOP_COMMANDS)

export const SHORTCUT_DEFAULTS: ShortcutMap = {
  'tab-new': { key: 't', shift: false, alt: false },
  'tab-reopen': { key: 't', shift: true, alt: false },
  'sidebar-toggle': { key: 'b', shift: false, alt: false },
  'url-focus': { key: 'l', shift: false, alt: false },
  'account-reload': { key: 'r', shift: false, alt: false },
  'tab-reload': { key: 'r', shift: true, alt: false },
  'account-mute': { key: 'm', shift: false, alt: false },
  'account-zoom-in': { key: '=', shift: false, alt: false },
  'account-zoom-out': { key: '-', shift: false, alt: false },
  'account-zoom-reset': { key: '0', shift: false, alt: false },
  'tab-next': { key: 'Tab', shift: false, alt: false },
  'account-slot': { key: '1', shift: false, alt: false },
  'account-create': { key: 'n', shift: true, alt: false },
  'account-prev': { key: '[', shift: true, alt: false },
  'account-next': { key: ']', shift: true, alt: false },
  'account-start': { key: 'Enter', shift: false, alt: false }
}

export function isShortcutCommand(value: unknown): value is ShortcutCommand {
  return typeof value === 'string' && COMMAND_SET.has(value)
}

export function cloneShortcutMap(map: ShortcutMap): ShortcutMap {
  return Object.fromEntries(
    SHORTCUT_COMMANDS.map((command) => [command, { ...map[command] }])
  ) as ShortcutMap
}

export function chordIdentity(chord: ShortcutChord): string {
  return `${chord.alt ? '1' : '0'}|${chord.shift ? '1' : '0'}|${chord.key.toLowerCase()}`
}

export function parseShortcutChord(value: unknown): ShortcutChord | null {
  if (!isRecord(value)) {
    return null
  }
  if (typeof value.key !== 'string' || value.key.trim() === '') {
    return null
  }
  if (typeof value.shift !== 'boolean' || typeof value.alt !== 'boolean') {
    return null
  }
  return { key: value.key, shift: value.shift, alt: value.alt }
}

export function canonicalizeShortcutChord(
  command: ShortcutCommand,
  chord: ShortcutChord
): ShortcutChord | null {
  if (command === 'account-slot') {
    if (!isSlotDigit(chord.key)) {
      return null
    }
    return { key: '1', shift: chord.shift, alt: chord.alt }
  }
  return { key: chord.key, shift: chord.shift, alt: chord.alt }
}

export function shortcutConflict(
  map: Partial<ShortcutMap>,
  command: ShortcutCommand,
  chord: ShortcutChord
): ShortcutCommand | null {
  const wanted = occupyingIdentities(command, chord)
  for (const other of SHORTCUT_COMMANDS) {
    if (other === command) {
      continue
    }
    const otherChord = map[other]
    if (!otherChord) {
      continue
    }
    for (const id of occupyingIdentities(other, otherChord)) {
      if (wanted.has(id)) {
        return other
      }
    }
  }
  return null
}

export function normalizeShortcutMap(raw: unknown): ShortcutMap {
  const accepted: Partial<ShortcutMap> = {}
  if (!isRecord(raw)) {
    return cloneShortcutMap(SHORTCUT_DEFAULTS)
  }
  for (const command of SHORTCUT_COMMANDS) {
    const parsed = parseShortcutChord(raw[command])
    const canonical = parsed ? canonicalizeShortcutChord(command, parsed) : null
    if (canonical && !shortcutConflict(accepted, command, canonical)) {
      accepted[command] = canonical
    } else {
      accepted[command] = { ...SHORTCUT_DEFAULTS[command] }
    }
  }
  return accepted as ShortcutMap
}

export function matchShortcut(
  input: ShortcutKeyInput,
  map: ShortcutMap,
  scope: ShortcutScope
): ShortcutCommand | null {
  if (input.type !== 'keyDown' || input.isAutoRepeat || !(input.meta || input.control)) {
    return null
  }
  const commands = scope === 'loop' ? LOOP_COMMANDS : CHROME_COMMANDS
  for (const command of commands) {
    if (matchesChord(input, map[command], command, 'exact')) {
      return command
    }
  }
  if (scope === 'chrome' && matchesChord(input, map['tab-next'], 'tab-next', 'invert-shift')) {
    return 'tab-next'
  }
  return null
}

export function displayShortcut(chord: ShortcutChord, platform: 'darwin' | 'win'): string {
  const key = displayKey(chord.key, platform)
  if (platform === 'darwin') {
    return `⌘${chord.shift ? '⇧' : ''}${chord.alt ? '⌥' : ''}${key}`
  }
  const parts = ['Ctrl']
  if (chord.shift) {
    parts.push('Shift')
  }
  if (chord.alt) {
    parts.push('Alt')
  }
  parts.push(key)
  return parts.join('+')
}

export function commandScope(command: ShortcutCommand): ShortcutScope {
  return LOOP_SET.has(command) ? 'loop' : 'chrome'
}

function occupyingIdentities(command: ShortcutCommand, chord: ShortcutChord): Set<string> {
  if (command === 'account-slot') {
    return new Set(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
        (digit) => `${chord.alt ? '1' : '0'}|${chord.shift ? '1' : '0'}|${digit}`
      )
    )
  }
  return new Set([chordIdentity(chord)])
}

function matchesChord(
  input: ShortcutKeyInput,
  stored: ShortcutChord,
  command: ShortcutCommand,
  shiftMode: 'exact' | 'invert-shift'
): boolean {
  if (input.alt !== stored.alt) {
    return false
  }
  if (shiftMode === 'invert-shift') {
    return input.shift !== stored.shift && keysMatch(input.key, stored.key, command)
  }
  if (input.shift !== stored.shift) {
    return false
  }
  if (command === 'account-slot') {
    return isSlotDigit(input.key)
  }
  return keysMatch(input.key, stored.key, command)
}

function keysMatch(inputKey: string, storedKey: string, command: ShortcutCommand): boolean {
  if (inputKey.toLowerCase() === storedKey.toLowerCase()) {
    return true
  }
  if (command === 'account-zoom-in' && storedKey === '=' && inputKey === '+') {
    return true
  }
  if (storedKey === '[' && (inputKey === '[' || inputKey === '{')) {
    return true
  }
  if (storedKey === ']' && (inputKey === ']' || inputKey === '}')) {
    return true
  }
  return false
}

function isSlotDigit(key: string): boolean {
  return key.length === 1 && key >= '1' && key <= '9'
}

function displayKey(key: string, platform: 'darwin' | 'win'): string {
  if (key === 'Enter') {
    return platform === 'darwin' ? '↩' : 'Enter'
  }
  if (key.length === 1) {
    return key.toUpperCase()
  }
  return key
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
