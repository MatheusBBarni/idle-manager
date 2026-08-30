import type { WorkspaceAction } from './workspace'

export type AccountLoopCommand = 'account-create' | 'account-prev' | 'account-next' | 'account-start'

export type AccountLoopKeyInput = {
  type: 'keyDown' | 'keyUp'
  key: string
  code: string
  control: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  isAutoRepeat: boolean
}

function hasMod(input: AccountLoopKeyInput): boolean {
  return input.meta || input.control
}

export function matchAccountLoopChord(input: AccountLoopKeyInput): AccountLoopCommand | null {
  if (input.type !== 'keyDown' || input.isAutoRepeat || input.alt || !hasMod(input)) {
    return null
  }

  if (input.shift && (input.key === 'n' || input.key === 'N')) {
    return 'account-create'
  }
  // Shift+[ / Shift+] report `{` / `}` on common layouts; keep `[` / `]` for layouts that preserve them.
  if (input.shift && (input.key === '[' || input.key === '{')) {
    return 'account-prev'
  }
  if (input.shift && (input.key === ']' || input.key === '}')) {
    return 'account-next'
  }
  if (!input.shift && input.key === 'Enter') {
    return 'account-start'
  }
  return null
}

export function nextAccountId(
  accountOrder: string[],
  activeId: string | null,
  delta: -1 | 1
): string | null {
  if (accountOrder.length === 0) {
    return null
  }
  const index = activeId ? accountOrder.indexOf(activeId) : -1
  const from = index === -1 ? 0 : index
  const next = (from + delta + accountOrder.length) % accountOrder.length
  return accountOrder[next] ?? null
}

export function keyboardCreateActions(tabId: string, id: string): WorkspaceAction[] {
  return [
    { type: 'account/create', tabId, id },
    { type: 'account/activate', id }
  ]
}
