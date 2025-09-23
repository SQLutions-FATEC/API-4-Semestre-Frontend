<template>
  <div class="mapa-container">
    <main class="main-content">
      <h1>Página do Mapa</h1>
      <p>Esta página será desenvolvida posteriormente.</p>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.mapa-container {
  width: 100%;
}

.main-content {
  padding: spacers.$contentPaddingMobile spacers.$contentPadding;
  @include mixins.content-container;
}

h1 {
  @include fonts.heading(large);
  color: colors.$colorTextSecondary;
  margin-bottom: spacers.$cardGap;
}

p {
  @include fonts.paragraph(medium);
  color: colors.$colorTextMuted;
}
</style>
