import { describe, expect, it } from 'vitest'
import { chromeAriaLocale, chromeHtmlLang, MESSAGE_KEYS, t, type MessageKey } from './i18n'
import { LOCALES } from './types'

const shared = new Set<MessageKey>([
  'appName',
  'cpu',
  'ram',
  'fps',
  'gpu',
  'version',
  'online',
  'layout',
  'urlPlaceholder',
  'localePt',
  'localeEn',
  'localeEs',
  'localeZhHans'
])

const frozenEn: Record<Exclude<MessageKey, 'localeEs' | 'localeZhHans'>, string> = {
  appName: 'Idle manager',
  newTab: 'New tab',
  closeTab: 'Close tab',
  reopenTab: 'Reopen tab',
  renameTab: 'Rename tab',
  deleteTab: 'Delete tab',
  deleteTabWipe: 'Delete tab and wipe accounts',
  addAccount: 'Add account',
  startAccount: 'Start',
  stopAccount: 'Close panel',
  startAll: 'Start all',
  stopTab: 'Stop this tab',
  renameAccount: 'Rename',
  recolor: 'Color',
  deleteAccount: 'Delete account',
  clearSession: 'Clear session',
  popOut: 'Pop out',
  popIn: 'Return to window',
  mute: 'Mute',
  unmute: 'Unmute',
  reload: 'Reload',
  reloadAll: 'Reload all',
  back: 'Back',
  forward: 'Forward',
  home: 'Home',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomReset: 'Reset zoom',
  layout: 'Layout',
  layoutGrid: 'Auto grid',
  layoutSingle: 'Single',
  layoutColumns: 'Columns',
  layoutRows: 'Rows',
  layoutFree: 'Free',
  settings: 'Settings',
  language: 'Language',
  theme: 'Theme',
  themeDark: 'Dark',
  themeLight: 'Light',
  launchAtStartup: 'Launch at startup',
  blockSleepWhileRunning: 'Block OS sleep while running',
  importWorkspace: 'Import workspace',
  exportWorkspace: 'Export workspace',
  importGameList: 'Import game list',
  exportGameList: 'Export game list',
  createTabTitle: 'New game tab',
  createTabName: 'Tab name',
  createTabUrl: 'Base URL',
  createAccountTitle: 'New account',
  createAccountName: 'Display name',
  cancel: 'Cancel',
  create: 'Create',
  save: 'Save',
  confirm: 'Confirm',
  online: 'Online',
  closed: 'Closed',
  emptyTitle: 'Add a game',
  emptyBody: 'Create a tab with the game URL, then start isolated accounts inside it.',
  emptyCta: 'Create tab',
  noRunning: 'No running panels',
  noRunningBody: 'Start an account to load its isolated session here.',
  poppedOut: 'In another window',
  statusReady: 'Ready',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  gpu: 'GPU',
  uptime: 'Uptime',
  version: 'v',
  help: 'Help',
  search: 'Search',
  confirmDeleteAccount:
    "Delete this account and wipe its isolated session? Only this account's login cookies and site data will be removed.",
  confirmClearSession:
    'Clear cookies, cache, and site data for this account? The panel stays, but the site will see a logged-out session.',
  confirmDeleteTab: 'Remove this tab from the bar? Account sessions stay on disk unless you wipe them too.',
  archived: 'Closed tabs',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: 'Names can repeat. Isolation uses the hidden account ID.',
  collapseSidebar: 'Collapse sidebar',
  expandSidebar: 'Expand sidebar',
  recentlyClosed: 'Recently closed',
  minimize: 'Minimize',
  maximize: 'Maximize',
  closeWindow: 'Close',
  quit: 'Quit',
  trayRestore: 'Restore',
  runningCount: 'running',
  runningStartWarning: '7+ running may stress this PC',
  sleepBlocked: 'Sleep blocked',
  localePt: 'Português',
  localeEn: 'English',
  urlBar: 'Address',
  shortcuts: 'Keyboard shortcuts',
  settingsGeneral: 'General',
  shortcutCreate: 'Create account',
  shortcutPrev: 'Previous account',
  shortcutNext: 'Next account',
  shortcutStart: 'Start targeted account',
  shortcutSidebar: 'Toggle sidebar',
  shortcutTabNext: 'Next tab',
  shortcutAccountSlot: 'Account slots 1–9',
  shortcutScopeLoop: 'Works in a game panel',
  shortcutScopeChrome: 'Chrome only',
  shortcutReset: 'Reset',
  shortcutPressChord: 'Press a modifier shortcut',
  shortcutTaken: 'That shortcut is already assigned',
  updateGetting: 'Getting update',
  updateApply: 'Apply',
  updateLater: 'Later'
}

