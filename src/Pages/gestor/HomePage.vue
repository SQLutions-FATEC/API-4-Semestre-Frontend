<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import { computed, onMounted, ref } from "vue";

// --- Mapa de Cores ---
const regionColorMap = {
  Norte: "#e6194B", // Vermelho
  Leste: "#3cb44b", // Verde
  Centro: "#ffe119", // Amarelo
  Sul: "#4363d8", // Azul
  Sudeste: "#f58231", // Laranja
  Oeste: "#911eb4", // Roxo
  "São Francisco Xavier": "#46f0f0", // Ciano
  default: "#a9a9a9", // Cinza Escuro (DarkGray)
};

// --- interfaces ---

interface vehicleTypeCounts {
  [key: string]: number;
}

interface speedTime {
  [key: string]: number;
}

interface readings {
  endTime: string;
  readings: number;
  totalreadings: number;
  averageSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  index: number;
  vehicleTypeCounts: vehicleTypeCounts;
}

interface citySummary {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros: vehicleTypeCounts;
}

interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros: vehicleTypeCounts;
}
// --- Estado dos Radares e Regioes (Dados da API) ---

const radarData = ref([]);
const isLoadingRadars = ref(true);
const errorRadars = ref(null);
const regionData = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- Refs para os dados da região clicada (Vão ser preenchidos pelo evento do mapa) ---
const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);
const ListaCarros = ref(<vehicleTypeCounts | null>null);
const ListaSpeedTime = ref(<speedTime | null>null);
const ListaSpeedMax = ref(<speedTime | null>null);

const citySummaryData = ref(<citySummary | null>null);

const linechartSeries = computed(() => {
  if (!ListaSpeedTime.value) return [];
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
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    title: {
      text: `Velocidade durante a ultima hora`,
      align: "center",
      style: {
        fontSize: "16px",
        color: "#333",
      },
    },

    xaxis: {
      type: "category",
      title: {
        text: "Tempo",
      },
    },
    yaxis: {
      title: {
        text: "Velocidade (km/h)",
      },
    },
    stroke: {
      curve: "smooth",
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
    },
  };
});

// --- Para os dados do gráfico de pizza ---
const piechartSeries = computed(() => {
  if (!ListaCarros.value) return [];
  return Object.values(ListaCarros.value);
});

// ... (Restante do pieChartOption) ...
const pieChartOption = computed(() => {
  const labels = ListaCarros.value ? Object.keys(ListaCarros.value) : [];

  return {
    chart: {
      type: "pie",
    },
    labels: labels,

    title: {
      text: `Distribuição (${nomeRegiaoClicada.value || "Geral"})`,
      align: "center",
      style: {
        fontSize: "16px",
        color: "#333",
      },
    },

    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetY: 5,
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            fontSize: "10px",
          },
        },
      },
    ],
  };
});

// --- Função auxiliar para buscar e processar o resumo da cidade (usada no Promise.all) ---
function fetchCitySummaryPromise(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    (async () => {
      try {
        // 1. Busca dos Índices
        const responseIndex = await fetch("http://localhost:8080/index?minutes=10");
        if (!responseIndex.ok) {
          throw new Error(`Erro HTTP Índices: ${responseIndex.status}`);
        }
        const dataIndex = await responseIndex.json();

        // 2. Busca das Leituras de Veículos
        const responseVehicle = await fetch("http://localhost:8080/reading?minutes=60");
        if (!responseVehicle.ok) {
          throw new Error(`Erro HTTP Veículos: ${responseVehicle.status}`);
        }
        const dataVehicleReadings = await responseVehicle.json();

        // 3. AGREGAR A CONTAGEM DE VEÍCULOS
        let totalVehicleCounts: vehicleTypeCounts = {};
        dataVehicleReadings.forEach((reading: readings) => {
          if (reading.vehicleTypeCounts) {
            for (const type in reading.vehicleTypeCounts) {
              const count = reading.vehicleTypeCounts[type];
              totalVehicleCounts[type] = (totalVehicleCounts[type] || 0) + count;
            }
          }
        });

        let SpeedsTimeMax: speedTime = {};
        dataVehicleReadings.forEach((reading: readings) => {
          if (reading.maxSpeed && reading.endTime) {
            const timePart = reading.endTime.split("T")[1];

            const speedInt = Math.trunc(reading.maxSpeed);

            SpeedsTimeMax[timePart] = speedInt;
          }
        });
        ListaSpeedMax.value = SpeedsTimeMax;

        let SpeedsTime: speedTime = {};
        dataVehicleReadings.forEach((reading: readings) => {
          if (reading.averageSpeed && reading.endTime) {
            const timePart = reading.endTime.split("T")[1];

            const speedInt = Math.trunc(reading.averageSpeed);

            SpeedsTime[timePart] = speedInt;
          }
        });
        ListaSpeedTime.value = SpeedsTime;

        // 4. Formata e DEFINE os dados de resumo

        citySummaryData.value = {
          name: "Cidade Inteira",
          overall: dataIndex.combinedIndex,
          traffic: dataIndex.trafficIndex,
          security: dataIndex.securityIndex,
          estado:
            (dataIndex.trafficIndex + dataIndex.securityIndex) / 2 == 1
              ? "Ótimo"
              : (dataIndex.trafficIndex + dataIndex.securityIndex) / 2 <= 3
                ? "Bom"
                : "Ruim",
          ListaCarros: totalVehicleCounts,
        };

        nomeRegiaoClicada.value = citySummaryData.value.name;
        indiceGeral.value = citySummaryData.value.overall;
        indiceTrafego.value = citySummaryData.value.traffic;
        indiceSeguranca.value = citySummaryData.value.security;
        estadoRegiao.value = citySummaryData.value.estado;
        ListaCarros.value = citySummaryData.value.ListaCarros;

        // Resolve a promise
        resolve(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Falha ao buscar resumo da cidade:", err);
        citySummaryData.value = null;
        reject(err);
      }
    })();
  });
}

