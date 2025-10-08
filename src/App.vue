<script setup lang="ts">
import { RouterView } from "vue-router";
import TheNavbar from "@/components/NavBar/TheNavbar.vue";
</script>

<template>
  <div id="app">
    <TheNavbar />
    <RouterView />
  </div>
</template>

<style lang="scss">
* {
  margin: $spacingNone;
  padding: $spacingNone;
  box-sizing: border-box;
}

html,
body {
  margin: $spacingNone;
  padding: $spacingNone;
  width: 100%;
  height: 100%;
  font-family: $fontFamily, sans-serif;
  line-height: 1.6;
  color: $colorTextPrimary;
  background-color: $colorBackgroundLight;
  display: block !important;
  place-items: unset !important;
}

#app {
  min-height: 100vh;
  width: 100% !important;
  max-width: none !important;
  margin: $spacingNone !important;
  padding: $spacingNone !important;
  display: block !important;
  grid-template-columns: none !important;
}
</style>
