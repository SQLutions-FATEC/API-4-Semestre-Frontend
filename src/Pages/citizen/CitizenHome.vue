<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import { onMounted, ref } from "vue";

const informacoes = ref([
  { descricao: "Provável trânsito intenso na Av. dos Astronautas", tipo: "trafego" },
  { descricao: "Semáforo com defeito na Rua XV de Novembro", tipo: "infraestrutura" },
  { descricao: "Obra em andamento na Via Dutra - km 142", tipo: "infraestrutura" },
]);

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

interface citySummary {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
}

interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
}

// --- Estado dos Radares e Regioes (Dados da API) ---
const radarData = ref([]);
const regionData = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- Refs para os dados da região clicada (Vão ser preenchidos pelo evento do mapa) ---
const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);

const citySummaryData = ref(<citySummary | null>null);

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
        };

        nomeRegiaoClicada.value = citySummaryData.value.name;
        indiceGeral.value = citySummaryData.value.overall;
        indiceTrafego.value = citySummaryData.value.traffic;
        indiceSeguranca.value = citySummaryData.value.security;
        estadoRegiao.value = citySummaryData.value.estado;

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
  } else {
    // Se a região for desclicada (clique no mapa vazio)
    nomeRegiaoClicada.value = null;
    indiceGeral.value = null;
    indiceTrafego.value = null;
    indiceSeguranca.value = null;
    estadoRegiao.value = null;
  }
}

// --- Lógica de Chamadas de API ---
async function fetchData() {
  isLoading.value = true;
  error.value = null;

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
  <div class="dashboard-container">
    <main class="dashboard-content">
      <div class="region-section">
        <div class="region-selector">
          <button class="export-btn" :disabled="!citySummaryData" @click="showCitySummary">
            Ver Resumo da Cidade
          </button>
        </div>
      </div>

      <div class="dashboard-layout">
        <div class="left-column">
          <div class="geral-section">
            <div
              :class="['index-card', 'geral-card', getIndexClass(indiceGeral!)]"
              @click="abrirModal('geral')"
            >
              <div class="index-number">{{ indiceGeral }}</div>
              <div class="index-name">Geral</div>
            </div>
          </div>
          <div class="map-section">
            <h3>Mapa</h3>
            <div class="image-container map-wrapper">
              <MapaLeaflet
                v-if="!isLoading && regionData.length > 0"
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
                <span v-if="error">Erro ao carregar dados.</span>
                <span v-else-if="regionData.length === 0">Nenhuma região encontrada.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="center-column">
          <div class="indices-header">
            <h2>Níveis</h2>
          </div>
          <div class="indices-grid">
            <div
              :class="['index-card', 'medium-card', getIndexClass(indiceTrafego!)]"
              @click="abrirModal('trafego')"
            >
              <div class="index-number">{{ indiceTrafego ?? "-" }}</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div
              :class="['index-card', 'medium-card', getIndexClass(indiceSeguranca!)]"
              @click="abrirModal('seguranca')"
            >
              <div class="index-number">{{ indiceSeguranca ?? "-" }}</div>
              <div class="index-name">Segurança</div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <h2>Informações</h2>
          <div class="info-cards">
            <div v-for="(info, index) in informacoes" :key="index" class="info-card">
              <div class="info-description">{{ info.descricao }}</div>
            </div>
          </div>
        </div>
      </div>
      <IndiceModal
        :model-value="modalAberto"
        :tipo="tipoModal"
        @update:model-value="modalAberto = $event"
      />
    </main>
  </div>
</template>
<style lang="scss" scoped src="@/Pages/citizen/CitizenHomeStyle.scss"></style>
