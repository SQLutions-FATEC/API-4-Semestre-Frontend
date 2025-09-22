import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify from "vite-plugin-vuetify";

// https://vite.dev/config/
export default defineConfig({
 SCM-23/configurar-ESLint-e-Prettier
  plugins: [vue(), vueDevTools(), vuetify({ autoImport: true })],

  plugins: [
    vue(),
    vueDevTools(),
    vuetify({ autoImport: true/*, styles: { configFile: 'src/styles/settings.scss' }*/}),
  ],
 develop-1
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
SCM-23/configurar-ESLint-e-Prettier
});

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
 develop-1
