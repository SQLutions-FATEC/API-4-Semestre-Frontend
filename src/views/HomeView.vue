<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";
import graficoVelocidade from "@/assets/grafico-velocidade.png";
import graficoPorcentagem from "@/assets/grafico-porcentagem.png";

const selectedRegion = ref("São José dos Campos");
const selectedVelocity = ref("Velocidade");

const indices = ref({
  geral: 0,
  trafego: 0,
  seguranca: 0,
  acessibilidade: 0,
  infraestrutura: 0,
});

const isLoading = ref(false);
const lastUpdate = ref<string>("");
let intervalId: number | null = null;

async function fetchIndices() {
  try {
    isLoading.value = true;
    // This URL is currently pointing to a local JS test server.
    // Update it to the appropriate URL.
    const response = await fetch("http://localhost:3001/indices");
    const result = await response.json();

    if (result.success) {
      indices.value = result.data;
      lastUpdate.value = new Date(result.timestamp).toLocaleTimeString();
    }
  } catch {
    lastUpdate.value = "Erro de conexão - tentando novamente...";
  } finally {
    isLoading.value = false;
  }
}

function getIndexClass(value: number): string {
  switch (value) {
    case 1:
      return "green";
    case 2:
      return "yellow";
    case 3:
      return "orange";
    case 4:
      return "red";
    default:
      return "gray";
  }
}

onMounted(() => {
  fetchIndices();
  // Update interval to fetch data every 5 seconds
  intervalId = setInterval(fetchIndices, 5000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="home-container">
    <main class="home-content">
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
        <div class="graphs-section">
          <div class="graph-container">
            <h2>Mapa</h2>
            <div class="image-container">
              <img :src="mapaSjc" alt="Mapa de São José dos Campos" class="graph-image" />
            </div>
          </div>
          <div class="graph-container graph-container-middle">
            <select v-model="selectedVelocity" class="velocity-dropdown">
              <option value="Velocidade">Velocidade</option>
            </select>
            <div class="image-container">
              <img :src="graficoVelocidade" alt="Gráfico de Velocidade" class="graph-image" />
            </div>
          </div>
          <div class="graph-container">
            <h2>Gráfico</h2>
            <div class="image-container">
              <img :src="graficoPorcentagem" alt="Gráfico de Porcentagem" class="graph-image" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
h2 {
  @include heading(xsmall);
  font-weight: 500;
  color: $colorTextSecondary;
}

.home-container {
  width: 100%;
  overflow: auto;
}

/* Main Content */
.home-content {
  padding: $contentPaddingMobile $contentPadding;
  @include content-container;
}

/* Region Section */
.region-section {
  margin-bottom: $spacingNone;
}

.region-label {
  display: block;
  @include label(small);
  color: $colorTextMuted;
}

.region-selector {
  @include flex-between;
}

.region-dropdown {
  @include dropdown-base;
  background-color: $colorBackgroundWhite;
  border: $borderWidthThin solid $colorBorderGray;
  border-radius: $borderRadiusSm;
  padding: $dropdownPadding;
  @include label(medium);
  min-width: $dropdownMinWidth;
  color: $colorTextPrimary;
}

.export-btn {
  @include button-base;
  background-color: $colorBackgroundWhite;
  border: $borderWidthThin solid $colorBorderGray;
  border-radius: $borderRadiusSm;
  padding: $buttonPadding;
  @include label(small);
  gap: $spacingMd;
  color: $colorTextPrimary;

  &:hover {
    background-color: $colorBackgroundHover;
  }
}

.main-content {
  @include flex-column;
  gap: $contentPadding;
  background-color: $colorBackgroundWhite;
  padding: $mainContentPadding;
  border-bottom-left-radius: $borderRadiusContent;
  border-bottom-right-radius: $borderRadiusContent;
  @include card-shadow(1);
}

/* Indices Section */
.indices-section {
  @include flex-column;
  gap: $spacingMd;
}

.indices-container {
  display: flex;
  gap: $indicesGap;
  align-items: flex-start;
  padding: $spacingLg;
  border-radius: $borderRadiusCard;
  box-shadow: inset $spacingNone $spacingNone $shadowInsetBlur
    $colorShadowInset;
}

.indices-header {
  @include flex-column;
  gap: $spacingSm;
}

.index-card {
  @include index-card-base;
  background-color: $colorBackgroundWhite;
  border-radius: $borderRadiusMd;
  @include card-shadow(1);
}

.large-card {
  width: $largeCardWidth;
  height: $largeCardHeight;
}

.small-card {
  width: $smallCardWidth;
  height: $smallCardHeight;
}

.index-number {
  @include heading(xxlarge);
  font-size: $fontSizeCustomXLarge;
  font-weight: bold;
  color: $colorTextSecondary;
  margin-bottom: $spacingMd;
}

.small-card .index-number {
  @include heading(xlarge);
  font-size: $fontSizeCustomLarge;
  margin-bottom: $spacingSm;
}

.index-name {
  @include label(medium);
  color: $colorTextTertiary;
  text-align: center;
}

.small-card .index-name {
  @include label(small);
}

/* Color variants */
.gray {
  border-bottom-color: $colorStatusGray;
}

.green {
  border-bottom-color: $colorStatusGreen;
}

.yellow {
  border-bottom-color: $colorStatusYellow;
}

.orange {
  border-bottom-color: $colorStatusOrange;
}

.red {
  border-bottom-color: $colorStatusRed;
}

/* Graphs Section */
.graphs-section {
  display: flex;
  gap: $cardGap;
  align-items: flex-start;
  // Remove altura fixa para permitir que as imagens definam o tamanho
}

.graph-container {
  @include flex-column;
  flex: 1;
  gap: $spacingMd;
  align-items: center;

  h2 {
    @include heading(xsmall);
    color: $colorTextSecondary;
    font-weight: 500;
    text-align: center;
    width: 100%;
  }
}

.graph-container-middle {
  flex: 1.5;
}

/* Map Section */
.map-section {
  padding: $spacingXxl $spacingSm;
}

.map-header {
  @include flex-between;
  margin-bottom: $contentPaddingMobile;
}

.velocity-dropdown {
  @include dropdown-base;
  background-color: $colorBackgroundWhite;
  border: $borderWidthThin solid $colorBorderGray;
  border-radius: $borderRadiusSm;
  padding: $velocityDropdownPadding;
  @include label(small);
  font-size: inherit;
  color: $colorTextPrimary;
  align-self: center;
}

.map-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $cardGap;
  height: $mapHeight;
}

.image-container {
  border-radius: $borderRadiusCard;
  overflow: hidden;
  @include card-shadow(1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.graph-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: $borderRadiusCard;
}

/* Responsive Design */
@media (max-width: $breakpointTablet) {
  .home-content {
    padding: $contentPaddingMobile;
  }

  .indices-container {
    flex-direction: column;
    align-items: center;
  }

  .small-indices {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: $largeCardWidth;
  }

  .map-container {
    grid-template-columns: 1fr;
    gap: $spacingLg;
  }

  .region-selector {
    flex-direction: column;
    gap: $spacingLg;
    align-items: flex-start;
  }

  .graphs-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
