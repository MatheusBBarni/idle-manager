import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const APP_NAME = 'Idle manager'

if (process.platform !== 'darwin') {
  process.exit(0)
}

const require = createRequire(import.meta.url)
let electronExecutable
try {
  electronExecutable = require('electron')
} catch {
  process.exit(0)
}

const appRoot = String(electronExecutable).replace(/\/Contents\/MacOS\/Electron$/, '')
const plist = join(appRoot, 'Contents/Info.plist')
if (!existsSync(plist)) {
  process.exit(0)
}

const buddy = '/usr/libexec/PlistBuddy'
const set = (key) => {
  const value = `"${APP_NAME}"`
  try {
    execFileSync(buddy, ['-c', `Set :${key} ${value}`, plist])
  } catch {
    execFileSync(buddy, ['-c', `Add :${key} string ${value}`, plist])
  }
}

set('CFBundleName')
set('CFBundleDisplayName')
