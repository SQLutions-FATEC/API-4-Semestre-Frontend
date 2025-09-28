<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";

const selectedRegion = ref("São José dos Campos");

const indices = ref({
  combinedIndex: 1,
  trafficIndex: 1,
  securityIndex: 1,
  acessibilidade: 1,
  infraestrutura: 1,
});

const informacoes = ref([
  {
    descricao: "Provável trânsito intenso na Av. dos Astronautas",
    tipo: "trafego",
  },
  {
    descricao: "Semáforo com defeito na Rua XV de Novembro",
    tipo: "infraestrutura",
  },
  {
    descricao: "Obra em andamento na Via Dutra - km 142",
    tipo: "infraestrutura",
  },
]);

let intervalId: number | null = null;

async function fetchIndices() {
  try {
    const response = await fetch("http://localhost:5432/indexes?minutes=5");
    const result = await response.json();

    if (result.success) {
      indices.value = result.data;
    } else {
      //para caso o backend de errado
      setDefaultIndices();
    }
  } catch {
    // Se houver erro na requisiçã
    setDefaultIndices();
    alert("Erro ao buscar índices - valores padrão aplicados");
  }
}

function setDefaultIndices() {
  indices.value = {
    combinedIndex: 1,
    trafficIndex: 1,
    securityIndex: 1,
    acessibilidade: 2,
    infraestrutura: 1,
  };
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

  //5 min
  intervalId = setInterval(fetchIndices, 300000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
<template>
  <div class="dashboard-container">
    <main class="dashboard-content">
      <div class="region-section">
        <label class="region-label">Região selecionada</label>
        <div class="region-selector">
          <select v-model="selectedRegion" class="region-dropdown">
            <option value="São José dos Campos">São José dos Campos</option>
          </select>
          <button class="export-btn">📊 Exportar relatório</button>
        </div>
      </div>

      <div class="dashboard-layout">
        <div class="left-column">
          <div class="geral-section">
            <div :class="['index-card', 'geral-card', getIndexClass(indices.combinedIndex)]">
              <div class="index-number">{{ indices.combinedIndex }}</div>
              <div class="index-name">Geral</div>
            </div>
          </div>
          <div class="map-section">
            <h2>Mapa</h2>
            <div class="image-container">
              <img :src="mapaSjc" alt="Mapa de São José dos Campos" class="map-image" />
            </div>
          </div>
        </div>

        <!-- Coluna Central: Índices -->
        <div class="center-column">
          <div class="indices-header">
            <h2>Índices</h2>
          </div>
          <div class="indices-grid">
            <div :class="['index-card', 'medium-card', getIndexClass(indices.trafficIndex)]">
              <div class="index-number">{{ indices.trafficIndex }}</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.securityIndex)]">
              <div class="index-number">{{ indices.securityIndex }}</div>
              <div class="index-name">Segurança</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.acessibilidade)]">
              <div class="index-number">{{ indices.acessibilidade }}</div>
              <div class="index-name">Acessibilidade</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.infraestrutura)]">
              <div class="index-number">{{ indices.infraestrutura }}</div>
              <div class="index-name">Infraestrutura</div>
            </div>
          </div>
        </div>

        <!-- Coluna Direita: Informações -->
        <div class="right-column">
          <h2>Informações</h2>
          <div class="info-cards">
            <div v-for="(info, index) in informacoes" :key="index" class="info-card">
              <div class="info-description">{{ info.descricao }}</div>
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

.dashboard-container {
  width: 100%;
  overflow: auto;
}

/* Main Content */
.dashboard-content {
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

/* Layout em 3 colunas */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $contentPadding;
  background-color: $colorBackgroundWhite;
  padding: $mainContentPadding;
  border-bottom-left-radius: $borderRadiusContent;
  border-bottom-right-radius: $borderRadiusContent;
  @include card-shadow(1);
}

/* Coluna Esquerda */
.left-column {
  @include flex-column;
  gap: $spacingLg;
}

.geral-section {
  display: flex;
  justify-content: center;
}

.geral-card {
  width: 200px;
  height: 200px;
}

.map-section {
  @include flex-column;
  gap: $spacingMd;

  h2 {
    text-align: center;
  }
}

.map-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  border-radius: $borderRadiusCard;
}

/* Coluna Central */
.center-column {
  @include flex-column;
  gap: $spacingMd;
  height: 100%;
}

.indices-header {
  @include flex-column;
  gap: $spacingSm;
  text-align: center;
}

.indices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacingMd;
  justify-items: stretch;
  align-items: stretch;
  height: 100%;
  flex: 1;
}

.medium-card {
  width: 100%;
  height: 100%;
  min-height: 180px;
  max-height: 220px;
}

/* Coluna Direita */
.right-column {
  @include flex-column;
  gap: $spacingMd;

  h2 {
    text-align: center;
  }
}

.info-cards {
  @include flex-column;
  gap: $spacingMd;
}

.info-card {
  background-color: $colorBackgroundWhite;
  border-radius: $borderRadiusMd;
  padding: $spacingLg;
  @include card-shadow(1);
  border-left: 4px solid $colorStatusYellow;
  transition: all 0.3s ease;

  &:hover {
    @include card-shadow(2);
    transform: translateY(-2px);
  }
}

.info-description {
  @include label(medium);
  color: $colorTextPrimary;
  line-height: 1.5;
  font-weight: 500;
}

/* Cards base */
.index-card {
  @include index-card-base;
  background-color: $colorBackgroundWhite;
  border-radius: $borderRadiusMd;
  @include card-shadow(1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacingSm;
  border-bottom: 4px solid;
}

.index-number {
  @include heading(xxlarge);
  font-size: $fontSizeCustomXLarge;
  font-weight: bold;
  color: $colorTextSecondary;
}

.medium-card .index-number {
  @include heading(xxlarge);
  font-size: 4rem;
  font-weight: bold;
}

.index-name {
  @include label(medium);
  color: $colorTextTertiary;
  text-align: center;
}

.medium-card .index-name {
  @include label(medium);
  font-size: 1rem;
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

.image-container {
  border-radius: $borderRadiusCard;
  overflow: hidden;
  @include card-shadow(1);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Status info */
.status-info {
  @include label(small);
  text-align: center;

  .loading {
    color: $colorStatusYellow;
  }

  .last-update {
    color: $colorTextMuted;
  }

  .no-update {
    color: $colorTextMuted;
  }
}

/* Responsive Design */
@media (max-width: $breakpointTablet) {
  .dashboard-content {
    padding: $contentPaddingMobile;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: $spacingXl;
  }

  .indices-grid {
    grid-template-columns: 1fr 1fr;
    gap: $spacingSm;
    height: auto;
  }

  .medium-card {
    width: 100%;
    height: 140px;
    min-height: 120px;
  }

  .medium-card .index-number {
    font-size: 2.5rem;
  }

  .geral-card {
    width: 150px;
    height: 150px;
  }

  .region-selector {
    flex-direction: column;
    gap: $spacingLg;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .indices-grid {
    grid-template-columns: 1fr;
    gap: $spacingMd;
  }

  .medium-card {
    width: 100%;
    height: 140px;
  }

  .medium-card .index-number {
    font-size: 2.8rem;
  }
}
</style>
