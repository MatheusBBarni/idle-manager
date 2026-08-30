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
  launchAtStartup: 'Start with the system',
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
  emptyTitle: 'Open a floor',
  emptyBody: 'Create a tab for a game URL, then start isolated accounts inside it.',
  emptyCta: 'Create tab',
  noRunning: 'No live panels',
  noRunningBody: 'Start an account to load its isolated session here.',
  poppedOut: 'Popped out',
  statusReady: 'Ready',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  uptime: 'Up',
  version: 'v',
  help: 'Help',
  search: 'Search',
  confirmDeleteAccount: 'Delete this account and wipe its isolated store? Login cookies for this account only will be removed.',
  confirmClearSession: 'Clear cookies, cache and site storage for this account? The panel stays, but the site will see a logged-out session.',
  confirmDeleteTab: 'Remove this tab from the bar? Account sessions stay on disk unless you also wipe them.',
  archived: 'Closed tabs',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: 'Names may repeat. Isolation uses the hidden account id.',
  collapseSidebar: 'Collapse sidebar',
  expandSidebar: 'Expand sidebar',
  recentlyClosed: 'Recently closed'
} as const

const pt: Record<keyof typeof en, string> = {
  appName: 'Idle manager',
  newTab: 'Nova aba',
  closeTab: 'Fechar aba',
  reopenTab: 'Reabrir aba',
  renameTab: 'Renomear aba',
  deleteTab: 'Excluir aba',
  deleteTabWipe: 'Excluir aba e limpar contas',
  addAccount: 'Adicionar conta',
  startAccount: 'Iniciar',
  stopAccount: 'Fechar painel',
  startAll: 'Iniciar todas',
  renameAccount: 'Renomear',
  recolor: 'Cor',
  deleteAccount: 'Excluir conta',
  clearSession: 'Limpar sessão',
  popOut: 'Destacar',
  popIn: 'Voltar à janela',
  mute: 'Silenciar',
  unmute: 'Som',
  reload: 'Recarregar',
  reloadAll: 'Recarregar todas',
  back: 'Voltar',
  forward: 'Avançar',
  home: 'Início',
  zoomIn: 'Aumentar zoom',
  zoomOut: 'Diminuir zoom',
  zoomReset: 'Zoom padrão',
  layout: 'Layout',
  layoutGrid: 'Grade automática',
  layoutSingle: 'Único',
  layoutColumns: 'Colunas',
  layoutRows: 'Linhas',
  layoutFree: 'Livre',
  settings: 'Ajustes',
  language: 'Idioma',
  theme: 'Tema',
  themeDark: 'Escuro',
  themeLight: 'Claro',
  launchAtStartup: 'Abrir com o sistema',
  importWorkspace: 'Importar espaço',
  exportWorkspace: 'Exportar espaço',
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
  emptyTitle: 'Abra um piso',
  emptyBody: 'Crie uma aba com a URL do jogo e inicie contas isoladas nela.',
  emptyCta: 'Criar aba',
  noRunning: 'Nenhum painel ativo',
  noRunningBody: 'Inicie uma conta para carregar a sessão isolada aqui.',
  poppedOut: 'Em outra janela',
  statusReady: 'Pronto',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  uptime: 'Ativo',
  version: 'v',
  help: 'Ajuda',
  search: 'Buscar',
  confirmDeleteAccount: 'Excluir esta conta e apagar o armazenamento isolado? Só os cookies desta conta serão removidos.',
  confirmClearSession: 'Limpar cookies, cache e storage desta conta? O painel permanece, mas o site verá uma sessão deslogada.',
  confirmDeleteTab: 'Remover esta aba da barra? As sessões das contas ficam no disco, a menos que você também as apague.',
  archived: 'Abas fechadas',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: 'Nomes podem repetir. O isolamento usa o id interno da conta.',
  collapseSidebar: 'Recolher painel',
  expandSidebar: 'Expandir painel',
  recentlyClosed: 'Fechadas recentemente'
}

const dictionaries = { en, pt }

export type MessageKey = keyof typeof en

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
