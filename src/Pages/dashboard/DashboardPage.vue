<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";
import BaseChart from "@/components/BaseChart/BaseChart.vue";
import { indexService, type IndexData } from "@/services/IndexService";

const selectedRegion = ref("São José dos Campos");
const selectedVelocity = ref("Velocidade");
const selectedVehicleType = ref("Carros");

const isLoading = ref(false);
const lastUpdate = ref<string>("");
const refreshTrigger = ref(0);
const indexData = ref<IndexData | null>(null);
let intervalId: number | null = null;

async function fetchIndexData() {
  try {
    const data = await indexService.getCityIndex(5);
    indexData.value = data;
    return true; // Success
  } catch {
    indexData.value = null;
    return false; // Failed
  }
}

async function refreshAllData() {
  isLoading.value = true;
  refreshTrigger.value++;

  // Try to fetch index data
  const indexDataSuccess = await fetchIndexData();

  // Update lastUpdate based on success of the operation
  if (indexDataSuccess) {
    lastUpdate.value = new Date().toLocaleTimeString();
  } else {
    lastUpdate.value = "Erro de conexão com o servidor";
  }

  isLoading.value = false;
}

function handleChartDataUpdated() {
  // Charts update successfully, but we don't override lastUpdate
  // since we want to show the unified update time
}

function handleChartLoadingChange() {
  // Chart loading state changes, but we manage loading centrally
}

function handleChartError() {
  // Chart errors don't override the main lastUpdate
  // The unified refreshAllData will handle error states
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
  // Update all data every 10 seconds
  intervalId = setInterval(refreshAllData, 10000);
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
        </div>
      </div>
      <div class="main-content">
        <div class="graphs-section">
          <div class="info-link-container">
             <div class="status-info">
              <span v-if="isLoading" class="loading">🔄 Carregando...</span>
              <span v-else-if="lastUpdate" class="last-update">
                Última atualização: {{ lastUpdate }}
              </span>
              <span v-else class="no-update">Nenhuma atualização ainda</span>
            </div>
            <a href="#" class="info-link">Como as informações são calculadas?</a>
          </div>
        </div>
        <div class="indices-section">
          <div class="indices-header">
            <h2>Índices</h2>
          </div>
          <div class="indices-container">
            <div :class="['index-card', 'large-card', getIndexClass(indexData?.combinedIndex || 0)]">
              <div class="index-number">{{ indexData?.combinedIndex || 0 }}</div>
              <div class="index-name">Geral</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indexData?.trafficIndex || 0)]">
              <div class="index-number">{{ indexData?.trafficIndex || 0 }}</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div :class="['index-card', 'small-card', getIndexClass(indexData?.securityIndex || 0)]">
              <div class="index-number">{{ indexData?.securityIndex || 0 }}</div>
              <div class="index-name">Segurança</div>
            </div>
          </div>
        </div>
        <div class="graphs-section">
          <div class="graph-container graph-container-size-large vehicles-volume-container">
            <div class="graph-container-header">
              <h2>Velocidade dos veículos por horário</h2>
              <select v-model="selectedVelocity" class="velocity-dropdown">
                <option value="Velocidade">Velocidade</option>
              </select>
            </div>
            <div class="chart-container">
              <BaseChart
                type="line"
                title="Volume de veículos"
                api-endpoint="/grafico-velocidade"
                :refresh-trigger="refreshTrigger"
                @data-updated="handleChartDataUpdated"
                @loading-change="handleChartLoadingChange"
                @error="handleChartError"
              />
            </div>
          </div>
          <div class="graph-container">
            <div class="graph-container-header">
              <h2>Porcentagem de veículos do dia</h2>
            </div>
            <div class="chart-container">
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
        <div class="graphs-section">
          <div class="graph-container graph-container-size-large vehicles-volume-container">
            <div class="graph-container-header">
              <h2>Volume de Veículos</h2>
              <select v-model="selectedVehicleType" class="velocity-dropdown">
                <option value="Carros">Carros</option>
                <option value="Caminhões">Caminhões</option>
                <option value="Motocicletas">Motocicletas</option>
              </select>
            </div>
            <div class="chart-container">
              <BaseChart
                type="line"
                title="Volume de veículos"
                api-endpoint="/grafico-velocidade"
                :refresh-trigger="refreshTrigger"
                @data-updated="handleChartDataUpdated"
                @loading-change="handleChartLoadingChange"
                @error="handleChartError"
              />
            </div>
          </div>
          <div class="graph-container">
            <h2>Mapa</h2>
            <div class="image-container">
              <img :src="mapaSjc" alt="Mapa de São José dos Campos" class="graph-image" />
            </div>
          </div>
        </div>
        <div class="indices-section">
          <div class="indices-header">
            <h2>Informações Diárias</h2>
          </div>
          <div class="daily-infos-container">
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <div class="index-name">Leituras totais</div>
              <div class="index-number">99999</div>
              <div class="comparison-text">+30% comparado a ontem</div>
            </div>
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <div class="index-name">Velocidade média geral</div>
              <div class="index-number">150 km/h</div>
              <div class="comparison-text">-15% comparado a ontem</div>
            </div>
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <h3>Velocidade mais rápida</h3>
              <a>200 km/h</a>
              <h3>Local</h3>
              <a>Av. Antônio Antônio (região Sul)</a>
              <h3>Hora</h3>
              <a>12:00:00</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<style lang="scss" scoped src="@/Pages/dashboard/DashboardPageStyle.scss">
</style>
