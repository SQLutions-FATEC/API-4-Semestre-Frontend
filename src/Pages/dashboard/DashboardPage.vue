<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import mapaSjc from "@/assets/mapa-sjc.png";
import BaseChart from "@/components/BaseChart/BaseChart.vue";
import { indexService, type IndexData } from "@/services/IndexService";
import readingService from "@/services/ReadingService";
import dailyDataService, { type DailyComparison } from "@/services/DailyDataService";
import timeService, { type TimeData } from "@/services/TimeService";
import GraphModal from "@/components/Modals/GraphModal.vue";
import type { ReadingAggregate } from "@/entities/ReadingAggregate";

const modalOpen = ref(false);

function openModal() {
  modalOpen.value = true;
}

function handleModalClose() {
  modalOpen.value = false;
}

const selectedRegion = ref("São José dos Campos");
const selectedVehicleType = ref("Todos");

const startDateTime = ref<string>("");
const endDateTime = ref<string>("");
const serverTimeData = ref<TimeData | null>(null);
const isDateTimeFilterActive = ref(false);
const userHasModifiedDateTime = ref(false);

const isLoadingIndex = ref(false);
const isLoadingVehicleData = ref(false);
const isLoadingDailyData = ref(false);
const lastUpdate = ref<string>("");
const refreshTrigger = ref(0);
const indexData = ref<IndexData | null>(null);
const vehicleData = ref<ReadingAggregate[] | null>(null);
const dailyData = ref<DailyComparison | null>(null);

const indexError = ref<string>("");
const vehicleDataError = ref<string>("");
const dailyDataError = ref<string>("");

let currentIndexController: AbortController | null = null;
let currentVehicleController: AbortController | null = null;
let currentDailyController: AbortController | null = null;

const VEHICLE_COLORS = {
  Carro: { bg: "rgba(59, 130, 246, 0.7)", border: "#3b82f6" }, // Azul
  Moto: { bg: "rgba(34, 197, 94, 0.7)", border: "#22c55e" }, // Verde
  "Caminhão grande": { bg: "rgba(239, 68, 68, 0.7)", border: "#ef4444" }, // Vermelho
  Ônibus: { bg: "rgba(245, 158, 11, 0.7)", border: "#f59e0b" }, // Amarelo/Laranja
  Camionete: { bg: "rgba(168, 85, 247, 0.7)", border: "#a855f7" }, // Roxo
  Van: { bg: "rgba(236, 72, 153, 0.7)", border: "#ec4899" }, // Rosa
  Indefinido: { bg: "rgba(107, 114, 128, 0.7)", border: "#6b7280" }, // Cinza
  Todos: { bg: "rgba(107, 114, 128, 0.7)", border: "#6b7280" }, // Cinza
} as const;

const getVehicleColorWithOpacity = (vehicleType: string, opacity: number = 0.7) => {
  const color =
    VEHICLE_COLORS[vehicleType as keyof typeof VEHICLE_COLORS] || VEHICLE_COLORS["Indefinido"];
  return {
    bg: color.bg.replace(/0\.\d+/, opacity.toString()),
    border: color.border,
  };
};

const availableRegions = ref<string[]>([
  "São José dos Campos",
  "Norte",
  "Sul",
  "Leste",
  "Oeste",
  "Centro",
  "Sudeste",
  "São Francisco Xavier",
]);
const availableVehicleTypes = ref<string[]>([
  "Todos",
  "Caminhão grande",
  "Camionete",
  "Carro",
  "Indefinido",
  "Moto",
  "Ônibus",
  "Van",
]);
let intervalId: number | null = null;

async function loadServerTimeData() {
  try {
    serverTimeData.value = await timeService.getServerTime();

    if (serverTimeData.value && !userHasModifiedDateTime.value) {
      initializeDateTimePickers();
    }
  } catch {
    // Erro silencioso - continuar com comportamento padrão
  }
}

function initializeDateTimePickers() {
  if (!serverTimeData.value) return;

  endDateTime.value = formatDateTimeLocal(serverTimeData.value.currentServerTime);

  const endDate = new Date(serverTimeData.value.currentServerTime);
  const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
  startDateTime.value = formatDateTimeLocal(startDate.toISOString());

  isDateTimeFilterActive.value = true;
}

