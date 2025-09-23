<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const selectedRegion = ref('São José dos Campos')
const selectedVelocity = ref('Velocidade')

const indices = ref({
  geral: 0,
  trafego: 0,
  seguranca: 0,
  acessibilidade: 0,
  infraestrutura: 0,
})

const isLoading = ref(false)
const lastUpdate = ref<string>('')
let intervalId: number | null = null

async function fetchIndices() {
  try {
    isLoading.value = true
    // This URL is currently pointing to a local JS test server.
    // Update it to the appropriate URL.
    const response = await fetch('http://localhost:3001/indices')
    const result = await response.json()

    if (result.success) {
      indices.value = result.data
      lastUpdate.value = new Date(result.timestamp).toLocaleTimeString()
    }
  } catch (error) {
    console.error('Erro ao buscar índices:', error)
  } finally {
    isLoading.value = false
  }
}

function getIndexClass(value: number): string {
  switch (value) {
    case 1:
      return 'green'
    case 2:
      return 'yellow'
    case 3:
      return 'orange'
    case 4:
      return 'red'
    default:
      return 'gray'
  }
}

onMounted(() => {
  fetchIndices()
  // Update interval to fetch data every 5 seconds
  intervalId = setInterval(fetchIndices, 5000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="home-container">
    <!-- Main Content -->
    <main class="home-content">
      <!-- Region Selector -->
      <div class="region-section">
        <label class="region-label">Região selecionada</label>
        <div class="region-selector">
          <select v-model="selectedRegion" class="region-dropdown">
            <option value="São José dos Campos">São José dos Campos</option>
          </select>
          <button class="export-btn">📊 Exportar relatório</button>
        </div>
      </div>

      <div class="main-content">
        <!-- Indices Section -->
        <div class="indices-section">
          <div class="indices-header">
            <h2>Índices</h2>
            <div class="status-info">
              <span v-if="isLoading" class="loading">🔄 Carregando...</span>
              <span v-else-if="lastUpdate" class="last-update">
                Última atualização: {{ lastUpdate }}
              </span>
              <span v-else class="no-update">Nenhuma atualização ainda</span>
            </div>
          </div>
          <div class="indices-container">
            <div :class="['index-card', 'large-card', getIndexClass(indices.geral)]">
              <div class="index-number">{{ indices.geral }}</div>
              <div class="index-name">Geral</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indices.trafego)]">
              <div class="index-number">{{ indices.trafego }}</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indices.seguranca)]">
              <div class="index-number">{{ indices.seguranca }}</div>
              <div class="index-name">Segurança</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indices.acessibilidade)]">
              <div class="index-number">{{ indices.acessibilidade }}</div>
              <div class="index-name">Acessibilidade</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indices.infraestrutura)]">
              <div class="index-number">{{ indices.infraestrutura }}</div>
              <div class="index-name">Infraestrutura</div>
            </div>
          </div>
        </div>

        <!-- Graphs Section -->
        <div class="graphs-section">
          <div class="graph-container">
            <h2>Mapa</h2>
            <div class="map-placeholder yellow-bg"></div>
          </div>
          <div class="graph-container">
            <select v-model="selectedVelocity" class="velocity-dropdown">
              <option value="Velocidade">Velocidade</option>
            </select>
            <div class="map-placeholder yellow-bg"></div>
          </div>
          <div class="graph-container">
            <h2>Gráfico</h2>
            <div class="map-placeholder yellow-bg"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  @include fonts.heading(xsmall);
  font-weight: 500;
  color: colors.$colorTextSecondary;
}

.home-container {
  width: 100%;
  overflow: auto;
}

/* Main Content */
.home-content {
  padding: spacers.$contentPaddingMobile spacers.$contentPadding;
  @include mixins.content-container;
}

/* Region Section */
.region-section {
  margin-bottom: spacers.$spacingNone;
}

.region-label {
  display: block;
  @include fonts.label(small);
  color: colors.$colorTextMuted;
}

.region-selector {
  @include mixins.flex-between;
}

.region-dropdown {
  @include mixins.dropdown-base;
  background-color: colors.$colorBackgroundWhite;
  border: spacers.$borderWidthThin solid colors.$colorBorderGray;
  border-radius: borderRadius.$borderRadiusSm;
  padding: spacers.$dropdownPadding;
  @include fonts.label(medium);
  min-width: spacers.$dropdownMinWidth;
  color: colors.$colorTextPrimary;
}

