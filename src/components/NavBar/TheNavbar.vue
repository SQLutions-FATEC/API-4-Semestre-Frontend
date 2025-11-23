<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref, onMounted } from "vue";
import logoSjc from "@/assets/logo-sjc.png";
import DateTimeDisplay from "@/components/DateTime/DateTimeDisplay.vue";
import { useAuth } from "@/composables/useAuth";

const { isAuthenticated, userName, login, logout, initializeAuth } = useAuth();

const showLoginModal = ref(false);
const loginForm = ref({
  email: '',
  password: ''
});
const loginError = ref('');
const isLoggingIn = ref(false);

onMounted(() => {
  initializeAuth();
});

const openLoginModal = () => {
  showLoginModal.value = true;
  loginError.value = '';
  loginForm.value = { email: '', password: '' };
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  loginError.value = '';
  loginForm.value = { email: '', password: '' };
};

const handleLogin = async () => {
  if (isLoggingIn.value) return;

  isLoggingIn.value = true;
  loginError.value = '';

  try {
    await login({
      email: loginForm.value.email,
      password: loginForm.value.password
    });

    closeLoginModal();

  } catch (error) {
    if (error instanceof Error) {
      loginError.value = error.message;
    } else {
      loginError.value = 'Erro inesperado. Tente novamente.';
    }
  } finally {
    isLoggingIn.value = false;
  }
};

const handleLogout = () => {
  logout();
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
      <RouterLink to="/sobre" class="nav-item">Sobre</RouterLink>
      <RouterLink to="/cidadao" class="nav-item">Cidadão</RouterLink>

      <template v-if="isAuthenticated">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/dashboards" class="nav-item">Dashboard</RouterLink>
        <RouterLink to="/mapa" class="nav-item">Mapa</RouterLink>
      </template>
    </nav>    <div class="header-actions">
      <DateTimeDisplay class="header-clock" />

      <!-- Login/Logout Button -->
      <button
        v-if="!isAuthenticated"
        class="auth-button login-button"
        type="button"
        @click="openLoginModal"
      >
        Login
      </button>

      <button
        v-else
        class="auth-button logout-button"
        type="button"
        :title="`Logout - ${userName}`"
        @click="handleLogout"
      >
        <span class="user-name">{{ userName }}</span>
        <span class="logout-text">Logout</span>
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
            <label for="email" class="form-label">Email:</label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              class="form-input"
              placeholder="Digite seu email"
              :disabled="isLoggingIn"
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
              :disabled="isLoggingIn"
              required
            />
          </div>

          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>

          <button type="submit" class="submit-button" :disabled="isLoggingIn">
            <span v-if="isLoggingIn">Entrando...</span>
            <span v-else>Entrar</span>
          </button>
        </form>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped src="@/components/NavBar/TheNavBarStyle.scss">
</style>
