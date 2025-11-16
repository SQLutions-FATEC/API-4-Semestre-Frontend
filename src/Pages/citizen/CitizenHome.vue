<script setup lang="ts">
import iconeCamera from "@/assets/cam2.png";
import MapaLeaflet from "@/components/MapaLeaflet.vue";
import IndiceModal from "@/components/Modals/IndiceModal.vue";
import {  ref, watch } from "vue";
import { useMapData } from "@/services/UseMapData";

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

interface regionProps {
  name: string;
  overall: number;
  traffic: number;
  security: number;
  estado: string;
}


const {
  addressData, // Dados de address/heatmap
  radarData, // Dados de radars
  regionData, // Dados de regions
  citySummaryData, // Dados do resumo da cidade (índices)
  isLoading, // Estado de loading unificado
  error, // Estado de erro unificado
} = useMapData();

const nomeRegiaoClicada = ref(<string | null>null);
const indiceGeral = ref(<number | null>null);
const indiceTrafego = ref(<number | null>null);
const indiceSeguranca = ref(<number | null>null);
const estadoRegiao = ref(<string | null>null);

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

const modalAberto = ref(false);
const tipoModal = ref<"trafego" | "seguranca" | "geral">("trafego");

function abrirModal(tipo: "trafego" | "seguranca" | "geral") {
  tipoModal.value = tipo;
  modalAberto.value = true;
}


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
  <div class="dashboard-container">
    <main class="dashboard-content">
      <div class="region-section">
        <div class="region-selector">
          <button class="export-btn" :disabled="!citySummaryData" @click="showCitySummary">
            Ver Resumo da Cidade
          </button>
          <button class="export-btn">📊 Exportar relatório</button>
        </div>
      </div>

      <div class="dashboard-layout">
        <div class="left-column">
          <div class="geral-section">
            <div
              :class="['index-card', 'geral-card', getIndexClass(indiceGeral!)]"
              @click="abrirModal('geral')"
            >
              <div class="index-number">{{ indiceGeral ?? "-" }}</div>
              <div class="index-name">Geral</div>
            </div>
          </div>
          <div class="map-section">
            <h3>Mapa</h3>
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
            <template v-for="address in addressData" :key="address.areaRuaGeoJson">
              <div v-if="address.trafficIndex >= 4" class="info-card">
                <div class="info-description">
                  {{ address.message }}.
                </div>
              </div>
            </template>
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
