import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ExternalLink,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { Button } from '@heroui/react'
import { layoutPanels } from '@shared/layout'
import { t } from '@shared/i18n'
import type { Rect } from '@shared/types'
import { accountsForTab, visibleTabs } from '@shared/workspace'
import { dispatch, useAppStore } from '../store'

const emptyRect: Rect = { x: 0, y: 0, width: 0, height: 0 }

export function Stage() {
  const snapshot = useAppStore((state) => state.snapshot)
  const dialog = useAppStore((state) => state.dialog)
  const urlFocused = useAppStore((state) => state.urlFocused)
  const ref = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Rect>(emptyRect)
  const locale = snapshot.locale
  const tab = visibleTabs(snapshot).find((item) => item.id === snapshot.activeTabId) ?? null
  const accounts = tab ? accountsForTab(snapshot, tab.id) : []
  const running = accounts.filter((account) => account.status === 'running')
  const firstAccount = accounts[0]
  const panels = tab ? layoutPanels(stage, tab, snapshot.accounts) : []

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }
    const report = () => {
      const box = node.getBoundingClientRect()
      const nextStage = { x: box.x, y: box.y, width: box.width, height: box.height }
      setStage(nextStage)
      const nextPanels = tab ? layoutPanels(nextStage, tab, snapshot.accounts) : []
      window.opsource.reportStage({
        stage: nextStage,
        overlayOpen: dialog.id !== 'none',
        chromeEditable: urlFocused,
        panels: nextPanels
      })
    }
    const observer = new ResizeObserver(report)
    observer.observe(node)
    report()
    window.addEventListener('resize', report)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', report)
    }
  }, [tab, snapshot.activeTabId, snapshot.accounts, dialog.id, urlFocused])

  return (
    <section ref={ref} className="relative h-full overflow-hidden bg-background">
      {!tab ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <p className="text-2xl font-semibold">{t(locale, 'emptyTitle')}</p>
            <p className="mt-2 text-sm text-muted">{t(locale, 'emptyBody')}</p>
            <Button className="mt-5" onPress={() => useAppStore.getState().setDialog({ id: 'tab-create' })}>
              {t(locale, 'emptyCta')}
            </Button>
          </div>
        </div>
      ) : running.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <p className="text-xl font-semibold">{t(locale, 'noRunning')}</p>
            <p className="mt-2 text-sm text-muted">{t(locale, 'noRunningBody')}</p>
            {firstAccount ? (
              <Button
                className="mt-5"
                onPress={() => void dispatch({ type: 'account/setStatus', id: firstAccount.id, status: 'running' })}
              >
                {t(locale, 'startAccount')}
              </Button>
            ) : (
              <Button className="mt-5" onPress={() => useAppStore.getState().setDialog({ id: 'account-create' })}>
                {t(locale, 'addAccount')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        panels.map((panel) => {
          const account = snapshot.accounts[panel.accountId]
          if (!account) {
            return null
          }
          return (
            <div
              key={account.id}
              className="absolute overflow-hidden rounded-sm ring-1 ring-black/40"
              style={{
                left: panel.marquee.x - stage.x,
                top: panel.marquee.y - stage.y,
                width: panel.marquee.width,
                height: panel.frame.height
              }}
            >
              <div
                className="flex h-[30px] items-center gap-2 px-2"
                style={{ background: account.color }}
                onPointerDown={(event) => {
                  if (tab.layout !== 'free' || event.button !== 0) {
                    return
                  }
                  const startX = event.clientX
                  const startY = event.clientY
                  const origin = account.freeBounds ?? { x: 0, y: 0, w: 0.4, h: 0.4 }
                  const move = (next: PointerEvent) => {
                    const box = ref.current?.getBoundingClientRect()
                    if (!box) {
                      return
                    }
                    const dx = (next.clientX - startX) / Math.max(box.width, 1)
                    const dy = (next.clientY - startY) / Math.max(box.height, 1)
                    void dispatch({
                      type: 'account/setFreeBounds',
                      id: account.id,
                      bounds: {
                        x: Math.min(0.8, Math.max(0, origin.x + dx)),
                        y: Math.min(0.8, Math.max(0, origin.y + dy)),
                        w: origin.w,
                        h: origin.h
                      }
                    })
                  }
                  const up = () => {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                  }
                  window.addEventListener('pointermove', move)
                  window.addEventListener('pointerup', up)
                }}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-black/80"
                  onClick={() => void dispatch({ type: 'account/activate', id: account.id })}
                >
                  {account.name} · {account.url.replace(/^https?:\/\//, '')}
                </button>
                <div className="flex items-center gap-0.5">
                  <Mini
                    label={account.muted ? t(locale, 'unmute') : t(locale, 'mute')}
                    onPress={() => void dispatch({ type: 'account/setMuted', id: account.id, muted: !account.muted })}
                  >
                    {account.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                  </Mini>
                  <Mini
                    label={t(locale, 'popOut')}
                    onPress={() => void dispatch({ type: 'account/setPoppedOut', id: account.id, poppedOut: true })}
                  >
                    <ExternalLink className="size-3.5" />
                  </Mini>
                  <Mini
                    label={t(locale, 'reload')}
                    onPress={() => void window.opsource.navigate({ kind: 'reload', accountId: account.id })}
                  >
                    <RotateCw className="size-3.5" />
                  </Mini>
                  <Mini
                    label={t(locale, 'zoomOut')}
                    onPress={() =>
                      void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor - 0.1 })
                    }
                  >
                    <ZoomOut className="size-3.5" />
                  </Mini>
                  <Mini
                    label={t(locale, 'zoomIn')}
                    onPress={() =>
                      void dispatch({ type: 'account/setZoom', id: account.id, zoomFactor: account.zoomFactor + 0.1 })
                    }
                  >
                    <ZoomIn className="size-3.5" />
                  </Mini>
                  <Mini
                    label={t(locale, 'stopAccount')}
                    onPress={() => void dispatch({ type: 'account/setStatus', id: account.id, status: 'closed' })}
                  >
                    <X className="size-3.5" />
                  </Mini>
                </div>
              </div>
            </div>
          )
        })
      )}
    </section>
  )
}

function Mini({
  label,
  onPress,
  children
}: {
  label: string
  onPress: () => void
  children: ReactNode
}) {
  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={label}
      onPress={onPress}
      className="h-6 min-w-6 text-black/80"
    >
      {children}
    </Button>
  )
}
