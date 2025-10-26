<script setup lang="ts">
import { computed, ref } from "vue";

defineProps<{
  modelValue: boolean;
  tipo: "trafego" | "seguranca" | "volume";
}>();

const emit = defineEmits(["update:modelValue"]);

const coresIndice = {
  trafego: { cor: "#ff9800", texto: "Tráfego", icone: "mdi-traffic-light" },
  seguranca: { cor: "#4caf50", texto: "Segurança", icone: "mdi-shield-check" },
  volume: { cor: "#2196f3", texto: "Volume de Veículos", icone: "mdi-car" },
};

const abaSelecionada = ref<"trafego" | "seguranca" | "volume">("trafego");

const tituloAtual = computed(() => coresIndice[abaSelecionada.value].texto);
const corAtual = computed(() => coresIndice[abaSelecionada.value].cor);
const iconeAtual = computed(() => coresIndice[abaSelecionada.value].icone);

function fechar() {
  emit("update:modelValue", false);
}

const volumeIndex = computed(() => 3.1);
const volumeLabel = computed(() => {
  if (volumeIndex.value < 2) return "Baixo";
  if (volumeIndex.value < 4) return "Moderado";
  return "Alto";
});
const volumePercent = computed(() => Math.min(Math.round((volumeIndex.value / 5) * 100), 100));
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="850"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard elevation="8" class="rounded-lg pa-4">
      <!-- Cabeçalho -->
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <VIcon :color="corAtual" size="34">{{ iconeAtual }}</VIcon>
          <h2 class="ml-3 mb-0" :style="{ color: corAtual }">Índice de {{ tituloAtual }}</h2>
        </div>
        <VBtn icon="mdi-close" variant="text" @click="fechar" />
      </div>

      <!-- Abas -->
      <VTabs v-model="abaSelecionada" background-color="transparent" grow>
        <VTab value="trafego">
          <VIcon start color="#ff9800">mdi-traffic-light</VIcon> Tráfego
        </VTab>
        <VTab value="seguranca">
          <VIcon start color="#4caf50">mdi-shield-check</VIcon> Segurança
        </VTab>
        <VTab value="volume"> <VIcon start color="#2196f3">mdi-car</VIcon> Volume </VTab>
      </VTabs>

      <!-- Conteúdo -->
      <VWindow v-model="abaSelecionada">
        <!-- ================= TRÁFEGO ================= -->
        <VWindowItem value="trafego">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Cálculo do Índice de Tráfego</h3>
            <p>
              O <strong>Índice de Tráfego</strong> mede a fluidez do trânsito com base na
              <em>densidade média de veículos</em> e na <em>velocidade média ponderada</em>
              das vias monitoradas.
            </p>

            <VRow class="mt-4">
              <VCol cols="12" md="6">
                <VSheet color="#fff8e1" class="pa-3 rounded-lg elevation-1">
                  <p class="font-weight-medium mb-2">📈 Fórmula</p>
                  <code>Tráfego = (1 - (Velocidade Média / Velocidade Ideal)) × 5</code>
                  <p class="text-caption mt-2 text-grey-darken-1">
                    Onde 1 indica fluidez total e 5 representa congestionamento grave.
                  </p>
                </VSheet>
              </VCol>

              <VCol cols="12" md="6">
                <VSheet color="#fff3e0" class="pa-3 rounded-lg elevation-1">
                  <p class="font-weight-medium mb-2">🧮 Exemplo atual</p>
                  <ul class="pl-4">
                    <li>Velocidade média: <strong>32 km/h</strong></li>
                    <li>Velocidade ideal: <strong>60 km/h</strong></li>
                    <li>Resultado: <strong>Tráfego = 2.3</strong> (Moderado)</li>
                  </ul>
                </VSheet>
              </VCol>
            </VRow>

            <div class="mt-5">
              <div class="d-flex justify-space-between mb-1">
                <span>Nível atual</span>
                <span class="font-weight-medium orange--text">Moderado (2.3)</span>
              </div>
              <VProgressLinear model-value="46" color="#ff9800" height="10" rounded />
            </div>
          </div>
        </VWindowItem>

        <!-- ================= SEGURANÇA ================= -->
        <VWindowItem value="seguranca">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Cálculo do Índice de Segurança Viária</h3>
            <p>
              Este índice combina o <em>número de incidentes</em> com o
              <em>nível de velocidade excedida</em> para mensurar a segurança em tempo real.
            </p>

            <VRow class="mt-4">
              <VCol cols="12" md="6">
                <VSheet color="#e8f5e9" class="pa-3 rounded-lg elevation-1">
                  <p class="font-weight-medium mb-2">📈 Fórmula</p>
                  <code>Segurança = 5 - ((Incidentes + ExcessoVelocidade) / 10)</code>
                  <p class="text-caption mt-2 text-grey-darken-1">
                    Valores próximos de 5 indicam segurança máxima.
                  </p>
                </VSheet>
              </VCol>

              <VCol cols="12" md="6">
                <VSheet color="#f1f8e9" class="pa-3 rounded-lg elevation-1">
                  <p class="font-weight-medium mb-2">🧮 Exemplo atual</p>
                  <ul class="pl-4">
                    <li>Incidentes registrados: <strong>2</strong></li>
                    <li>Casos de velocidade excedida: <strong>5</strong></li>
                    <li>Resultado: <strong>4.3</strong> (Ótimo)</li>
                  </ul>
                </VSheet>
              </VCol>
            </VRow>

            <div class="mt-5">
              <div class="d-flex justify-space-between mb-1">
                <span>Nível atual</span>
                <span class="font-weight-medium green--text">Ótimo (4.3)</span>
              </div>
              <VProgressLinear model-value="86" color="#4caf50" height="10" rounded />
            </div>
          </div>
        </VWindowItem>

        <!-- ================= VOLUME ================= -->
        <VWindowItem value="volume">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Índice Geral da Cidade</h3>
            <p>
              O índice geral de volume considera todos os radares da cidade e indica a condição
              média do tráfego.
            </p>

            <div class="mt-5">
              <div class="d-flex justify-space-between mb-1">
                <span>Nível atual</span>
                <span class="font-weight-medium blue--text"
                  >{{ volumeLabel }} ({{ volumeIndex }})</span
                >
              </div>
              <VProgressLinear :model-value="volumePercent" color="#2196f3" height="10" rounded />
            </div>
          </div>
        </VWindowItem>
      </VWindow>
    </VCard>
  </VDialog>
</template>
