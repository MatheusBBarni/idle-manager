import { selectWindowsDownload } from './selectWindowsDownload'

export const FALLBACK_DOWNLOAD_HREF =
  'https://github.com/MatheusBBarni/idle-manager/releases/latest'

export const RELEASES_LATEST_API =
  'https://api.github.com/repos/MatheusBBarni/idle-manager/releases/latest'

export async function probeWindowsDownload(link: HTMLAnchorElement): Promise<void> {
  let ok = false
  let status = 0
  let json: unknown = null

  try {
    const response = await fetch(RELEASES_LATEST_API, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    status = response.status
    ok = response.ok
    try {
      json = await response.json()
    } catch {
      json = null
    }
  } catch {
    ok = false
    status = 0
    json = null
  }

  const result = selectWindowsDownload({ ok, status, json }, FALLBACK_DOWNLOAD_HREF)
  link.href = result.href
}
