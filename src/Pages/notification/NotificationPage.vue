<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { NotificationLog } from "@/entities/NotificationLog";

const notifications = ref<NotificationLog[]>([]);
const loading = ref<boolean>(true);

onMounted(async () => {
  try {
    loading.value = true;
    notifications.value = [
      {
        id: 1,
        messageText: "Alerta de temperatura alta detectada",
        chatId: "chat_12345",
        success: true,
        errorDetails: null,
        indexType: "TEMPERATURE",
        indexValue: 35,
        startAt: "2024-01-15T10:30:00",
        completedAt: "2024-01-15T10:30:05",
      },
      {
        id: 2,
        messageText: "Monitoramento de umidade normal",
        chatId: "chat_67890",
        success: false,
        errorDetails: "Falha na conexão com o serviço de mensagens",
        indexType: "HUMIDITY",
        indexValue: 60,
        startAt: "2024-01-15T11:15:00",
        completedAt: "2024-01-15T11:15:10",
      },
    ];
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
  } finally {
    loading.value = false;
  }
});

const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleString("pt-BR");
};

const getStatusClass = (success: boolean): string => {
  return success ? "status-success" : "status-error";
};

const getStatusText = (success: boolean): string => {
  return success ? "Sucesso" : "Erro";
};
</script>

<template>
  <div class="home-container">
    <main class="home-content">
      <div class="main-content">
        <div v-if="loading" class="loading">
          <p>Carregando logs de notificação...</p>
        </div>

        <div v-else-if="notifications.length > 0" class="notifications-container">
          <h1>Logs de Notificação</h1>
          <p class="subtitle">Histórico de envio de notificações</p>

          <div class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="getStatusClass(notification.success)"
            >
              <div class="notification-header">
                <div class="status-indicator">
                  <span class="status-badge" :class="getStatusClass(notification.success)">
                    {{ getStatusText(notification.success) }}
                  </span>
                </div>
                <div class="notification-info">
                  <span class="index-type">{{ notification.indexType }}</span>
                  <span class="index-value">Valor: {{ notification.indexValue || "N/A" }}</span>
                </div>
              </div>

              <div class="notification-body">
                <p class="message-text">{{ notification.messageText }}</p>
                <div class="chat-info"><strong>Chat ID:</strong> {{ notification.chatId }}</div>
              </div>

              <div class="notification-dates">
                <small>Início: {{ formatDateTime(notification.startAt) }}</small>
                <small>Conclusão: {{ formatDateTime(notification.completedAt) }}</small>
              </div>

              <div v-if="!notification.success && notification.errorDetails" class="error-details">
                <strong>Detalhes do Erro:</strong>
                <p>{{ notification.errorDetails }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-notifications">
          <h1>Logs de Notificação</h1>
          <p>Nenhum registro de notificação encontrado.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped src="@/Pages/notification/NotificationPageStyle.scss"></style>
