<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";
import BaseChart from "@/components/BaseChart/BaseChart.vue";
import { indexService, type IndexData } from "@/services/IndexService";
import readingService, { type VehicleTypeHourlyData } from "@/services/ReadingService";

const selectedRegion = ref("São José dos Campos");
const selectedVelocity = ref("Velocidade");
const selectedVehicleType = ref("Todos");

const isLoading = ref(false);
const lastUpdate = ref<string>("");
const refreshTrigger = ref(0);
const indexData = ref<IndexData | null>(null);
const vehicleData = ref<VehicleTypeHourlyData[] | null>(null);
const availableRegions = ref<string[]>([
  "São José dos Campos",
  "Norte",
  "Sul",
  "Leste",
  "Oeste",
  "Centro",
  "Sudeste",
  "São Francisco Xavier"
]);
const availableVehicleTypes = ref<string[]>([
  "Todos",
  "Caminhão grande",
  "Camionete",
  "Carro",
  "Indefinido",
  "Moto",
  "Ônibus",
  "Van"
]);
let intervalId: number | null = null;

async function fetchVehicleData() {
  try {
    // Data fixa: 2025-08-05, apenas variando as horas
    const fixedDate = "2025-08-05";
    const startTime = `${fixedDate}T00:00:00`; // Início do dia
    const endTime = `${fixedDate}T23:59:59`;   // Final do dia

    const params = {
      startTime,
      endTime,
      ...(selectedVehicleType.value !== "Todos" && {
        vehicleType: selectedVehicleType.value
      }),
      ...(selectedRegion.value !== "São José dos Campos" && {
        regions: [selectedRegion.value]
      })
    };

    const response = await readingService.getHourlyCount(params);
    vehicleData.value = response.data;

    return true;
  } catch {
    vehicleData.value = null;
    return false;
  }
}

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

  const [indexDataSuccess, vehicleDataSuccess] = await Promise.all([
    fetchIndexData(),
    fetchVehicleData()
  ]);

  if (indexDataSuccess || vehicleDataSuccess) {
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

const chartDataForVolume = computed(() => {
  if (!vehicleData.value || vehicleData.value.length === 0) return null;

  const selectedData = selectedVehicleType.value === "Todos"
    ? vehicleData.value.find(item => item.vehicleType === "Todos")
    : vehicleData.value[0];

  if (!selectedData) return null;

  const labels = selectedData.data.map(item => {
    const date = new Date(item.hour);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  const data = selectedData.data.map(item => item.vehicleCount);

  const getVehicleColor = (vehicleType: string) => {
    const colors = {
      "Todos": { bg: "rgba(107, 114, 128, 0.7)", border: "#6b7280" },
      "Carro": { bg: "rgba(59, 130, 246, 0.7)", border: "#3b82f6" },
      "Moto": { bg: "rgba(34, 197, 94, 0.7)", border: "#22c55e" },
      "Ônibus": { bg: "rgba(239, 68, 68, 0.7)", border: "#ef4444" },
      "Caminhão grande": { bg: "rgba(168, 85, 247, 0.7)", border: "#a855f7" },
      "Camionete": { bg: "rgba(245, 158, 11, 0.7)", border: "#f59e0b" },
      "Van": { bg: "rgba(236, 72, 153, 0.7)", border: "#ec4899" },
      "Indefinido": { bg: "rgba(156, 163, 175, 0.7)", border: "#9ca3af" }
    };
    return colors[vehicleType as keyof typeof colors] || colors["Indefinido"];
  };

  const color = getVehicleColor(selectedVehicleType.value);

  return {
    labels,
    datasets: [{
      label: selectedVehicleType.value,
      data,
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 2
    }]
  };
});

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

watch(selectedVehicleType, () => {
  fetchVehicleData();
});

onMounted(() => {
  refreshAllData();
  // Update all data every 10 minutes
  intervalId = setInterval(refreshAllData, 600000);
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
          <select v-model="selectedRegion" class="region-dropdown" @change="refreshAllData">
            <option
              v-for="region in availableRegions"
              :key="region"
              :value="region"
            >
              {{ region }}
            </option>
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
                <option
                  v-for="vehicleType in availableVehicleTypes"
                  :key="vehicleType"
                  :value="vehicleType"
                >
                  {{ vehicleType }}
                </option>
              </select>
            </div>
            <div class="chart-container">
              <div v-if="chartDataForVolume" class="volume-chart">
                <BaseChart
                  type="bar"
                  title="Volume de veículos por horário"
                  api-endpoint=""
                  :chart-data="chartDataForVolume"
                  :refresh-trigger="refreshTrigger"
                  @data-updated="handleChartDataUpdated"
                  @loading-change="handleChartLoadingChange"
                  @error="handleChartError"
                />
              </div>
              <div v-else class="chart-loading">
                <span>Carregando dados do volume...</span>
              </div>
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
