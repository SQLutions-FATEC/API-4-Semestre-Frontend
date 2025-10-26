<script setup lang="ts">
import { computed, ref } from "vue";

defineProps<{
  modelValue: boolean;
  tipo: "trafego" | "seguranca" | "geral";
}>();

const emit = defineEmits(["update:modelValue"]);

const coresNivel = {
  trafego: { cor: "#ff9800", texto: "Tráfego" },
  seguranca: { cor: "#4caf50", texto: "Segurança" },
  geral: { cor: "#2196f3", texto: "Geral" },
};

const abaSelecionada = ref<"trafego" | "seguranca" | "geral">("trafego");

const tituloAtual = computed(() => coresNivel[abaSelecionada.value].texto);
const corAtual = computed(() => coresNivel[abaSelecionada.value].cor);

function fechar() {
  emit("update:modelValue", false);
}
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
          <h2 class="ml-3 mb-0" :style="{ color: corAtual }">Nível de {{ tituloAtual }}</h2>
        </div>
        <VBtn icon="mdi-close" variant="text" @click="fechar" />
      </div>

      <!-- Abas -->
      <VTabs v-model="abaSelecionada" background-color="transparent" grow>
        <VTab value="trafego">Tráfego</VTab>
        <VTab value="seguranca">Segurança</VTab>
        <VTab value="geral">Geral</VTab>
      </VTabs>

      <!-- Conteúdo -->
      <VWindow v-model="abaSelecionada">
        <!-- TRÁFEGO -->
        <VWindowItem value="trafego">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Cálculo do Nível de Tráfego</h3>
            <p>
              O nível de Tráfego mede a fluidez baseado na densidade de veículos e velocidade
              relativa.
            </p>

            <VRow class="mt-4">
              <!-- CLASSIFICAÇÃO -->
              <VCol cols="12" md="4">
                <VSheet color="#fff8e1" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Classificação dos Níveis</p>
                  <div class="text-caption">
                    <strong>Nível 1 (Ótimo):</strong><br />D &lt; 100 e V_rel &gt; 70%<br /><br />
                    <strong>Nível 2 (Bom):</strong><br />100 ≤ D &lt; 300 e V_rel &gt; 60%<br /><br />
                    <strong>Nível 3 (Moderado):</strong><br />300 ≤ D &lt; 600 ou 40% ≤ V_rel ≤
                    60%<br /><br />
                    <strong>Nível 4 (Ruim):</strong><br />D ≥ 600 ou 30% ≤ V_rel &lt; 40%<br /><br />
                    <strong>Nível 5 (Crítico):</strong><br />V_rel &lt; 30%
                  </div>
                </VSheet>
              </VCol>

              <!-- FÓRMULA E VARIÁVEIS -->
              <VCol cols="12" md="4">
                <VSheet color="#e3f2fd" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Fórmula e Variáveis</p>
                  <div class="text-caption">
                    <strong>Variáveis:</strong><br />
                    • <strong>D</strong>: Densidade (veículos/minuto)<br />
                    • <strong>V_rel</strong>: Velocidade relativa (%)<br /><br />

                    <strong>Velocidade Relativa:</strong><br />
                    <code>V_rel = (Velocidade Média ÷ Velocidade Regulamentada) × 100</code
                    ><br /><br />

                    <strong>Classificação:</strong><br />
                    Baseada na tabela de combinações D × V_rel
                  </div>
                </VSheet>
              </VCol>

              <!-- EXEMPLO -->
              <VCol cols="12" md="4">
                <VSheet color="#e8f5e9" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Exemplo Prático</p>
                  <div class="text-caption">
                    <strong>Dados coletados:</strong><br />
                    • Velocidade média: <strong>45 km/h</strong><br />
                    • Velocidade regulamentada: <strong>60 km/h</strong><br />
                    • Densidade: <strong>250 veículos/min</strong><br /><br />

                    <strong>Cálculos:</strong><br />
                    • V_rel = (45 ÷ 60) × 100 = <strong>75%</strong><br />
                    • D = <strong>250</strong><br /><br />

                    <strong>Resultado:</strong><br />
                    • Classificação: <strong>Nível 2 (Bom)</strong>
                  </div>
                </VSheet>
              </VCol>
            </VRow>
          </div>
        </VWindowItem>

        <!-- SEGURANÇA -->
        <VWindowItem value="seguranca">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Cálculo do Nível de Segurança</h3>
            <p>Combina a porcentagem de infrações com a média de excesso de velocidade.</p>

            <VRow class="mt-4">
              <!-- CLASSIFICAÇÃO -->
              <VCol cols="12" md="4">
                <VSheet color="#fff8e1" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Classificação dos Níveis</p>
                  <div class="text-caption">
                    <strong>Nível 1 (Ótimo):</strong><br />1.0 - 1.4<br /><br />
                    <strong>Nível 2 (Bom):</strong><br />1.5 - 2.4<br /><br />
                    <strong>Nível 3 (Moderado):</strong><br />2.5 - 3.4<br /><br />
                    <strong>Nível 4 (Ruim):</strong><br />3.5 - 4.4<br /><br />
                    <strong>Nível 5 (Crítico):</strong><br />4.5 - 5.0
                  </div>
                </VSheet>
              </VCol>

              <!-- FÓRMULA E VARIÁVEIS -->
              <VCol cols="12" md="4">
                <VSheet color="#e3f2fd" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Fórmula e Variáveis</p>
                  <div class="text-caption">
                    <strong>Fórmula Principal:</strong><br />
                    <code>Índice = 1 + 4 × [(P_infr × 0.4 + M_exc × 0.6) ÷ 100]</code><br /><br />

                    <strong>Variáveis:</strong><br />
                    • <strong>P_infr</strong>: % de infrações (0-100)<br />
                    • <strong>M_exc</strong>: Média de excesso (km/h)<br />
                    • <strong>0.4</strong>: Peso das infrações<br />
                    • <strong>0.6</strong>: Peso do excesso<br /><br />

                    <strong>Arredondamento:</strong><br />
                    Resultado final é arredondado para inteiro
                  </div>
                </VSheet>
              </VCol>

              <!-- EXEMPLO -->
              <VCol cols="12" md="4">
                <VSheet color="#e8f5e9" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Exemplo Prático</p>
                  <div class="text-caption">
                    <strong>Dados coletados:</strong><br />
                    • Total de veículos: <strong>200</strong><br />
                    • Infrações: <strong>50</strong><br />
                    • Média excesso: <strong>8 km/h</strong><br /><br />

                    <strong>Cálculos:</strong><br />
                    • P_infr = (50 ÷ 200) × 100 = <strong>25%</strong><br />
                    • M_exc = <strong>8 km/h</strong><br />
                    • Raw = (25×0.4 + 8×0.6) = <strong>14.8</strong><br />
                    • Índice = 1 + 4×(14.8÷100) = <strong>1.59</strong><br /><br />

                    <strong>Resultado:</strong><br />
                    • Arredondado: <strong>Nível 2 (Bom)</strong>
                  </div>
                </VSheet>
              </VCol>
            </VRow>
          </div>
        </VWindowItem>

        <!-- GERAL -->
        <VWindowItem value="geral">
          <div class="pa-4">
            <h3 class="text-h6 mb-2">Cálculo do Nível Geral da Cidade</h3>
            <p>Média simples entre os índices de Tráfego e Segurança.</p>

            <VRow class="mt-4">
              <!-- CLASSIFICAÇÃO -->
              <VCol cols="12" md="4">
                <VSheet color="#fff8e1" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Classificação dos Níveis</p>
                  <div class="text-caption">
                    <strong>Nível 1 (Ótimo):</strong><br />1.0 - 1.4<br /><br />
                    <strong>Nível 2 (Bom):</strong><br />1.5 - 2.4<br /><br />
                    <strong>Nível 3 (Moderado):</strong><br />2.5 - 3.4<br /><br />
                    <strong>Nível 4 (Ruim):</strong><br />3.5 - 4.4<br /><br />
                    <strong>Nível 5 (Crítico):</strong><br />4.5 - 5.0
                  </div>
                </VSheet>
              </VCol>

              <!-- FÓRMULA E VARIÁVEIS -->
              <VCol cols="12" md="4">
                <VSheet color="#e3f2fd" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Fórmula e Variáveis</p>
                  <div class="text-caption">
                    <strong>Fórmula Principal:</strong><br />
                    <code>Índice Geral = (Índice Tráfego + Índice Segurança) ÷ 2</code><br /><br />

                    <strong>Variáveis:</strong><br />
                    • <strong>Índice Tráfego</strong>: 1-5 (do cálculo de tráfego)<br />
                    • <strong>Índice Segurança</strong>: 1-5 (do cálculo de segurança)<br /><br />

                    <strong>Arredondamento:</strong><br />
                    • Média calculada<br />
                    • Arredondada para inteiro<br />
                    • Mantém escala 1-5
                  </div>
                </VSheet>
              </VCol>

              <!-- EXEMPLO -->
              <VCol cols="12" md="4">
                <VSheet color="#e8f5e9" class="pa-3 rounded-lg elevation-1 h-100">
                  <p class="font-weight-medium mb-2">Exemplo Prático</p>
                  <div class="text-caption">
                    <strong>Dados de entrada:</strong><br />
                    • Índice Tráfego: <strong>2</strong><br />
                    • Índice Segurança: <strong>3</strong><br /><br />

                    <strong>Cálculos:</strong><br />
                    • Média = (2 + 3) ÷ 2 = <strong>2.5</strong><br />
                    • Arredondamento matemático<br /><br />

                    <strong>Resultado:</strong><br />
                    • Índice Geral: <strong>Nível 3 (Moderado)</strong><br /><br />

                    <em>Obs: Pode variar conforme arredondamento</em>
                  </div>
                </VSheet>
              </VCol>
            </VRow>
          </div>
        </VWindowItem>
      </VWindow>
    </VCard>
  </VDialog>
</template>