function showCitySummary() {
  if (citySummaryData.value) {
    // Aplica os dados do resumo da cidade nas refs do dashboard
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

// --- Função para lidar com o evento do Mapa Leaflet ---
function handleRegionSelected(regionProps: regionProps | null) {
  if (regionProps) {
    // Recebe os dados da região clicada no componente filho
    nomeRegiaoClicada.value = regionProps.name;
    indiceGeral.value = regionProps.overall;
    indiceTrafego.value = regionProps.traffic;
    indiceSeguranca.value = regionProps.security;
    estadoRegiao.value = regionProps.estado;
    ListaCarros.value = regionProps.ListaCarros;
  } else {
    // Se a região for desclicada (clique no mapa vazio)
    nomeRegiaoClicada.value = null;
    indiceGeral.value = null;
    indiceTrafego.value = null;
    indiceSeguranca.value = null;
    estadoRegiao.value = null;
    ListaCarros.value = null;
  }
}

// --- Lógica de Chamadas de API ---
async function fetchData() {
  isLoading.value = true;
  isLoadingRadars.value = true;
  error.value = null;
  errorRadars.value = null;

  const promises: [Promise<Response>, Promise<boolean>] = [
    fetch("http://localhost:8080/regions"),
    fetchCitySummaryPromise(),
  ];

  try {
    // 1. Executa todas as chamadas EM PARALELO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [responseRegions, _] = await Promise.all(promises);

    // 2. Processa a resposta das Regiões
    if (!responseRegions.ok) {
      throw new Error(`Erro HTTP Regiões: ${responseRegions.status} ${responseRegions.statusText}`);
    }
    regionData.value = await responseRegions.json();
    isLoading.value = false; // 3. Processa a resposta do Resumo da Cidade

    radarData.value = [];
    isLoadingRadars.value = false;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Falha ao buscar dados do mapa:", err);
  }
}

const modalAberto = ref(false);
const tipoModal = ref<"trafego" | "seguranca" | "geral">("trafego");

function abrirModal(tipo: "trafego" | "seguranca" | "geral") {
  tipoModal.value = tipo;
  modalAberto.value = true;
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="home-container">
    <main class="home-content">
      <div class="region-section">
        <div class="region-selector">
          <button class="export-btn" :disabled="!citySummaryData" @click="showCitySummary">
            Ver Resumo da Cidade
          </button>
          <button class="export-btn">📊 Exportar relatório</button>
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
              <div class="index-number">{{ indiceGeral }}</div>
              <div class="index-name">Geral</div>
            </div>

            <div
              :class="['index-card', 'small-card', getIndexClass(indiceTrafego!)]"
              @click="abrirModal('trafego')"
            >
              <div class="index-number">{{ indiceTrafego }}</div>
              <div class="index-name">Tráfego</div>
            </div>

            <div
              :class="['index-card', 'small-card', getIndexClass(indiceSeguranca!)]"
              @click="abrirModal('seguranca')"
            >
              <div class="index-number">{{ indiceSeguranca }}</div>
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
                  v-if="!isLoading && !isLoadingRadars && regionData.length > 0"
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
                  <span v-if="isLoading || isLoadingRadars">Carregando dados do mapa...</span>
                  <span v-else-if="error || errorRadars">Erro ao carregar dados.</span>
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
