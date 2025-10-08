import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "vuetify/styles";
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

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount("#app");