function formatDateTimeLocal(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getQueryParams() {
  if (startDateTime.value && endDateTime.value) {
    const start = new Date(startDateTime.value);
    const end = new Date(endDateTime.value);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

    const indexMinutes = userHasModifiedDateTime.value ? Math.min(diffInMinutes, 1440) : 5;
    const indexTimestamp = userHasModifiedDateTime.value
      ? timeService.convertDateTimeToServerFormat(endDateTime.value)
      : undefined;

    const dataMinutes = diffInMinutes;
    const dataTimestamp = timeService.convertDateTimeToServerFormat(endDateTime.value);

    return {
      indexMinutes,
      indexTimestamp,
      dataMinutes,
      dataTimestamp,
    };
  }

  return {
    indexMinutes: 5,
    indexTimestamp: undefined,
    dataMinutes: 1440,
    dataTimestamp: undefined,
  };
}

watch(startDateTime, (newStart, oldStart) => {
  if (newStart !== oldStart && oldStart !== undefined && oldStart !== "") {
    userHasModifiedDateTime.value = true;
    indexError.value = "";
    vehicleDataError.value = "";
    refreshDataWithoutDaily();
  }
});

watch(endDateTime, (newEnd, oldEnd) => {
  if (newEnd !== oldEnd && oldEnd !== undefined && oldEnd !== "") {
    userHasModifiedDateTime.value = true;
    indexError.value = "";
    vehicleDataError.value = "";
    refreshDataWithoutDaily();
  }
});

function resetDateTimeFilters() {
  userHasModifiedDateTime.value = false;
  indexError.value = "";
  vehicleDataError.value = "";
  dailyDataError.value = "";
  initializeDateTimePickers();
  refreshAllData();
}

async function fetchVehicleData() {
  if (currentVehicleController) {
    currentVehicleController.abort();
  }

  currentVehicleController = new AbortController();
  const signal = currentVehicleController.signal;

  isLoadingVehicleData.value = true;
  vehicleDataError.value = "";

  try {
    const queryParams = getQueryParams();
    const params: { minutes: number; timestamp?: string } = {
      minutes: queryParams.dataMinutes,
    };

    if (queryParams.dataTimestamp) {
      params.timestamp = queryParams.dataTimestamp;
    }

    let response;
    if (selectedRegion.value === "São José dos Campos") {
      response = await readingService.getCityData({
        ...params,
        signal,
      });
    } else {
      response = await readingService.getRegionData({
        ...params,
        regions: [selectedRegion.value],
        signal,
      });
    }

    if (signal.aborted) {
      return false;
    }

    vehicleData.value = response.data;
    lastUpdate.value = new Date().toLocaleTimeString();
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }

    vehicleData.value = null;

    // Verificar tipo de erro
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        vehicleDataError.value = "Não há dados para a região e o período selecionados";
      } else if (axiosError.response?.status === 500) {
        vehicleDataError.value = "Houve um erro ao buscar os dados";
      } else {
        vehicleDataError.value = "Erro de conexão com o servidor";
      }
    } else {
      vehicleDataError.value = "Erro de conexão com o servidor";
    }

    return false;
  } finally {
    isLoadingVehicleData.value = false;
    if (currentVehicleController?.signal === signal) {
      currentVehicleController = null;
    }
  }
}

