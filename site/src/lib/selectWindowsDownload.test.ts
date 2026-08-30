import { describe, expect, it } from 'vitest'
import { selectWindowsDownload } from './selectWindowsDownload'
import { FALLBACK_DOWNLOAD_HREF } from './urls'

const fallbackHref = FALLBACK_DOWNLOAD_HREF

describe('selectWindowsDownload', () => {
  it('falls back when the probe is a 404', () => {
    expect(
      selectWindowsDownload({ ok: false, status: 404, json: { message: 'Not Found' } }, fallbackHref)
    ).toEqual({ kind: 'fallback', href: fallbackHref })
  })

  it('falls back when ok and assets are empty', () => {
    expect(
      selectWindowsDownload({ ok: true, status: 200, json: { assets: [] } }, fallbackHref)
    ).toEqual({ kind: 'fallback', href: fallbackHref })
  })

  it('falls back when the probe is rate limited (429)', () => {
    expect(
      selectWindowsDownload({ ok: false, status: 429, json: { message: 'API rate limit exceeded' } }, fallbackHref)
    ).toEqual({ kind: 'fallback', href: fallbackHref })
  })

  it('picks the first allowlisted .exe when two are present', () => {
    expect(
      selectWindowsDownload(
        {
          ok: true,
          status: 200,
          json: {
            assets: [
              {
                name: 'Idle-manager-Setup-0.1.0.exe',
                browser_download_url:
                  'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/Idle-manager-Setup-0.1.0.exe'
              },
              {
                name: 'Idle-manager-Setup-0.1.0-ia32.exe',
                browser_download_url:
                  'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/Idle-manager-Setup-0.1.0-ia32.exe'
              }
            ]
          }
        },
        fallbackHref
      )
    ).toEqual({
      kind: 'asset',
      href: 'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/Idle-manager-Setup-0.1.0.exe',
      name: 'Idle-manager-Setup-0.1.0.exe'
    })
  })

  it('skips a .dmg-only release and falls back', () => {
    expect(
      selectWindowsDownload(
        {
          ok: true,
          status: 200,
          json: {
            assets: [
              {
                name: 'Idle-manager-0.1.0.dmg',
                browser_download_url:
                  'https://github.com/MatheusBBarni/idle-manager/releases/download/v0.1.0/Idle-manager-0.1.0.dmg'
              }
            ]
          }
        },
        fallbackHref
      )
    ).toEqual({ kind: 'fallback', href: fallbackHref })
  })

  it('skips a rejected .exe and picks the next allowlisted .exe', () => {
    expect(
      selectWindowsDownload(
        {
          ok: true,
          status: 200,
          json: {
            assets: [
              {
                name: 'payload.exe',
                browser_download_url: 'javascript:alert(1)'
              },
              {
                name: 'Idle-manager-Setup.exe',
                browser_download_url:
                  'https://objects.githubusercontent.com/github-production-release-asset-2e65be/Idle-manager-Setup.exe'
              }
            ]
          }
        },
        fallbackHref
      )
    ).toEqual({
      kind: 'asset',
      href: 'https://objects.githubusercontent.com/github-production-release-asset-2e65be/Idle-manager-Setup.exe',
      name: 'Idle-manager-Setup.exe'
    })
  })

  it('rejects a .exe whose browser_download_url is javascript:', () => {
    expect(
      selectWindowsDownload(
        {
          ok: true,
          status: 200,
          json: {
            assets: [
              {
                name: 'Idle-manager-Setup.exe',
                browser_download_url: 'javascript:alert(1)'
              }
            ]
          }
        },
        fallbackHref
      )
    ).toEqual({ kind: 'fallback', href: fallbackHref })
  })
})
