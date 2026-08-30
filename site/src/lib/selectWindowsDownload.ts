export type ProbeResult =
  | { kind: 'asset'; href: string; name: string }
  | { kind: 'fallback'; href: string }

export function selectWindowsDownload(
  input: { ok: boolean; status: number; json: unknown },
  fallbackHref: string
): ProbeResult {
  if (!input.ok) {
    return { kind: 'fallback', href: fallbackHref }
  }

  const assets = releaseAssets(input.json)
  if (!assets) {
    return { kind: 'fallback', href: fallbackHref }
  }

  for (const asset of assets) {
    const selected = selectAllowlistedExe(asset)
    if (selected) {
      return selected
    }
  }

  return { kind: 'fallback', href: fallbackHref }
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

function selectAllowlistedExe(asset: unknown): Extract<ProbeResult, { kind: 'asset' }> | null {
  if (!isRecord(asset)) {
    return null
  }

  const { name, browser_download_url: href } = asset

  if (typeof name !== 'string' || !name.toLowerCase().endsWith('.exe')) {
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
