import type { WebContents } from 'electron'
import { keyboardCreateActions, nextAccountId, type AccountLoopCommand } from '@shared/accountLoop'
import { newId } from '@shared/ids'
import { matchShortcut } from '@shared/shortcuts'
import type { WorkspaceSnapshot } from '@shared/types'
import { activeAccount, tabById, type WorkspaceAction } from '@shared/workspace'

type AccountLoopHost = {
  commitAll: (actions: WorkspaceAction[]) => void
  getSnapshot: () => WorkspaceSnapshot
  overlayOpen: () => boolean
  chromeEditable: () => boolean
}

type LoopSource = 'chrome' | 'game'

let host: AccountLoopHost | null = null

export function bindAccountLoop(next: AccountLoopHost): void {
  host = next
}

function liveTab(snapshot: WorkspaceSnapshot) {
  const tab = tabById(snapshot, snapshot.activeTabId)
  if (!tab || tab.archived) {
    return null
  }
  return tab
}

function actionsForCommand(command: AccountLoopCommand, snapshot: WorkspaceSnapshot): WorkspaceAction[] {
  if (command === 'account-start') {
    const account = activeAccount(snapshot)
    if (!account) {
      return []
    }
    return [{ type: 'account/setStatus', id: account.id, status: 'running' }]
  }

  const tab = liveTab(snapshot)
  if (!tab) {
    return []
  }
  if (command === 'account-create') {
    return keyboardCreateActions(tab.id, newId())
  }
  const id = nextAccountId(tab.accountOrder, tab.activeAccountId, command === 'account-next' ? 1 : -1)
  if (!id) {
    return []
  }
  return [{ type: 'account/activate', id }]
}

export function attachAccountLoop(contents: WebContents, source: LoopSource): void {
  contents.on('before-input-event', (event, input) => {
    if (!host || host.overlayOpen()) {
      return
    }
    if (source === 'chrome' && host.chromeEditable()) {
      return
    }
    const snapshot = host.getSnapshot()
    const command = matchShortcut(
      {
        type: input.type,
        key: input.key,
        control: input.control,
        meta: input.meta,
        shift: input.shift,
        alt: input.alt,
        isAutoRepeat: input.isAutoRepeat
      },
      snapshot.shortcuts,
      'loop'
    )
    if (
      command !== 'account-create' &&
      command !== 'account-prev' &&
      command !== 'account-next' &&
      command !== 'account-start'
    ) {
      return
    }
    const actions = actionsForCommand(command, snapshot)
    if (actions.length === 0) {
      return
    }
    event.preventDefault()
    host.commitAll(actions)
  })
}
