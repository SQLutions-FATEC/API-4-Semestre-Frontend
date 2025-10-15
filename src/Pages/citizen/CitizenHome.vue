<script setup lang="ts">
import mapaSjc from "@/assets/mapa-sjc.png";
import { IndexData, indexService } from "@/services/indexService";
import { onMounted, ref } from "vue";

const selectedRegion = ref("São José dos Campos");

const indices = ref({
  combinedIndex: 1,
  trafficIndex: 1,
  securityIndex: 1,
  acessibilidade: 1,
  infraestrutura: 1,
});

const informacoes = ref([
  { descricao: "Provável trânsito intenso na Av. dos Astronautas", tipo: "trafego" },
  { descricao: "Semáforo com defeito na Rua XV de Novembro", tipo: "infraestrutura" },
  { descricao: "Obra em andamento na Via Dutra - km 142", tipo: "infraestrutura" },
]);

async function fetchIndices() {
  try {
    let result: IndexData;
    // Se futuramente adicionar suporte a regiões no backend
    // use getRegionIndex(selectedRegion.value, 5)
    result = await indexService.getCityIndex(5);

    indices.value = {
      combinedIndex: result.combinedIndex,
      trafficIndex: result.trafficIndex,
      securityIndex: result.securityIndex,
      acessibilidade: 1, // valor fixo por enquanto
      infraestrutura: 1, // valor fixo por enquanto
    };
  } catch (error) {
    console.error("Erro ao buscar índices:", error);
    setDefaultIndices();
    alert("Erro ao buscar índices - valores padrão aplicados");
  }
}

function setDefaultIndices() {
  indices.value = {
    combinedIndex: 1,
    trafficIndex: 1,
    securityIndex: 1,
    acessibilidade: 2,
    infraestrutura: 1,
  };
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

onMounted(() => {
  fetchIndices();
});
</script>

<template>
  <div class="dashboard-container">
    <main class="dashboard-content">
      <div class="region-section">
        <label class="region-label">Região selecionada</label>
        <div class="region-selector">
          <select v-model="selectedRegion" class="region-dropdown">
            <option value="São José dos Campos">São José dos Campos</option>
          </select>
          <button class="export-btn">📊 Exportar relatório</button>
        </div>
      </div>

      <div class="dashboard-layout">
        <div class="left-column">
          <div class="geral-section">
            <div :class="['index-card', 'geral-card', getIndexClass(indices.combinedIndex)]">
              <div class="index-number">{{ indices.combinedIndex }}</div>
              <div class="index-name">Geral</div>
            </div>
          </div>
          <div class="map-section">
            <h2>Mapa</h2>
            <div class="image-container">
              <img :src="mapaSjc" alt="Mapa de São José dos Campos" class="map-image" />
            </div>
          </div>
        </div>

        <div class="center-column">
          <div class="indices-header">
            <h2>Índices</h2>
          </div>
          <div class="indices-grid">
            <div :class="['index-card', 'medium-card', getIndexClass(indices.trafficIndex)]">
              <div class="index-number">{{ indices.trafficIndex }}</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.securityIndex)]">
              <div class="index-number">{{ indices.securityIndex }}</div>
              <div class="index-name">Segurança</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.acessibilidade)]">
              <div class="index-number">{{ indices.acessibilidade }}</div>
              <div class="index-name">Acessibilidade</div>
            </div>
            <div :class="['index-card', 'medium-card', getIndexClass(indices.infraestrutura)]">
              <div class="index-number">{{ indices.infraestrutura }}</div>
              <div class="index-name">Infraestrutura</div>
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
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/citizen/CitizenHomeStyle.scss"></style>
