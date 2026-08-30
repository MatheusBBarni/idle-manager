import { defineConfig } from 'astro/config'

// Project GitHub Pages: origin is the user site, base is the repo name.
// Locales are prefixed (`/en/`, `/pt/`); `/` redirects to `/en/` (ADR-003).
export default defineConfig({
  site: 'https://matheusbarni.github.io',
  base: '/idle-manager',
  trailingSlash: 'always',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: true,
      // Astro 7 requires `src/pages/index.astro` for `/` and warns if this is also true.
      redirectToDefaultLocale: false
    }
  }
})
