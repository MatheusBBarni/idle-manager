import { describe, expect, it } from 'vitest'
import { selectPlatformDownload } from './selectWindowsDownload'
import { FALLBACK_DOWNLOAD_HREF } from './urls'

const fallbackHref = FALLBACK_DOWNLOAD_HREF

const v010Assets = {
  ok: true,
  status: 200,
  json: {
    assets: [
      {
        name: 'idle-manager-0.1.0-linux-x86_64.AppImage',
        browser_download_url:
          'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-linux-x86_64.AppImage'
      },
      {
        name: 'idle-manager-0.1.0-mac-arm64.dmg',
        browser_download_url:
          'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-mac-arm64.dmg'
      },
      {
        name: 'idle-manager-0.1.0-mac-x64.dmg',
        browser_download_url:
          'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-mac-x64.dmg'
      },
      {
        name: 'idle-manager-0.1.0-win-x64.exe',
        browser_download_url:
          'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-win-x64.exe'
      }
    ]
  }
} as const

describe('selectPlatformDownload', () => {
  it('picks the Windows exe', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'windows', arch: 'x64' })).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-win-x64.exe',
      name: 'idle-manager-0.1.0-win-x64.exe'
    })
  })

  it('picks the macOS arm64 dmg', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'macos', arch: 'arm64' })).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-mac-arm64.dmg',
      name: 'idle-manager-0.1.0-mac-arm64.dmg'
    })
  })

  it('picks the macOS Intel dmg', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'macos', arch: 'x64' })).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-mac-x64.dmg',
      name: 'idle-manager-0.1.0-mac-x64.dmg'
    })
  })

  it('prefers Apple Silicon when Mac arch is unknown', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'macos', arch: 'unknown' })).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-mac-arm64.dmg',
      name: 'idle-manager-0.1.0-mac-arm64.dmg'
    })
  })

  it('picks the Linux AppImage', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'linux', arch: 'x64' })).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/idle-manager-0.1.0-linux-x86_64.AppImage',
      name: 'idle-manager-0.1.0-linux-x86_64.AppImage'
    })
  })

  it('falls back for phones and tablets', () => {
    expect(selectPlatformDownload(v010Assets, fallbackHref, { platform: 'other', arch: 'unknown' })).toEqual({
      kind: 'fallback',
      href: fallbackHref
    })
  })
})
