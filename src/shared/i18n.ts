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
  localeZhHans: '简体中文',
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
  localeZhHans: '简体中文',
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
  localeZhHans: '简体中文',
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

const zhHans: Record<keyof typeof en, string> = {
  appName: 'Idle manager',
  newTab: '新建标签页',
  closeTab: '关闭标签页',
  reopenTab: '重新打开标签页',
  renameTab: '重命名标签页',
  deleteTab: '删除标签页',
  deleteTabWipe: '删除标签页并清除账号',
  addAccount: '添加账号',
  startAccount: '启动',
  stopAccount: '关闭面板',
  startAll: '全部启动',
  renameAccount: '重命名',
  recolor: '账号颜色',
  deleteAccount: '删除账号',
  clearSession: '清除会话',
  popOut: '弹出到新窗口',
  popIn: '返回主窗口',
  mute: '静音',
  unmute: '取消静音',
  reload: '重新加载',
  reloadAll: '全部重新加载',
  back: '后退',
  forward: '前进',
  home: '主页',
  zoomIn: '放大',
  zoomOut: '缩小',
  zoomReset: '重置缩放',
  layout: 'Layout',
  layoutGrid: '自动网格',
  layoutSingle: '单面板',
  layoutColumns: '分列',
  layoutRows: '分行',
  layoutFree: '自由排列',
  settings: '设置',
  language: '语言',
  theme: '主题',
  themeDark: '深色',
  themeLight: '浅色',
  launchAtStartup: '开机启动',
  importWorkspace: '导入工作区',
  exportWorkspace: '导出工作区',
  importGameList: '导入游戏列表',
  exportGameList: '导出游戏列表',
  createTabTitle: '新建游戏标签页',
  createTabName: '标签页名称',
  createTabUrl: '基础网址',
  createAccountTitle: '新建账号',
  createAccountName: '显示名称',
  cancel: '取消',
  create: '创建',
  save: '保存',
  confirm: '确认',
  online: 'Online',
  closed: '已关闭',
  emptyTitle: '添加游戏',
  emptyBody: '用游戏网址创建标签页，然后在其中启动隔离账号。',
  emptyCta: '创建标签页',
  noRunning: '没有运行中的面板',
  noRunningBody: '启动一个账号，在此加载其隔离会话。',
  poppedOut: '在其他窗口中',
  statusReady: '就绪',
  cpu: 'CPU',
  ram: 'RAM',
  fps: 'FPS',
  uptime: '运行时间',
  version: 'v',
  help: '帮助',
  search: '搜索',
  confirmDeleteAccount:
    '删除此账号并清除其隔离会话？只会移除此账号的登录 Cookie 和网站数据。',
  confirmClearSession:
    '清除此账号的 Cookie、缓存和网站数据？面板会保留，但网站会视为已退出登录。',
  confirmDeleteTab:
    '从栏中移除此标签页？账号会话仍保留在磁盘上，除非你也将其清除。',
  archived: '已关闭的标签页',
  urlPlaceholder: 'https://gengar.com.br/',
  duplicateNamesHint: '名称可以重复。隔离使用隐藏的账号 ID。',
  collapseSidebar: '折叠侧边栏',
  expandSidebar: '展开侧边栏',
  recentlyClosed: '最近关闭',
  minimize: '最小化',
  maximize: '最大化',
  closeWindow: '关闭',
  runningCount: '运行中',
  localePt: 'Português',
  localeEn: 'English',
  localeEs: 'Español',
  localeZhHans: '简体中文',
  urlBar: '地址',
  shortcuts: '键盘快捷键',
  shortcutCreate: '创建账号',
  shortcutPrev: '上一个账号',
  shortcutNext: '下一个账号',
  shortcutStart: '启动当前账号',
  updateGetting: '正在获取更新',
  updateApply: '应用',
  updateLater: '稍后'
}

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, pt, es, 'zh-Hans': zhHans }

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
  if (locale === 'zh-Hans') {
    return 'zh-Hans'
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
  if (locale === 'zh-Hans') {
    return 'zh-Hans'
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
