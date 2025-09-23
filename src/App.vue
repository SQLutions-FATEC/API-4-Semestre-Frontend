<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div id="app">
    <!-- Header Global -->
    <header class="main-header">
      <div class="logo-section">
        <div class="logo-placeholder"></div>
      </div>

      <nav class="main-nav">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <RouterLink to="/mapa" class="nav-item">Mapa</RouterLink>
        <RouterLink to="/sobre" class="nav-item">Sobre</RouterLink>
      </nav>
    </header>

    <!-- Conteúdo das páginas -->
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Gantari', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
  /* Remove qualquer layout do template original */
  display: block !important;
  place-items: unset !important;
}

#app {
  min-height: 100vh;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  /* Remove grid layout do template original */
  display: block !important;
  grid-template-columns: none !important;
}

/* Header Styles */
.main-header {
  background: linear-gradient(to bottom, black 0%, black 80%, #ff9d00 100%);
  display: flex;
  align-items: center;
  padding: 0;
  height: 80px;
  width: 100%;
  position: relative;
}

.logo-section {
  height: 100%;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-placeholder {
  width: 60px;
  height: 60px;
  background-color: #0ea5e9;
  border-radius: 4px;
}

.main-nav {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 40px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 50%;
  bottom: 0;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 10px 50px;
  font-size: 24px;
  font-weight: 400;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-nav {
    flex-wrap: wrap;
    margin-left: 20px;
  }

  .nav-item {
    font-size: 18px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .main-header {
    flex-direction: column;
    height: auto;
    padding-bottom: 10px;
  }

  .logo-section {
    width: 100%;
    height: 60px;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
    margin-left: 0;
  }

  .nav-item {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>
