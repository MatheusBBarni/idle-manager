import { useEffect } from 'react'
import { I18nProvider } from '@heroui/react'
import { activeAccount, visibleTabs } from '@shared/workspace'
import { Shell } from './components/Shell'
import { useAppStore } from './store'

export function App() {
  const locale = useAppStore((state) => state.snapshot.locale)
  const theme = useAppStore((state) => state.snapshot.theme)

  useEffect(() => {
    const root = document.documentElement
    const themeName = theme === 'light' ? 'mobbin-light' : 'mobbin-dark'
    root.classList.toggle('dark', theme !== 'light')
    root.classList.toggle('light', theme === 'light')
    root.dataset.theme = themeName
    root.lang = locale === 'pt' ? 'pt-BR' : 'en'
  }, [locale, theme])

  useEffect(() => {
    let cancelled = false
    const store = useAppStore.getState()
    void Promise.all([window.opsource.getState(), window.opsource.getPlatform(), window.opsource.getVersion()]).then(
      ([snapshot, platform, version]) => {
        if (cancelled) {
          return
        }
        store.setSnapshot(snapshot)
        store.setMeta({ platform, version })
        const account = activeAccount(snapshot)
        if (account) {
          store.setUrlDraft(account.url)
        }
        if (visibleTabs(snapshot).length === 0) {
          store.setDialog({ id: 'tab-create' })
        }
      }
    )
    const offState = window.opsource.onState((snapshot) => useAppStore.getState().setSnapshot(snapshot))
    const offMetrics = window.opsource.onMetrics((metrics) => useAppStore.getState().setMetrics(metrics))
    const offNav = window.opsource.onNavigation((nav) => useAppStore.getState().setNav(nav))
    const offUpdate = window.opsource.onUpdate((status) => useAppStore.getState().setUpdateStatus(status))
    return () => {
      cancelled = true
      offState()
      offMetrics()
      offNav()
      offUpdate()
    }
  }, [])

  return (
    <I18nProvider locale={locale === 'pt' ? 'pt-BR' : 'en-US'}>
      <Shell />
    </I18nProvider>
  )
}
