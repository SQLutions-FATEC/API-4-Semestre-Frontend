<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import { computed, ref, onMounted } from "vue";
import { useMapData } from "@/composables/useMapData";
import { useManagerData } from "@/composables/useManagerData";
import type { VehicleTypeCounts } from "@/entities/VehicleTypeCounts";

interface RegionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
  ListaCarros?: VehicleTypeCounts;
}

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

// chama o service externo exclusivo para dados do mapa
const { addressData, radarData, regionData, citySummaryData, isLoading, error } =
  useMapData();

const {
  totalVehicleCounts,
  fetchReadingData,
} = useManagerData();

const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);

function showCitySummary() {
  if (citySummaryData.value) {
    nomeRegiaoClicada.value = citySummaryData.value.name;
    indiceGeral.value = citySummaryData.value.overall;
    indiceTrafego.value = citySummaryData.value.traffic;
    indiceSeguranca.value = citySummaryData.value.security;
    estadoRegiao.value = citySummaryData.value.estado;
  }
}

import { watch } from 'vue';

onMounted(() => {
  fetchReadingData();
});

watch(citySummaryData, (newSummary) => {
    if (newSummary && !nomeRegiaoClicada.value) {
        showCitySummary();
    }
}, { immediate: true });

const piechartSeries = computed(() => {
  if (!totalVehicleCounts.value || Object.keys(totalVehicleCounts.value).length === 0) return [];
  return Object.values(totalVehicleCounts.value);
});

const pieChartOption = computed(() => {
  const labels = totalVehicleCounts.value ? Object.keys(totalVehicleCounts.value) : [];

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

function handleRegionSelected(regionProps: RegionProps | null) {
  if (regionProps) {
    // Recebe os dados da região clicada no componente filho
    nomeRegiaoClicada.value = regionProps.name;
    indiceGeral.value = regionProps.overall;
    indiceTrafego.value = regionProps.traffic;
    indiceSeguranca.value = regionProps.security;
    estadoRegiao.value = regionProps.estado;
  }
}

const modalAberto = ref(false);
const tipoModal = ref<"trafego" | "seguranca" | "geral">("trafego");

function abrirModal(tipo: "trafego" | "seguranca" | "geral") {
  tipoModal.value = tipo;
  modalAberto.value = true;
}
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
              v-if="!isLoading && regionData.length > 0"
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

        <div class="right-column">
          <div :class="['index-card', getIndexClass(indiceGeral!)]" @click="abrirModal('trafego')">
            <span class="index-number">{{ indiceGeral ?? "-" }}</span>
            <span class="index-name">Geral</span>
          </div>

          <div
            :class="['index-card', getIndexClass(indiceTrafego!)]"
            @click="abrirModal('trafego')"
          >
            <span class="index-number">{{ indiceTrafego ?? "-" }}</span>
            <span class="index-name">Tráfego</span>
          </div>

          <div
            :class="['index-card', getIndexClass(indiceSeguranca!)]"
            @click="abrirModal('seguranca')"
          >
            <span class="index-number">{{ indiceSeguranca ?? "-" }}</span>
            <span class="index-name">Segurança</span>
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

<style lang="scss" scoped src="@/Pages/mapa/MapaPageStyle.scss"></style>
