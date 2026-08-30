export type Locale = 'en' | 'pt'

export type KeyboardBind = {
  keys: string
  action: string
}

export type KeyboardCopy = {
  title: string
  description: string
  skip: string
  home: string
  localeNav: string
  heading: string
  lead: string
  shortcutCol: string
  actionCol: string
  binds: KeyboardBind[]
}

export const keyboard: Record<Locale, KeyboardCopy> = {
  en: {
    title: 'Keyboard shortcuts — Idle manager',
    description:
      'Create, cycle, and start isolated accounts from the keyboard while a game panel is focused.',
    skip: 'Skip to shortcuts',
    home: 'Idle manager',
    localeNav: 'Language',
    heading: 'Keyboard shortcuts',
    shortcutCol: 'Shortcut',
    actionCol: 'Action',
    lead: 'These four reserved modifier chords work while a game panel is focused. Unmatched keys still reach the game. Modifier is Ctrl on Windows and Linux, Command on macOS.',
    binds: [
      { keys: 'Ctrl+Shift+N / ⌘⇧N', action: 'Create account (default name)' },
      { keys: 'Ctrl+Shift+[ / ⌘⇧[', action: 'Previous account' },
      { keys: 'Ctrl+Shift+] / ⌘⇧]', action: 'Next account' },
      { keys: 'Ctrl+Enter / ⌘↩', action: 'Start targeted account' }
    ]
  },
  pt: {
    title: 'Atalhos de teclado — Idle manager',
    description:
      'Crie, percorra e inicie contas isoladas pelo teclado enquanto um painel de jogo está em foco.',
    skip: 'Ir para os atalhos',
    home: 'Idle manager',
    localeNav: 'Idioma',
    heading: 'Atalhos de teclado',
    shortcutCol: 'Atalho',
    actionCol: 'Ação',
    lead: 'Estes quatro atalhos com modificador funcionam com um painel de jogo em foco. As demais teclas continuam no jogo. O modificador é Ctrl no Windows e no Linux, Command no macOS.',
    binds: [
      { keys: 'Ctrl+Shift+N / ⌘⇧N', action: 'Criar conta (nome padrão)' },
      { keys: 'Ctrl+Shift+[ / ⌘⇧[', action: 'Conta anterior' },
      { keys: 'Ctrl+Shift+] / ⌘⇧]', action: 'Próxima conta' },
      { keys: 'Ctrl+Enter / ⌘↩', action: 'Iniciar a conta em foco' }
    ]
  }
}
