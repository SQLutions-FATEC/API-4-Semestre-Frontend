<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface Props {
  type: "line" | "doughnut" | "bar";
  title: string;
  apiEndpoint: string;
  refreshTrigger?: number;
  chartData?: object; // Para passar dados diretamente
}

const props = defineProps<Props>();

const emit = defineEmits<{
  dataUpdated: [timestamp: string];
  loadingChange: [isLoading: boolean];
  error: [errorMessage: string];
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const internalChartData = ref<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chartOptions = ref<any>({});
const isLoading = ref(false);
const error = ref<string>("");

const finalChartData = computed(() => {
  return props.chartData || internalChartData.value;
});

const getChartOptions = (type: string, title: string) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 5,
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      legend: {
        position: "top" as const,
      },
    },
  };

  if (type === "line") {
    return {
      ...baseOptions,
      scales: {
        x: {
          title: {
            display: true,
            text: "Horário",
          },
          ticks: {
            maxTicksLimit: 17,
            autoSkip: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Velocidade (km/h)",
          },
          min: 0,
          max: 140,
          ticks: {
            stepSize: 20,
          },
        },
      },
    };
  }

  if (type === "bar") {
    return {
      ...baseOptions,
      scales: {
        x: {
          title: {
            display: true,
            text: "Horário",
          },
          ticks: {
            maxTicksLimit: 24,
            autoSkip: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Volume de Veículos",
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1000,
          },
        },
      },
    };
  }

  if (type === "doughnut") {
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function (context: any) {
              return `${context.label}: ${context.parsed}%`;
            },
          },
        },
      },
    };
  }

  return baseOptions;
};

const getVehicleStyles = () => ({
  Carro: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  Ônibus: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  Moto: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  Indefinido: {
    borderColor: "#6b7280",
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processChartData = (rawData: any) => {
  if (!rawData) return null;

  const vehicleStyles = getVehicleStyles();

  if (props.type === "line") {
    return {
      labels: rawData.labels,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasets: rawData.datasets.map((dataset: any) => ({
        ...dataset,
        ...vehicleStyles[dataset.label as keyof typeof vehicleStyles],
        tension: 0.4,
      })),
    };
  }

  if (props.type === "bar") {
    return {
      labels: rawData.labels,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasets: rawData.datasets.map((dataset: any) => ({
        ...dataset,
        ...vehicleStyles[dataset.label as keyof typeof vehicleStyles],
      })),
    };
  }

  if (props.type === "doughnut") {
    return {
      labels: rawData.labels,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datasets: rawData.datasets.map((dataset: any) => ({
        ...dataset,
        backgroundColor: ["#3b82f6", "#ef4444", "#22c55e", "#6b7280"],
        borderWidth: 2,
        borderColor: "#ffffff",
      })),
    };
  }

  return rawData;
};

const fetchChartData = async () => {
  if (props.chartData) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    emit("loadingChange", true);

    const response = await fetch(`http://localhost:3001${props.apiEndpoint}`);
    const result = await response.json();

    if (result.success) {
      internalChartData.value = processChartData(result.data);
      emit("dataUpdated", result.timestamp);
    } else {
      error.value = "Erro ao carregar dados do gráfico";
      emit("error", error.value);
    }
  } catch {
    error.value = "Erro de conexão com o servidor";
    emit("error", error.value);
  } finally {
    isLoading.value = false;
    emit("loadingChange", false);
  }
};

watch(() => props.apiEndpoint, () => {
  if (!props.chartData) {
    fetchChartData();
  }
});

watch(() => props.chartData, (newData) => {
  if (newData) {
    emit("dataUpdated", new Date().toISOString());
  }
});

watch(
  () => props.refreshTrigger,
  () => {
    if (props.refreshTrigger) {
      if (props.chartData) {
        emit("dataUpdated", new Date().toISOString());
      } else {
        fetchChartData();
      }
    }
  }
);

onMounted(() => {
  chartOptions.value = getChartOptions(props.type, props.title);
  fetchChartData();
});
</script>

<template>
  <div v-if="isLoading" class="chart-loading">
    <div class="loading-spinner"></div>
    <span>Carregando gráfico...</span>
  </div>

  <div v-else-if="error" class="chart-error">
    <span>❌ {{ error }}</span>
  </div>

  <div v-else-if="finalChartData" class="chart-content">
    <Line v-if="props.type === 'line'" :data="finalChartData" :options="chartOptions" />
    <Doughnut v-if="props.type === 'doughnut'" :data="finalChartData" :options="chartOptions" />
    <Bar v-if="props.type === 'bar'" :data="finalChartData" :options="chartOptions" />
  </div>

  <div v-else class="chart-empty">
    <span>Nenhum dado disponível</span>
  </div>
</template>

<style lang="scss" scoped src="@/components/BaseChart/BaseChartStyle.scss">
</style>
