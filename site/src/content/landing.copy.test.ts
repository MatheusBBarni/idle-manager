import { describe, expect, it } from 'vitest'
import { landing } from './landing'
import { TWITTER_HREF } from '../lib/urls'

describe('landing isolation claims', () => {
  it('keeps the English first-screen isolation-vs-bot copy', () => {
    const firstScreen = [landing.en.kicker, landing.en.headline, landing.en.subhead, landing.en.claim].join(
      ' '
    )

    expect(firstScreen).toContain('Idle manager is a local multi-account shell')
    expect(firstScreen).toContain(
      'does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar'
    )
    expect(landing.en.downloadAction).toBe('Download for Windows')
  })

  it('keeps the Portuguese first-screen isolation-vs-bot copy', () => {
    const firstScreen = [landing.pt.kicker, landing.pt.headline, landing.pt.subhead, landing.pt.claim].join(
      ' '
    )

    expect(firstScreen).toContain('Idle manager é um shell local de várias contas')
    expect(firstScreen).toContain(
      'Não automatiza o jogo, não injeta cheats, não falsifica fingerprints, não usa proxies e não compartilha um único cookie jar'
    )
    expect(landing.pt.downloadAction).toBe('Baixar para Windows')
  })

  it('does not invent a bot, proxy, or anti-detect promise', () => {
    const blob = JSON.stringify(landing).toLowerCase()

    expect(blob).not.toContain('auto-battle tool that')
    expect(blob).not.toContain('spoof your fingerprint')
    expect(blob).not.toContain('undetectable')
    expect(landing.en.notBotItems).toEqual([
      'Not a bot or macro tool',
      'Not a cheat injector',
      'Not a fingerprint spoof',
      'Not a proxy or anti-detect browser',
      'Not a shared cookie-jar swapper'
    ])
  })

  it('points both locales at the Idle manager X account', () => {
    expect(landing.en.twitterLink).toBe('Follow on X')
    expect(landing.pt.twitterLink).toBe('Siga no X')
    expect(TWITTER_HREF).toBe('https://x.com/idlemanagerapp')
  })
})
