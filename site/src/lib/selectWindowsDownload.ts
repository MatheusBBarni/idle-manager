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

function releaseAssets(json: unknown): unknown[] | null {
  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    return null
  }

  const assets = (json as { assets?: unknown }).assets
  return Array.isArray(assets) ? assets : null
}

function selectAllowlistedExe(asset: unknown): Extract<ProbeResult, { kind: 'asset' }> | null {
  if (asset === null || typeof asset !== 'object') {
    return null
  }

  const { name, browser_download_url: href } = asset as {
    name?: unknown
    browser_download_url?: unknown
  }

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