async function fetchIndexData() {
  if (currentIndexController) {
    currentIndexController.abort();
  }

  currentIndexController = new AbortController();
  const signal = currentIndexController.signal;

  isLoadingIndex.value = true;
  indexError.value = "";

  try {
    const queryParams = getQueryParams();
    let data: IndexData;

    if (userHasModifiedDateTime.value) {
      if (selectedRegion.value === "São José dos Campos") {
        data = await indexService.getCityIndex({
          minutes: queryParams.indexMinutes,
          timestamp: queryParams.indexTimestamp,
          signal,
        });
      } else {
        data = await indexService.getRegionIndex(selectedRegion.value, {
          minutes: queryParams.indexMinutes,
          timestamp: queryParams.indexTimestamp,
          signal,
        });
      }
    } else {
      let foundData = false;
      let lastError: unknown = null;

      for (let minutes = 5; minutes <= 30; minutes += 5) {
        try {
          if (selectedRegion.value === "São José dos Campos") {
            data = await indexService.getCityIndex({
              minutes,
              timestamp: queryParams.indexTimestamp,
              signal,
            });
          } else {
            data = await indexService.getRegionIndex(selectedRegion.value, {
              minutes,
              timestamp: queryParams.indexTimestamp,
              signal,
            });
          }
          foundData = true;
          break;
        } catch (error: unknown) {
          lastError = error;
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as { response?: { status: number } };
            if (axiosError.response?.status !== 404) {
              break;
            }
          } else {
            break;
          }
        }
      }

      if (!foundData) {
        throw lastError;
      }
    }

    if (signal.aborted) {
      return false;
    }

    indexData.value = data!;
    lastUpdate.value = new Date().toLocaleTimeString();
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }

    indexData.value = null;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        if (userHasModifiedDateTime.value) {
          indexError.value = "Não há dados para a região e o período selecionados";
        } else {
          indexError.value = "Não há dados para a região nos últimos 30 minutos";
        }
      } else if (axiosError.response?.status === 500) {
        indexError.value = "Houve um erro ao buscar os dados";
      } else {
        indexError.value = "Erro de conexão com o servidor";
      }
    } else {
      indexError.value = "Erro de conexão com o servidor";
    }

    return false;
  } finally {
    isLoadingIndex.value = false;
    if (currentIndexController?.signal === signal) {
      currentIndexController = null;
    }
  }
}

async function fetchDailyData() {
  if (currentDailyController) {
    currentDailyController.abort();
  }

  currentDailyController = new AbortController();
  const signal = currentDailyController.signal;

  isLoadingDailyData.value = true;
  dailyDataError.value = "";

  try {
    const data = await dailyDataService.getDailyComparison(selectedRegion.value);

    if (signal.aborted) {
      return false;
    }

    dailyData.value = data;

    if (!lastUpdate.value || data.today.totalReadings > 0) {
      lastUpdate.value = new Date().toLocaleTimeString();
    }
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }

    dailyData.value = null;

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        dailyDataError.value = "Não há dados diários disponíveis";
      } else if (axiosError.response?.status === 500) {
        dailyDataError.value = "Houve um erro ao buscar os dados";
      } else {
        dailyDataError.value = "Erro de conexão com o servidor";
      }
    } else {
      dailyDataError.value = "Erro de conexão com o servidor";
    }

    return false;
  } finally {
    isLoadingDailyData.value = false;
    if (currentDailyController?.signal === signal) {
      currentDailyController = null;
    }
  }
}

async function refreshAllData() {
  refreshTrigger.value++;

  const [indexDataSuccess, vehicleDataSuccess, dailyDataSuccess] = await Promise.all([
    fetchIndexData(),
    fetchVehicleData(),
    fetchDailyData(),
  ]);

  if (!indexDataSuccess && !vehicleDataSuccess && !dailyDataSuccess) {
    lastUpdate.value = "Erro de conexão com o servidor";
  }
}

async function refreshDataWithoutDaily() {
  refreshTrigger.value++;

  const [indexDataSuccess, vehicleDataSuccess] = await Promise.all([
    fetchIndexData(),
    fetchVehicleData(),
  ]);

  if (!indexDataSuccess && !vehicleDataSuccess) {
    lastUpdate.value = "Erro de conexão com filtros aplicados";
  }
}

function resetAllData() {
  indexData.value = null;
  vehicleData.value = null;
  dailyData.value = null;
  lastUpdate.value = "";
  indexError.value = "";
  vehicleDataError.value = "";
  dailyDataError.value = "";
  isLoadingIndex.value = true;
  isLoadingVehicleData.value = true;
  isLoadingDailyData.value = true;
}

