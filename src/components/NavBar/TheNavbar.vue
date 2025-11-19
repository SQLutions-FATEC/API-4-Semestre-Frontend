<script setup lang="ts">
import { RouterLink } from "vue-router";
import logoSjc from "@/assets/logo-sjc.png";
import DateTimeDisplay from "@/components/DateTime/DateTimeDisplay.vue";
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
      <RouterLink to="/notificacoes" class="nav-item">Avisos</RouterLink>
      <RouterLink to="/sobre" class="nav-item">Sobre</RouterLink>
      <RouterLink to="/cidadao" class="nav-item">Cidadão</RouterLink>
    </nav>

    <DateTimeDisplay class="header-clock" />
  </header>
</template>

<style lang="scss" scoped src="@/components/NavBar/TheNavBarStyle.scss">
</style>
