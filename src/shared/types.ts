export type LayoutMode = 'grid' | 'single' | 'columns' | 'rows' | 'free'
export type AccountStatus = 'running' | 'closed'
export const LOCALES = ['pt', 'en', 'es', 'zh-Hans'] as const
export type Locale = (typeof LOCALES)[number]
export type ThemeName = 'dark' | 'light'

const LOCALE_SET = new Set<string>(LOCALES)

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALE_SET.has(value)
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type FractionRect = {
  x: number
  y: number
  w: number
  h: number
}

export type WindowBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type Account = {
  id: string
  tabId: string
  name: string
  color: string
  url: string
  homeUrl: string
  status: AccountStatus
  muted: boolean
  zoomFactor: number
  lastActivityAt: number | null
  poppedOut: boolean
  freeBounds: FractionRect | null
}

export type GameTab = {
  id: string
  name: string
  baseUrl: string
  layout: LayoutMode
  accountOrder: string[]
  activeAccountId: string | null
  archived: boolean
}

export type WorkspaceSnapshot = {
  version: 1
  tabs: GameTab[]
  accounts: Record<string, Account>
  activeTabId: string | null
  locale: Locale
  theme: ThemeName
  windowBounds: WindowBounds | null
  launchAtStartup: boolean
}

export type AccountMetrics = {
  cpu: number
  memoryBytes: number
  lastActivityAt: number | null
}

export type AggregateMetrics = {
  cpu: number
  memoryBytes: number
  fps: number
  uptimeMs: number
}

export type MetricsPayload = {
  at: number
  perAccount: Record<string, AccountMetrics>
  aggregate: AggregateMetrics
}

export type NavigationState = {
  accountId: string
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
}

export type PanelGeometry = {
  accountId: string
  frame: Rect
  marquee: Rect
  contents: Rect
}

export type StageReport = {
  stage: Rect
  overlayOpen: boolean
  chromeEditable: boolean
  panels: PanelGeometry[]
}

export const ACCOUNT_COLORS = [
  '#FF6B35',
  '#E6B84D',
  '#3DDC97',
  '#5B8CFF',
  '#C45CFF',
  '#FF5B8C',
  '#2EC4B6',
  '#F4A261'
] as const

export const MARQUEE_HEIGHT = 30
export const PANEL_GAP = 8
export const STAGE_PAD = 8
