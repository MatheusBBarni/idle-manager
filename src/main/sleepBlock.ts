import { powerSaveBlocker } from 'electron'
import type { WorkspaceSnapshot } from '@shared/types'
import { hasRunningAccount } from '@shared/workspace'

let blockerId: number | null = null

export function stopSleepBlock(): void {
  if (blockerId == null) {
    return
  }
  powerSaveBlocker.stop(blockerId)
  blockerId = null
}

export function syncSleepBlock(snapshot: WorkspaceSnapshot): void {
  if (!hasRunningAccount(snapshot)) {
    stopSleepBlock()
    return
  }
  if (blockerId != null && powerSaveBlocker.isStarted(blockerId)) {
    return
  }
  if (blockerId != null) {
    powerSaveBlocker.stop(blockerId)
    blockerId = null
  }
  const id = powerSaveBlocker.start('prevent-app-suspension')
  if (!powerSaveBlocker.isStarted(id)) {
    console.error('sleep block start failed')
    blockerId = null
    return
  }
  blockerId = id
}
