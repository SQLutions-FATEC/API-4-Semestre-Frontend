<script setup lang="ts">
import { ref, watch } from "vue";
import speedGraph from "@/assets/SpeedGraph.png";
import vehicleTypes from "@/assets/TypeGraph.png";
import volumeGraph from "@/assets/VolumeGraph.png";
import dailyInfo from "@/assets/DailyInfo.png";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "closed"]);

const dialog = ref(props.modelValue);
const tab = ref(1);

const imageMaxHeight = ref("100%");
const imageMaxWidth = ref("100%");

const navigationItems = ref([
  {
    id: 1,
    title: "Velocidade média",
    icon: "mdi-speedometer",
    image: speedGraph,
    rectangleTitle: "Colunas",
    rectangleContent: "As colunas do gráfico são:",
    stats: [
      { label: "Velocidade(km/h)", value: "Velocidade média de todos os veículos" },
      { label: "Hora", value: "Horário dos registros" },
    ],
    bottomTitle: "Descrição",
    bottomContent:
      "Este gráfico apresenta as velocidades medias de todos os veiculos ao passar do dia, util para ver horários de engarrafamento nas regiões.",
  },
  {
    id: 2,
    title: "Tipos de veículo",
    icon: "mdi-car-multiple",
    image: vehicleTypes,
    rectangleTitle: "Informações",
    rectangleContent: "As informações do gráfico são:",
    stats: [{ label: "Tipo de veículo", value: "Os tipos de veiculos em diferentes cores" }],
    bottomTitle: "Descrição",
    bottomContent:
      "Este gráfico apresenta a porcentagem de cada um dos veículos dentro de um determinado período de tempo, util para descobrir quais são os vículos mais frequentes na cidade",
  },
  {
    id: 3,
    title: "Volume de veículos",
    icon: "mdi-chart-bar",
    image: volumeGraph,
    rectangleTitle: "Colunas",
    rectangleContent: "Estas são as colunas presentes no gráfico:",
    stats: [
      { label: "Volume de veículos", value: "Quantidade de veículos registrados" },
      { label: "Hora", value: "Horário dos registros" },
    ],
    bottomTitle: "Descrição",
    bottomContent:
      "Este gráfico representa a quantidade de registros em uma determinada hora do dia, util para descobrir quais são os horários de pico da região.",
  },
  {
    id: 4,
    title: "Informações diárias",
    icon: "mdi-calendar-text",
    image: dailyInfo,
    rectangleTitle: "Tipos de informações",
    rectangleContent: "Esse são os tipos diferentes de informações diárias:",
    stats: [
      {
        label: "Leituras totais",
        value:
          "Apresenta as leituras totais do dia e a porcentagem de aumento ou redução da quantidade de registros comparado ao dia anterior",
      },
      {
        label: "Velocidade média geral",
        value:
          "Apresenta a velocidade média de todos os veículos no periodo de um dia e a porcentagem de aumento ou redução comparado ao dia anterior",
      },
      { label: "Velocidade mais alta", value: "Apresenta a velocidade mais alta detectada no dia" },
    ],
    bottomTitle: "Descrição",
    bottomContent:
      "Estas informações apresentam dados básicos que podem ser uteis em identificar problemas gerais em uma determinada região.",
  },
]);

watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal;
  }
);

watch(dialog, (newVal) => {
  emit("update:modelValue", newVal);
});

function closeModal() {
  dialog.value = false;
  emit("closed");
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="1200">
    <v-card>
      <v-tabs
        v-model="tab"
        grow
        bg-color="primary"
        color="white"
        active-class="active-tab"
        slider-color="white"
        slider-size="3"
      >
        <v-tab v-for="item in navigationItems" :key="item.id" :value="item.id" class="custom-tab">
          <v-icon start size="20">{{ item.icon }}</v-icon>
          <span class="tab-text">{{ item.title }}</span>
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-4">
        <v-window v-model="tab">
          <v-window-item v-for="item in navigationItems" :key="item.id" :value="item.id">
            <div class="content-wrapper">
              <div class="top-row">
                <div class="image-container">
                  <v-img
                    :src="item.image"
                    class="image-content"
                    contain
                    :max-height="imageMaxHeight"
                    :max-width="imageMaxWidth"
                  >
                    <template v-slot:placeholder>
                      <div class="image-placeholder">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </div>
                    </template>
                  </v-img>
                </div>

                <div class="rectangle-container">
                  <div class="rectangle-content">
                    <h3 class="mb-2">{{ item.rectangleTitle }}</h3>
                    <p class="mb-4">{{ item.rectangleContent }}</p>
                    <!-- Dados específicos de cada página -->
                    <div v-if="item.stats" class="stats-container">
                      <div v-for="(stat, index) in item.stats" :key="index" class="stat-item">
                        <strong>{{ stat.label }}:</strong> {{ stat.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bottom-row">
                <div class="full-width-content">
                  <h3 class="mb-2">{{ item.bottomTitle }}</h3>
                  <p class="mb-4">{{ item.bottomContent }}</p>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeModal"> Fechar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.active-tab {
  background-color: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600 !important;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.custom-tab {
  min-height: 48px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.custom-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.tab-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.content-wrapper {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.top-row {
  height: 60%;
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.image-container {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.image-content {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.rectangle-container {
  flex: 0 0 60%;
  display: flex;
  min-height: 0;
}

.rectangle-content {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
}

.stats-container {
  margin-top: 15px;
  flex-grow: 1;
}

.stat-item {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.bottom-row {
  height: 40%;
  display: flex;
  min-height: 0;
}

.full-width-content {
  width: 100%;
  background-color: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
}

.rectangle-content h3,
.full-width-content h3 {
  color: #333;
  font-weight: 600;
}

.rectangle-content p,
.full-width-content p {
  color: #666;
  line-height: 1.5;
}

.stat-item strong {
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.stat-item {
  color: #555;
}

/* Responsividade */
@media (max-width: 768px) {
  .top-row {
    flex-direction: column;
    height: auto;
  }

  .image-container,
  .rectangle-container {
    flex: 0 0 100%;
    height: 300px;
  }

  .content-wrapper {
    height: auto;
    min-height: 500px;
  }

  .image-container {
    min-height: 250px;
  }

  .custom-tab {
    min-height: 44px;
    padding: 8px 12px;
  }

  .tab-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    height: auto;
    min-height: 600px;
  }

  .top-row {
    gap: 12px;
    margin-bottom: 12px;
  }

  .rectangle-content,
  .full-width-content {
    padding: 16px;
  }
}
</style>
