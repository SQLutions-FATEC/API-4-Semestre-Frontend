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
  refreshTrigger?: number;
  chartData?: object; // Para passar dados diretamente
}

const props = defineProps<Props>();

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
            autoSkip: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Velocidade (km/h)",
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
            autoSkip: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Volume de Veículos",
          },
          beginAtZero: true,
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

watch(() => props.chartData, (newData) => {
  if (newData) {
    isLoading.value = false;
    error.value = "";
  } else {
    internalChartData.value = null;
  }
});

watch(
  () => props.refreshTrigger,
  () => {
    if (props.refreshTrigger && props.chartData) {
      // Force re-render if needed
    }
  }
);

onMounted(() => {
  chartOptions.value = getChartOptions(props.type, props.title);
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
