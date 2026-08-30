import { detectClientTarget, type ClientPlatform } from './detectClientTarget'
import { selectPlatformDownload } from './selectWindowsDownload'
import { FALLBACK_DOWNLOAD_HREF, RELEASES_LATEST_API } from './urls'

export type DownloadCopy = {
  actions: Record<ClientPlatform, string>
  warnings: Record<ClientPlatform, string>
}

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

async function readArchitecture(): Promise<string | undefined> {
  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>
      }
    }
  ).userAgentData
  if (!uaData?.getHighEntropyValues) {
    return undefined
  }
  try {
    const { architecture } = await uaData.getHighEntropyValues(['architecture'])
    return architecture
  } catch {
    return undefined
  }
}

export async function probeDownloads(
  links: HTMLAnchorElement[],
  warnings: HTMLElement[],
  copy: DownloadCopy
): Promise<void> {
  const target = detectClientTarget({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    architecture: await readArchitecture()
  })
  const result = selectPlatformDownload(await readLatestRelease(), FALLBACK_DOWNLOAD_HREF, target)
  const label = copy.actions[target.platform]
  const warning = copy.warnings[target.platform]

  for (const link of links) {
    link.href = result.href
    link.textContent = label
  }

  for (const node of warnings) {
    node.textContent = warning
    node.hidden = warning.length === 0
  }
}
