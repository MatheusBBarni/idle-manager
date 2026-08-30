export type Locale = 'en' | 'pt'

type LandingCopy = {
  title: string
  description: string
  skip: string
  pageNav: string
  localeNav: string
  isolation: string
  how: string
  faq: string
  kicker: string
  headline: string
  subhead: string
  claim: string
  heroSecondary: string
  trustItems: string[]
  screenshotAlt: string
  screenshotCaption: string
  problemEyebrow: string
  problemHeadline: string
  problemLead: string
  problemItems: { title: string; body: string }[]
  solutionEyebrow: string
  solutionHeadline: string
  solutionLead: string
  features: { title: string; body: string }[]
  howEyebrow: string
  howHeadline: string
  howLead: string
  steps: { title: string; body: string }[]
  notBot: string
  notBotLead: string
  notBotItems: string[]
  faqEyebrow: string
  faqHeadline: string
  faqs: { q: string; a: string }[]
  finalHeadline: string
  finalLead: string
  download: string
  downloadAction: string
  smartScreen: string
  privacy: string
  privacyParagraphs: string[]
  source: string
  sourceLead: string
  sourceLink: string
}

export const landing = {
  en: {
    title: 'Idle manager — run isolated idle accounts in one window',
    description:
      'Idle manager is a local multi-account shell. It does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar.',
    skip: 'Skip to isolation claim',
    pageNav: 'On this page',
    localeNav: 'Language',
    isolation: 'Isolation',
    how: 'How it works',
    faq: 'FAQ',
    kicker: 'Idle manager is a local multi-account shell.',
    headline: 'Run every idle account in one window.',
    subhead:
      'Tile logged-in sessions of the same game. Each account keeps its own cookie jar.',
    claim:
      'It does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar.',
    heroSecondary: 'View source',
    trustItems: [
      'Sessions stay on this PC',
      'MIT-licensed source',
      'Windows installer',
      'Not a bot or anti-detect browser'
    ],
    screenshotAlt:
      'Idle manager with three isolated accounts of the same game tiled in one window.',
    screenshotCaption: 'Same game. Three jars.',
    problemEyebrow: 'The problem',
    problemHeadline: 'One origin. One cookie jar. That is the browser rule.',
    problemLead:
      'A normal tab, iframe, or PWA cannot keep two live logins of the same idle game apart. Cookies, localStorage, IndexedDB, and service workers are keyed by origin.',
    problemItems: [
      {
        title: 'Extra profiles, extra windows',
        body: 'You multiply Chrome just to keep users apart, then lose the games behind a pile of windows.'
      },
      {
        title: 'The shared jar',
        body: 'Two live views of the same origin in one profile share one login, one inventory, one cookie jar.'
      },
      {
        title: 'The wrong tools',
        body: 'Bots, macros, proxies, and anti-detect browsers put the account at risk. Isolation is not stealth.'
      }
    ],
    solutionEyebrow: 'The shell',
    solutionHeadline: 'Isolation is the product.',
    solutionLead:
      'Idle manager is a small multi-session desktop shell. A tab is one game URL. An account is one isolated session inside that tab.',
    features: [
      {
        title: 'Own cookie jar',
        body: 'Each account is a separate Chromium session on this PC. Account A never sees Account B’s cookies.'
      },
      {
        title: 'Tiled live views',
        body: 'Several running accounts sit in one window. Idle loops stay alive in the background.'
      },
      {
        title: 'Close without wipe',
        body: 'Closing a panel tears down the view and keeps the store. Delete an account only when you mean to wipe that jar.'
      }
    ],
    howEyebrow: 'How it works',
    howHeadline: 'Three steps. No macros.',
    howLead: 'You log in. The shell only keeps the jars apart.',
    steps: [
      {
        title: 'Add a game tab',
        body: 'Set the game URL. Any site — games are not hardcoded.'
      },
      {
        title: 'Start isolated accounts',
        body: 'Add accounts and start them. Each panel is its own session.'
      },
      {
        title: 'Log in separately',
        body: 'Use a different user in each panel. Quit and reopen: both stay logged in.'
      }
    ],
    notBot: 'What it is not',
    notBotLead: 'If you need a bot, this is the wrong download.',
    notBotItems: [
      'Not a bot or macro tool',
      'Not a cheat injector',
      'Not a fingerprint spoof',
      'Not a proxy or anti-detect browser',
      'Not a shared cookie-jar swapper'
    ],
    faqEyebrow: 'Questions',
    faqHeadline: 'Straight answers before you install.',
    faqs: [
      {
        q: 'Is this a bot or auto-battle tool?',
        a: 'No. It does not automate play, inject cheats, or click for you. It only isolates sessions on this device.'
      },
      {
        q: 'Will two accounts of the same game share a login?',
        a: 'No. Each account is a separate Chromium session. Cookies and localStorage stay in that jar.'
      },
      {
        q: 'Why does Windows warn me?',
        a: 'Builds are unsigned. SmartScreen may say the file is from an unknown publisher. That is expected. This page does not claim a known publisher.'
      },
      {
        q: 'Does anything leave my PC?',
        a: 'Game sessions stay on this device. This public page is hosted on GitHub Pages, which may log visitor IPs for security. The page may GET GitHub’s Releases API to find the Windows installer. There are no extra tracking pixels.'
      },
      {
        q: 'Can I download for macOS or Linux?',
        a: 'Windows is the installer on this page. Source is on GitHub if you want to build for another OS.'
      },
      {
        q: 'Is it free?',
        a: 'Yes. Idle manager is MIT-licensed. You can read the source before you install.'
      }
    ],
    finalHeadline: 'Install the Windows shell.',
    finalLead: 'One visit. Isolated jars. No bot.',
    download: 'Download',
    downloadAction: 'Download for Windows',
    smartScreen:
      'Windows may warn that this file is unsigned or from an unknown publisher (Microsoft SmartScreen). That is expected. This page does not claim a known publisher.',
    privacy: 'Privacy',
    privacyParagraphs: [
      'Game sessions stay on this device. Account cookie jars are local Chromium partitions and are not sent to a server.',
      'This public page is hosted on GitHub Pages. The host may log visitor IPs for security.',
      'This page may GET GitHub’s Releases API at api.github.com to look up a Windows installer. There are no extra tracking pixels.'
    ],
    source: 'Source',
    sourceLead: 'Idle manager is MIT-licensed.',
    sourceLink: 'Source on GitHub'
  },
  pt: {
    title: 'Idle manager — rode contas idle isoladas em uma janela',
    description:
      'Idle manager é um shell local de várias contas. Não automatiza o jogo, não injeta cheats, não falsifica fingerprints, não usa proxies e não compartilha um único cookie jar.',
    skip: 'Ir para a afirmação de isolamento',
    pageNav: 'Nesta página',
    localeNav: 'Idioma',
    isolation: 'Isolamento',
    how: 'Como funciona',
    faq: 'Perguntas',
    kicker: 'Idle manager é um shell local de várias contas.',
    headline: 'Rode todas as contas idle em uma janela.',
    subhead:
      'Abra várias sessões logadas do mesmo jogo lado a lado. Cada conta fica no seu próprio cookie jar.',
    claim:
      'Não automatiza o jogo, não injeta cheats, não falsifica fingerprints, não usa proxies e não compartilha um único cookie jar.',
    heroSecondary: 'Ver código-fonte',
    trustItems: [
      'Sessões ficam neste PC',
      'Código sob licença MIT',
      'Instalador para Windows',
      'Não é bot nem navegador anti-detect'
    ],
    screenshotAlt:
      'Idle manager com três contas isoladas do mesmo jogo lado a lado na mesma janela.',
    screenshotCaption: 'Mesmo jogo. Três jars.',
    problemEyebrow: 'O problema',
    problemHeadline: 'Uma origem. Um cookie jar. Essa é a regra do navegador.',
    problemLead:
      'Uma aba normal, um iframe ou um PWA não consegue manter dois logins vivos do mesmo jogo idle separados. Cookies, localStorage, IndexedDB e service workers usam a origem como chave.',
    problemItems: [
      {
        title: 'Perfis e janelas demais',
        body: 'Você multiplica o Chrome só para não misturar usuários — e perde os jogos atrás de um monte de janelas.'
      },
      {
        title: 'O jar compartilhado',
        body: 'Dois painéis da mesma origem no mesmo perfil compartilham login, inventário e cookie jar.'
      },
      {
        title: 'As ferramentas erradas',
        body: 'Bot, macro, proxy e anti-detect colocam a conta em risco. Isolamento não é stealth.'
      }
    ],
    solutionEyebrow: 'O shell',
    solutionHeadline: 'Isolamento é o produto.',
    solutionLead:
      'Idle manager é um shell desktop de várias sessões. Uma aba é a URL do jogo. Uma conta é uma sessão isolada dentro dessa aba.',
    features: [
      {
        title: 'Cookie jar próprio',
        body: 'Cada conta é uma sessão Chromium separada neste PC. A Conta A nunca vê os cookies da Conta B.'
      },
      {
        title: 'Painéis lado a lado',
        body: 'Várias contas rodando na mesma janela. Os loops idle continuam ativos em segundo plano.'
      },
      {
        title: 'Fechar sem apagar',
        body: 'Fechar um painel encerra a tela e mantém a sessão no disco. Só apague uma conta quando quiser limpar aquele jar.'
      }
    ],
    howEyebrow: 'Como funciona',
    howHeadline: 'Três passos. Sem macros.',
    howLead: 'Você faz o login. O shell só mantém os jars separados.',
    steps: [
      {
        title: 'Crie uma aba do jogo',
        body: 'Defina a URL. Qualquer site — os jogos não vêm pré-definidos.'
      },
      {
        title: 'Inicie contas isoladas',
        body: 'Adicione contas e inicie cada uma. Cada painel é a sua própria sessão.'
      },
      {
        title: 'Entre com usuários diferentes',
        body: 'Use um usuário diferente em cada painel. Feche e abra de novo: as duas continuam logadas.'
      }
    ],
    notBot: 'O que não é',
    notBotLead: 'Se você precisa de um bot, este não é o download certo.',
    notBotItems: [
      'Não é um bot nem ferramenta de macro',
      'Não é um injetor de cheats',
      'Não é um spoof de fingerprint',
      'Não é um proxy nem um navegador anti-detect',
      'Não é um trocador de cookie jar compartilhado'
    ],
    faqEyebrow: 'Perguntas',
    faqHeadline: 'Respostas diretas antes de instalar.',
    faqs: [
      {
        q: 'Isso é um bot ou ferramenta de auto-battle?',
        a: 'Não. Não automatiza o jogo, não injeta cheats e não clica por você. Só isola sessões neste dispositivo.'
      },
      {
        q: 'Duas contas do mesmo jogo vão compartilhar o login?',
        a: 'Não. Cada conta é uma sessão Chromium separada. Cookies e localStorage ficam naquele jar.'
      },
      {
        q: 'Por que o Windows avisa?',
        a: 'Os builds não estão assinados. O SmartScreen pode dizer que o arquivo é de um editor desconhecido. Isso é esperado. Esta página não afirma um editor conhecido.'
      },
      {
        q: 'Alguma coisa sai do meu PC?',
        a: 'As sessões de jogo ficam neste dispositivo. Esta página pública é hospedada no GitHub Pages, que pode registrar IPs de visitantes por segurança. A página pode fazer GET na API de Releases do GitHub para localizar o instalador Windows. Não há pixels de rastreamento extras.'
      },
      {
        q: 'Posso baixar para macOS ou Linux?',
        a: 'O instalador nesta página é para Windows. O código-fonte está no GitHub se você quiser compilá-lo para outro sistema.'
      },
      {
        q: 'É de graça?',
        a: 'Sim. Idle manager é licenciado sob MIT. Você pode ler o código-fonte antes de instalar.'
      }
    ],
    finalHeadline: 'Instale o shell no Windows.',
    finalLead: 'Uma visita. Jars isolados. Sem bot.',
    download: 'Baixar',
    downloadAction: 'Baixar para Windows',
    smartScreen:
      'O Windows pode avisar que este arquivo não está assinado ou é de um editor desconhecido (Microsoft SmartScreen). Isso é esperado. Esta página não afirma um editor conhecido.',
    privacy: 'Privacidade',
    privacyParagraphs: [
      'As sessões de jogo ficam neste dispositivo. Os cookie jars das contas são partições Chromium locais e não são enviados a um servidor.',
      'Esta página pública é hospedada no GitHub Pages, que pode registrar IPs de visitantes por segurança.',
      'Esta página pode fazer GET na API de Releases do GitHub em api.github.com para localizar um instalador Windows. Não há pixels de rastreamento extras.'
    ],
    source: 'Código-fonte',
    sourceLead: 'Idle manager é licenciado sob MIT.',
    sourceLink: 'Código-fonte no GitHub'
  }
} as const satisfies Record<Locale, LandingCopy>
