<template>
  <div class="sobre-container">
    <main class="main-content">
      <h1>Sobre</h1>
      <p>Esta página será desenvolvida posteriormente.</p>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.sobre-container {
  width: 100%;
}

.main-content {
  padding: $contentPaddingMobile $contentPadding;
  @include content-container;
}

h1 {
  @include heading(large);
  color: $colorTextSecondary;
  margin-bottom: $cardGap;
}

p {
  @include paragraph(medium);
  color: $colorTextMuted;
}
</style>
