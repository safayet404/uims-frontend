export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vercel/analytics',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  // The UI is designed for light mode only: disable Nuxt UI's color mode so
  // neither the OS preference nor a previously stored choice turns it dark
  ui: {
    colorMode: false,
  },

  imports: {
    dirs: ['stores', 'composables'],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      appName: 'UniCore',
    }
  },

  app: {
    head: {
      title: 'UniCore — University Management System',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})