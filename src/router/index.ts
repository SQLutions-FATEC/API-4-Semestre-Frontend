import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: '/Cidadao',
      name: 'Cidadao',
      component: () => import('../views/CitizenView.vue'),
    },
    {
      path: '/mapa',
      name: 'mapa',
      component: () => import('../views/MapaView.vue'),
    },
    {
      path: "/sobre",
      name: "sobre",
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