const frozenPt: Record<Exclude<MessageKey, 'localeEs' | 'localeZhHans'>, string> = {
  appName: 'Idle manager',
  newTab: 'Nova aba',
  closeTab: 'Fechar aba',
  reopenTab: 'Reabrir aba',
  renameTab: 'Renomear aba',
  deleteTab: 'Excluir aba',
  deleteTabWipe: 'Excluir aba e apagar contas',
  addAccount: 'Adicionar conta',
  startAccount: 'Iniciar',
  stopAccount: 'Fechar painel',
  startAll: 'Iniciar todas',
  stopTab: 'Parar esta aba',
  renameAccount: 'Renomear',
  recolor: 'Cor',
  deleteAccount: 'Excluir conta',
  clearSession: 'Limpar sessão',
  popOut: 'Abrir em janela',
  popIn: 'Voltar à janela',
  mute: 'Silenciar',
  unmute: 'Ativar som',
  reload: 'Recarregar',
  reloadAll: 'Recarregar todas',
  back: 'Voltar',
  forward: 'Avançar',
  home: 'Início',
  zoomIn: 'Ampliar',
  zoomOut: 'Reduzir',
  zoomReset: 'Redefinir zoom',
  layout: 'Layout',
  layoutGrid: 'Grade automática',
  layoutSingle: 'Painel único',
  layoutColumns: 'Colunas',
  layoutRows: 'Linhas',
  layoutFree: 'Livre',
  settings: 'Configurações',
  language: 'Idioma',
  theme: 'Tema',
  themeDark: 'Escuro',
  themeLight: 'Claro',
  launchAtStartup: 'Iniciar com o sistema',
  blockSleepWhileRunning: 'Bloquear suspensão com contas em execução',
  importWorkspace: 'Importar espaço de trabalho',
  exportWorkspace: 'Exportar espaço de trabalho',
  importGameList: 'Importar lista de jogos',
  exportGameList: 'Exportar lista de jogos',
  createTabTitle: 'Nova aba de jogo',
  createTabName: 'Nome da aba',
  createTabUrl: 'URL base',
  createAccountTitle: 'Nova conta',
  createAccountName: 'Nome de exibição',
  cancel: 'Cancelar',
  create: 'Criar',
  save: 'Salvar',
  confirm: 'Confirmar',
  online: 'Online',
  closed: 'Fechada',
  emptyTitle: 'Adicione um jogo',
  emptyBody: 'Crie uma aba com a URL do jogo e inicie contas isoladas nela.',
  emptyCta: 'Criar aba',
  noRunning: 'Nenhum painel em execução',
  noRunningBody: 'Inicie uma conta para carregar a sessão isolada aqui.',
  poppedOut: 'Em outra janela',
  statusReady: 'Pronto',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  gpu: 'GPU',
  uptime: 'Tempo',
  version: 'v',
  help: 'Ajuda',
  search: 'Buscar',
  confirmDeleteAccount:
    'Excluir esta conta e apagar a sessão isolada? Só os cookies e os dados do site desta conta serão removidos.',
  confirmClearSession:
    'Limpar cookies, cache e dados do site desta conta? O painel permanece, mas o site vai tratar como se você tivesse saído.',
  confirmDeleteTab:
    'Remover esta aba da barra? As sessões das contas permanecem no disco, a menos que você também as apague.',
  archived: 'Abas fechadas',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: 'Os nomes podem se repetir. O isolamento usa o ID interno da conta.',
  collapseSidebar: 'Recolher barra lateral',
  expandSidebar: 'Expandir barra lateral',
  recentlyClosed: 'Fechadas recentemente',
  minimize: 'Minimizar',
  maximize: 'Maximizar',
  closeWindow: 'Fechar',
  quit: 'Sair',
  trayRestore: 'Restaurar',
  runningCount: 'em execução',
  runningStartWarning: '7+ em execução podem sobrecarregar este PC',
  sleepBlocked: 'Suspensão bloqueada',
  localePt: 'Português',
  localeEn: 'English',
  urlBar: 'Endereço',
  shortcuts: 'Atalhos de teclado',
  settingsGeneral: 'Geral',
  shortcutCreate: 'Criar conta',
  shortcutPrev: 'Conta anterior',
  shortcutNext: 'Próxima conta',
  shortcutStart: 'Iniciar a conta em foco',
  shortcutSidebar: 'Alternar barra lateral',
  shortcutTabNext: 'Próxima aba',
  shortcutAccountSlot: 'Contas 1–9',
  shortcutScopeLoop: 'Funciona no painel do jogo',
  shortcutScopeChrome: 'Só na interface',
  shortcutReset: 'Redefinir',
  shortcutPressChord: 'Pressione um atalho com modificador',
  shortcutTaken: 'Esse atalho já está em uso',
  updateGetting: 'Baixando atualização',
  updateApply: 'Aplicar',
  updateLater: 'Depois'
}

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

  it('uses Sleep blocked in English and distinct copy in the other locales', () => {
    expect(t('en', 'sleepBlocked')).toBe('Sleep blocked')
    for (const locale of ['pt', 'es', 'zh-Hans'] as const) {
      expect(t(locale, 'sleepBlocked').length).toBeGreaterThan(0)
      expect(t(locale, 'sleepBlocked')).not.toBe(t('en', 'sleepBlocked'))
    }
  })

  it('has quit and trayRestore in every locale', () => {
    expect(t('en', 'quit')).toBe('Quit')
    expect(t('en', 'trayRestore')).toBe('Restore')
    for (const locale of ['pt', 'es', 'zh-Hans'] as const) {
      expect(t(locale, 'quit').length).toBeGreaterThan(0)
      expect(t(locale, 'quit')).not.toBe(t('en', 'quit'))
      expect(t(locale, 'trayRestore').length).toBeGreaterThan(0)
      expect(t(locale, 'trayRestore')).not.toBe(t('en', 'trayRestore'))
    }
  })

  it('uses Block OS sleep while running in English and distinct copy in the other locales', () => {
    expect(t('en', 'blockSleepWhileRunning')).toBe('Block OS sleep while running')
    for (const locale of ['pt', 'es', 'zh-Hans'] as const) {
      expect(t(locale, 'blockSleepWhileRunning').length).toBeGreaterThan(0)
      expect(t(locale, 'blockSleepWhileRunning')).not.toBe(t('en', 'blockSleepWhileRunning'))
    }
  })

  it('has getting, apply, and later copy in both locales', () => {
    for (const key of ['updateGetting', 'updateApply', 'updateLater'] as const) {
      expect(t('en', key).length).toBeGreaterThan(0)
      expect(t('pt', key).length).toBeGreaterThan(0)
      expect(t('pt', key)).not.toBe(t('en', key))
    }
  })

  it('has a complete dictionary for every locale; non-shared keys differ from English', () => {
    for (const locale of LOCALES) {
      for (const key of MESSAGE_KEYS) {
        expect(t(locale, key).length).toBeGreaterThan(0)
        if (locale === 'en' || shared.has(key)) {
          continue
        }
        expect(t(locale, key), `${locale}:${key}`).not.toBe(t('en', key))
      }
    }
  })

  it('uses distinct confirm copy in every locale', () => {
    for (const key of ['confirmDeleteAccount', 'confirmClearSession', 'confirmDeleteTab'] as const) {
      const values = LOCALES.map((locale) => t(locale, key))
      expect(new Set(values).size, key).toBe(LOCALES.length)
    }
  })

  it('self-names Español and 简体中文 in every dictionary', () => {
    for (const locale of LOCALES) {
      expect(t(locale, 'localeEs')).toBe('Español')
      expect(t(locale, 'localeZhHans')).toBe('简体中文')
    }
  })

  it('keeps existing Portuguese and English strings except localeEs', () => {
    for (const key of Object.keys(frozenEn) as Array<keyof typeof frozenEn>) {
      expect(t('en', key), key).toBe(frozenEn[key])
      expect(t('pt', key), key).toBe(frozenPt[key])
    }
  })

  it('translates Shortcuts tab copy in every locale without leftover English', () => {
    const keys = [
      'settingsGeneral',
      'shortcutScopeLoop',
      'shortcutScopeChrome',
      'shortcutReset',
      'shortcutPressChord',
      'shortcutTaken',
      'shortcutSidebar',
      'shortcutTabNext',
      'shortcutAccountSlot'
    ] as const
    for (const locale of LOCALES) {
      for (const key of keys) {
        expect(t(locale, key).length).toBeGreaterThan(0)
        if (locale === 'en') {
          continue
        }
        expect(t(locale, key), `${locale}:${key}`).not.toBe(t('en', key))
      }
    }
    expect(t('pt', 'settingsGeneral')).not.toMatch(/general/i)
    expect(t('pt', 'shortcutReset')).not.toMatch(/reset/i)
    expect(t('es', 'shortcutTaken')).not.toMatch(/already assigned/i)
    expect(t('zh-Hans', 'shortcutPressChord')).not.toMatch(/press a modifier/i)
  })

  it('maps chrome html lang and aria locale for pt, en, es, and zh-Hans', () => {
    expect(chromeHtmlLang('pt')).toBe('pt-BR')
    expect(chromeHtmlLang('en')).toBe('en')
    expect(chromeHtmlLang('es')).toBe('es')
    expect(chromeHtmlLang('zh-Hans')).toBe('zh-Hans')
    expect(chromeAriaLocale('pt')).toBe('pt-BR')
    expect(chromeAriaLocale('en')).toBe('en-US')
    expect(chromeAriaLocale('es')).toBe('es')
    expect(chromeAriaLocale('zh-Hans')).toBe('zh-Hans')
  })
})
