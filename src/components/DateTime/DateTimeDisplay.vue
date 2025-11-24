<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import timeService from '@/services/TimeService';
import './DateTimeDisplayStyle.scss';

const displayDate = ref('');
const displayTime = ref('');
const currentServerTime = ref<Date | null>(null);

let tickIntervalId: number | undefined;
let resyncIntervalId: number | undefined;

const updateDisplay = () => {
  if (!currentServerTime.value) return;

  const dateObj = currentServerTime.value;

  displayDate.value = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  displayTime.value = dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const fetchTime = async () => {
  try {
    const timeData = await timeService.getServerTime();

    if (timeData.currentServerTime) {
      const newServerTime = new Date(timeData.currentServerTime);

      if (isNaN(newServerTime.getTime())) {
        // eslint-disable-next-line no-console
        console.error('Data inválida recebida do endpoint:', timeData.currentServerTime);
        displayDate.value = 'Data Inválida';
      } else {
        // Atualiza nossa "fonte da verdade"
        currentServerTime.value = newServerTime;
        updateDisplay();
      }
    } else {
      displayDate.value = 'Sem dados';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Falha ao buscar o horário:', error);
    displayDate.value = 'Erro ao carregar';
  }
};

const tick = () => {
  if (currentServerTime.value) {
    // Adiciona 1 segundo ao tempo que já temos
    currentServerTime.value.setSeconds(currentServerTime.value.getSeconds() + 1);
    // Atualiza a tela
    updateDisplay();
  }
};

onMounted(() => {
  fetchTime();
  tickIntervalId = window.setInterval(tick, 1000);
  resyncIntervalId = window.setInterval(fetchTime, 60000);
});

onUnmounted(() => {
  // Limpa OS DOIS intervalos
  if (tickIntervalId) {
    clearInterval(tickIntervalId);
  }
  if (resyncIntervalId) {
    clearInterval(resyncIntervalId);
  }
});
</script>

<template>
  <div class="datetime-display">
    <span class="date-label">Data</span>
    <span class="datetime-value">{{ displayDate }}</span>
    <span class="datetime-value">{{ displayTime }}</span>
  </div>
</template>


<style lang="scss" scoped src="./DateTimeDisplayStyle.scss">
</style>
