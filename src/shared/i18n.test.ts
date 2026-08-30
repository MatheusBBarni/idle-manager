import { describe, expect, it } from 'vitest'
import { MESSAGE_KEYS, t, type MessageKey } from './i18n'

const shared = new Set<MessageKey>([
  'appName',
  'cpu',
  'ram',
  'fps',
  'version',
  'online',
  'layout',
  'urlPlaceholder',
  'localePt',
  'localeEn'
])

describe('i18n', () => {
  it('uses natural empty-state copy instead of the floor/piso calque', () => {
    expect(t('en', 'emptyTitle')).toBe('Add a game')
    expect(t('pt', 'emptyTitle')).toBe('Adicione um jogo')
    expect(t('en', 'emptyTitle')).not.toMatch(/floor/i)
    expect(t('pt', 'emptyTitle')).not.toMatch(/piso/i)
  })

  it('keeps Portuguese free of leftover English UI words', () => {
    expect(t('pt', 'confirmClearSession')).not.toMatch(/storage/i)
    expect(t('pt', 'unmute')).toBe('Ativar som')
    expect(t('pt', 'settings')).toBe('Configurações')
    expect(t('pt', 'importWorkspace')).toBe('Importar espaço de trabalho')
    expect(t('pt', 'exportWorkspace')).toBe('Exportar espaço de trabalho')
    expect(t('pt', 'collapseSidebar')).toBe('Recolher barra lateral')
    expect(t('pt', 'expandSidebar')).toBe('Expandir barra lateral')
  })

  it('translates every key that is not a shared brand or unit label', () => {
    for (const key of MESSAGE_KEYS) {
      expect(t('en', key).length).toBeGreaterThan(0)
      expect(t('pt', key).length).toBeGreaterThan(0)
      if (shared.has(key)) {
        continue
      }
      expect(t('pt', key), key).not.toBe(t('en', key))
    }
  })
})
