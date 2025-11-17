<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useMapData } from "@/services/useMapData";
import { computed, onMounted, ref } from "vue";
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
interface speedTime {
  [key: string]: number;
}
interface readings {
  timeInterval: string;
  averageSpeed: number;
  totalReadings: number;
  endTime: string;
  startTime: string;
  maxSpeed: number;
  minSpeed: number;
  averageSpeedLimit: number;
  speedingCount: number;
  averageSpeedingAmount: number;
  vehicleTypeCounts: vehicleTypeCounts;
}
interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros: vehicleTypeCounts;
}

const {
  addressData,
  radarData,
  regionData,
  citySummaryData, // Contém ListaCarros, Overall, Traffic, Security, etc.
  isLoading,
  error,
} = useMapData();

const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);
const ListaCarros = ref(<vehicleTypeCounts | null>null);

const ListaSpeedTime = ref(<speedTime | null>null);
const ListaSpeedMax = ref(<speedTime | null>null);


const linechartSeries = computed(() => {
  if (!ListaSpeedTime.value || !ListaSpeedMax.value) return [];
  return [
    {
      name: "Velocidade Média",
      data: Object.entries(ListaSpeedTime.value!).map(([time, speed]) => ({
        x: time,
        y: speed,
      })),
    },
    {
      name: "Velocidade Máxima",
      data: Object.entries(ListaSpeedMax.value!).map(([time, speed]) => ({
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
  if (!ListaCarros.value) return [];
  return Object.values(ListaCarros.value);
});

const pieChartOption = computed(() => {
  const labels = ListaCarros.value ? Object.keys(ListaCarros.value) : [];

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

async function fetchSpeedData() {
  try {
    const responseVehicle = await fetch("http://localhost:8080/reading/series?minutes=59");
    if (!responseVehicle.ok) {
      throw new Error(`Erro HTTP Veículos: ${responseVehicle.status}`);
    }
    const dataVehicleReadings: readings[] = await responseVehicle.json();

    // Processamento para Velocidade Máxima
    let SpeedsTimeMax: speedTime = {};
    dataVehicleReadings.forEach((reading: readings) => {
      if (reading.maxSpeed && reading.endTime) {
        const timePart = reading.endTime.split("T")[1];
        SpeedsTimeMax[timePart] = Math.trunc(reading.maxSpeed);
      }
    });
    ListaSpeedMax.value = SpeedsTimeMax;

    // Processamento para Velocidade Média
    let SpeedsTime: speedTime = {};
    dataVehicleReadings.forEach((reading: readings) => {
      if (reading.averageSpeed && reading.endTime) {
        const timePart = reading.endTime.split("T")[1];
        SpeedsTime[timePart] = Math.trunc(reading.averageSpeed);
      }
    });
    ListaSpeedTime.value = SpeedsTime;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Falha ao buscar dados de velocidade:", err);
  }
}

function showCitySummary() {
  if (citySummaryData.value) {
    // Aplica os dados do resumo da cidade (do Composable) nas refs do dashboard
    nomeRegiaoClicada.value = citySummaryData.value.name;
    indiceGeral.value = citySummaryData.value.overall;
    indiceTrafego.value = citySummaryData.value.traffic;
    indiceSeguranca.value = citySummaryData.value.security;
    estadoRegiao.value = citySummaryData.value.estado;
    ListaCarros.value = citySummaryData.value.ListaCarros;
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
    ListaCarros.value = regionProps.ListaCarros;
  } else {
    nomeRegiaoClicada.value = null;
    indiceGeral.value = null;
    indiceTrafego.value = null;
    indiceSeguranca.value = null;
    estadoRegiao.value = null;
    ListaCarros.value = null;
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
  exportarRelatorio('.main-content', nomeRegiaoClicada.value || undefined);
}


onMounted(() => {
  fetchSpeedData();
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
            <h2>Níveis</h2>
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
