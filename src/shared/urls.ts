const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/

export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    return ''
  }
  if (HAS_SCHEME.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function hostnameOf(url: string): string {
  try {
    return new URL(normalizeUrl(url) || 'https://invalid.local').hostname
  } catch {
    return ''
  }
}

export function displayHost(url: string): string {
  return hostnameOf(url).replace(/^www\./, '')
}

export function isValidHttpUrl(input: string): boolean {
  const value = normalizeUrl(input)
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
