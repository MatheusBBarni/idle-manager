import type { WebContents } from 'electron'
import {
  keyboardCreateActions,
  matchAccountLoopChord,
  nextAccountId,
  type AccountLoopCommand,
  type AccountLoopKeyInput
} from '@shared/accountLoop'
import { newId } from '@shared/ids'
import type { WorkspaceSnapshot } from '@shared/types'
import { activeAccount, tabById, type WorkspaceAction } from '@shared/workspace'

const CHROME_EDITABLE_PROBE = `(() => {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return Boolean(el.isContentEditable)
})()`

type AccountLoopHost = {
  commit: (action: WorkspaceAction) => void
  getSnapshot: () => WorkspaceSnapshot
  overlayOpen: () => boolean
}

type LoopSource = 'chrome' | 'game'

let host: AccountLoopHost | null = null
const chromeEditable = new WeakMap<WebContents, boolean>()

export function bindAccountLoop(next: AccountLoopHost): void {
  host = next
}

function mapInput(input: Electron.Input): AccountLoopKeyInput | null {
  if (input.type !== 'keyDown' && input.type !== 'keyUp') {
    return null
  }
  return {
    type: input.type,
    key: input.key,
    code: input.code,
    control: input.control,
    meta: input.meta,
    shift: input.shift,
    alt: input.alt,
    isAutoRepeat: input.isAutoRepeat
  }
}

function refreshChromeEditable(contents: WebContents): void {
  if (contents.isDestroyed()) {
    return
  }
  void contents
    .executeJavaScript(CHROME_EDITABLE_PROBE, false)
    .then((value: unknown) => {
      chromeEditable.set(contents, value === true)
    })
    .catch(() => undefined)
}

function actionsForCommand(command: AccountLoopCommand, snapshot: WorkspaceSnapshot): WorkspaceAction[] {
  const tab = tabById(snapshot, snapshot.activeTabId)
  if (command === 'account-create') {
    if (!tab || tab.archived) {
      return []
    }
    return keyboardCreateActions(tab.id, newId())
  }
  if (command === 'account-prev' || command === 'account-next') {
    if (!tab || tab.archived) {
      return []
    }
    const id = nextAccountId(tab.accountOrder, tab.activeAccountId, command === 'account-next' ? 1 : -1)
    if (!id) {
      return []
    }
    return [{ type: 'account/activate', id }]
  }
  const account = activeAccount(snapshot)
  if (!account) {
    return []
  }
  return [{ type: 'account/setStatus', id: account.id, status: 'running' }]
}

export function attachAccountLoop(contents: WebContents, source: LoopSource): void {
  if (source === 'chrome') {
    refreshChromeEditable(contents)
    contents.on('dom-ready', () => refreshChromeEditable(contents))
    contents.on('before-mouse-event', () => refreshChromeEditable(contents))
  }

  contents.on('before-input-event', (event, input) => {
    const mapped = mapInput(input)
    if (!mapped) {
      return
    }
    const command = matchAccountLoopChord(mapped)
    if (source === 'chrome') {
      refreshChromeEditable(contents)
    }
    if (!command || !host) {
      return
    }
    if (host.overlayOpen()) {
      return
    }
    if (source === 'chrome' && chromeEditable.get(contents)) {
      return
    }
    const actions = actionsForCommand(command, host.getSnapshot())
    if (actions.length === 0) {
      return
    }
    event.preventDefault()
    for (const action of actions) {
      host.commit(action)
    }
  })
}
