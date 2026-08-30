export type ClientPlatform = 'windows' | 'macos' | 'linux' | 'other'
export type ClientArch = 'arm64' | 'x64' | 'unknown'

export type ClientTarget = {
  platform: ClientPlatform
  arch: ClientArch
}

export function detectClientTarget(input: {
  userAgent: string
  platform?: string
  architecture?: string
}): ClientTarget {
  const ua = input.userAgent
  const platform = input.platform ?? ''

  if (/iphone|ipad|ipod|android|mobile/i.test(ua) && !/windows/i.test(ua)) {
    return { platform: 'other', arch: 'unknown' }
  }

  if (/windows/i.test(ua) || /win32|win64/i.test(platform)) {
    return { platform: 'windows', arch: 'x64' }
  }

  if (/mac os x|macintosh/i.test(ua) || /mac/i.test(platform)) {
    return { platform: 'macos', arch: readArch(input.architecture, ua) }
  }

  if (/linux/i.test(ua) || /linux/i.test(platform)) {
    return { platform: 'linux', arch: readArch(input.architecture, ua) }
  }

  return { platform: 'other', arch: 'unknown' }
}

function readArch(architecture: string | undefined, userAgent: string): ClientArch {
  const hint = (architecture ?? '').toLowerCase()
  if (hint === 'arm' || hint === 'arm64' || hint === 'aarch64') {
    return 'arm64'
  }
  if (hint === 'x86' || hint === 'x64' || hint === 'x86_64') {
    return 'x64'
  }
  if (/arm64|aarch64/i.test(userAgent)) {
    return 'arm64'
  }
  if (/x86_64|amd64/i.test(userAgent) && !/macintosh/i.test(userAgent)) {
    return 'x64'
  }
  return 'unknown'
}
