import { describe, expect, it } from 'vitest'
import { gridMetrics, layoutPanels } from './layout'
import type { Account, GameTab } from './types'

const stage = { x: 100, y: 80, width: 800, height: 600 }

function tab(layout: GameTab['layout'], ids: string[]): GameTab {
  return {
    id: 'tab',
    name: 'Gengar',
    baseUrl: 'https://gengar.com.br/',
    layout,
    accountOrder: ids,
    activeAccountId: ids[0] ?? null,
    archived: false
  }
}

function accounts(ids: string[]): Record<string, Account> {
  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      {
        id,
        tabId: 'tab',
        name: `Conta ${index + 1}`,
        color: '#FF6B35',
        url: 'https://gengar.com.br/',
        homeUrl: 'https://gengar.com.br/',
        status: 'running' as const,
        muted: false,
        zoomFactor: 1,
        lastActivityAt: null,
        poppedOut: false,
        freeBounds: null
      }
    ])
  )
}

describe('layout', () => {
  it('tiles four running accounts in a 2x2 grid', () => {
    const ids = ['a', 'b', 'c', 'd']
    const metrics = gridMetrics(4, stage)
    expect(metrics).toEqual({ cols: 2, rows: 2 })
    const panels = layoutPanels(stage, tab('grid', ids), accounts(ids))
    expect(panels).toHaveLength(4)
    expect(panels[0]?.contents.y).toBeGreaterThan(panels[0]?.marquee.y ?? 0)
    expect(panels[0]?.contents.height).toBeLessThan(panels[0]?.frame.height ?? 0)
  })

  it('single layout shows only the focused account', () => {
    const ids = ['a', 'b', 'c']
    const panels = layoutPanels(stage, tab('single', ids), accounts(ids), { focusedId: 'b' })
    expect(panels.map((panel) => panel.accountId)).toEqual(['b'])
    expect(panels[0]?.frame.width).toBeGreaterThan(700)
  })

  it('columns and rows match the account count', () => {
    const ids = ['a', 'b', 'c']
    const columns = layoutPanels(stage, tab('columns', ids), accounts(ids))
    const rows = layoutPanels(stage, tab('rows', ids), accounts(ids))
    expect(columns).toHaveLength(3)
    expect(rows).toHaveLength(3)
    expect(columns[0]?.frame.y).toBe(columns[1]?.frame.y)
    expect(rows[0]?.frame.x).toBe(rows[1]?.frame.x)
  })

  it('ignores closed and popped-out accounts', () => {
    const ids = ['a', 'b']
    const map = accounts(ids)
    map.b = { ...map.b, status: 'closed' }
    expect(layoutPanels(stage, tab('grid', ids), map)).toHaveLength(1)
  })
})
