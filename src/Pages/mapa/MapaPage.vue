<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";

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

interface readings {
  endtime: string;
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

const citySummaryData = ref(<citySummary | null>null);

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

        // Resolve a promise
        resolve(true);
      } catch (err) {
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

  const promises: [Promise<Response>, Promise<boolean>, Promise<Response>] = [
    fetch("http://localhost:8080/regions"),
    fetchCitySummaryPromise(),
    fetch("http://localhost:8080/radars"),
  ];

  try {
    // 1. Executa todas as chamadas EM PARALELO
    const [responseRegions, _, responseRadars] = await Promise.all(promises);

    // 2. Processa a resposta das Regiões
    if (!responseRegions.ok) {
      throw new Error(`Erro HTTP Regiões: ${responseRegions.status} ${responseRegions.statusText}`);
    }
    regionData.value = await responseRegions.json();
    isLoading.value = false; // 3. Processa a resposta do Resumo da Cidade

    if (!responseRadars.ok) {
      throw new Error(`Erro HTTP Radares: ${responseRadars.status} ${responseRadars.statusText}`);
    }
    radarData.value = await responseRadars.json(); // <-- Este é o passo crucial
    isLoadingRadars.value = false;
  } catch (err) {
    console.error("Falha ao buscar dados do mapa:", err);
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="dashboard-container">
    <main class="dashboard-content">
      <div class="dashboard-layout">
        <div class="left-column">
          <div class="widget-card">
            <h2>Informações sobre a região</h2>
            <div class="info-content">
              <p>
                Nome da região: <span>{{ nomeRegiaoClicada ?? "Nenhuma selecionada" }}</span>
              </p>
              <p>
                Estado: <span>{{ estadoRegiao ?? "Desconhecido" }}</span>
              </p>
            </div>

            <button class="summary-button" :disabled="!citySummaryData" @click="showCitySummary">
              Ver Resumo da Cidade
            </button>
          </div>

          <div class="widget-card">
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
        </div>

        <div class="center-column">
          <h3>Mapa</h3>
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

        <div class="right-column">
          <div :class="['index-card', getIndexClass(indiceGeral!)]">
            <span class="index-number">{{ indiceGeral ?? "-" }}</span>
            <span class="index-name">Geral</span>
          </div>

          <div :class="['index-card', getIndexClass(indiceTrafego!)]">
            <span class="index-number">{{ indiceTrafego ?? "-" }}</span>
            <span class="index-name">Tráfego</span>
          </div>

          <div :class="['index-card', getIndexClass(indiceSeguranca!)]">
            <span class="index-number">{{ indiceSeguranca ?? "-" }}</span>
            <span class="index-name">Segurança</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/mapa/MapaPageStyle.scss"></style>
