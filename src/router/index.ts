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
      path: "/dashboards",
      name: "Dashboards",
      component: () => import("../Pages/dashboard/DashboardPage.vue"),
    },
    {
      path: "/cidadao",
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
    {
      path: "/notificacoes",
      name: "notificacoes",
      component: () => import("../Pages/notification/NotificationPage.vue"),
    },
  ],
});

export default router;
