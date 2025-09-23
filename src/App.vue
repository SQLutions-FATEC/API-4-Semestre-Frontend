<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import logoSjc from '@/assets/logo-sjc.png'
</script>

<template>
  <div id="app">
    <!-- Header Global -->
    <header class="main-header">
      <div class="logo-section">
        <RouterLink to="/">
          <img :src="logoSjc" alt="Logo São José dos Campos" class="logo" />
        </RouterLink>
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

<style lang="scss">
// Use SCSS modules (variáveis já estão disponíveis globalmente via vite.config.ts)

// Reset Global
* {
  margin: spacers.$spacingNone;
  padding: spacers.$spacingNone;
  box-sizing: border-box;
}

html,
body {
  margin: spacers.$spacingNone;
  padding: spacers.$spacingNone;
  width: 100%;
  height: 100%;
  font-family: fonts.$fontFamily, sans-serif;
  line-height: 1.6;
  color: colors.$colorTextPrimary;
  background-color: colors.$colorBackgroundLight;
  /* Remove qualquer layout do template original */
  display: block !important;
  place-items: unset !important;
}

#app {
  min-height: 100vh;
  width: 100% !important;
  max-width: none !important;
  margin: spacers.$spacingNone !important;
  padding: spacers.$spacingNone !important;
  /* Remove grid layout do template original */
  display: block !important;
  grid-template-columns: none !important;
}

/* Header Styles using SCSS modules and mixins */
.main-header {
  @include mixins.header-responsive;
  background: linear-gradient(
    to bottom,
    colors.$colorPrimaryGradientStart 0%,
    colors.$colorPrimaryGradientMid 80%,
    colors.$colorPrimaryGradientEnd 100%
  );
  padding: spacers.$spacingNone;
  height: spacers.$headerHeight;
}

.logo-section {
  @include mixins.flex-center;
  height: 100%;
  width: spacers.$logoContainerWidth;
  flex-shrink: 0;
}

.logo {
  width: spacers.$logoSize;
  height: spacers.$logoSize;
  border-radius: borderRadius.$borderRadiusSm;
  display: block;
}

.main-nav {
  @include mixins.nav-responsive;
  margin-left: spacers.$spacingXxl;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 50%;
  bottom: 0;
}

.nav-item {
  @include mixins.flex-center;
  @include fonts.label(large);
  @include mixins.smooth-transition(background-color);
  color: colors.$colorTextWhite;
  text-decoration: none;
  padding: spacers.$spacingSm spacers.$spacingXl;
  border-right: 1px solid colors.$colorBorderLight;
  height: 100%;

  &:hover {
    background-color: colors.$colorBackgroundTransparent;
  }

  &.router-link-active {
    background-color: colors.$colorBackgroundTransparentActive;
    border-bottom: 2px solid colors.$colorBorderAccent;
  }
}

/* Responsive Design usando variáveis SCSS */
@media (max-width: 768px) {
  .main-nav {
    flex-wrap: wrap;
    margin-left: spacers.$spacingLg;
  }

  .nav-item {
    @include fonts.label(medium);
    padding: spacers.$spacingSm spacers.$spacingLg;
  }
}

@media (max-width: 480px) {
  .main-header {
    flex-direction: column;
    height: auto;
    padding-bottom: spacers.$spacingSm;
  }

  .logo-section {
    width: 100%;
    height: 60px;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
    margin-left: spacers.$spacingNone;
    position: static;
    transform: none;
    height: auto;
  }

  .nav-item {
    border-right: none;
    border-bottom: 1px solid colors.$colorBorderLight;
    padding: spacers.$spacingMd spacers.$spacingLg;

    &.router-link-active {
      border-bottom: 2px solid colors.$colorBorderAccent;
    }
  }
}
</style>
