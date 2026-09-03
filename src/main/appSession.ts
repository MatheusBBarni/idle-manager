import { app } from 'electron'

let quitting = false

export function isQuitting(): boolean {
  return quitting
}

export function beginQuit(): void {
  quitting = true
  app.quit()
}
