import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../Pages/gestor/HomePage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/Cidadao",
      name: "Cidadao",
      component: () => import("../Pages/citizen/CitizenHome.vue"),
    },
    {
      path: "/mapa",
      name: "mapa",
      component: () => import("../Pages/mapa/MapaPage.vue"),
    },
    {
      path: "/sobre",
      name: "sobre",
      component: () => import("../Pages/about/AboutPage.vue"),
    },
  ],
});

export default router;