const chartDataForVolume = computed(() => {
  if (!vehicleData.value || vehicleData.value.length === 0 || isLoadingVehicleData.value)
    return null;

  const firstDate = new Date(vehicleData.value[0].startTime);
  const lastDate = new Date(vehicleData.value[vehicleData.value.length - 1].startTime);
  const timeDiff = lastDate.getTime() - firstDate.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  const isGroupedByDay = daysDiff > 3;

  const processedData = vehicleData.value.map((item) => {
    const startTime = new Date(item.startTime);

    const label = isGroupedByDay
      ? `${startTime.getDate().toString().padStart(2, "0")}/${(startTime.getMonth() + 1).toString().padStart(2, "0")}`
      : `${startTime.getHours().toString().padStart(2, "0")}:00`;

    let vehicleCount: number;
    if (selectedVehicleType.value === "Todos") {
      vehicleCount = item.totalReadings;
    } else {
      vehicleCount =
        item.vehicleTypeCounts[selectedVehicleType.value as keyof typeof item.vehicleTypeCounts] ||
        0;
    }

    return {
      label,
      vehicleCount,
      timestamp: startTime.getTime(),
    };
  });

  processedData.sort((a, b) => a.timestamp - b.timestamp);

  const labels = processedData.map((item) => item.label);
  const data = processedData.map((item) => item.vehicleCount);

  const getVehicleColor = (vehicleType: string) => {
    return (
      VEHICLE_COLORS[vehicleType as keyof typeof VEHICLE_COLORS] || VEHICLE_COLORS["Indefinido"]
    );
  };

  const color = getVehicleColor(selectedVehicleType.value);

  return {
    labels,
    datasets: [
      {
        label: selectedVehicleType.value,
        data,
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
      },
    ],
  };
});

