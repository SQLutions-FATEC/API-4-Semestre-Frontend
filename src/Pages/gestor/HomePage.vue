<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import questionMarkIcon from "@/assets/question-mark.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useMapData } from "@/composables/useMapData";
import { useManagerData } from "@/composables/useManagerData";
import { useReportExport } from "@/composables/useReportExport";

const regionColorMap = {
  Norte: "#e6194B",
  Leste: "#3cb44b",
  Centro: "#ffe119",
  Sul: "#4363d8",
  Sudeste: "#f58231",
  Oeste: "#911eb4",
  "São Francisco Xavier": "#46f0f0",
  default: "#a9a9a9",
};

interface vehicleTypeCounts {
  [key: string]: number;
}
interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros?: vehicleTypeCounts;
}

const {
  addressData,
  radarData,
  regionData,
  citySummaryData,
  isLoading,
  error,
} = useMapData();

const {
  totalVehicleCounts,
  speedMaxByTime,
  speedAvgByTime,
  fetchReadingData,
} = useManagerData();

const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);

const linechartSeries = computed(() => {
  if (!speedAvgByTime.value || !speedMaxByTime.value) return [];
  return [
    {
      name: "Velocidade Média",
      data: Object.entries(speedAvgByTime.value!).map(([time, speed]) => ({
        x: time,
        y: speed,
      })),
    },
    {
      name: "Velocidade Máxima",
      data: Object.entries(speedMaxByTime.value!).map(([time, speed]) => ({
        x: time,
        y: speed,
      })),
    },
  ];
});

const lineChartOption = computed(() => {
  return {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    title: {
      text: `Velocidade durante a ultima hora`,
      align: "center",
      style: { fontSize: "16px", color: "#333" },
    },
    xaxis: { type: "category", title: { text: "Tempo" } },
    yaxis: { title: { text: "Velocidade (km/h)" } },
    stroke: { curve: "smooth" },
    legend: { position: "top", horizontalAlign: "center" },
  };
});

const piechartSeries = computed(() => {
  if (!totalVehicleCounts.value || Object.keys(totalVehicleCounts.value).length === 0) return [];
  return Object.values(totalVehicleCounts.value);
});

const pieChartOption = computed(() => {
  const labels = totalVehicleCounts.value ? Object.keys(totalVehicleCounts.value) : [];

  return {
    chart: { type: "pie" },
    labels: labels,
    title: {
      text: `Distribuição (${nomeRegiaoClicada.value || "Geral"})`,
      align: "center",
      style: { fontSize: "16px", color: "#333" },
    },
    legend: { position: "bottom", horizontalAlign: "center", offsetY: 5 },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: { position: "bottom", fontSize: "10px" },
        },
      },
    ],
  };
});

function showCitySummary() {
  if (citySummaryData.value) {
    // Aplica os dados do resumo da cidade (do Composable) nas refs do dashboard
    nomeRegiaoClicada.value = citySummaryData.value.name;
    indiceGeral.value = citySummaryData.value.overall;
    indiceTrafego.value = citySummaryData.value.traffic;
    indiceSeguranca.value = citySummaryData.value.security;
    estadoRegiao.value = citySummaryData.value.estado;
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
      return "dark-red";
    case 5:
      return "red";
    default:
      return "gray";
  }
}

function handleRegionSelected(regionProps: regionProps | null) {
  if (regionProps) {
    nomeRegiaoClicada.value = regionProps.name;
    indiceGeral.value = regionProps.overall;
    indiceTrafego.value = regionProps.traffic;
    indiceSeguranca.value = regionProps.security;
    estadoRegiao.value = regionProps.estado;
  } else {
    nomeRegiaoClicada.value = null;
    indiceGeral.value = null;
    indiceTrafego.value = null;
    indiceSeguranca.value = null;
    estadoRegiao.value = null;
  }
}

const modalAberto = ref(false);
const tipoModal = ref<"trafego" | "seguranca" | "geral">("trafego");
const { exportarRelatorio } = useReportExport();

function abrirModal(tipo: "trafego" | "seguranca" | "geral") {
  tipoModal.value = tipo;
  modalAberto.value = true;
}

function handleExportarRelatorio() {
  exportarRelatorio(".main-content", nomeRegiaoClicada.value || undefined);
}

onMounted(() => {
  fetchReadingData();
});

watch(
  citySummaryData,
  (newSummary) => {
    if (newSummary && !nomeRegiaoClicada.value) {
      showCitySummary();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="home-container">
    <main class="home-content">
      <div class="region-section">
        <div class="region-selector">
          <button class="export-btn" :disabled="!citySummaryData" @click="showCitySummary">
            Ver Resumo da Cidade
          </button>
          <button class="export-btn" @click="handleExportarRelatorio">📊 Exportar relatório</button>
        </div>
      </div>
      <div class="main-content">
        <div class="indices-section">
          <div class="indices-header">
            <h2 style="display: flex; gap: 16px">
              Níveis
              <img
                :src="questionMarkIcon"
                alt="?"
                width="25"
                lenght="25"
                @click="abrirModal('trafego')"
              />
            </h2>
          </div>
          <div class="indices-container">
            <div
              :class="['index-card', 'large-card', getIndexClass(indiceGeral!)]"
              @click="abrirModal('trafego')"
            >
              <div class="index-number">{{ indiceGeral ?? "-" }}</div>
              <div class="index-name">Geral</div>
            </div>

            <div
              :class="['index-card', 'small-card', getIndexClass(indiceTrafego!)]"
              @click="abrirModal('trafego')"
            >
              <div class="index-number">{{ indiceTrafego ?? "-" }}</div>
              <div class="index-name">Tráfego</div>
            </div>

            <div
              :class="['index-card', 'small-card', getIndexClass(indiceSeguranca!)]"
              @click="abrirModal('seguranca')"
            >
              <div class="index-number">{{ indiceSeguranca ?? "-" }}</div>
              <div class="index-name">Segurança</div>
            </div>

            <IndiceModal v-model="modalAberto" :tipo="tipoModal" />
          </div>
        </div>
        <div class="graphs-section">
          <div class="graph-container">
            <h2>Mapa</h2>
            <div class="image-container">
              <div class="image-container map-wrapper">
                <MapaLeaflet
                  v-if="!isLoading && !error && regionData.length > 0"
                  :address-data="addressData"
                  :region-data="regionData"
                  :radar-data="radarData"
                  :region-color-map="regionColorMap"
                  :icone-camera="iconeCamera"
                  @region-selected="handleRegionSelected"
                />
                <div
                  v-else
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #888;
                    flex-direction: column;
                  "
                >
                  <span v-if="isLoading">Carregando dados do mapa...</span>
                  <span v-else-if="error">Erro ao carregar dados.</span>
                  <span v-else-if="regionData.length === 0">Nenhuma região encontrada.</span>
                </div>
              </div>
            </div>
          </div>
          <div class="graph-container graph-container-middle">
            <h2>Porcentagem de veiculos da ultima Hora</h2>
            <div class="chart-container" style="height: 300px; width: 100%">
              <ApexCharts
                v-if="piechartSeries.length > 0"
                type="pie"
                height="100%"
                :options="pieChartOption"
                :series="piechartSeries"
              />

              <div
                v-else
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  color: #888;
                "
              >
                <span>Selecione uma região ou sem dados de contagem.</span>
              </div>
            </div>
          </div>
          <div class="graph-container">
            <ApexCharts
              type="line"
              height="100%"
              :options="lineChartOption"
              :series="linechartSeries"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/gestor/HomePageStyle.scss"></style>
