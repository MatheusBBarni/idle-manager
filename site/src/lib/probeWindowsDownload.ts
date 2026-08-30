import { selectWindowsDownload } from './selectWindowsDownload'
import { FALLBACK_DOWNLOAD_HREF, RELEASES_LATEST_API } from './urls'

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function readLatestRelease(): Promise<{ ok: boolean; status: number; json: unknown }> {
  try {
    const response = await fetch(RELEASES_LATEST_API, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    return {
      ok: response.ok,
      status: response.status,
      json: await readJson(response)
    }
  } catch {
    return { ok: false, status: 0, json: null }
  }
}

export async function probeWindowsDownload(link: HTMLAnchorElement): Promise<void> {
  const result = selectWindowsDownload(await readLatestRelease(), FALLBACK_DOWNLOAD_HREF)
  link.href = result.href
}
