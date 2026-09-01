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
  localeEs: 'Español',
  urlBar: 'Address',
  shortcuts: 'Keyboard shortcuts',
  shortcutCreate: 'Create account',
  shortcutPrev: 'Previous account',
  shortcutNext: 'Next account',
  shortcutStart: 'Start targeted account',
  updateGetting: 'Getting update',
  updateApply: 'Apply',
  updateLater: 'Later'
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
  localeEs: 'Español',
  urlBar: 'Endereço',
  shortcuts: 'Atalhos de teclado',
  shortcutCreate: 'Criar conta',
  shortcutPrev: 'Conta anterior',
  shortcutNext: 'Próxima conta',
  shortcutStart: 'Iniciar a conta em foco',
  updateGetting: 'Baixando atualização',
  updateApply: 'Aplicar',
  updateLater: 'Depois'
}

const es: Record<keyof typeof en, string> = {
  appName: 'Idle manager',
  newTab: 'Nueva pestaña',
  closeTab: 'Cerrar pestaña',
  reopenTab: 'Reabrir pestaña',
  renameTab: 'Renombrar pestaña',
  deleteTab: 'Eliminar pestaña',
  deleteTabWipe: 'Eliminar pestaña y borrar cuentas',
  addAccount: 'Añadir cuenta',
  startAccount: 'Iniciar',
  stopAccount: 'Cerrar panel',
  startAll: 'Iniciar todas',
  renameAccount: 'Renombrar',
  recolor: 'Color de cuenta',
  deleteAccount: 'Eliminar cuenta',
  clearSession: 'Borrar sesión',
  popOut: 'Abrir en otra ventana',
  popIn: 'Volver a la ventana',
  mute: 'Silenciar',
  unmute: 'Activar sonido',
  reload: 'Recargar',
  reloadAll: 'Recargar todas',
  back: 'Atrás',
  forward: 'Adelante',
  home: 'Inicio',
  zoomIn: 'Acercar',
  zoomOut: 'Alejar',
  zoomReset: 'Restablecer zoom',
  layout: 'Layout',
  layoutGrid: 'Cuadrícula automática',
  layoutSingle: 'Panel único',
  layoutColumns: 'Columnas',
  layoutRows: 'Filas',
  layoutFree: 'Libre',
  settings: 'Ajustes',
  language: 'Idioma',
  theme: 'Tema',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  launchAtStartup: 'Iniciar con el sistema',
  importWorkspace: 'Importar espacio de trabajo',
  exportWorkspace: 'Exportar espacio de trabajo',
  importGameList: 'Importar lista de juegos',
  exportGameList: 'Exportar lista de juegos',
  createTabTitle: 'Nueva pestaña de juego',
  createTabName: 'Nombre de la pestaña',
  createTabUrl: 'URL base',
  createAccountTitle: 'Nueva cuenta',
  createAccountName: 'Nombre para mostrar',
  cancel: 'Cancelar',
  create: 'Crear',
  save: 'Guardar',
  confirm: 'Confirmar',
  online: 'Online',
  closed: 'Cerrada',
  emptyTitle: 'Añade un juego',
  emptyBody: 'Crea una pestaña con la URL del juego y luego inicia cuentas aisladas en ella.',
  emptyCta: 'Crear pestaña',
  noRunning: 'Ningún panel en ejecución',
  noRunningBody: 'Inicia una cuenta para cargar su sesión aislada aquí.',
  poppedOut: 'En otra ventana',
  statusReady: 'Listo',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  uptime: 'Tiempo',
  version: 'v',
  help: 'Ayuda',
  search: 'Buscar',
  confirmDeleteAccount:
    '¿Eliminar esta cuenta y borrar su sesión aislada? Solo se quitarán las cookies de inicio de sesión y los datos del sitio de esta cuenta.',
  confirmClearSession:
    '¿Borrar cookies, caché y datos del sitio de esta cuenta? El panel permanece, pero el sitio verá una sesión cerrada.',
  confirmDeleteTab:
    '¿Quitar esta pestaña de la barra? Las sesiones de las cuentas permanecen en el disco a menos que también las borres.',
  archived: 'Pestañas cerradas',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: 'Los nombres pueden repetirse. El aislamiento usa el ID interno de la cuenta.',
  collapseSidebar: 'Contraer barra lateral',
  expandSidebar: 'Expandir barra lateral',
  recentlyClosed: 'Cerradas recientemente',
  minimize: 'Minimizar',
  maximize: 'Maximizar',
  closeWindow: 'Cerrar',
  runningCount: 'en ejecución',
  localePt: 'Português',
  localeEn: 'English',
  localeEs: 'Español',
  urlBar: 'Dirección',
  shortcuts: 'Atajos de teclado',
  shortcutCreate: 'Crear cuenta',
  shortcutPrev: 'Cuenta anterior',
  shortcutNext: 'Cuenta siguiente',
  shortcutStart: 'Iniciar la cuenta en foco',
  updateGetting: 'Obteniendo actualización',
  updateApply: 'Aplicar',
  updateLater: 'Después'
}

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, pt, es }

export type MessageKey = keyof typeof en
export const MESSAGE_KEYS = Object.keys(en) as MessageKey[]

export function t(locale: Locale, key: MessageKey): string {
  return dictionaries[locale][key]
}

export function chromeHtmlLang(locale: Locale): string {
  if (locale === 'pt') {
    return 'pt-BR'
  }
  if (locale === 'es') {
    return 'es'
  }
  return 'en'
}

export function chromeAriaLocale(locale: Locale): string {
  if (locale === 'pt') {
    return 'pt-BR'
  }
  if (locale === 'es') {
    return 'es'
  }
  return 'en-US'
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
