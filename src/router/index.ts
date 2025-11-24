import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../Pages/gestor/HomePage.vue";
import AuthService from "@/services/AuthService";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboards",
      name: "Dashboards",
      component: () => import("../Pages/dashboard/DashboardPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/cidadao",
      name: "Cidadao",
      component: () => import("../Pages/citizen/CitizenHome.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/mapa",
      name: "mapa",
      component: () => import("../Pages/mapa/MapaPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/sobre",
      name: "sobre",
      component: () => import("../Pages/about/AboutPage.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/gerir-usuarios",
      name: "GerirUsuarios",
      component: () => import("../Pages/users/UserManagement.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      redirect: { name: "Cidadao" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const requiresAuth = to.meta?.requiresAuth;

  if (to.path === '/' && !isAuthenticated) {
    next({ name: 'Cidadao' });
    return;
  }

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Cidadao' });
  } else {
    next();
  }
});

export default router;