const chartDataForSpeed = computed(() => {
  if (!vehicleData.value || vehicleData.value.length === 0 || isLoadingVehicleData.value)
    return null;

  const firstDate = new Date(vehicleData.value[0].startTime);
  const lastDate = new Date(vehicleData.value[vehicleData.value.length - 1].startTime);
  const timeDiff = lastDate.getTime() - firstDate.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  const isGroupedByDay = daysDiff > 3;

  const processedData = vehicleData.value.map((item) => {
    const startTime = new Date(item.startTime);

    const label = isGroupedByDay
      ? `${startTime.getDate().toString().padStart(2, "0")}/${(startTime.getMonth() + 1).toString().padStart(2, "0")}`
      : `${startTime.getHours().toString().padStart(2, "0")}:00`;

    return {
      label,
      averageSpeed: item.averageSpeed,
      timestamp: startTime.getTime(),
    };
  });

  processedData.sort((a, b) => a.timestamp - b.timestamp);

  const labels = processedData.map((item) => item.label);
  const data = processedData.map((item) => Math.round(item.averageSpeed * 100) / 100);

  return {
    labels,
    datasets: [
      {
        label: "Velocidade Média",
        data,
        backgroundColor: getVehicleColorWithOpacity("Carro", 0.1).bg,
        borderColor: VEHICLE_COLORS["Carro"].border,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
});

const chartDataForPercentage = computed(() => {
  if (!vehicleData.value || vehicleData.value.length === 0 || isLoadingVehicleData.value)
    return null;

  const totalCounts: Record<string, number> = {};

  vehicleData.value.forEach((item) => {
    Object.entries(item.vehicleTypeCounts).forEach(([vehicleType, count]) => {
      if (count && count > 0) {
        totalCounts[vehicleType] = (totalCounts[vehicleType] || 0) + count;
      }
    });
  });

  const grandTotal = Object.values(totalCounts).reduce((sum, count) => sum + count, 0);

  if (grandTotal === 0) return null;

  const labels = Object.keys(totalCounts);
  const data = Object.values(totalCounts).map(
    (count) => Math.round((count / grandTotal) * 100 * 100) / 100
  );

  const getStandardVehicleColor = (vehicleType: string) => {
    return (
      VEHICLE_COLORS[vehicleType as keyof typeof VEHICLE_COLORS]?.border ||
      VEHICLE_COLORS["Indefinido"].border
    );
  };

  const colors = labels.map((label) => getStandardVehicleColor(label));

  return {
    labels,
    datasets: [
      {
        label: "Porcentagem de Veículos",
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };
});

const hasDataStillLoading = computed(() => {
  return isLoadingIndex.value || isLoadingVehicleData.value || isLoadingDailyData.value;
});

const todayTotalReadings = computed(() => {
  return dailyData.value?.today.totalReadings || 0;
});

const todayAverageSpeed = computed(() => {
  const speed = dailyData.value?.today.averageSpeed || 0;
  return Math.round(speed * 100) / 100;
});

const todayMaxSpeed = computed(() => {
  const speed = dailyData.value?.today.maxSpeed || 0;
  return Math.round(speed * 100) / 100;
});

const readingsComparison = computed(() => {
  if (!dailyData.value || dailyData.value.today.totalReadings === 0) return "Dados não disponíveis";
  if (dailyData.value.yesterday.totalReadings === 0) return "Comparação não disponível";
  const change = dailyData.value.readingsChange;
  return change >= 0 ? `+${change}%` : `${change}%`;
});

const speedComparison = computed(() => {
  if (!dailyData.value || dailyData.value.today.averageSpeed === 0) return "Dados não disponíveis";
  if (dailyData.value.yesterday.averageSpeed === 0) return "Comparação não disponível";
  const change = dailyData.value.speedChange;
  return change >= 0 ? `+${change}%` : `${change}%`;
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

watch(selectedRegion, () => {
  resetAllData();
  userHasModifiedDateTime.value = false;
  if (serverTimeData.value) {
    initializeDateTimePickers();
  }
  refreshAllData();
});

onMounted(async () => {
  await loadServerTimeData();
  refreshAllData();
  intervalId = setInterval(refreshAllData, 600000);
});

onUnmounted(() => {
  if (currentIndexController) {
    currentIndexController.abort();
  }
  if (currentVehicleController) {
    currentVehicleController.abort();
  }
  if (currentDailyController) {
    currentDailyController.abort();
  }

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
            <option v-for="region in availableRegions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>
      </div>

      <div class="datetime-filter-section">
        <div class="datetime-filter-header">
          <h3>Filtro de Data/Hora</h3>
          <button type="button" class="reset-button" @click="resetDateTimeFilters">Resetar</button>
        </div>
        <div class="datetime-inputs">
          <div class="datetime-input-group">
            <label for="start-datetime">Data/Hora Inicial:</label>
            <input
              id="start-datetime"
              v-model="startDateTime"
              type="datetime-local"
              class="datetime-input"
              :min="serverTimeData ? formatDateTimeLocal(serverTimeData.firstDate) : ''"
              :max="serverTimeData ? formatDateTimeLocal(serverTimeData.lastDate) : ''"
            />
          </div>
          <div class="datetime-input-group">
            <label for="end-datetime">Data/Hora Final:</label>
            <input
              id="end-datetime"
              v-model="endDateTime"
              type="datetime-local"
              class="datetime-input"
              :min="serverTimeData ? formatDateTimeLocal(serverTimeData.firstDate) : ''"
              :max="serverTimeData ? formatDateTimeLocal(serverTimeData.lastDate) : ''"
            />
          </div>
        </div>
      </div>
      <div class="main-content">
        <div class="graphs-section">
          <div class="info-link-container">
            <div class="status-info">
              <span v-if="!lastUpdate" class="loading">🔄 Aguardando dados...</span>
              <span
                v-else-if="lastUpdate === 'Erro de conexão com o servidor'"
                class="error-update"
                >{{ lastUpdate }}</span
              >
              <span v-else class="last-update">
                Última atualização: {{ lastUpdate }}
                <span v-if="hasDataStillLoading" class="loading-indicator">
                  • ⏳ Alguns dados ainda carregando...
                </span>
              </span>
            </div>
            <button class="info-link" @click="openModal">
              Como as informações são calculadas?
            </button>
          </div>
        </div>
        <div class="indices-section">
          <div class="indices-header">
            <h2>Índices</h2>
          </div>
          <div class="indices-container">
            <div v-if="isLoadingIndex" class="indices-loading">
              <div class="chart-loading">
                <span>🔄 Carregando índices...</span>
              </div>
            </div>
            <div v-else-if="indexError" class="indices-loading">
              <div class="chart-loading">
                <span>❌ {{ indexError }}</span>
              </div>
            </div>
            <div v-else class="indices-loaded">
              <div
                :class="['index-card', 'large-card', getIndexClass(indexData?.combinedIndex || 0)]"
              >
                <div class="index-number">{{ indexData?.combinedIndex || 0 }}</div>
                <div class="index-name">Geral</div>
              </div>
              <div
                :class="['index-card', 'small-card', getIndexClass(indexData?.trafficIndex || 0)]"
              >
                <div class="index-number">{{ indexData?.trafficIndex || 0 }}</div>
                <div class="index-name">Tráfego</div>
              </div>
              <div
                :class="['index-card', 'small-card', getIndexClass(indexData?.securityIndex || 0)]"
              >
                <div class="index-number">{{ indexData?.securityIndex || 0 }}</div>
                <div class="index-name">Segurança</div>
              </div>
            </div>
          </div>
        </div>
        <div class="graphs-section">
          <div class="graph-container graph-container-size-large vehicles-volume-container">
            <div class="chart-container">
              <div v-if="chartDataForSpeed" class="volume-chart">
                <BaseChart
                  type="line"
                  title="Velocidade média por horário"
                  :chart-data="chartDataForSpeed"
                  :refresh-trigger="refreshTrigger"
                />
              </div>
              <div v-else-if="vehicleDataError" class="chart-loading">
                <span>❌ {{ vehicleDataError }}</span>
              </div>
              <div v-else class="chart-loading">
                <span>🔄 Carregando dados de velocidade...</span>
              </div>
            </div>
          </div>
          <div class="graph-container">
            <div class="chart-container">
              <div v-if="chartDataForPercentage" class="volume-chart">
                <BaseChart
                  type="doughnut"
                  title="Distribuição de tipos de veículos"
                  :chart-data="chartDataForPercentage"
                  :refresh-trigger="refreshTrigger"
                />
              </div>
              <div v-else-if="vehicleDataError" class="chart-loading">
                <span>❌ {{ vehicleDataError }}</span>
              </div>
              <div v-else class="chart-loading">
                <span>🔄 Carregando dados de porcentagem...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="graphs-section">
          <div class="graph-container graph-container-size-large vehicles-volume-container">
            <div class="graph-container-header">
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
                  :chart-data="chartDataForVolume"
                  :refresh-trigger="refreshTrigger"
                />
              </div>
              <div v-else-if="vehicleDataError" class="chart-loading">
                <span>❌ {{ vehicleDataError }}</span>
              </div>
              <div v-else class="chart-loading">
                <span>🔄 Carregando dados do volume...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="indices-section">
          <div class="indices-header">
            <h2>Informações Diárias</h2>
          </div>
          <div v-if="isLoadingDailyData" class="indices-loading">
            <div class="chart-loading">
              <span>🔄 Carregando dados diários...</span>
            </div>
          </div>
          <div v-else-if="dailyDataError" class="indices-loading">
            <div class="chart-loading">
              <span>❌ {{ dailyDataError }}</span>
            </div>
          </div>
          <div v-else class="daily-infos-container">
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <div class="index-name">Leituras totais</div>
              <div class="index-number">{{ todayTotalReadings.toLocaleString() }}</div>
              <div class="comparison-text">{{ readingsComparison }} comparado a ontem</div>
            </div>
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <div class="index-name">Velocidade média geral</div>
              <div class="index-number">{{ todayAverageSpeed }} km/h</div>
              <div class="comparison-text">{{ speedComparison }} comparado a ontem</div>
            </div>
            <div :class="['index-card', 'large-card', getIndexClass(0)]">
              <div class="index-name">Velocidade mais alta</div>
              <div class="index-number">{{ todayMaxSpeed }} km/h</div>
              <!-- <h3>Local</h3>
              <a>Não disponível</a>
              <h3>Hora</h3>
              <a>Não disponível</a> -->
            </div>
          </div>
        </div>
      </div>
      <GraphModal v-model="modalOpen" @closed="handleModalClose" />
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/dashboard/DashboardPageStyle.scss"></style>
