import { fileURLToPath, URL } from "node:url";

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/__colors.module.scss" as colors;
          @use "@/styles/__fonts.module.scss" as fonts;
          @use "@/styles/__spacers.module.scss" as spacers;
          @use "@/styles/__border-radius.module.scss" as borderRadius;
          @use "@/styles/__mixins.module.scss" as mixins;
        `,
      },
    },
  },
})