.export-btn {
  @include mixins.button-base;
  background-color: colors.$colorBackgroundWhite;
  border: spacers.$borderWidthThin solid colors.$colorBorderGray;
  border-radius: borderRadius.$borderRadiusSm;
  padding: spacers.$buttonPadding;
  @include fonts.label(small);
  gap: spacers.$spacingMd;
  color: colors.$colorTextPrimary;

  &:hover {
    background-color: colors.$colorBackgroundHover;
  }
}

.main-content {
  @include mixins.flex-column;
  gap: spacers.$contentPadding;
  background-color: colors.$colorBackgroundWhite;
  padding: spacers.$mainContentPadding;
  border-bottom-left-radius: borderRadius.$borderRadiusContent;
  border-bottom-right-radius: borderRadius.$borderRadiusContent;
  @include mixins.card-shadow(1);
}

/* Indices Section */
.indices-section {
  @include mixins.flex-column;
  gap: spacers.$spacingMd;
}

.indices-container {
  display: flex;
  gap: spacers.$indicesGap;
  align-items: flex-start;
  padding: spacers.$spacingLg;
  border-radius: borderRadius.$borderRadiusCard;
  box-shadow: inset spacers.$spacingNone spacers.$spacingNone spacers.$shadowInsetBlur
    colors.$colorShadowInset;
}

.indices-header {
  @include mixins.flex-column;
  gap: spacers.$spacingSm;
}

.index-card {
  @include mixins.index-card-base;
  background-color: colors.$colorBackgroundWhite;
  border-radius: borderRadius.$borderRadiusMd;
  @include mixins.card-shadow(1);
}

.large-card {
  width: spacers.$largeCardWidth;
  height: spacers.$largeCardHeight;
}

.small-card {
  width: spacers.$smallCardWidth;
  height: spacers.$smallCardHeight;
}

.index-number {
  @include fonts.heading(xxlarge);
  font-size: fonts.$fontSizeCustomXLarge;
  font-weight: bold;
  color: colors.$colorTextSecondary;
  margin-bottom: spacers.$spacingMd;
}

.small-card .index-number {
  @include fonts.heading(xlarge);
  font-size: fonts.$fontSizeCustomLarge;
  margin-bottom: spacers.$spacingSm;
}

.index-name {
  @include fonts.label(medium);
  color: colors.$colorTextTertiary;
  text-align: center;
}

.small-card .index-name {
  @include fonts.label(small);
}

/* Color variants */
.gray {
  border-bottom-color: colors.$colorStatusGray;
}

.green {
  border-bottom-color: colors.$colorStatusGreen;
}

.yellow {
  border-bottom-color: colors.$colorStatusYellow;
}

.orange {
  border-bottom-color: colors.$colorStatusOrange;
}

.red {
  border-bottom-color: colors.$colorStatusRed;
}

/* Graphs Section */
.graphs-section {
  height: spacers.$graphHeight;
  display: flex;
  gap: spacers.$cardGap;
}

.graph-container {
  flex: 1;
  display: flex;
  flex-direction: column;

  // Títulos h2 dentro dos graph-containers
  h2 {
    @include fonts.heading(xsmall);
    color: colors.$colorTextSecondary;
    margin-bottom: spacers.$spacingMd;
    font-weight: 500;
  }
}

/* Map Section */
.map-section {
  padding: spacers.$spacingXxl spacers.$spacingSm;
}

.map-header {
  @include mixins.flex-between;
  margin-bottom: spacers.$contentPaddingMobile;
}

.velocity-dropdown {
  @include mixins.dropdown-base;
  background-color: colors.$colorBackgroundWhite;
  border: spacers.$borderWidthThin solid colors.$colorBorderGray;
  border-radius: borderRadius.$borderRadiusSm;
  padding: spacers.$velocityDropdownPadding;
  @include fonts.label(small);
  font-size: inherit;
  color: colors.$colorTextPrimary;
}

.map-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: spacers.$cardGap;
  height: spacers.$mapHeight;
}

.map-placeholder {
  border-radius: borderRadius.$borderRadiusCard;
  width: 100%;
  height: 100%;
  min-height: spacers.$contentPadding * 4; // 160px mínimo

  // Garante que os placeholders sejam visíveis
  &.yellow-bg {
    background-color: colors.$colorBackgroundYellow;
  }
}

/* Responsive Design */
@media (max-width: spacers.$breakpointTablet) {
  .home-content {
    padding: spacers.$contentPaddingMobile;
  }

  .indices-container {
    flex-direction: column;
    align-items: center;
  }

  .small-indices {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: spacers.$largeCardWidth;
  }

  .map-container {
    grid-template-columns: 1fr;
    gap: spacers.$spacingLg;
  }

  .region-selector {
    flex-direction: column;
    gap: spacers.$spacingLg;
    align-items: flex-start;
  }
}
</style>
