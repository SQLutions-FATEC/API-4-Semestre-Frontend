<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";
import BaseChart from "@/components/BaseChart/BaseChart.vue";

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
const refreshTrigger = ref(0);
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

async function refreshAllData() {
  refreshTrigger.value++;
  await fetchIndices();
}

function handleChartDataUpdated(timestamp: string) {
  lastUpdate.value = new Date(timestamp).toLocaleTimeString();
}

function handleChartLoadingChange(loading: boolean) {
  if (!loading && isLoading.value) {
    setTimeout(() => {
      isLoading.value = false;
    }, 100);
  }
}

function handleChartError(errorMessage: string) {
  lastUpdate.value = errorMessage;
  isLoading.value = false;
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
  refreshAllData();
  // Update interval to fetch data every 2 seconds
  intervalId = setInterval(refreshAllData, 2000);
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
            <BaseChart
              type="line"
              title="Velocidade dos veículos por horário"
              api-endpoint="/grafico-velocidade"
              :refresh-trigger="refreshTrigger"
              @data-updated="handleChartDataUpdated"
              @loading-change="handleChartLoadingChange"
              @error="handleChartError"
            />
          </div>
          <div class="graph-container">
            <BaseChart
              type="doughnut"
              title="Percentual de veículos do dia"
              api-endpoint="/grafico-porcentagem"
              :refresh-trigger="refreshTrigger"
              @data-updated="handleChartDataUpdated"
              @loading-change="handleChartLoadingChange"
              @error="handleChartError"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/gestor/HomePageStyle.scss">
</style>
