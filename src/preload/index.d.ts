import type { OpsourceAPI } from '@shared/ipc'

declare global {
  interface Window {
    opsource: OpsourceAPI
  }
}

export {}
