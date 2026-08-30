import { BrowserWindow, app, session } from 'electron'
import { partitionForAccount } from '@shared/partition'

function htmlPage(): Response {
  const body = `<!doctype html>
<html><head><meta charset="utf-8"><title>iso</title></head>
<body>
<script>
window.__read = () => ({
  local: localStorage.getItem('who'),
  session: sessionStorage.getItem('who')
})
window.__write = (value) => {
  localStorage.setItem('who', value)
  sessionStorage.setItem('who', value)
  document.cookie = 'who=' + value + '; path=/'
}
</script>
</body></html>`
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

async function loadIsolated(accountId: string): Promise<BrowserWindow> {
  const partition = partitionForAccount(accountId)
  const ses = session.fromPartition(partition)
  ses.protocol.handle('opsource-iso', () => htmlPage())
  const win = new BrowserWindow({
    show: false,
    width: 320,
    height: 240,
    webPreferences: {
      session: ses,
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  })
  await win.loadURL('opsource-iso://probe/')
  return win
}

export async function verifyIsolation(): Promise<number> {
  await app.whenReady()
  const origin = 'https://gengar.com.br'
  const sessionA = session.fromPartition(partitionForAccount('verify-a'))
  const sessionB = session.fromPartition(partitionForAccount('verify-b'))

  await sessionA.cookies.set({ url: origin, name: 'sid', value: 'account-a', path: '/' })
  await sessionB.cookies.set({ url: origin, name: 'sid', value: 'account-b', path: '/' })

  const cookiesA = await sessionA.cookies.get({ url: origin })
  const cookiesB = await sessionB.cookies.get({ url: origin })
  const sidA = cookiesA.find((cookie) => cookie.name === 'sid')?.value
  const sidB = cookiesB.find((cookie) => cookie.name === 'sid')?.value

  if (sidA !== 'account-a' || sidB !== 'account-b') {
    console.error('cookie isolation failed', { sidA, sidB })
    return 1
  }

  const winA = await loadIsolated('verify-a')
  const winB = await loadIsolated('verify-b')
  await winA.webContents.executeJavaScript('window.__write("alpha")')
  await winB.webContents.executeJavaScript('window.__write("beta")')
  const readA = (await winA.webContents.executeJavaScript('window.__read()')) as {
    local: string
    session: string
  }
  const readB = (await winB.webContents.executeJavaScript('window.__read()')) as {
    local: string
    session: string
  }

  winA.destroy()
  winB.destroy()

  if (readA.local !== 'alpha' || readB.local !== 'beta' || readA.session === readB.session) {
    console.error('storage isolation failed', { readA, readB })
    return 1
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        primitive: 'session.fromPartition(persist:opsource-account-{accountId})',
        cookies: { a: sidA, b: sidB },
        localStorage: { a: readA.local, b: readB.local }
      },
      null,
      2
    )
  )
  return 0
}
