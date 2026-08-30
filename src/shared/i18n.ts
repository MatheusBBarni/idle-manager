import type { Locale } from './types'

const en = {
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
  importWorkspace: 'Import workspace',
  exportWorkspace: 'Export workspace',
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
  runningCount: 'running',
  localePt: 'Português',
  localeEn: 'English',
  urlBar: 'Address',
  shortcuts: 'Keyboard shortcuts',
  shortcutCreate: 'Create account',
  shortcutPrev: 'Previous account',
  shortcutNext: 'Next account',
  shortcutStart: 'Start targeted account'
} as const

const pt: Record<keyof typeof en, string> = {
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
  importWorkspace: 'Importar espaço de trabalho',
  exportWorkspace: 'Exportar espaço de trabalho',
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
  runningCount: 'em execução',
  localePt: 'Português',
  localeEn: 'English',
  urlBar: 'Endereço',
  shortcuts: 'Atalhos de teclado',
  shortcutCreate: 'Criar conta',
  shortcutPrev: 'Conta anterior',
  shortcutNext: 'Próxima conta',
  shortcutStart: 'Iniciar a conta em foco'
}

const dictionaries = { en, pt }

export type MessageKey = keyof typeof en
export const MESSAGE_KEYS = Object.keys(en) as MessageKey[]

export function t(locale: Locale, key: MessageKey): string {
  return dictionaries[locale][key]
}

export function formatAge(from: number | null, now: number): string {
  if (!from) {
    return '-'
  }
  const seconds = Math.max(0, Math.round((now - from) / 1000))
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) {
    return `${mb >= 100 ? mb.toFixed(0) : mb.toFixed(0)} MB`
  }
  return `${(mb / 1024).toFixed(1)} GB`
}

export function formatCpu(cpu: number): string {
  return `${Math.max(0, cpu).toFixed(1)}%`
}

export function formatUptime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${seconds}s`
}
