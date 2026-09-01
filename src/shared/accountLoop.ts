import {
  LOOP_COMMANDS,
  SHORTCUT_DEFAULTS,
  displayShortcut,
  type ShortcutCommand
} from './shortcuts'
import type { WorkspaceAction } from './workspace'

export type AccountLoopCommand = Extract<
  ShortcutCommand,
  'account-create' | 'account-prev' | 'account-next' | 'account-start'
>

export const ACCOUNT_LOOP_SHORTCUTS = LOOP_COMMANDS.map((command) => ({
  command,
  mac: displayShortcut(SHORTCUT_DEFAULTS[command], 'darwin'),
  win: displayShortcut(SHORTCUT_DEFAULTS[command], 'win')
}))

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
