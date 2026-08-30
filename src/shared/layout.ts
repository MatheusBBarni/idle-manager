import {
  MARQUEE_HEIGHT,
  PANEL_GAP,
  STAGE_PAD,
  type Account,
  type FractionRect,
  type GameTab,
  type LayoutMode,
  type PanelGeometry,
  type Rect
} from './types'

function roundRect(rect: Rect): Rect {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.max(0, Math.round(rect.width)),
    height: Math.max(0, Math.round(rect.height))
  }
}

function inset(rect: Rect, pad: number): Rect {
  return {
    x: rect.x + pad,
    y: rect.y + pad,
    width: Math.max(0, rect.width - pad * 2),
    height: Math.max(0, rect.height - pad * 2)
  }
}

function splitMarquee(frame: Rect): { marquee: Rect; contents: Rect } {
  const height = Math.min(MARQUEE_HEIGHT, frame.height)
  return {
    marquee: { x: frame.x, y: frame.y, width: frame.width, height },
    contents: {
      x: frame.x,
      y: frame.y + height,
      width: frame.width,
      height: Math.max(0, frame.height - height)
    }
  }
}

export function gridMetrics(count: number, stage: Rect): { cols: number; rows: number } {
  if (count <= 0) {
    return { cols: 0, rows: 0 }
  }
  if (count === 1) {
    return { cols: 1, rows: 1 }
  }
  const aspect = stage.width / Math.max(stage.height, 1)
  let cols = Math.max(1, Math.ceil(Math.sqrt(count * Math.max(aspect, 0.5))))
  let rows = Math.ceil(count / cols)
  while (cols > 1 && (cols - 1) * rows >= count) {
    cols -= 1
    rows = Math.ceil(count / cols)
  }
  return { cols, rows }
}

function cellsForMode(mode: LayoutMode, count: number, stage: Rect): { cols: number; rows: number } {
  if (mode === 'columns') {
    return { cols: Math.max(1, count), rows: 1 }
  }
  if (mode === 'rows') {
    return { cols: 1, rows: Math.max(1, count) }
  }
  return gridMetrics(count, stage)
}

function tileFrames(stage: Rect, count: number, cols: number, rows: number): Rect[] {
  const inner = inset(stage, STAGE_PAD)
  const cellW = (inner.width - PANEL_GAP * Math.max(0, cols - 1)) / Math.max(cols, 1)
  const cellH = (inner.height - PANEL_GAP * Math.max(0, rows - 1)) / Math.max(rows, 1)
  const frames: Rect[] = []
  for (let i = 0; i < count; i += 1) {
    const col = i % cols
    const row = Math.floor(i / cols)
    frames.push(
      roundRect({
        x: inner.x + col * (cellW + PANEL_GAP),
        y: inner.y + row * (cellH + PANEL_GAP),
        width: cellW,
        height: cellH
      })
    )
  }
  return frames
}

function fractionToFrame(stage: Rect, bounds: FractionRect): Rect {
  const inner = inset(stage, STAGE_PAD)
  return roundRect({
    x: inner.x + bounds.x * inner.width,
    y: inner.y + bounds.y * inner.height,
    width: bounds.w * inner.width,
    height: bounds.h * inner.height
  })
}

export function defaultFreeBounds(index: number, count: number): FractionRect {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)))
  const rows = Math.ceil(count / cols)
  const col = index % cols
  const row = Math.floor(index / cols)
  const w = 1 / cols
  const h = 1 / rows
  return {
    x: col * w,
    y: row * h,
    w: Math.max(0.18, w - 0.01),
    h: Math.max(0.18, h - 0.01)
  }
}

function toPanels(accounts: Account[], frames: Rect[]): PanelGeometry[] {
  return accounts.map((account, index) => {
    const frame = frames[index] ?? frames[0] ?? { x: 0, y: 0, width: 0, height: 0 }
    const split = splitMarquee(frame)
    return { accountId: account.id, frame, ...split }
  })
}

export function layoutPanels(
  stage: Rect,
  tab: GameTab,
  accounts: Record<string, Account>,
  options?: { focusedId?: string | null }
): PanelGeometry[] {
  const running = tab.accountOrder
    .map((id) => accounts[id])
    .filter((account): account is Account => Boolean(account))
    .filter((account) => account.status === 'running' && !account.poppedOut)

  if (running.length === 0 || stage.width <= 0 || stage.height <= 0) {
    return []
  }

  const focusedId = options?.focusedId ?? tab.activeAccountId
  const focused = running.find((account) => account.id === focusedId)
  const visible = tab.layout === 'single' ? [focused ?? running[0]] : running

  if (tab.layout === 'single') {
    return toPanels(visible, [roundRect(inset(stage, STAGE_PAD))])
  }

  if (tab.layout === 'free') {
    const frames = visible.map((account, index) =>
      fractionToFrame(stage, account.freeBounds ?? defaultFreeBounds(index, visible.length))
    )
    return toPanels(visible, frames)
  }

  const { cols, rows } = cellsForMode(tab.layout, visible.length, stage)
  return toPanels(visible, tileFrames(stage, visible.length, cols, rows))
}

export function clampZoom(factor: number): number {
  if (!Number.isFinite(factor)) {
    return 1
  }
  return Math.min(3, Math.max(0.5, Math.round(factor * 100) / 100))
}
