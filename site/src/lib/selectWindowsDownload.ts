import type { ClientTarget } from './detectClientTarget'

export type ProbeResult =
  | { kind: 'asset'; href: string; name: string }
  | { kind: 'fallback'; href: string }

export function selectWindowsDownload(
  input: { ok: boolean; status: number; json: unknown },
  fallbackHref: string
): ProbeResult {
  return selectPlatformDownload(input, fallbackHref, { platform: 'windows', arch: 'x64' })
}

export function selectPlatformDownload(
  input: { ok: boolean; status: number; json: unknown },
  fallbackHref: string,
  target: ClientTarget
): ProbeResult {
  if (!input.ok || target.platform === 'other') {
    return { kind: 'fallback', href: fallbackHref }
  }

  const assets = releaseAssets(input.json)
  if (!assets) {
    return { kind: 'fallback', href: fallbackHref }
  }

  const preferred = preferredMatchers(target)
  for (const matches of preferred) {
    for (const asset of assets) {
      const selected = selectAllowlistedAsset(asset, matches)
      if (selected) {
        return selected
      }
    }
  }

  return { kind: 'fallback', href: fallbackHref }
}

function preferredMatchers(target: ClientTarget): ((name: string) => boolean)[] {
  switch (target.platform) {
    case 'windows':
      return [(name) => name.endsWith('.exe')]
    case 'linux':
      return [(name) => name.endsWith('.appimage')]
    case 'macos':
      if (target.arch === 'x64') {
        return [(name) => name.endsWith('.dmg') && name.includes('mac-x64')]
      }
      if (target.arch === 'arm64') {
        return [(name) => name.endsWith('.dmg') && name.includes('arm64')]
      }
      return [
        (name) => name.endsWith('.dmg') && name.includes('arm64'),
        (name) => name.endsWith('.dmg') && name.includes('mac-x64')
      ]
    default:
      return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function releaseAssets(json: unknown): unknown[] | null {
  if (!isRecord(json) || !Array.isArray(json.assets)) {
    return null
  }

  return json.assets
}

function selectAllowlistedAsset(
  asset: unknown,
  matches: (name: string) => boolean
): Extract<ProbeResult, { kind: 'asset' }> | null {
  if (!isRecord(asset)) {
    return null
  }

  const { name, browser_download_url: href } = asset

  if (typeof name !== 'string' || !matches(name.toLowerCase())) {
    return null
  }

  if (typeof href !== 'string' || !isAllowlistedHttpsHref(href)) {
    return null
  }

  return { kind: 'asset', href, name }
}

function isAllowlistedHttpsHref(href: string): boolean {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') {
    return false
  }

  const host = url.hostname.toLowerCase()
  return (
    host === 'github.com' ||
    host === 'githubusercontent.com' ||
    host.endsWith('.githubusercontent.com')
  )
}
