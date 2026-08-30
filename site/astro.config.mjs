import { defineConfig } from 'astro/config'

// Project GitHub Pages: origin is the user site, base is the repo name.
// English lives at /idle-manager/en/ via src/pages/en/index.astro (PT + root redirect are later tasks).
export default defineConfig({
  site: 'https://matheusbarni.github.io',
  base: '/idle-manager',
  trailingSlash: 'always',
  output: 'static'
})
