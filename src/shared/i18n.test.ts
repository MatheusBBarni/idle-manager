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
    expect(t('pt', 'shortcuts')).toBe('Atalhos de teclado')
    expect(t('pt', 'shortcutCreate')).toBe('Criar conta')
    expect(t('pt', 'shortcutPrev')).toBe('Conta anterior')
    expect(t('pt', 'shortcutNext')).toBe('Próxima conta')
    expect(t('pt', 'shortcutStart')).toBe('Iniciar a conta em foco')
    expect(t('pt', 'shortcutCreate')).not.toMatch(/create/i)
    expect(t('pt', 'shortcutPrev')).not.toMatch(/previous/i)
    expect(t('pt', 'shortcutNext')).not.toMatch(/next/i)
    expect(t('pt', 'shortcutStart')).not.toMatch(/start/i)
  })

  it('keeps game-list labels distinct from workspace strings in EN and PT', () => {
    for (const locale of ['en', 'pt'] as const) {
      expect(t(locale, 'exportGameList').length).toBeGreaterThan(0)
      expect(t(locale, 'importGameList').length).toBeGreaterThan(0)
      expect(t(locale, 'exportGameList')).not.toBe(t(locale, 'exportWorkspace'))
      expect(t(locale, 'importGameList')).not.toBe(t(locale, 'importWorkspace'))
    }
    expect(t('pt', 'exportGameList')).not.toBe(t('en', 'exportGameList'))
    expect(t('pt', 'importGameList')).not.toBe(t('en', 'importGameList'))
    expect(t('pt', 'exportGameList')).not.toMatch(/export game list/i)
    expect(t('pt', 'importGameList')).not.toMatch(/import game list/i)
  })

  it('has getting, apply, and later copy in both locales', () => {
    for (const key of ['updateGetting', 'updateApply', 'updateLater'] as const) {
      expect(t('en', key).length).toBeGreaterThan(0)
      expect(t('pt', key).length).toBeGreaterThan(0)
      expect(t('pt', key)).not.toBe(t('en', key))
    }
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
