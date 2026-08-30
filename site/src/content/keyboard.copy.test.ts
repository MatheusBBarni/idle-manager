import { describe, expect, it } from 'vitest'
import { keyboard } from './keyboard'
import { landing } from './landing'

const accelerators = ['Shift+N', '[', ']', 'Enter'] as const

describe('keyboard docs copy', () => {
  it('lists the four frozen accelerators in English and Portuguese', () => {
    for (const locale of ['en', 'pt'] as const) {
      const blob = JSON.stringify(keyboard[locale])
      for (const piece of accelerators) {
        expect(blob, `${locale} missing ${piece}`).toContain(piece)
      }
      expect(keyboard[locale].binds).toHaveLength(4)
    }
  })

  it('does not put the create-account chord table on the marketing landing', () => {
    const blob = JSON.stringify(landing)
    expect(blob).not.toContain('Shift+N')
    expect(blob).not.toContain('⌘⇧N')
    expect(blob).not.toContain('Ctrl+Enter')
  })
})
