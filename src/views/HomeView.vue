<script setup lang="ts">
import { ref } from 'vue'

const selectedRegion = ref('São José dos Campos')
const selectedVelocity = ref('Velocidade')
</script>

<template>
  <div class="home-container">
    <!-- Main Content -->
    <main class="home-content">
      <!-- Region Selector -->
      <div class="region-section">
        <label class="region-label">Região selecionada</label>
        <div class="region-selector">
          <select v-model="selectedRegion" class="region-dropdown">
            <option value="São José dos Campos">São José dos Campos</option>
          </select>
          <button class="export-btn">📊 Exportar relatório</button>
        </div>
      </div>

      <div class="main-content">
        <!-- Indices Section -->
        <div class="indices-section">
          <h2>Índices</h2>
          <div class="indices-container">
            <!-- General Index (Large) -->
            <div class="index-card large-card green">
              <div class="index-number">1</div>
              <div class="index-name">Geral</div>
            </div>
            <div class="index-card small-card green">
              <div class="index-number">1</div>
              <div class="index-name">Tráfego</div>
            </div>
            <div class="index-card small-card yellow">
              <div class="index-number">2</div>
              <div class="index-name">Segurança</div>
            </div>
            <div class="index-card small-card orange">
              <div class="index-number">3</div>
              <div class="index-name">Acessibilidade</div>
            </div>
            <div class="index-card small-card red">
              <div class="index-number">4</div>
              <div class="index-name">Infraestrutura</div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div class="graphs-section">
          <div class="graph-container">
            <h2>Mapa</h2>
            <div class="map-placeholder yellow-bg"></div>
          </div>
          <div class="graph-container">
            <select v-model="selectedVelocity" class="velocity-dropdown">
              <option value="Velocidade">Velocidade</option>
            </select>
            <div class="map-placeholder yellow-bg"></div>
          </div>
          <div class="graph-container">
            <h2>Gráfico</h2>
            <div class="map-placeholder yellow-bg"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
h2 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.home-container {
  width: 100%;
  overflow: auto;
}

/* Main Content */
.home-content {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Region Section */
.region-section {
  margin-bottom: 0px;
}

.region-label {
  display: block;
  font-size: 14px;
  color: #666;
}

.region-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.region-dropdown {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 16px;
  min-width: 200px;
  cursor: pointer;
}

.export-btn {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #f8f9fa;
}

.main-content {
  background-color: white;
  padding: 20px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Indices Section */
.indices-section {
  margin-bottom: 40px;
}

.indices-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.index-card {
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 4px solid;
  transition: transform 0.2s;
  flex-grow: 1;
}

.index-card:hover {
  transform: translateY(-2px);
}

.large-card {
  width: 200px;
  height: 200px;
}

.small-card {
  width: 150px;
  height: 120px;
}

.index-number {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.small-card .index-number {
  font-size: 36px;
  margin-bottom: 4px;
}

.index-name {
  font-size: 16px;
  font-weight: 500;
  color: #555;
  text-align: center;
}

.small-card .index-name {
  font-size: 14px;
}

/* Color variants */
.green {
  border-bottom-color: #22c55e;
}

.yellow {
  border-bottom-color: #eab308;
}

.orange {
  border-bottom-color: #f97316;
}

.red {
  border-bottom-color: #ef4444;
}

/* Graphs Section */
.graphs-section {
  height: 350px;
  display: flex;
  gap: 16px;
}

.graph-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Map Section */
.map-section {
  padding: 24px;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.velocity-dropdown {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
}

.map-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  height: 300px;
}

.map-placeholder {
  border-radius: 15px;
  flex: 1;
}

.yellow-bg {
  background-color: #fef08a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-content {
    padding: 20px;
  }

  .indices-container {
    flex-direction: column;
    align-items: center;
  }

  .small-indices {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 200px;
  }

  .map-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .region-selector {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
