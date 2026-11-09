// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      // apiBase: "http://127.0.0.1:3000/api/",
      apiBase: "https://cms.roqay.dev/api/",
      // secretKey : "9e810ce4d7b9e83d7aaf208b3ecfd0488d6a1e5c67a6a72f384a1d3bcb40c012"
    },
  },

  ssr: false,

  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    head: {
      title: "CMS Dashboard",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "CMS Dashboard" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/logo.ico" }],
    },
  },

  modules: [
    "@primevue/nuxt-module",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vee-validate/nuxt",
    "nuxt-yup",
  ],

  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: "VeeForm",
      Field: "VeeField",
      ErrorMessage: "VeeErrorMessage",
    },
  },

  components: [
    // Automatically import components from the default components directory
    { path: "~/components/", pathPrefix: false },

    // Automatically import components from the 'popup' directory with .vue extension
    { path: "~/components/popup/", pathPrefix: false, extensions: ["vue"] },

    // Automatically import components from the 'fields' directory with .vue extension
    {
      path: "~/components/components_fields/",
      pathPrefix: false,
      extensions: ["vue"],
    },
  ],

  imports: {
    dirs: ["stores", "composables", "helpers", "schemas"],
    presets: [
      {
        from: "vee-validate",
        imports: ["Field", "Form", "ErrorMessage", "useField", "useForm"],
      },
    ],
  },

  primevue: {
    autoImport: true,
    options: {
      // unstyled: true,
      zIndex: {
        modal: 3000,
      },
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          prefix: "p",
          darkModeSelector: ".dark",
          cssLayer: false,
        },
      },
    },
  },

  i18n: {
    detectBrowserLanguage: false,
    locales: [
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "English",
        dir: "ltr",
      },
      {
        code: "ar",
        iso: "ar-SA",
        file: "ar.json",
        name: "العربية",
        dir: "rtl",
      },
    ],
    langDir: "../app/locales/",
    strategy: "prefix_except_default",
    // lazy: true,
    defaultLocale: "en",
    vueI18n: "./i18n.config.ts",
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/scss/_variables.scss" as *;
            @use "@/assets/scss/_mixins.scss" as *;
          `,
        },
      },
    },
  },

  css: [
    "@/assets/scss/_generic.scss",
    "@/assets/scss/_main-btn.scss",
    "@/assets/scss/_form.scss",
    "@/assets/scss/_popup.scss",
    "@/assets/scss/_flex_buttons.scss",
    "@/assets/scss/_grid_items.scss",
    "@/assets/scss/_components.scss",
    "@/assets/scss/_sections.scss",
    "@/assets/scss/style.scss",
    "primeicons/primeicons.css",
    // 'primevue/resources/themes/aura-light-green/theme.css'
  ],
});
