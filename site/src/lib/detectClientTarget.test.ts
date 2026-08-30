import { describe, expect, it } from 'vitest'
import { detectClientTarget } from './detectClientTarget'

describe('detectClientTarget', () => {
  it('detects Windows', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32'
      })
    ).toEqual({ platform: 'windows', arch: 'x64' })
  })

  it('detects macOS Apple Silicon from UA-CH architecture', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        architecture: 'arm'
      })
    ).toEqual({ platform: 'macos', arch: 'arm64' })
  })

  it('detects Intel Mac from UA-CH architecture', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        architecture: 'x86'
      })
    ).toEqual({ platform: 'macos', arch: 'x64' })
  })

  it('leaves Mac arch unknown when Intel in the UA is not trustworthy', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        platform: 'MacIntel'
      })
    ).toEqual({ platform: 'macos', arch: 'unknown' })
  })

  it('detects Linux', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        platform: 'Linux x86_64'
      })
    ).toEqual({ platform: 'linux', arch: 'x64' })
  })

  it('treats iPhone as other', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone'
      })
    ).toEqual({ platform: 'other', arch: 'unknown' })
  })

  it('treats Android as other', () => {
    expect(
      detectClientTarget({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
        platform: 'Linux armv8l'
      })
    ).toEqual({ platform: 'other', arch: 'unknown' })
  })
})
