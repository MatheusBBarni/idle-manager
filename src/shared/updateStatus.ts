export type UpdateStatus =
  | { phase: 'idle' }
  | { phase: 'getting' }
  | { phase: 'ready'; version: string }
  | { phase: 'later'; version: string }

/** Main no-ops unless status is `ready`. Enforced in the updater process, not here. */
export type UpdateCommand = 'apply' | 'later'

export type UpdateEvent =
  | { type: 'checking' }
  | { type: 'available'; version: string }
  | { type: 'not-available' }
  | { type: 'progress' }
  | { type: 'downloaded'; version: string }
  | { type: 'error' }
  | { type: 'later' }
  | { type: 'reset' }

export function reduceUpdateStatus(current: UpdateStatus, event: UpdateEvent): UpdateStatus {
  if (event.type === 'error' || event.type === 'not-available' || event.type === 'reset') {
    return { phase: 'idle' }
  }

  if (event.type === 'later') {
    if (current.phase === 'ready') {
      return { phase: 'later', version: current.version }
    }
    return current
  }

  if (event.type === 'downloaded') {
    if (current.phase === 'later' && current.version === event.version) {
      return current
    }
    return { phase: 'ready', version: event.version }
  }

  if (current.phase === 'idle' || current.phase === 'getting') {
    return { phase: 'getting' }
  }

  return current
}
