<template>
  <v-dialog v-model="showModal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">
        Descrição do Relatório
        <v-chip v-if="isCompleted" color="success" small class="ml-2"> Concluído </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- Mensagem original da notificação -->
        <div v-if="originalMessage" class="original-message">
          <strong>Mensagem original:</strong>
          <p class="message-text">{{ originalMessage }}</p>
        </div>

        <!-- Campo para o relatório -->
        <v-textarea
          v-model="reportText"
          label="Como o problema foi resolvido?"
          placeholder="Alertamos as autoridades da região com base..."
          outlined
          rows="6"
          auto-grow
          class="mt-4"
          :readonly="isCompleted"
          :disabled="isCompleted"
        ></v-textarea>

        <div v-if="completedAt" class="completion-info">
          <small>Relatório concluído em: {{ formatCompletionDate(completedAt) }}</small>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="close">
          {{ isCompleted ? "Fechar" : "Cancelar" }}
        </v-btn>
        <v-btn color="primary" text :disabled="isCompleted" @click="submit"> Concluir </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

// Props
interface Props {
  modelValue: boolean;
  originalMessage?: string; // Mensagem original da notificação
  initialReportText?: string; // Texto do relatório existente
  completedAt?: string | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: { reportText: string; completedAt: string }];
}>();

// Data
const reportText = ref<string>(props.initialReportText || "");

// Computed
const showModal = ref<boolean>(props.modelValue);

const isCompleted = computed<boolean>(() => {
  return !!props.completedAt;
});

// Watch para sincronizar com o prop
watch(
  () => props.modelValue,
  (newValue) => {
    showModal.value = newValue;
  }
);

watch(showModal, (newValue) => {
  emit("update:modelValue", newValue);
});

// Watch para atualizar o texto do relatório quando mudar
watch(
  () => props.initialReportText,
  (newReportText) => {
    if (newReportText !== undefined) {
      reportText.value = newReportText;
    }
  }
);

// Methods
const close = (): void => {
  showModal.value = false;
};

const submit = (): void => {
  const completedAt = new Date().toISOString(); // Data/hora atual em ISO
  emit("submit", {
    reportText: reportText.value,
    completedAt: completedAt,
  });
  close();
};

const formatCompletionDate = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString("pt-BR");
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-textarea {
  font-size: 14px;
}

.original-message {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.message-text {
  margin: 8px 0 0 0;
  color: rgba(0, 0, 0, 0.7);
}

.completion-info {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
}

.v-textarea--disabled {
  opacity: 0.7;
}
</style>
