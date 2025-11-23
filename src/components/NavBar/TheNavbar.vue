<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref } from "vue";
import logoSjc from "@/assets/logo-sjc.png";
import DateTimeDisplay from "@/components/DateTime/DateTimeDisplay.vue";

const isAuthenticated = ref(false);
const showLoginModal = ref(false);
const loginForm = ref({
  username: '',
  password: ''
});
const loginError = ref('');

const openLoginModal = () => {
  showLoginModal.value = true;
  loginError.value = '';
  loginForm.value = { username: '', password: '' };
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  loginError.value = '';
  loginForm.value = { username: '', password: '' };
};

const handleLogin = () => {
  loginError.value = 'Funcionalidade ainda não implementada.';
};

const handleLogout = () => {
  isAuthenticated.value = false;
};
</script>

<template>
  <header class="main-header">
    <div class="logo-section">
      <RouterLink to="/">
        <img :src="logoSjc" alt="Logo São José dos Campos" class="logo" />
      </RouterLink>
    </div>

    <nav class="main-nav">
      <RouterLink to="/" class="nav-item">Home</RouterLink>
      <RouterLink to="/dashboards" class="nav-item">Dashboard</RouterLink>
      <RouterLink to="/mapa" class="nav-item">Mapa</RouterLink>
      <RouterLink to="/sobre" class="nav-item">Sobre</RouterLink>
      <RouterLink to="/cidadao" class="nav-item">Cidadão</RouterLink>
    </nav>

    <div class="header-actions">
      <DateTimeDisplay class="header-clock" />

      <!-- Login/Logout Button -->
      <button
        v-if="!isAuthenticated"
        class="auth-button login-button"
        type="button"
        @click="openLoginModal"
      >
        <i class="icon-login">👤</i>
        Login
      </button>

      <button
        v-else
        class="auth-button logout-button"
        type="button"
        @click="handleLogout"
      >
        <i class="icon-logout">🚪</i>
        Logout
      </button>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Login</h3>
          <button class="modal-close-button" type="button" @click="closeLoginModal">
            ×
          </button>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username" class="form-label">Usuário:</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              class="form-input"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Senha:</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              class="form-input"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>

          <button type="submit" class="submit-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped src="@/components/NavBar/TheNavBarStyle.scss">
</style>
