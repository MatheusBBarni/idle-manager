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
  switch (event.type) {
    case 'error':
    case 'not-available':
    case 'reset':
      return { phase: 'idle' }
    case 'later':
      if (current.phase === 'ready') {
        return { phase: 'later', version: current.version }
      }
      return current
    case 'downloaded':
      if (current.phase === 'later' && current.version === event.version) {
        return current
      }
      return { phase: 'ready', version: event.version }
    case 'checking':
    case 'available':
    case 'progress':
      if (current.phase === 'idle' || current.phase === 'getting') {
        return { phase: 'getting' }
      }
      return current
  }
}
