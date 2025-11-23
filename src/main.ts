import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "vuetify/styles";
import VueApexCharts from "vue3-apexcharts";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import router from "./router";
import { makeServer } from "./mock/serverConfig";

if (import.meta.env.VITE_MOCK_ENABLED === "true") {
  makeServer();
}

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);

app.use(VueApexCharts);
app.component("ApexCharts", VueApexCharts);

app.use(createPinia());
app.use(router);
app.use(vuetify);

// Aguardar router estar pronto antes de montar
router.isReady().then(() => {
  app.mount("#app");
});
